import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { clearAccessToken } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import {
  FiArrowLeft,
  FiUser,
  FiEdit,
  FiKey,
  FiTrash2,
  FiLogOut,
  FiSun,
  FiMoon,
  FiCheck,
  FiLayers,
  FiCalendar,
  FiMapPin,
  FiHash,
} from "react-icons/fi";

export default function Settings() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES } = useTheme();

  const [profile, setProfile] = useState({
    _id: "",
    username: "",
    fullname: "",
    email: "",
    address: "",
    joined: "",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appearance");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("GrowTyping/v1/users/getuserprofile");
        const data = res.data.data;
        setProfile({
          _id: data._id || "",
          username: data.username || "",
          fullname: data.fullname || "",
          email: data.email || "",
          address: data.address || "",
          joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDeleteUser = async () => {
    if (profile.username.toLowerCase() === "avasanam") {
      alert("Account deletion is disabled for this user.");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await api.post("GrowTyping/v1/users/deleteuser");
      clearAccessToken();
      alert("Your account has been deleted.");
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("GrowTyping/v1/users/logout");
      clearAccessToken();
      // Reset to default guest theme
      setThemeId('glassmorphism');
      // Ensure dark mode for guests
      // Using setMode directly because we only need to change the mode state
      // The ThemeContext provides setMode setter
      setMode('dark');
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      clearAccessToken();
      alert("Logged out successfully.");
      navigate("/login");
    }
  };

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} p-4 sm:p-8 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className={`flex items-center justify-between p-4 ${themeConfig.card} border ${themeConfig.border}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/typing")}
              className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FiArrowLeft className="text-base" /> Typing Page
            </button>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${themeConfig.accent}`}>
              Settings & Customization
            </h1>
          </div>

          <button
            onClick={toggleMode}
            className={`p-2.5 ${themeConfig.buttonSecondary} transition-all`}
            title="Toggle Dark / Light Mode"
          >
            {mode === "dark" ? <FiSun className="text-sm" /> : <FiMoon className="text-sm" />}
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className={`flex gap-2 p-1.5 ${themeConfig.card} border ${themeConfig.border} overflow-x-auto`}>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "appearance"
                ? themeConfig.buttonPrimary
                : `${themeConfig.mutedText} hover:${themeConfig.bodyText}`
            }`}
          >
            <FiLayers className="text-sm" /> Appearance & Themes
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "profile"
                ? themeConfig.buttonPrimary
                : `${themeConfig.mutedText} hover:${themeConfig.bodyText}`
            }`}
          >
            <FiUser className="text-sm" /> Profile Details
          </button>
        </div>

        {/* Tab 1: Appearance & Theme Selector Grid */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-4`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>
                    Universal Theme Gallery
                  </h2>
                  <p className={`text-xs ${themeConfig.mutedText}`}>
                    Select an art style. Themes apply universally across all pages.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${themeConfig.mutedText}`}>Mode:</span>
                  <button
                    onClick={toggleMode}
                    className={`px-4 py-2 text-xs font-bold ${themeConfig.buttonSecondary} flex items-center gap-2 capitalize`}
                  >
                    {mode === "dark" ? <FiMoon /> : <FiSun />}
                    <span>{mode} Mode</span>
                  </button>
                </div>
              </div>

              {/* Grid of Theme Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
                {THEMES.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? `${themeConfig.border} ${themeConfig.accent} ring-2 ring-indigo-500/40 scale-[1.02]`
                          : `${themeConfig.cardInset} border-transparent opacity-80 hover:opacity-100`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">
                          <FiCheck />
                        </div>
                      )}
                      <div>
                        <h3 className={`text-base font-extrabold ${themeConfig.bodyText} mb-1`}>
                          {theme.name}
                        </h3>
                        <p className={`text-xs ${themeConfig.mutedText} leading-relaxed`}>
                          {theme.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${
                          isSelected ? themeConfig.buttonPrimary : themeConfig.cardInset
                        }`}>
                          {isSelected ? "Active Theme" : "Apply Theme"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile Details & Danger Zone */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-6`}>
              <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>
                User Profile Details
              </h2>

              {loading ? (
                <p className={`text-sm ${themeConfig.mutedText} animate-pulse`}>
                  Loading account profile...
                </p>
              ) : (
                <div className="space-y-4 max-w-2xl">
                  {/* User ID */}
                  <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
                      <FiHash className="text-xs" /> User ID
                    </p>
                    <p className={`text-sm font-mono font-bold ${themeConfig.accent}`}>
                      {profile._id || "Not Available"}
                    </p>
                  </div>

                  {/* Username & Full Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
                        <FiUser className="text-xs" /> Username
                      </p>
                      <p className={`text-base font-extrabold ${themeConfig.bodyText}`}>
                        {profile.username || "Guest"}
                      </p>
                    </div>

                    <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
                        <FiUser className="text-xs" /> Full Name
                      </p>
                      <p className={`text-base font-extrabold ${themeConfig.bodyText}`}>
                        {profile.fullname || "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Email & Joined Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                        Email Address
                      </p>
                      <p className={`text-sm font-extrabold ${themeConfig.bodyText} truncate`}>
                        {profile.email || "Not set"}
                      </p>
                    </div>

                    <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
                        <FiCalendar className="text-xs" /> Joined On
                      </p>
                      <p className={`text-sm font-extrabold ${themeConfig.bodyText}`}>
                        {profile.joined}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className={`${themeConfig.cardInset} p-4 space-y-1`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
                      <FiMapPin className="text-xs" /> Address / Location
                    </p>
                    <p className={`text-sm font-extrabold ${themeConfig.bodyText}`}>
                      {profile.address || "Not provided"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className={`px-4 py-2.5 ${themeConfig.buttonPrimary} text-xs font-bold flex items-center gap-2`}
                    >
                      <FiEdit className="text-sm" /> Edit Profile Details
                    </button>
                    <button
                      onClick={() => navigate("/change-password")}
                      className={`px-4 py-2.5 ${themeConfig.buttonSecondary} text-xs font-bold flex items-center gap-2`}
                    >
                      <FiKey className="text-sm" /> Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className={`p-6 ${themeConfig.card} border border-red-500/30 space-y-4`}>
              <h2 className="text-lg font-extrabold text-red-500">Account Security & Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                >
                  <FiLogOut className="text-sm" /> Sign Out
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <FiTrash2 className="text-sm" /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
