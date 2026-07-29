import React, { useState } from "react";
import { Link } from "react-router-dom";
import api, { setAccessToken } from "../lib/api";

/* ─────────────────────────────────────────────────────────
   Shared helper: read / write the single global theme key
───────────────────────────────────────────────────────── */
const getTheme = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("growtyping.theme") || "dark"
    : "dark";

function Login() {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [theme, setTheme] = useState(getTheme);

  const isLight = theme === "light";

  const toggleTheme = () => {
    const next = isLight ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("growtyping.theme", next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const res = await api.post("GrowTyping/v1/users/login", {
        username,
        password,
      });

      if (res.data.error) {
        setLoginError(res.data.error);
      } else {
        setAccessToken(res.data?.data?.accessToken);
        window.location.href = "/typing";
      }
    } catch (error) {
      setLoginError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      if (!forgotPasswordEmail && !forgotPasswordUsername) {
        alert("Please enter your email or username");
        setForgotPasswordLoading(false);
        return;
      }

      const res = await api.post("GrowTyping/v1/users/forgotpassword", {
        email: forgotPasswordEmail || undefined,
        username: forgotPasswordUsername || undefined,
      });

      if (res.data.message) {
        alert(res.data.message);
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordUsername("");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  /* ── colour tokens ───────────────────────────────────────── */
  const bg       = isLight ? "bg-[#F8FAFC]"     : "bg-[#0D1117]";
  const cardBg   = isLight ? "bg-white"          : "bg-[#161B22]";
  const border   = isLight ? "border-[#E2E8F0]"  : "border-[#30363D]";
  const text1    = isLight ? "text-[#0F172A]"    : "text-[#E6EDF3]";
  const text2    = isLight ? "text-[#64748B]"    : "text-[#8B949E]";
  const inputBg  = isLight ? "bg-[#F1F5F9]"     : "bg-[#21262D]";
  const inputBdr = isLight ? "border-[#E2E8F0]"  : "border-[#30363D]";

  const inputCls = `w-full px-4 py-3 ${inputBg} border ${inputBdr} rounded-lg ${text1}
    placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-emerald-500/40
    focus:border-emerald-500 transition-all duration-200 text-sm font-medium`;

  const labelCls = `block text-xs font-semibold ${text2} mb-1.5 uppercase tracking-widest`;

  return (
    <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-4 py-10 transition-colors duration-300`}>

      {/* ── Theme toggle ── */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isLight
              ? "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]"
              : "bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]"
          }`}
        >
          {isLight ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* ── Logo ── */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">GT</span>
        </div>
        <h1 className={`text-sm font-bold ${text2} tracking-widest uppercase`}>GrowTyping</h1>
      </div>

      {/* ── Card ── */}
      <div className={`w-full max-w-md ${cardBg} border ${border} rounded-2xl shadow-sm p-8`}>
        <h2 className={`text-2xl font-bold ${text1} mb-1`}>Sign in</h2>
        <p className={`text-sm ${text2} mb-7`}>Welcome back — enter your credentials below.</p>

        <form onSubmit={submit} className="space-y-5">
          {loginError && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400"
            >
              {loginError}
            </div>
          )}

          <div>
            <label className={labelCls}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              className={inputCls}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className={inputCls}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 mt-2
              ${loading
                ? "bg-emerald-700/50 cursor-not-allowed text-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className={`text-sm ${text2} hover:text-emerald-500 transition-colors duration-200 font-medium`}
          >
            Forgot your password?
          </button>
        </div>

        <div className={`mt-6 pt-6 border-t ${border} text-center`}>
          <p className={`text-sm ${text2}`}>
            Don't have an account?{" "}
            <Link
              to="/registration"
              className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className={`w-full max-w-md ${cardBg} border ${border} rounded-2xl shadow-xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${text1}`}>Reset Password</h3>
                <p className={`text-sm ${text2} mt-1`}>Enter your email or username to continue.</p>
              </div>
              <button
                onClick={() => { setShowForgotPassword(false); setForgotPasswordEmail(""); setForgotPasswordUsername(""); }}
                className={`w-8 h-8 rounded-lg border ${border} ${text2} hover:text-red-400 flex items-center justify-center text-base font-bold transition-colors`}
                aria-label="Close"
              >
                x
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>

              <div className={`flex items-center gap-3 py-1`}>
                <div className={`flex-1 h-px ${isLight ? "bg-[#E2E8F0]" : "bg-[#30363D]"}`}></div>
                <span className={`text-xs font-semibold ${text2} uppercase tracking-wider`}>or</span>
                <div className={`flex-1 h-px ${isLight ? "bg-[#E2E8F0]" : "bg-[#30363D]"}`}></div>
              </div>

              <div>
                <label className={labelCls}>Username</label>
                <input
                  type="text"
                  value={forgotPasswordUsername}
                  onChange={(e) => setForgotPasswordUsername(e.target.value)}
                  className={inputCls}
                  placeholder="Enter your username"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotPasswordEmail(""); setForgotPasswordUsername(""); }}
                  className={`flex-1 py-2.5 rounded-lg border ${border} ${text2} text-sm font-semibold hover:bg-[${isLight ? "#F1F5F9" : "#21262D"}] transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all
                    ${forgotPasswordLoading
                      ? "bg-emerald-700/50 cursor-not-allowed text-emerald-300"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                >
                  {forgotPasswordLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
