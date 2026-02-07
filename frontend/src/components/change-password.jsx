import React,{ useState } from "react";
import axios from "axios";

function ChangePassword(){
  const[oldPassword,setoldpassword] = useState('');
  const[newPassword,setnewpassword] = useState('');
  const[confirmPassword,setconfirmpassword] = useState('');
  
  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/GrowTyping/v1",
    withCredentials: true,
  });

  const submit = async (e) => {
    e.preventDefault();
    if(newPassword !== confirmPassword){
      alert('password not matched');
      return;
    }
    try {
      const res = await api.post("/users/changePassword", {
        oldPassword,
        newPassword,
        confirmPassword
      });

      if(res.data.error){
        alert(res.data.error);
      } else {
        alert('Password changed successfully');
        window.location.href = '/login';
      }
    } catch(error){
      alert("Password change failed: " + error.message);
    }
  };
  
   
  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Change Password
        </h2>
        <form onSubmit={submit} id="form" className="space-y-6">
          <div>
            <label
              htmlFor="old"
              className="block text-sm font-semibold text-gray-100 mb-2"
            >
              Old Password
            </label>
            <input
              type="password"
              id="old"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e)=>setoldpassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="new"
              className="block text-sm font-semibold text-gray-100 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="new"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e)=>setnewpassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-semibold text-gray-100 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e)=>setconfirmpassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default  ChangePassword;
