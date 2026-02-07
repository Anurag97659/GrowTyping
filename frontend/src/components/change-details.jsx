import React,{ useState, useEffect } from "react";
import axios from "axios";

function ChangeDetails(){
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/GrowTyping/v1",
    withCredentials: true,
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/users/updatedetails", {
        username,
        email,
        fullname,
        address,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Details changed successfully");
        window.location.href = "/login";
      }
    } catch (error) {
      alert("Details change failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl p-8 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center">
          Update Details
        </h2>
        <form onSubmit={submit} id="form" className="space-y-6">
          <div>
            <label htmlFor="uname" className="block text-sm font-bold text-purple-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="uname"
              placeholder="Enter Username"
              name="uname"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-purple-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter Email"
              name="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="fullname" className="block text-sm font-bold text-purple-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              placeholder="Enter Full Name"
              name="fullname"
              value={fullname}
              onChange={(e)=>setFullname(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-bold text-purple-300 mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              placeholder="Enter Address"
              name="address"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
          >
            Update Details
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangeDetails;
