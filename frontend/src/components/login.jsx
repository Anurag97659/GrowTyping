import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
    withCredentials: true,
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("GrowTyping/v1/users/login", {
        username,
        password,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Login successful");
        window.location.href = "/typing";
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };
  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-purple-500/20 relative z-10">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
      
      <div className="relative z-20">
        <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
        Login
        </h2>
        <p className="text-center text-slate-400 mb-6 text-sm font-medium">Welcome back to our community</p>

        <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Username</label>
          <input
          type="text"
          value={username}
          onChange={(e)=>setusername(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
          placeholder="Enter Username"
          required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
          <input
          type="password"
          value={password}
          onChange={(e)=>setpassword(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300"
          placeholder="Enter Password"
          required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl transition duration-300 mt-4 text-lg tracking-wide"
        >
          Login
        </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
        Create account{" "}
        <Link to="/registration" className="font-bold text-purple-400 hover:text-pink-400 transition duration-300">
          Sign Up
        </Link>
        </p>
      </div>
      </div>
    </div>
    );
  }

export default Login;
