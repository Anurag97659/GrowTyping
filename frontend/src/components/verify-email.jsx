import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const { themeConfig } = useTheme();

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
            "Verification link is invalid or has expired. Please request a new one."
        );
      }
    };

    verify();
  }, [id, token]);

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex flex-col justify-center items-center p-4 transition-colors duration-300`}>
      <div className={`w-full max-w-md ${themeConfig.card} border ${themeConfig.border} p-8 space-y-6 shadow-2xl text-center`}>
        <div className="flex justify-center">
          {status === "loading" && (
            <FiLoader className={`text-4xl animate-spin ${themeConfig.accent}`} />
          )}
          {status === "success" && (
            <FiCheckCircle className="text-5xl text-emerald-400" />
          )}
          {status === "error" && (
            <FiAlertCircle className="text-5xl text-red-400" />
          )}
        </div>

        <h1 className={`text-2xl font-extrabold tracking-tight ${themeConfig.bodyText}`}>
          Email Verification
        </h1>

        <p className={`text-xs ${themeConfig.mutedText} leading-relaxed`}>
          {message}
        </p>

        <div className="pt-2">
          <Link
            to="/login"
            className={`inline-block w-full py-3 ${themeConfig.buttonPrimary} text-xs font-bold uppercase tracking-wider transition-all`}
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
