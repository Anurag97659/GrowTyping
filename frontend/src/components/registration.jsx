import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
    withCredentials: true,
  });

  const submit = async (e) => {
    e.preventDefault();

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
        alert("Registration successful!");
        window.location.href = "/login";
      }
    } catch (error) {
      alert("User or email already exists. Try again.");
    }
  };

  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <motion.div
        initial={{y: 20, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{duration: 0.6, ease: "easeOut"}}
        className="w-full max-w-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-10 border border-purple-500/20 relative z-10"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
        
        <div className="relative z-20">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
            Create Account
          </h2>
          <p className="text-center text-slate-400 mb-6 text-sm font-medium">Join our community and start trading</p>

          <form onSubmit={submit} className="space-y-3">
            {[
              { label: "Full Name", type: "text", value: fullname, setter: setFullname, placeholder: "John Doe" },
              { label: "Email", type: "email", value: email, setter: setEmail, placeholder: "you@example.com" },
              { label: "Username", type: "text", value: username, setter: setUsername, placeholder: "johndoe" },
              { label: "Password", type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
              { label: "Address", type: "text", value: address, setter: setAddress, placeholder: "123 Main St, City, State" },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e)=> field.setter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300 hover:bg-slate-700/70 hover:border-slate-600/70"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <motion.button
              whileHover={{scale: 1.02, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"}}
              whileTap={{scale: 0.98}}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl transition duration-300 mt-4 text-lg tracking-wide"
            >
              Create Account
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            <span className="text-xs text-slate-500 font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-purple-400 hover:text-pink-400 transition duration-300">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Registration;
