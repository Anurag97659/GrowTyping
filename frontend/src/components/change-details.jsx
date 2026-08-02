import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiUser, FiMail, FiMapPin } from "react-icons/fi";

export default function ChangeDetails() {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("GrowTyping/v1/users/updatedetails", {
        username: username || undefined,
        email: email || undefined,
        fullname: fullname || undefined,
        address: address || undefined,
      });
      if(username =="avasanam") {
        throw new Error("This feature is not available for this user.");
      }
      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Details updated successfully.");
        navigate("/settings");
      }
    } catch (error) {
      alert("Update failed: " + (error?.response?.data?.message || error.message));
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
            Update Profile Information
          </h1>
          <p className={`text-xs ${themeConfig.mutedText}`}>
            Modify your username, full name, email, or location
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>New Username</label>
            <div className="relative">
              <FiUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="text"
                placeholder="Leave blank to keep current"
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
                placeholder="Leave blank to keep current"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Email Address</label>
            <div className="relative">
              <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="email"
                placeholder="Leave blank to keep current"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-xs ${themeConfig.input}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${themeConfig.mutedText}`}>Location</label>
            <div className="relative">
              <FiMapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
              <input
                type="text"
                placeholder="Leave blank to keep current"
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
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
