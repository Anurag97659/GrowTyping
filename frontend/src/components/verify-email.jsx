import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";

const getTheme = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("growtyping.theme") || "dark"
    : "dark";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [theme] = useState(getTheme);

  const isLight = theme === "light";
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  useEffect(() => {
    const verify = async () => {
      if (!token || !id) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        const response = await api.get("GrowTyping/v1/users/verify-email", {
          params: { token, id },
        });

        setStatus("success");
        setMessage(response?.data?.message || "Email verified successfully. You can now sign in.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Verification link is invalid or has expired. Please request a new one.",
        );
      }
    };

    verify();
  }, [id, token]);

  /* ── colour tokens ────────────────────────────────────── */
  const bg     = isLight ? "bg-[#F8FAFC]"    : "bg-[#0D1117]";
  const cardBg = isLight ? "bg-white"         : "bg-[#161B22]";
  const border = isLight ? "border-[#E2E8F0]" : "border-[#30363D]";
  const text1  = isLight ? "text-[#0F172A]"   : "text-[#E6EDF3]";
  const text2  = isLight ? "text-[#64748B]"   : "text-[#8B949E]";

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
      <div className={`w-full max-w-md ${cardBg} border ${border} rounded-2xl shadow-sm p-10 text-center`}>

        {/* Status icon area */}
        <div className="flex justify-center mb-6">
          {status === "loading" && (
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          )}
          {status === "success" && (
            <div className="w-14 h-14 rounded-full bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <h2 className={`text-2xl font-bold ${text1} mb-3`}>Email Verification</h2>

        <p className={`text-sm leading-relaxed ${status === "success" ? "text-emerald-500" : status === "error" ? "text-red-400" : text2}`}>
          {message}
        </p>

        {status !== "loading" && (
          <Link
            to="/login"
            className="inline-block mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm"
          >
            Go to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
