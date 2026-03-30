import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiKey, FiTrash2, FiLogOut } from "react-icons/fi";

const Profile = () => {
    const [profile, setProfile] = useState({
        _id: "",
        username: "",
        fullname: "",
        email: "",
        address: "",
        joined: "",
    });
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
        withCredentials: true,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get("GrowTyping/v1/users/getuserprofile");
                const data = res.data.data;
                setProfile({
                    _id: data._id || "",
                    username: data.username || "",
                    fullname: data.fullname || "",
                    email: data.email || "",
                    address: data.address || "",
                    joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleDeleteUser = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );
        if (!confirmed) return;
        try {
            await api.post("GrowTyping/v1/users/deleteuser");
            alert("Your account has been deleted.");
            window.location.href = "/";
        } catch (err) {
            console.error("Error deleting account:", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("GrowTyping/v1/users/logout");
            alert("Logged out successfully.");
            window.location.href = "/login";
        } catch (err) {
            console.error("Error logging out:", err);
            alert("Failed to log out. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-fuchsia-500 animate-spin"></div>
                    </div>
                    <p className="text-violet-400 text-base font-medium tracking-widest uppercase animate-pulse">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] font-sans py-14 px-4"
            style={{
                backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.07) 0%, transparent 60%),
                                  radial-gradient(ellipse at 80% 80%, rgba(217,70,239,0.05) 0%, transparent 60%)`
            }}
        >
            
            <div className="max-w-2xl mx-auto mb-10 text-center">
                <div className="relative inline-flex items-center justify-center mb-5">
                    <div className="absolute inset-0 rounded-full bg-violet-600/30 blur-xl scale-150"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-violet-500/40 ring-4 ring-violet-500/20">
                        {profile.username ? profile.username[0].toUpperCase() : "?"}
                    </div>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300 bg-clip-text text-transparent">
                    {profile.fullname || profile.username}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                    <p className="text-violet-400 text-sm tracking-wider">@{profile.username}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-emerald-400 text-xs font-medium tracking-wider">Active Member</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-5">
                
                <div className="relative bg-[#111118] border border-white/5 rounded-3xl shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5 pointer-events-none"></div>
                    <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
                        <h2 className="text-base font-bold text-white flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                            </span>
                            Account Details
                        </h2>
                        <button
                            onClick={() => (window.location.href = "/edit-profile")}
                            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-4 py-2 rounded-xl transition-all duration-300 text-xs font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95"
                        >
                            <FiEdit size={13} /> Edit Profile
                        </button>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {[
                            { label: "User ID", value: profile._id },
                            { label: "Username", value: profile.username },
                            { label: "Full Name", value: profile.fullname },
                            { label: "Email", value: profile.email},
                            { label: "Address", value: profile.address || "Not provided"},
                            { label: "Joined On", value: profile.joined },
                        ].map(({ label, value}) => (
                            <div
                                key={label}
                                className="flex items-center justify-between px-7 py-4 hover:bg-white/[0.03] transition-colors duration-200 group/item"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-sm font-medium">{label}</span>
                                </div>
                                <span className="text-gray-200 text-sm font-semibold max-w-xs text-right truncate group-hover/item:text-violet-300 transition-colors">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

               
                <div className="relative bg-[#111118] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-orange-600/5 pointer-events-none"></div>
                    <div className="px-7 py-5 border-b border-white/5">
                        <h2 className="text-base font-bold text-white flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            </span>
                            Security
                        </h2>
                    </div>
                    <div className="px-7 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <FiKey size={16} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-gray-200 font-semibold text-sm">Password</p>
                                    <p className="text-gray-600 text-xs mt-0.5">Protect your account</p>
                                </div>
                            </div>
                            <button
                                onClick={() => (window.location.href = "/change-password")}
                                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 px-4 py-2 rounded-xl transition-all duration-300 text-xs font-semibold hover:scale-105 active:scale-95"
                            >
                                <FiKey size={13} /> Change Password
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="relative bg-[#111118] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-rose-600/5 pointer-events-none"></div>
                    <div className="px-7 py-5 border-b border-white/5">
                        <h2 className="text-base font-bold text-white flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            </span>
                            Account Actions
                        </h2>
                    </div>
                    <div className="px-7 py-6 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold border border-white/5 hover:border-white/10 hover:scale-[1.02] active:scale-95"
                        >
                            <FiLogOut size={15} className="text-gray-400" />
                            Sign Out
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="flex-1 flex items-center justify-center gap-2.5 bg-red-500/5 hover:bg-red-500/15 text-red-500 hover:text-red-400 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold border border-red-500/10 hover:border-red-500/30 hover:scale-[1.02] active:scale-95"
                        >
                            <FiTrash2 size={15} />
                            Delete Account
                        </button>
                    </div>
                </div>

                
                <div className="text-center pb-6 pt-2">
                    <div className="inline-flex items-center gap-2 text-gray-700 text-xs">
                        <span className="w-8 h-px bg-gray-800"></span>
                        Member since {profile.joined} · GrowTyping
                        <span className="w-8 h-px bg-gray-800"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Profile;
