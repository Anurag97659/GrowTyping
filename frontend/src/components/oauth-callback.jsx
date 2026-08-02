import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { setAccessToken } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { themeConfig, applyThemeFromData } = useTheme();
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (started.current) return;
    started.current = true;

    if (!token) {
      setError("The Google sign-in link is missing or invalid.");
      return;
    }

    const complete = async () => {
      try {
        const response = await api.post("GrowTyping/v1/users/oauth/google/complete", { token });
        setAccessToken(response.data?.data?.accessToken);
        applyThemeFromData(response.data?.data?.user);
        navigate("/typing", { replace: true });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Google sign-in could not be completed. Please try again."
        );
      }
    };

    complete();
  }, [applyThemeFromData, navigate, searchParams]);

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${themeConfig.card} border ${themeConfig.border} p-8 text-center space-y-5 shadow-2xl`}>
        {error ? (
          <>
            <FiAlertCircle className="mx-auto text-5xl text-red-400" />
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold">Google sign-in failed</h1>
              <p className={`text-xs leading-relaxed ${themeConfig.mutedText}`}>{error}</p>
            </div>
            <Link to="/login" className={`inline-block w-full py-3 ${themeConfig.buttonPrimary} text-xs font-bold uppercase tracking-wider`}>
              Return to Login
            </Link>
          </>
        ) : (
          <>
            <FiLoader className={`mx-auto text-5xl animate-spin ${themeConfig.accent}`} />
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold">Completing Google sign-in</h1>
              <p className={`text-xs ${themeConfig.mutedText}`}>Please wait a moment…</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
