import axios from "axios";

const ACCESS_TOKEN_KEY = "growtyping.accessToken";

const rawBaseURL = import.meta.env.VITE_REACT_APP_API || "http://localhost:8000";
const cleanBaseURL = rawBaseURL.replace(/\/+$/, "");

const api = axios.create({
  baseURL: cleanBaseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url && !config.url.startsWith("http")) {
    if (!config.url.startsWith("/")) {
      config.url = `/${config.url}`;
    }
  }

  return config;
});

export const setAccessToken = (token) => {
  if (token && token !== "undefined" && token !== "null") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const clearAccessToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export default api;
