import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import {
  FiArrowLeft,
  FiSearch,
  FiUserPlus,
  FiUserCheck,
  FiTrash2,
  FiBarChart2,
  FiSun,
  FiMoon,
  FiUser,
  FiX,
} from "react-icons/fi";

export default function Friends() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES } = useTheme();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const [selectedUserStats, setSelectedUserStats] = useState(null);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.get("/GrowTyping/v1/users/friends");
      setFriends(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(`/GrowTyping/v1/users/search?query=${encodeURIComponent(q.trim())}`);
      setSearchResults(res.data?.data || []);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await api.post("/GrowTyping/v1/users/follow", { userIdToFollow: userId });
      await fetchFriends();
    } catch (err) {
      console.error("Error adding friend:", err);
      alert(err.response?.data?.message || "Failed to add friend.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await api.post("/GrowTyping/v1/users/unfollow", { userIdToUnfollow: userId });
      await fetchFriends();
    } catch (err) {
      console.error("Error removing friend:", err);
      alert(err.response?.data?.message || "Failed to remove friend.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const isAlreadyFriend = (userId) => {
    return friends.some((f) => (f._id || f.friend?._id) === userId);
  };

  const handleViewStats = async (friendId, friendUsername) => {
    try {
      setSelectedUserStats({ username: friendUsername, loading: true });
      const res = await api.get(`/GrowTyping/v1/stats/public/${friendId}`);
      setSelectedUserStats({
        username: friendUsername,
        stats: res.data?.data,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching friend stats:", err);
      setSelectedUserStats({
        username: friendUsername,
        stats: null,
        loading: false,
      });
    }
  };

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} p-4 sm:p-8 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className={`flex items-center justify-between p-4 ${themeConfig.card} border ${themeConfig.border}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/typing")}
              className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FiArrowLeft className="text-base" /> Typing Page
            </button>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${themeConfig.accent}`}>
              Friends & Community
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className={`px-3 py-1.5 text-xs font-medium ${themeConfig.input} cursor-pointer`}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={toggleMode}
              className={`p-2.5 ${themeConfig.buttonSecondary} transition-all`}
              title="Toggle Dark / Light Mode"
            >
              {mode === "dark" ? <FiSun className="text-sm" /> : <FiMoon className="text-sm" />}
            </button>
          </div>
        </div>

        {/* Find Friends Search Box */}
        <div className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-4`}>
          <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>Search & Add Typists</h2>
          <div className="relative max-w-xl">
            <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={handleSearch}
              className={`w-full pl-11 pr-4 py-3 text-xs ${themeConfig.input}`}
            />
          </div>

          {searchQuery && (
            <div className="pt-2">
              {searchLoading ? (
                <p className={`text-xs ${themeConfig.mutedText} animate-pulse`}>Searching users...</p>
              ) : searchResults.length === 0 ? (
                <p className={`text-xs ${themeConfig.mutedText}`}>No typists found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {searchResults.map((user) => {
                    const friendAlready = isAlreadyFriend(user._id);

                    return (
                      <div
                        key={user._id}
                        className={`p-4 ${themeConfig.cardInset} border ${themeConfig.border} flex items-center justify-between rounded-xl`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${themeConfig.card} border ${themeConfig.border} flex items-center justify-center font-bold text-xs ${themeConfig.accent}`}>
                            {user.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${themeConfig.bodyText}`}>{user.username}</p>
                            <p className={`text-[10px] ${themeConfig.mutedText}`}>{user.fullname || "Typist"}</p>
                          </div>
                        </div>

                        {friendAlready ? (
                          <button
                            disabled
                            className={`px-3 py-1.5 ${themeConfig.buttonSecondary} opacity-70 cursor-not-allowed text-[11px] font-bold flex items-center gap-1.5`}
                          >
                            <FiUserCheck className="text-emerald-400" /> Friend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(user._id)}
                            disabled={actionLoading[user._id]}
                            className={`px-3 py-1.5 ${themeConfig.buttonPrimary} text-[11px] font-bold flex items-center gap-1.5`}
                          >
                            <FiUserPlus /> {actionLoading[user._id] ? "Adding..." : "Add Friend"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Friends List Grid */}
        <div className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>Your Friends List</h2>
            <span className={`text-xs ${themeConfig.mutedText}`}>{friends.length} Friends</span>
          </div>

          {loading ? (
            <p className={`text-xs ${themeConfig.mutedText} animate-pulse text-center p-8`}>
              Loading friends network...
            </p>
          ) : friends.length === 0 ? (
            <div className={`p-8 text-center ${themeConfig.cardInset}`}>
              <p className={`text-sm ${themeConfig.mutedText}`}>
                You haven't added any friends yet. Use the search bar above to find typists!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((item) => {
                const friendUser = item.friend || item;
                const fId = friendUser._id || item._id;

                return (
                  <div
                    key={fId}
                    className={`p-5 ${themeConfig.cardInset} border ${themeConfig.border} rounded-2xl flex flex-col justify-between space-y-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${themeConfig.card} border ${themeConfig.border} flex items-center justify-center font-extrabold text-sm ${themeConfig.accent}`}>
                        {friendUser.username?.[0]?.toUpperCase() || "F"}
                      </div>
                      <div className="truncate">
                        <p className={`text-sm font-extrabold ${themeConfig.bodyText} truncate`}>
                          {friendUser.username}
                        </p>
                        <p className={`text-[10px] ${themeConfig.mutedText} truncate`}>
                          {friendUser.fullname || "GrowTyping Member"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleViewStats(fId, friendUser.username)}
                        className={`flex-1 py-2 ${themeConfig.buttonSecondary} text-xs font-bold flex items-center justify-center gap-1.5`}
                      >
                        <FiBarChart2 /> View Stats
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(fId)}
                        disabled={actionLoading[fId]}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                        title="Remove Friend"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Friend Stats Modal */}
      {selectedUserStats && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${themeConfig.card} max-w-lg w-full p-6 border ${themeConfig.border} space-y-6 shadow-2xl relative`}>
            <button
              onClick={() => setSelectedUserStats(null)}
              className={`absolute top-4 right-4 p-2 ${themeConfig.buttonSecondary}`}
            >
              <FiX className="text-base" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${themeConfig.cardInset} flex items-center justify-center font-extrabold text-sm ${themeConfig.accent}`}>
                {selectedUserStats.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className={`text-xl font-extrabold ${themeConfig.bodyText}`}>
                  {selectedUserStats.username}'s Telemetry
                </h3>
                <p className={`text-xs ${themeConfig.mutedText}`}>Performance stats and metrics</p>
              </div>
            </div>

            {selectedUserStats.loading ? (
              <p className={`text-xs ${themeConfig.mutedText} animate-pulse p-6 text-center`}>
                Fetching user statistics...
              </p>
            ) : selectedUserStats.stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className={`${themeConfig.cardInset} p-4 text-center space-y-1`}>
                  <p className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}>Top Speed</p>
                  <p className={`text-3xl font-black ${themeConfig.accent}`}>
                    {selectedUserStats.stats?.highestWpm || selectedUserStats.stats?.topWpm || 0} WPM
                  </p>
                </div>
                <div className={`${themeConfig.cardInset} p-4 text-center space-y-1`}>
                  <p className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}>Avg Speed</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {Math.round(selectedUserStats.stats?.avgWpm || 0)} WPM
                  </p>
                </div>
                <div className={`${themeConfig.cardInset} p-4 text-center space-y-1`}>
                  <p className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}>Avg Accuracy</p>
                  <p className="text-3xl font-black text-indigo-400">
                    {selectedUserStats.stats?.avgAccuracy ? Number(selectedUserStats.stats.avgAccuracy).toFixed(1) : 100}%
                  </p>
                </div>
                <div className={`${themeConfig.cardInset} p-4 text-center space-y-1`}>
                  <p className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}>Total Tests</p>
                  <p className="text-3xl font-black text-amber-400">
                    {selectedUserStats.stats?.totalTests || selectedUserStats.stats?.totalSessions || 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className={`text-xs ${themeConfig.mutedText} text-center p-4`}>
                No stats available for this user.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
