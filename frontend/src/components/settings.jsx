import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiKey, FiTrash2, FiLogOut } from "react-icons/fi";

const Profile = () => {
    const [profile, setProfile] = useState({
        username: "",
        fullname: "",
        email: "",
        address: "",
        joined: "",
    });
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/GrowTyping/v1",
        withCredentials: true,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get("/users/getuserprofile"); 
                const data = res.data.data;
                setProfile({
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
            await api.post("/users/deleteuser"); 
            alert("Your account has been deleted.");
            window.location.href = "/"; 
        } catch (err) {
            console.error("Error deleting account:", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/users/logout"); 
            alert("Logged out successfully.");
            window.location.href = "/login"; 
        } catch (err) {
            console.error("Error logging out:", err);
            alert("Failed to log out. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-10 text-gray-500 text-lg">Loading profile...</div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen font-sans">
            <h1 className="text-center text-4xl font-bold text-gray-100 mb-8">
                Profile
            </h1>

            <div className="bg-gray-800 shadow-lg rounded-lg p-8 border border-gray-700 max-w-2xl mx-auto">
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-200">Account Details</h2>
                        <button
                            onClick={() => (window.location.href = "/edit-profile")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                        >
                            <FiEdit /> Edit Details
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="text-gray-300 text-base">Username: <span className="text-gray-100 font-medium">{profile.username}</span></div>
                            <hr className="border-gray-700 mt-1" />
                        </div>

                        <div>
                            <div className="text-gray-300 text-base">Full Name: <span className="text-gray-100 font-medium">{profile.fullname}</span></div>
                            <hr className="border-gray-700 mt-1" />
                        </div>

                        <div>
                            <div className="text-gray-300 text-base">Email: <span className="text-gray-100 font-medium">{profile.email}</span></div>
                            <hr className="border-gray-700 mt-1" />
                        </div>

                        <div>
                            <div className="text-gray-300 text-base">Address: <span className="text-gray-100 font-medium">{profile.address}</span></div>
                            <hr className="border-gray-700 mt-1" />
                        </div>

                        <div>
                            <div className="text-gray-300 text-base">Joined On: <span className="text-gray-100 font-medium">{profile.joined}</span></div>
                            <hr className="border-gray-700 mt-1" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-2">Security</h2>
                        <button
                            onClick={() => (window.location.href = "/change-password")}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                        >
                            <FiKey /> Change Password
                        </button>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-2">Danger Zone</h2>
                        <button
                            onClick={handleDeleteUser}
                            className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg transition-all text-sm"
                        >
                            <FiTrash2 /> Delete Account
                        </button>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-2">Logout</h2>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                        >
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
