import React,{ useEffect, useState } from "react";
import{ Link, useSearchParams } from "react-router-dom";
import axios from "axios";

function VerifyEmail(){
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  useEffect(() =>{
    const verify = async() =>{
      if(!token || !id){
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try{
        const api = axios.create({
          baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
          withCredentials: true,
        });

        const response = await api.get("GrowTyping/v1/users/verify-email",{
          params:{ token, id },
        });

        setStatus("success");
        setMessage(response?.data?.message || "Email verified successfully.");
      } catch(error){
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Verification link is invalid or expired."
        );
      }
    };

    verify();
  }, [id, token]);

  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-purple-500/20 relative z-10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>

        <div className="relative z-20 text-center">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Email Verification
          </h2>

          <p className="text-slate-300 text-base mt-4">{message}</p>

         {status === "loading" &&(
            <div className="mt-6 flex justify-center">
              <div className="w-10 h-10 border-4 border-purple-300/30 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
          )}

         {status !== "loading" &&(
            <Link
              to="/login"
              className="inline-block mt-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-2xl transition duration-300"
            >
              Go To Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
