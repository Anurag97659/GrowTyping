import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import HistoryHeatmap from "./HistoryHeatmap";
import {
  FiArrowLeft,
  FiSearch,
  FiUserPlus,
  FiUserCheck,
  FiTrash2,
  FiBarChart2,
  FiSun,
  FiMoon,
  FiX,
  FiAward,
  FiCalendar,
  FiClock,
  FiCheck,
  FiInbox,
  FiUsers,
} from "react-icons/fi";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
const STAT_RANGES = [
  { id: "today", label: "Today" },
  { id: "lastDay", label: "Last Day" },
  { id: "lastWeek", label: "Last Week" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "allTime", label: "All Time" },
];

export default function Friends() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES } = useTheme();

  const [activeTab, setActiveTab] = useState("friends"); // "friends" | "requests"
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState({});
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [selectedStatsRange, setSelectedStatsRange] = useState("allTime");

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

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await api.get("/GrowTyping/v1/users/friend-requests");
      setRequests(res.data?.data || { received: [], sent: [] });
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchFriends(), fetchRequests()]);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (!query.trim()) return setSearchResults([]);
    try {
      setSearchLoading(true);
      const res = await api.get(
        `/GrowTyping/v1/users/search?query=${encodeURIComponent(query.trim())}`
      );
      setSearchResults(res.data?.data || []);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const isAlreadyFriend = (userId) =>
    friends.some((f) => (f._id || f.friend?._id) === userId);

  const isAlreadyRequested = (userId) =>
    (requests.sent || []).some((r) => r._id === userId);

  const hasIncomingRequest = (userId) =>
    (requests.received || []).some((r) => r._id === userId);

  const handleSendRequest = async (targetUserId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
      await api.post("/GrowTyping/v1/users/send-friend-request", { targetUserId });
      await refreshAll();
      if (searchQuery.trim()) {
        const res = await api.get(`/GrowTyping/v1/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data?.data || []);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert(err.response?.data?.message || "Failed to send friend request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [senderId]: true }));
      await api.post("/GrowTyping/v1/users/accept-friend-request", { senderId });
      await refreshAll();
      if (searchQuery.trim()) {
        const res = await api.get(`/GrowTyping/v1/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data?.data || []);
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
      alert(err.response?.data?.message || "Failed to accept friend request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [senderId]: false }));
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [senderId]: true }));
      await api.post("/GrowTyping/v1/users/reject-friend-request", { senderId });
      await refreshAll();
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      alert(err.response?.data?.message || "Failed to reject friend request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [senderId]: false }));
    }
  };

  const handleCancelRequest = async (targetUserId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
      await api.post("/GrowTyping/v1/users/cancel-friend-request", { targetUserId });
      await refreshAll();
    } catch (err) {
      console.error("Error canceling friend request:", err);
      alert(err.response?.data?.message || "Failed to cancel friend request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        await api.post("/GrowTyping/v1/users/unfollow", { userIdToUnfollow: userId, friendId: userId });
        await refreshAll();
      } catch (err) {
        console.error("Error removing friend:", err);
        alert(err.response?.data?.message || "Failed to remove friend.");
      } finally {
        setActionLoading((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  const fetchFriendTelemetry = async (userId, username, range) => {
    setSelectedUserStats((current) => ({
      username,
      userId,
      stats: current?.userId === userId ? current.stats : null,
      loading: true,
    }));
    try {
      const res = await api.get(
        `/GrowTyping/v1/stats/public-telemetry/${userId}?range=${range}`
      );
      setSelectedUserStats({
        username,
        userId,
        stats: res.data?.data,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching friend telemetry:", err);
      setSelectedUserStats({ username, userId, stats: null, loading: false });
    }
  };

  const handleViewStats = (userId, username) => {
    setSelectedStatsRange("allTime");
    fetchFriendTelemetry(userId, username, "allTime");
  };

  const handleStatsRangeChange = (range) => {
    if (!selectedUserStats || range === selectedStatsRange) return;
    setSelectedStatsRange(range);
    fetchFriendTelemetry(
      selectedUserStats.userId,
      selectedUserStats.username,
      range
    );
  };

  const pendingRequestsCount = requests.received ? requests.received.length : 0;

  return (
    <div
      className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} p-4 sm:p-8 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <header
          className={`flex items-center justify-between p-4 ${themeConfig.card} border ${themeConfig.border} flex-wrap gap-3`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/typing")}
              className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FiArrowLeft /> Typing Page
            </button>
            <h1
              className={`text-xl sm:text-2xl font-extrabold ${themeConfig.accent}`}
            >
              Friends & Community
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={themeId}
              onChange={(event) => setThemeId(event.target.value)}
              className={`px-3 py-1.5 text-xs ${themeConfig.input}`}
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <button
              onClick={toggleMode}
              className={`p-2.5 ${themeConfig.buttonSecondary}`}
            >
              {mode === "dark" ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>

        {/* Search & Add Typists */}
        <section
          className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-4`}
        >
          <h2 className="text-lg font-extrabold">Search & Add Typists</h2>
          <div className="relative max-w-xl">
            <FiSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`}
            />
            <input
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by username..."
              className={`w-full pl-11 pr-4 py-3 text-xs ${themeConfig.input}`}
            />
          </div>
          {searchQuery && (
            <div className="pt-2">
              {searchLoading ? (
                <p className={`text-xs ${themeConfig.mutedText}`}>
                  Searching users...
                </p>
              ) : searchResults.length === 0 ? (
                <p className={`text-xs ${themeConfig.mutedText}`}>
                  No typists found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((user) => {
                    const friend = isAlreadyFriend(user._id) || user.isFriend;
                    const requested = isAlreadyRequested(user._id) || user.isRequested;
                    const incoming = hasIncomingRequest(user._id) || user.hasIncomingRequest;

                    return (
                      <div
                        key={user._id}
                        className={`p-4 ${themeConfig.cardInset} border ${themeConfig.border} flex items-center justify-between rounded-xl`}
                      >
                        <div>
                          <p className="text-xs font-bold">{user.username}</p>
                          <p className={`text-[10px] ${themeConfig.mutedText}`}>
                            {user.fullname || "Typist"}
                          </p>
                        </div>
                        <div>
                          {friend ? (
                            <span
                              className={`px-3 py-1.5 ${themeConfig.buttonSecondary} text-[11px] font-bold flex items-center gap-1 opacity-80`}
                            >
                              <FiUserCheck className="text-emerald-400" /> Friend
                            </span>
                          ) : requested ? (
                            <span
                              className={`px-3 py-1.5 ${themeConfig.card} text-amber-400 text-[11px] font-bold flex items-center gap-1 border ${themeConfig.border}`}
                            >
                              <FiClock /> Requested
                            </span>
                          ) : incoming ? (
                            <button
                              disabled={actionLoading[user._id]}
                              onClick={() => handleAcceptRequest(user._id)}
                              className={`px-3 py-1.5 ${themeConfig.buttonPrimary} text-[11px] font-bold flex items-center gap-1`}
                            >
                              <FiCheck /> Accept Request
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading[user._id]}
                              onClick={() => handleSendRequest(user._id)}
                              className={`px-3 py-1.5 ${themeConfig.buttonPrimary} text-[11px] font-bold flex items-center gap-1`}
                            >
                              <FiUserPlus />{" "}
                              {actionLoading[user._id] ? "Sending..." : "Add Friend"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tab Toggle Header & Main Content Section */}
        <section
          className={`p-6 ${themeConfig.card} border ${themeConfig.border} space-y-6`}
        >
          {/* Toggle Options: Friends vs Requests */}
          <div className="flex items-center justify-between border-b pb-4 gap-4 flex-wrap border-slate-700/30">
            <div className={`flex gap-2 ${themeConfig.cardInset} p-1.5 rounded-xl border ${themeConfig.border}`}>
              <button
                onClick={() => setActiveTab("friends")}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activeTab === "friends"
                    ? themeConfig.buttonPrimary
                    : `${themeConfig.mutedText} hover:${themeConfig.bodyText}`
                }`}
              >
                <FiUsers className="text-sm" />
                <span>Friends</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-black/20 font-mono">
                  {friends.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("requests")}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 relative ${
                  activeTab === "requests"
                    ? themeConfig.buttonPrimary
                    : `${themeConfig.mutedText} hover:${themeConfig.bodyText}`
                }`}
              >
                <FiInbox className="text-sm" />
                <span>Requests</span>
                {pendingRequestsCount > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {pendingRequestsCount}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-black/20 font-mono">
                    0
                  </span>
                )}
              </button>
            </div>

            <span className={`text-xs ${themeConfig.mutedText}`}>
              {activeTab === "friends"
                ? `${friends.length} connected friends`
                : `${pendingRequestsCount} pending incoming request${pendingRequestsCount === 1 ? "" : "s"}`}
            </span>
          </div>

          {/* Tab 1: Friends List */}
          {activeTab === "friends" && (
            <div>
              {loading ? (
                <p className={`text-xs ${themeConfig.mutedText} text-center p-8`}>
                  Loading friends network...
                </p>
              ) : friends.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <FiUsers className={`mx-auto text-3xl ${themeConfig.mutedText}`} />
                  <p className={`text-sm ${themeConfig.mutedText}`}>
                    You haven't added any friends yet. Use the search box above to find typists and send requests!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((item) => {
                    const friend = item.friend || item;
                    const id = friend._id || item._id;
                    return (
                      <div
                        key={id}
                        className={`p-5 ${themeConfig.cardInset} border ${themeConfig.border} rounded-2xl space-y-4 shadow-sm`}
                      >
                        <div>
                          <p className="text-sm font-extrabold">
                            {friend.username}
                          </p>
                          <p className={`text-[10px] ${themeConfig.mutedText}`}>
                            {friend.fullname || "GrowTyping Member"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewStats(id, friend.username)}
                            className={`flex-1 py-2 ${themeConfig.buttonSecondary} text-xs font-bold flex justify-center items-center gap-1`}
                          >
                            <FiBarChart2 /> View Stats
                          </button>
                          <button
                            disabled={actionLoading[id]}
                            onClick={() => handleRemoveFriend(id)}
                            title="Remove Friend"
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Requests Section */}
          {activeTab === "requests" && (
            <div className="space-y-8">
              {/* Incoming Requests */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <FiInbox className={themeConfig.accent} /> Incoming Friend Requests ({requests.received?.length || 0})
                </h3>

                {requestsLoading ? (
                  <p className={`text-xs ${themeConfig.mutedText} p-4`}>Loading requests...</p>
                ) : !requests.received || requests.received.length === 0 ? (
                  <div className={`p-6 text-center ${themeConfig.cardInset} border ${themeConfig.border} rounded-xl`}>
                    <p className={`text-xs ${themeConfig.mutedText}`}>No pending incoming friend requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requests.received.map((reqUser) => (
                      <div
                        key={reqUser._id}
                        className={`p-4 ${themeConfig.cardInset} border ${themeConfig.border} rounded-xl flex items-center justify-between gap-3`}
                      >
                        <div>
                          <p className="text-xs font-bold">{reqUser.username}</p>
                          <p className={`text-[10px] ${themeConfig.mutedText}`}>
                            {reqUser.fullname || "Typist"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionLoading[reqUser._id]}
                            onClick={() => handleAcceptRequest(reqUser._id)}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                          >
                            <FiCheck /> Accept
                          </button>
                          <button
                            disabled={actionLoading[reqUser._id]}
                            onClick={() => handleRejectRequest(reqUser._id)}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-4 pt-4 border-t border-slate-700/30">
                <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <FiClock className={themeConfig.accent} /> Sent Friend Requests ({requests.sent?.length || 0})
                </h3>

                {requestsLoading ? (
                  <p className={`text-xs ${themeConfig.mutedText} p-4`}>Loading sent requests...</p>
                ) : !requests.sent || requests.sent.length === 0 ? (
                  <div className={`p-6 text-center ${themeConfig.cardInset} border ${themeConfig.border} rounded-xl`}>
                    <p className={`text-xs ${themeConfig.mutedText}`}>No pending sent requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requests.sent.map((reqUser) => (
                      <div
                        key={reqUser._id}
                        className={`p-4 ${themeConfig.cardInset} border ${themeConfig.border} rounded-xl flex items-center justify-between gap-3`}
                      >
                        <div>
                          <p className="text-xs font-bold">{reqUser.username}</p>
                          <p className={`text-[10px] ${themeConfig.mutedText}`}>
                            {reqUser.fullname || "Typist"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${themeConfig.mutedText} flex items-center gap-1 mr-1`}>
                            <FiClock /> Pending
                          </span>
                          <button
                            disabled={actionLoading[reqUser._id]}
                            onClick={() => handleCancelRequest(reqUser._id)}
                            className="px-3 py-1.5 bg-slate-700/40 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Telemetry Stats Modal */}
      {selectedUserStats && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className={`${themeConfig.card} max-w-6xl w-full max-h-[92vh] overflow-y-auto p-6 border ${themeConfig.border} space-y-5 shadow-2xl relative`}
          >
            <button
              onClick={() => setSelectedUserStats(null)}
              className={`absolute top-4 right-4 p-2 ${themeConfig.buttonSecondary}`}
            >
              <FiX />
            </button>
            <div>
              <h3 className="text-xl font-extrabold">
                {selectedUserStats.username}'s Telemetry
              </h3>
              <p className={`text-xs ${themeConfig.mutedText}`}>
                Performance, personal records, weak keys, and keyboard accuracy
              </p>
            </div>
            <div
              className={`p-3 ${themeConfig.cardInset} border ${themeConfig.border} flex items-center gap-3 flex-wrap`}
            >
              <span
                className={`text-[10px] font-bold uppercase ${themeConfig.mutedText} flex items-center gap-1`}
              >
                <FiCalendar /> Current range
              </span>
              {STAT_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleStatsRangeChange(range.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold ${selectedStatsRange === range.id ? themeConfig.buttonPrimary : themeConfig.buttonSecondary}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {selectedUserStats.loading && !selectedUserStats.stats ? (
              <p
                className={`text-xs ${themeConfig.mutedText} animate-pulse p-6 text-center`}
              >
                Fetching user statistics...
              </p>
            ) : selectedUserStats.stats ? (
              <FriendTelemetry
                stats={selectedUserStats.stats}
                userId={selectedUserStats.userId}
                range={
                  STAT_RANGES.find((range) => range.id === selectedStatsRange)
                    ?.label
                }
                themeConfig={themeConfig}
                refreshing={selectedUserStats.loading}
              />
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

function FriendTelemetry({ stats, userId, range, themeConfig, refreshing }) {
  const overview = stats.overview || {};
  const allTimeRecords = Object.entries(stats.allTimeBestRecords || {});
  const rangeRecords = Object.entries(stats.rangeBestRecords || {});
  const keyStats = Object.fromEntries(
    (stats.heatmap || []).map((item) => [item.key, item])
  );
  const weakKeys = Object.values(keyStats)
    .filter((item) => item.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 5);
  const maxMistakes = Math.max(...weakKeys.map((item) => item.mistakes), 1);
  return (
    <div className="space-y-5">
      {refreshing && (
        <p className={`text-[10px] animate-pulse ${themeConfig.mutedText}`}>
          Refreshing {range.toLowerCase()} statistics...
        </p>
      )}
      <section className="space-y-3">
        <div className="flex justify-between">
          <h4 className="text-sm font-extrabold">{range} Snapshot</h4>
          <span className={`text-[10px] ${themeConfig.mutedText}`}>
            {overview.totalSessions || 0} tests
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [
              "Top Speed",
              `${Math.round(overview.highestWpm || 0)} WPM`,
              themeConfig.accent,
            ],
            [
              "Avg Speed",
              `${Math.round(overview.avgWpm || 0)} WPM`,
              "text-emerald-400",
            ],
            [
              "Avg Accuracy",
              `${Number(overview.avgAccuracy || 0).toFixed(1)}%`,
              "text-indigo-400",
            ],
            [
              "Practice Time",
              `${Math.round((overview.totalTime || 0) / 60)} min`,
              "text-amber-400",
            ],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className={`${themeConfig.cardInset} p-4 text-center border ${themeConfig.border}`}
            >
              <p
                className={`text-[10px] font-bold uppercase ${themeConfig.mutedText}`}
              >
                {label}
              </p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className={`${themeConfig.cardInset} p-5 border ${themeConfig.border} space-y-4`}
      >
        <h4 className="text-sm font-extrabold flex items-center gap-2">
          <FiAward className="text-amber-400" /> All-Time Best Records by Test
          Type
        </h4>
        {allTimeRecords.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allTimeRecords.map(([type, record]) => (
              <RecordCard
                key={type}
                type={type}
                record={record}
                themeConfig={themeConfig}
              />
            ))}
          </div>
        ) : (
          <Empty themeConfig={themeConfig} text="No completed tests yet." />
        )}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section
          className={`${themeConfig.cardInset} p-5 border ${themeConfig.border} space-y-3`}
        >
          <h4 className="text-sm font-extrabold">{range} Best Records</h4>
          {rangeRecords.length ? (
            rangeRecords.map(([type, record]) => (
              <div
                key={type}
                className={`${themeConfig.card} p-3 border ${themeConfig.border} grid grid-cols-4 gap-2 text-center text-xs`}
              >
                <b className={`${themeConfig.accent} uppercase self-center`}>
                  {type}
                </b>
                <span>
                  <b>{Math.round(record.highestWpm || 0)}</b>
                  <small className={`block ${themeConfig.mutedText}`}>
                    WPM
                  </small>
                </span>
                <span>
                  <b>{Math.round(record.highestAccuracy || 0)}%</b>
                  <small className={`block ${themeConfig.mutedText}`}>
                    accuracy
                  </small>
                </span>
                <span>
                  <b>{record.totalTests || 0}</b>
                  <small className={`block ${themeConfig.mutedText}`}>
                    tests
                  </small>
                </span>
              </div>
            ))
          ) : (
            <Empty themeConfig={themeConfig} text="No tests in this range." />
          )}
        </section>
        <section
          className={`${themeConfig.cardInset} p-5 border ${themeConfig.border} space-y-4`}
        >
          <h4 className="text-sm font-extrabold">Weak Keys</h4>
          {weakKeys.length ? (
            weakKeys.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-[22px_1fr_42px] items-center gap-2 text-xs"
              >
                <b className={`uppercase ${themeConfig.accent}`}>{item.key}</b>
                <div className="h-3 rounded-full bg-slate-700/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${(item.mistakes / maxMistakes) * 100}%` }}
                  />
                </div>
                <span className={`text-right ${themeConfig.mutedText}`}>
                  {item.mistakes} err
                </span>
              </div>
            ))
          ) : (
            <Empty
              themeConfig={themeConfig}
              text="No key-error data for this range."
            />
          )}
        </section>
      </div>
      <section
        className={`${themeConfig.cardInset} p-5 border ${themeConfig.border} space-y-4`}
      >
        <h4 className="text-sm font-extrabold">
          Keyboard Accuracy & Error Heatmap
        </h4>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] flex flex-col items-center gap-2 py-4">
            {KEYBOARD_ROWS.map((row) => (
              <div key={row.join("")} className="flex gap-2">
                {row.map((key) => {
                  const stat = keyStats[key],
                    attempts = stat?.attempts || 0,
                    mistakes = stat?.mistakes || 0,
                    errorRate = attempts ? (mistakes / attempts) * 100 : 0;
                  const color = !attempts
                    ? "bg-slate-700/40 border-slate-600/50 text-slate-400"
                    : errorRate === 0
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : errorRate < 15
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-red-500/20 border-red-500 text-red-400";
                  return (
                    <div
                      key={key}
                      title={`${key.toUpperCase()}: ${attempts} attempts, ${mistakes} errors`}
                      className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-bold ${color}`}
                    >
                      <span className="uppercase">{key}</span>
                      <span className="text-[9px] opacity-75">
                        {mistakes ? `${mistakes} err` : attempts ? "100%" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* <HistoryHeatmap themeConfig={themeConfig} userId={userId} /> */}
    </div>
  );
}

function RecordCard({ type, record, themeConfig }) {
  return (
    <div
      className={`${themeConfig.card} p-4 border ${themeConfig.border} space-y-2`}
    >
      <p className={`text-xs font-extrabold uppercase ${themeConfig.accent}`}>
        {type} mode
      </p>
      <div className="text-xs space-y-1">
        <p className="flex justify-between">
          <span className={themeConfig.mutedText}>Best speed</span>
          <b>{Math.round(record.highestWpm || 0)} WPM</b>
        </p>
        <p className="flex justify-between">
          <span className={themeConfig.mutedText}>Best accuracy</span>
          <b className="text-emerald-400">
            {Math.round(record.highestAccuracy || 0)}%
          </b>
        </p>
        <p className="flex justify-between">
          <span className={themeConfig.mutedText}>Max duration</span>
          <b className="text-amber-400">{record.longestDuration || 0}s</b>
        </p>
      </div>
    </div>
  );
}
function Empty({ themeConfig, text }) {
  return <p className={`text-xs ${themeConfig.mutedText}`}>{text}</p>;
}