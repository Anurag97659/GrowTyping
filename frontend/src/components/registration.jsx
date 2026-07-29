import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

const getTheme = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("growtyping.theme") || "dark"
    : "dark";

function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
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
        const fallbackLink = res?.data?.data?.verificationUrl;
        const message =
          res?.data?.message ||
          "Registration successful. Please check your email and verify your account before login.";

        if (fallbackLink && import.meta.env.DEV) {
          console.info("Verification link (dev fallback):", fallbackLink);
        }

        alert(message);
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Registration failed. Try again.");
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

  const fields = [
    { label: "Full Name",  type: "text",     value: fullname,  setter: setFullname,  placeholder: "John Doe" },
    { label: "Email",      type: "email",    value: email,     setter: setEmail,     placeholder: "you@example.com" },
    { label: "Username",   type: "text",     value: username,  setter: setUsername,  placeholder: "johndoe" },
    { label: "Password",   type: "password", value: password,  setter: setPassword,  placeholder: "Create a password" },
    { label: "Address",    type: "text",     value: address,   setter: setAddress,   placeholder: "123 Main St, City" },
  ];

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
      <div className={`w-full max-w-2xl ${cardBg} border ${border} rounded-2xl shadow-sm p-8 md:p-10`}>
        <h2 className={`text-2xl font-bold ${text1} mb-1`}>Create account</h2>
        <p className={`text-sm ${text2} mb-7`}>Fill in the details below to get started.</p>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field, idx) => (
              <div key={idx} className={field.label === "Address" ? "md:col-span-2" : ""}>
                <label className={labelCls}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className={inputCls}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-7 py-3 rounded-lg text-sm font-bold tracking-wide transition-all duration-200
              ${loading
                ? "bg-emerald-700/50 cursor-not-allowed text-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className={`mt-6 pt-6 border-t ${border} text-center`}>
          <p className={`text-sm ${text2}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registration;
