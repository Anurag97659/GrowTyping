import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { getThemeConfig, THEMES } from "../config/themeStyles";
import api from "../lib/api";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return window.localStorage.getItem("growtyping.themeId") || "glassmorphism";
  });

  const [mode, setMode] = useState(() => {
    return window.localStorage.getItem("growtyping.themeMode") || "light";
  });

  const themeConfig = getThemeConfig(themeId, mode);

  useEffect(() => {
    window.localStorage.setItem("growtyping.themeId", themeId);
    window.localStorage.setItem("growtyping.themeMode", mode);

    // Apply data attributes to body for universal CSS targeting
    document.body.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-mode", mode);
  }, [themeId, mode]);

  /**
   * Fetches the user's saved theme from the server and applies it locally.
   * Call this after login so the user's preferred theme is restored instantly.
   */
  const refreshTheme = useCallback(async () => {
    try {
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
    } catch (err) {
      // Silently fail if token is missing or request fails
    }
  }, []);

  /**
   * Instantly applies a theme from a user object (e.g. from the login response),
   * avoiding an extra network round-trip.
   */
  const applyThemeFromData = useCallback((user) => {
    if (!user?.theme) return;
    const savedTheme = user.theme;
    if (savedTheme.includes(":")) {
      const [savedId, savedMode] = savedTheme.split(":");
      if (savedId) setThemeId(savedId);
      if (savedMode) setMode(savedMode);
    } else {
      setThemeId(savedTheme);
    }
  }, []);

  // Load theme from server on app mount if user is already logged in
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const res = await api.get("/GrowTyping/v1/users/me");
        if (res.data?.loggedIn) {
          await refreshTheme();
        }
      } catch (err) {
        // Silently fail if guest or offline
      }
    };
    fetchUserTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        refreshTheme,
        applyThemeFromData,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
