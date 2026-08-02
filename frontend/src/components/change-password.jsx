import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiLock } from "react-icons/fi";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();

  const [oldPassword, setoldpassword] = useState("");
  const [newPassword, setnewpassword] = useState("");
  const [confirmPassword, setconfirmpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("GrowTyping/v1/users/changePassword", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Password changed successfully.");
        navigate("/login");
      }
    } catch (error) {
      alert(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex flex-col justify-center items-center p-4 transition-colors duration-300`}>
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/settings")}
          className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-xs font-bold`}
        >
          <FiArrowLeft className="text-sm" /> Back to Settings
        </button>
      </div>

      <div className={`w-full max-w-md ${themeConfig.card} border ${themeConfig.border} p-8 space-y-6 shadow-2xl`}>
        <div className="text-center space-y-1">
          <h1 className={`text-2xl font-extrabold tracking-tight ${themeConfig.accent}`}>
            Change Password
          </h1>
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Ensure your account is using a strong password
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Current Password</label>
            <div className="relative">
              <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setoldpassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>New Password</label>
            <div className="relative">
              <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setnewpassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Confirm New Password</label>
            <div className="relative">
              <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setconfirmpassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${themeConfig.buttonPrimary} text-xs font-bold tracking-wider uppercase transition-all shadow-md mt-2`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
