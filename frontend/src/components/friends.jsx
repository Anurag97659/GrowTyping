import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { FiArrowLeft, FiSettings, FiSearch, FiUserPlus, FiUserCheck, FiTrash2, FiBarChart2, FiSun, FiMoon } from "react-icons/fi";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem("growtyping.theme") || "dark";
  });

  // Friend details modal state
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme = isLight ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("growtyping.theme", nextTheme);
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.get("GrowTyping/v1/users/friends");
      setFriends(res.data.data || []);
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
      const res = await api.get(`GrowTyping/v1/users/search?query=${encodeURIComponent(q.trim())}`);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const isFriend = (userId) => {
    return friends.some((f) => f._id === userId);
  };

  const handleAddFriend = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.post("GrowTyping/v1/users/follow", { userIdToFollow: userId });
      await fetchFriends();
      if (searchQuery.trim()) {
        const res = await api.get(`GrowTyping/v1/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add friend";
      alert(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveFriend = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.post("GrowTyping/v1/users/unfollow", { userIdToUnfollow: userId });
      await fetchFriends();
      if (searchQuery.trim()) {
        const res = await api.get(`GrowTyping/v1/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data.data || []);
      }
    } catch (err) {
      console.error("Error removing friend:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const fetchFriendStats = async (friend) => {
    setStatsLoading(true);
    try {
      const profileRes = await api.get(`GrowTyping/v1/users/public-profile/${friend.username}`);
      const user = profileRes.data.data;

      const [statsRes, bestRes, streakRes] = await Promise.all([
        api.get(`GrowTyping/v1/stats/public/${user._id}`),
        api.get(`GrowTyping/v1/stats/public-best/${user._id}`),
        api.get(`GrowTyping/v1/stats/public-streak/${user._id}`)
      ]);

      setSelectedUserStats({
        user,
        stats: statsRes.data.data || {},
        bestRecords: bestRes.data.data || {},
        streak: streakRes.data.data?.streak || 0
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-[#0b131e] text-slate-100"
      }`}
    >
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg ${
        isLight ? "bg-white/80 border-slate-200" : "bg-[#0f1927]/80 border-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-lg">GT</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              GrowTyping Friends
            </h1>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Connect & Compete with Typists
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 flex items-center gap-2 text-xs font-semibold ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isLight ? <FiMoon className="text-slate-600" size={16} /> : <FiSun className="text-amber-400" size={16} />}
            <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
          </button>

          <button
            onClick={() => (window.location.href = "/typing")}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
            title="Back to Typing"
          >
            <FiArrowLeft size={18} />
          </button>

          <button
            onClick={() => (window.location.href = "/settings")}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
            title="Settings"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* User Search Section */}
        <section className={`mb-10 p-6 rounded-2xl border backdrop-blur-md shadow-sm ${
          isLight
            ? "bg-white border-slate-200"
            : "bg-[#111c2d]/90 border-slate-800"
        }`}>
          <div className="flex flex-col gap-2 mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiSearch className="text-emerald-500" /> Find & Add Friends
            </h2>
            <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center gap-2 ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-600"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}>
              <span>
                <strong>Note:</strong> Find the user with their unique User ID or Username from their profile. Adding a user makes you mutual friends instantly!
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search users by Username or ID..."
              value={searchQuery}
              onChange={handleSearch}
              className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm focus:outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                  : "bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
              }`}
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown/Grid */}
          {searchQuery.trim() !== "" && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 && !searchLoading ? (
                <p className={`text-sm py-4 text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  No users found matching "{searchQuery}"
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((user) => {
                    const alreadyFriend = isFriend(user._id);
                    return (
                      <div
                        key={user._id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          isLight
                            ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                            : "bg-slate-800/50 border-slate-700/80 hover:border-slate-600"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-emerald-400 text-sm">@{user.username}</div>
                          <div className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            {user.fullname}
                          </div>
                        </div>
                        <button
                          onClick={() => (alreadyFriend ? handleRemoveFriend(user._id) : handleAddFriend(user._id))}
                          disabled={actionLoading[user._id]}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            alreadyFriend
                              ? "bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                              : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                          }`}
                        >
                          {actionLoading[user._id] ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : alreadyFriend ? (
                            <>
                              <FiUserCheck size={14} /> Remove
                            </>
                          ) : (
                            <>
                              <FiUserPlus size={14} /> Add Friend
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Friends List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>My Friends</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                {friends.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-emerald-500 animate-pulse">Loading Friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className={`p-12 rounded-2xl border text-center ${
              isLight ? "bg-white border-slate-200" : "bg-[#111c2d] border-slate-800"
            }`}>
              <h3 className="text-lg font-bold mb-1">No friends added yet</h3>
              <p className={`text-sm max-w-md mx-auto ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Use the search box above with a user's ID or username to find friends and compare typing stats!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                    isLight
                      ? "bg-white border-slate-200 hover:border-slate-300"
                      : "bg-[#111c2d] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                        {friend.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-emerald-400">@{friend.username}</h4>
                        <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {friend.fullname || "Typist"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => fetchFriendStats(friend)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isLight
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      <FiBarChart2 size={14} /> View Stats
                    </button>

                    <button
                      onClick={() => handleRemoveFriend(friend._id)}
                      disabled={actionLoading[friend._id]}
                      className="py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
                      title="Remove Friend"
                    >
                      {actionLoading[friend._id] ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Friend Stats Details Modal */}
        {(selectedUserStats || statsLoading) && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#111c2d] border-slate-800 text-white"
            }`}>
              {statsLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-emerald-400">Loading friend stats...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-emerald-400">@{selectedUserStats.user?.username}</h3>
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        {selectedUserStats.user?.fullname}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedUserStats(null)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className={`p-4 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"
                    }`}>
                      <div className="text-2xl font-black text-emerald-400">
                        {Math.round(selectedUserStats.stats?.avgWpm || 0)}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Avg WPM</div>
                    </div>

                    <div className={`p-4 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"
                    }`}>
                      <div className="text-2xl font-black text-teal-400">
                        {Math.round(selectedUserStats.stats?.avgAccuracy || 0)}%
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Avg Accuracy</div>
                    </div>

                    <div className={`p-4 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"
                    }`}>
                      <div className="text-2xl font-black text-amber-400">
                        {selectedUserStats.stats?.totalSessions || 0}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Sessions</div>
                    </div>

                    <div className={`p-4 rounded-xl border text-center ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"
                    }`}>
                      <div className="text-2xl font-black text-orange-400">
                        {selectedUserStats.streak} d
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Streak</div>
                    </div>
                  </div>

                  {/* Best Records */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                      All-Time Best Records
                    </h4>
                    {Object.keys(selectedUserStats.bestRecords).length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No test records completed yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedUserStats.bestRecords).map(([type, rec]) => (
                          <div
                            key={type}
                            className={`p-4 rounded-xl border ${
                              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"
                            }`}
                          >
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                              {type} Test
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Highest WPM</span>
                                <span className="font-bold text-emerald-400">{Math.round(rec.highestWpm || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Highest Accuracy</span>
                                <span className="font-bold text-teal-400">{Math.round(rec.highestAccuracy || 0)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Longest Duration</span>
                                <span className="font-bold text-amber-400">{Math.round(rec.longestDuration || 0)}s</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Friends;
