import axios from "axios";

const ACCESS_TOKEN_KEY = "growtyping.accessToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const setAccessToken = (token) => {
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const clearAccessToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export default api;
