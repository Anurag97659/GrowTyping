import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiSun, FiMoon, FiLock, FiUser, FiMail } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES, applyThemeFromData } = useTheme();

  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

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
        // Instantly restore the user's saved theme from the login response (no extra API call)
        applyThemeFromData(res.data?.data?.user);
        navigate("/typing");
      }
    } catch (error) {
      setLoginError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in. Please try again."
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

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex flex-col justify-center items-center p-4 transition-colors duration-300`}>
      {/* Top Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/typing")}
          className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-xs font-bold`}
        >
          <FiArrowLeft className="text-sm" /> Back to Typing
        </button>

        <div className="flex items-center gap-2">
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className={`px-2.5 py-1.5 text-xs font-medium ${themeConfig.input} cursor-pointer`}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={toggleMode}
            className={`p-2.5 ${themeConfig.buttonSecondary}`}
            title="Toggle Dark / Light Mode"
          >
            {mode === "dark" ? <FiSun className="text-xs" /> : <FiMoon className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className={`w-full max-w-md ${themeConfig.card} border ${themeConfig.border} p-8 space-y-6 shadow-2xl`}>
        <div className="text-center space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${themeConfig.accent}`}>
            Welcome Back
          </h1>
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Sign in to track your speed, rankings, and stats
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Username</label>
            <div className="relative">
              <FiUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="text"
                required
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className={`text-[11px] font-semibold ${themeConfig.accent} hover:underline`}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${themeConfig.buttonPrimary} text-xs font-bold tracking-wider uppercase transition-all shadow-md`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Don't have an account?{" "}
            <Link to="/registration" className={`font-bold ${themeConfig.accent} hover:underline`}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${themeConfig.card} max-w-sm w-full p-6 border ${themeConfig.border} space-y-4 shadow-2xl`}>
            <h3 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>Reset Password</h3>
            <p className={`text-xs ${themeConfig.mutedText}`}>
              Enter your email address or username to receive password reset instructions.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="text"
                placeholder="Username (optional)"
                value={forgotPasswordUsername}
                onChange={(e) => setForgotPasswordUsername(e.target.value)}
                className={`w-full p-3 text-xs ${themeConfig.input}`}
              />
              <input
                type="email"
                placeholder="Email Address (optional)"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className={`w-full p-3 text-xs ${themeConfig.input}`}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className={`flex-1 py-2.5 ${themeConfig.buttonPrimary} text-xs font-bold`}
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className={`px-4 py-2.5 ${themeConfig.buttonSecondary} text-xs font-bold`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
