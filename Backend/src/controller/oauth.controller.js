import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_COOKIE = "growtyping_google_oauth_state";
const isProduction = process.env.NODE_ENV === "production";

const oauthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
};

const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

function frontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
}

function requireGoogleConfig() {
  const config = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  };

  if (Object.values(config).some((value) => !value)) {
    throw new ApiError(503, "Google sign-in is not configured");
  }

  return config;
}

function redirectToFrontend(res, path, params = {}) {
  const url = new URL(path, `${frontendUrl()}/`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return res.redirect(url.toString());
}

function stateMatches(expected, actual) {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

async function uniqueUsername(name, email) {
  const fallback = email.split("@")[0] || "google_user";
  const base = (name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16) || "googleuser";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const username = `${base.slice(0, 20 - suffix.length)}${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ username });
    if (!exists) return username;
  }

  throw new ApiError(500, "Could not create a unique username for this Google account");
}

async function getGoogleProfile(code) {
  const { clientId, clientSecret, redirectUri } = requireGoogleConfig();
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok || !tokens.access_token) {
    throw new ApiError(401, "Google could not authorize this sign-in request");
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileResponse.json();

  if (!profileResponse.ok || !profile.sub || !profile.email || !profile.email_verified) {
    throw new ApiError(401, "Google did not provide a verified email address");
  }

  return profile;
}

async function findOrCreateGoogleUser(profile) {
  const email = profile.email.toLowerCase().trim();
  let user = await User.findOne({ googleId: profile.sub });

  if (user) return user;

  user = await User.findOne({ email });
  if (user) {
    if (user.googleId && user.googleId !== profile.sub) {
      throw new ApiError(409, "This email is already linked to another Google account");
    }
    user.googleId = profile.sub;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    return user;
  }

  const username = await uniqueUsername(profile.name, email);
  return User.create({
    username,
    email,
    fullname: profile.name?.trim() || username,
    address: "Not provided",
    password: crypto.randomBytes(32).toString("hex"),
    googleId: profile.sub,
    isEmailVerified: true,
  });
}

async function createSession(userId) {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

export const googleRedirect = (req, res, next) => {
  try {
    const { clientId, redirectUri } = requireGoogleConfig();
    const state = crypto.randomBytes(32).toString("hex");
    const url = new URL(GOOGLE_AUTHORIZE_URL);
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    }).toString();

    return res.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions).redirect(url.toString());
  } catch (error) {
    return next(error);
  }
};

export const googleCallback = async (req, res) => {
  const { code, error, state } = req.query;
  const stateIsValid = stateMatches(req.cookies?.[OAUTH_STATE_COOKIE], state);
  res.clearCookie(OAUTH_STATE_COOKIE, oauthCookieOptions);

  if (error || !code) return redirectToFrontend(res, "/login", { error: "google_cancelled" });
  if (!stateIsValid) return redirectToFrontend(res, "/login", { error: "google_state_invalid" });

  try {
    const profile = await getGoogleProfile(code);
    const user = await findOrCreateGoogleUser(profile);
    const handoffToken = jwt.sign(
      { userId: user._id.toString(), provider: "google-oauth-handoff" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2m" }
    );
    return redirectToFrontend(res, "/oauth/callback", { token: handoffToken });
  } catch (error) {
    console.error("Google OAuth callback failed:", error.message);
    return redirectToFrontend(res, "/login", { error: "google_failed" });
  }
};

export const completeGoogleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, "Google sign-in token is required");

  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Google sign-in link is invalid or expired");
  }

  if (payload.provider !== "google-oauth-handoff") {
    throw new ApiError(401, "Invalid Google sign-in token");
  }

  const user = await User.findById(payload.userId).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");

  const { accessToken, refreshToken } = await createSession(user._id);
  return res
    .status(200)
    .cookie("accessToken", accessToken, sessionCookieOptions)
    .cookie("refreshToken", refreshToken, sessionCookieOptions)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Google sign-in successful"));
});
