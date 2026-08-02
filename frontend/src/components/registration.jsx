import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiSun, FiMoon, FiLock, FiUser, FiMail, FiMapPin } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Registration() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES, setMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!window.localStorage.getItem("growtyping.themeMode")) {
      setMode("light");
    }
  }, [setMode]);

  const continueWithGoogle = () => {
    window.location.assign(`${API_BASE_URL}/GrowTyping/v1/users/oauth/google`);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("GrowTyping/v1/users/register", {
        username,
        password,
        fullname,
        email,
        address,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        const message =
          res?.data?.message ||
          "Registration successful. Please check your email and verify your account before login.";
        alert(message);
        navigate("/login");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex flex-col justify-center items-center p-4 transition-colors duration-300`}>
      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
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

      {/* Main Registration Card */}
      <div className={`w-full max-w-lg ${themeConfig.card} border ${themeConfig.border} p-8 space-y-6 shadow-2xl`}>
        <div className="text-center space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${themeConfig.accent}`}>
            Create Account
          </h1>
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Join GrowTyping to track your progress and compete globally
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Username</label>
              <div className="relative">
                <FiUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Full Name</label>
              <div className="relative">
                <FiUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Email Address</label>
            <div className="relative">
              <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Password</label>
            <div className="relative">
              <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="password"
                required
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Location (Optional)</label>
            <div className="relative">
              <FiMapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="text"
                placeholder="City / Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${themeConfig.buttonPrimary} text-xs font-bold tracking-wider uppercase transition-all shadow-md mt-2`}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className={`h-px flex-1 ${themeConfig.border}`} />
          <span className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}>or</span>
          <div className={`h-px flex-1 ${themeConfig.border}`} />
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          className={`w-full py-3 ${themeConfig.buttonSecondary} text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md`}
        >
          <FcGoogle className="text-lg" />
          <span>Continue with Google</span>
        </button>

        <div className="text-center pt-2">
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Already registered?{" "}
            <Link to="/login" className={`font-bold ${themeConfig.accent} hover:underline`}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
