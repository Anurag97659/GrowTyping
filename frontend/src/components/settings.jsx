import React, { useEffect, useState } from "react";
import api, { clearAccessToken } from "../lib/api";
import { FiEdit, FiKey, FiTrash2, FiLogOut, FiSun, FiMoon, FiArrowLeft } from "react-icons/fi";

const getTheme = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("growtyping.theme") || "dark"
    : "dark";

const Profile = () => {
  const [profile, setProfile] = useState({
    _id: "",
    username: "",
    fullname: "",
    email: "",
    address: "",
    joined: "",
  });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(getTheme);

  const isLight = theme === "light";

  const toggleTheme = () => {
    const next = isLight ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("growtyping.theme", next);
  };

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
          joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
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
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("GrowTyping/v1/users/logout");
      clearAccessToken();
      alert("Logged out successfully.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleChangePassword = () => {
    if (profile.username.toLowerCase() === "avasanam") {
      alert("Password changes are disabled for this user.");
      return;
    }
    window.location.href = "/change-password";
  };

  /* ── colour tokens ────────────────────────────────────── */
  const bg      = isLight ? "bg-[#F8FAFC]"    : "bg-[#0D1117]";
  const cardBg  = isLight ? "bg-white"         : "bg-[#161B22]";
  const border  = isLight ? "border-[#E2E8F0]" : "border-[#30363D]";
  const divider = isLight ? "divide-[#E2E8F0]" : "divide-[#30363D]";
  const text1   = isLight ? "text-[#0F172A]"   : "text-[#E6EDF3]";
  const text2   = isLight ? "text-[#64748B]"   : "text-[#8B949E]";
  const hoverRow = isLight ? "hover:bg-[#F8FAFC]" : "hover:bg-[#21262D]/60";

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bg} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <p className="text-emerald-500 text-sm font-semibold tracking-wider animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const avatarInitial = profile.username ? profile.username[0].toUpperCase() : "?";

  return (
    <div className={`min-h-screen ${bg} font-sans transition-colors duration-300`}>

      {/* ── Sticky Header ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-sm ${
        isLight ? "bg-white/90 border-[#E2E8F0]" : "bg-[#0D1117]/90 border-[#30363D]"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">GT</span>
          </div>
          <div>
            <h1 className={`text-base font-bold ${text1}`}>Account Settings</h1>
            <p className={`text-xs ${text2}`}>Manage your profile and preferences</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isLight
                ? "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]"
                : "bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]"
            }`}
          >
            {isLight ? <FiMoon size={14} /> : <FiSun size={14} className="text-amber-400" />}
            <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
          </button>
          <button
            onClick={() => (window.location.href = "/typing")}
            className={`p-2 rounded-lg border transition-all ${
              isLight
                ? "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                : "bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D]"
            }`}
            title="Back to Typing"
          >
            <FiArrowLeft size={16} />
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Avatar + name ── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-md mb-4">
            {avatarInitial}
          </div>
          <h2 className={`text-2xl font-bold ${text1}`}>{profile.fullname || profile.username}</h2>
          <p className={`text-sm ${text2} mt-1`}>@{profile.username}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-semibold">Active Member</span>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── Account Details card ── */}
          <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
              <h3 className={`text-sm font-bold ${text1}`}>Account Details</h3>
              <button
                onClick={() => (window.location.href = "/edit-profile")}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              >
                <FiEdit size={12} />
                Edit Profile
              </button>
            </div>

            <div className={`divide-y ${divider}`}>
              {[
                { label: "User ID",    value: profile._id },
                { label: "Username",   value: profile.username },
                { label: "Full Name",  value: profile.fullname },
                { label: "Email",      value: profile.email },
                { label: "Address",    value: profile.address || "Not provided" },
                { label: "Joined On",  value: profile.joined },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-6 py-3.5 ${hoverRow} transition-colors duration-150`}
                >
                  <span className={`text-xs font-semibold ${text2} uppercase tracking-wider`}>{label}</span>
                  <span className={`text-sm font-medium ${text1} max-w-xs text-right truncate`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Security card ── */}
          <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`px-6 py-4 border-b ${border}`}>
              <h3 className={`text-sm font-bold ${text1}`}>Security</h3>
            </div>
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                  isLight ? "bg-[#F1F5F9] border-[#E2E8F0]" : "bg-[#21262D] border-[#30363D]"
                }`}>
                  <FiKey size={15} className="text-amber-400" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${text1}`}>Password</p>
                  <p className={`text-xs ${text2}`}>Keep your account secure</p>
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                  isLight
                    ? "bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A] hover:border-amber-400 hover:text-amber-600"
                    : "bg-[#21262D] border-[#30363D] text-[#8B949E] hover:border-amber-500/50 hover:text-amber-400"
                }`}
              >
                <FiKey size={12} />
                Change Password
              </button>
            </div>
          </div>

          {/* ── Account Actions card ── */}
          <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`px-6 py-4 border-b ${border}`}>
              <h3 className={`text-sm font-bold ${text1}`}>Account Actions</h3>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  isLight
                    ? "bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A] hover:border-[#CBD5E1]"
                    : "bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]"
                }`}
              >
                <FiLogOut size={14} />
                Sign Out
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 bg-red-500/8 border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/40"
              >
                <FiTrash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>

          {/* ── Footer note ── */}
          <p className={`text-center text-xs ${text2} pt-2 pb-6`}>
            Member since {profile.joined} — GrowTyping
          </p>

        </div>
      </main>
    </div>
  );
};

export default Profile;
