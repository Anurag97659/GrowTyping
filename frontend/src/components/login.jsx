import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
    withCredentials: true,
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("GrowTyping/v1/users/login", {
        username,
        password,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Login successful");
        window.location.href = "/typing";
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-purple-500/20 relative z-10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>

        <div className="relative z-20">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
            Login
          </h2>
          <p className="text-center text-slate-400 mb-6 text-sm font-medium">
            Welcome back to our community
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
                placeholder="Enter Username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
                placeholder="Enter Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 rounded-xl transition duration-300 mt-4 text-lg tracking-wide
    ${
      loading
        ? "bg-slate-600 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl"
    } text-white`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-slate-400 hover:text-blue-400 transition duration-300 font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Create account{" "}
            <Link
              to="/registration"
              className="font-bold text-purple-400 hover:text-pink-400 transition duration-300"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-purple-500/20 w-full max-w-md">
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
              Forgot Password
            </h3>
            <p className="text-center text-slate-400 mb-6 text-sm font-medium">
              Enter your email or username to reset your password
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
                  placeholder="Enter Email"
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex-1 border-t border-slate-600/50"></div>
                <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Or</span>
                <div className="flex-1 border-t border-slate-600/50"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={forgotPasswordUsername}
                  onChange={(e) => setForgotPasswordUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
                  placeholder="Enter Username"
                />
              </div>

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className={`w-full font-bold py-3 rounded-xl transition duration-300 mt-4 text-lg tracking-wide
        ${
          forgotPasswordLoading
            ? "bg-slate-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl"
        } text-white`}
              >
                {forgotPasswordLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </span>
                ) : (
                  "Send Password Reset"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordUsername("");
                }}
                className="w-full font-bold py-3 rounded-xl transition duration-300 bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
