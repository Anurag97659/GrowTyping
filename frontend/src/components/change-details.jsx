import React, { useState } from "react";
import api from "../lib/api";
import { FiArrowLeft } from "react-icons/fi";

const getTheme = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("growtyping.theme") || "dark"
    : "dark";

function ChangeDetails() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme] = useState(getTheme);

  const isLight = theme === "light";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("GrowTyping/v1/users/updatedetails", {
        username,
        email,
        fullname,
        address,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Details updated successfully.");
        window.location.href = "/settings";
      }
    } catch (error) {
      alert("Update failed: " + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /* ── colour tokens ────────────────────────────────────── */
  const bg      = isLight ? "bg-[#F8FAFC]"    : "bg-[#0D1117]";
  const cardBg  = isLight ? "bg-white"         : "bg-[#161B22]";
  const border  = isLight ? "border-[#E2E8F0]" : "border-[#30363D]";
  const text1   = isLight ? "text-[#0F172A]"   : "text-[#E6EDF3]";
  const text2   = isLight ? "text-[#64748B]"   : "text-[#8B949E]";
  const inputBg = isLight ? "bg-[#F1F5F9]"    : "bg-[#21262D]";
  const inputBdr = isLight ? "border-[#E2E8F0]" : "border-[#30363D]";

  const inputCls = `w-full px-4 py-3 ${inputBg} border ${inputBdr} rounded-lg ${text1}
    placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-emerald-500/40
    focus:border-emerald-500 transition-all duration-200 text-sm font-medium`;

  const labelCls = `block text-xs font-semibold ${text2} mb-1.5 uppercase tracking-widest`;

  return (
    <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-4 py-10 transition-colors duration-300`}>

      {/* ── Logo ── */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">GT</span>
        </div>
        <h1 className={`text-sm font-bold ${text2} tracking-widest uppercase`}>GrowTyping</h1>
      </div>

      {/* ── Card ── */}
      <div className={`w-full max-w-md ${cardBg} border ${border} rounded-2xl shadow-sm p-8`}>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => (window.location.href = "/settings")}
            className={`p-1.5 rounded-lg border transition-all ${
              isLight
                ? "border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]"
                : "border-[#30363D] text-[#8B949E] hover:bg-[#21262D]"
            }`}
          >
            <FiArrowLeft size={15} />
          </button>
          <div>
            <h2 className={`text-xl font-bold ${text1}`}>Edit Profile</h2>
            <p className={`text-xs ${text2}`}>Update your account information</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {[
            { label: "Username",  type: "text",  value: username,  setter: setUsername,  id: "uname",    placeholder: "Enter new username" },
            { label: "Email",     type: "email", value: email,     setter: setEmail,     id: "email",    placeholder: "Enter new email" },
            { label: "Full Name", type: "text",  value: fullname,  setter: setFullname,  id: "fullname", placeholder: "Enter full name" },
            { label: "Address",   type: "text",  value: address,   setter: setAddress,   id: "address",  placeholder: "Enter address" },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className={labelCls}>{field.label}</label>
              <input
                type={field.type}
                id={field.id}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-lg text-sm font-bold tracking-wide transition-all duration-200
              ${loading
                ? "bg-emerald-700/50 cursor-not-allowed text-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangeDetails;
