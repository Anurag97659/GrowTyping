import React, { createContext, useContext, useEffect, useState } from "react";
import { getThemeConfig, THEMES } from "../config/themeStyles";
import api from "../lib/api";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return window.localStorage.getItem("growtyping.themeId") || "glassmorphism";
  });

  const [mode, setMode] = useState(() => {
    return window.localStorage.getItem("growtyping.themeMode") || "dark";
  });

  const themeConfig = getThemeConfig(themeId, mode);

  useEffect(() => {
    window.localStorage.setItem("growtyping.themeId", themeId);
    window.localStorage.setItem("growtyping.themeMode", mode);

    // Apply data attributes to body for universal CSS targeting
    document.body.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-mode", mode);
  }, [themeId, mode]);

  // Load theme from profile if user is logged in
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const res = await api.get("/GrowTyping/v1/users/me");
        if (res.data?.loggedIn) {
          const profileRes = await api.get("/GrowTyping/v1/users/getuserprofile");
          const savedTheme = profileRes.data?.data?.theme;
          if (savedTheme) {
            if (savedTheme.includes(":")) {
              const [savedId, savedMode] = savedTheme.split(":");
              if (savedId) setThemeId(savedId);
              if (savedMode) setMode(savedMode);
            } else {
              setThemeId(savedTheme);
            }
          }
        }
      } catch (err) {
        // Silently fail if guest or offline
      }
    };
    fetchUserTheme();
  }, []);

  const changeTheme = async (newThemeId) => {
    setThemeId(newThemeId);
    try {
      await api.post("/GrowTyping/v1/users/updatetheme", { theme: `${newThemeId}:${mode}` });
    } catch (err) {}
  };

  const toggleMode = async () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    try {
      await api.post("/GrowTyping/v1/users/updatetheme", { theme: `${themeId}:${newMode}` });
    } catch (err) {}
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        mode,
        themeConfig,
        THEMES,
        setThemeId: changeTheme,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
