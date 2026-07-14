import React, { useEffect, useState } from "react";
import api, { clearAccessToken } from "../lib/api";
import { FiSettings, FiArrowLeft } from "react-icons/fi";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const HISTORY_PAGE_SIZE = 10;

const getBarLayout = (itemCount) => {
  const plotLeft = 44;
  const plotWidth = 536;
  const count = Math.max(itemCount, 1);
  const gap = count === 1 ? 0 : Math.min(24, Math.max(12, (plotWidth / count) * 0.12));
  const barWidth = (plotWidth - gap * (count - 1)) / count;

  return {
    barWidth,
    x: (index) => plotLeft + index * (barWidth + gap),
  };
};

const getTrendPoints = (values, maximum) => {
  const plotLeft = 42;
  const plotTop = 18;
  const plotWidth = 536;
  const plotHeight = 160;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? plotLeft + plotWidth / 2 : plotLeft + (index / (values.length - 1)) * plotWidth;
      const y = plotTop + plotHeight - (value / maximum) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");
};

const formatProgressDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const getHeatmapStyle = (keyStat, legacyMaximum) => {
  if (!keyStat) {
    return {
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.1)",
      color: "#6b7280",
    };
  }

  const intensity = keyStat.attempts
    ? keyStat.errorRate
    : (keyStat.mistakes / legacyMaximum) * 10;

  if (intensity === 0) {
    return {
      backgroundColor: "rgba(16, 185, 129, 0.18)",
      borderColor: "rgba(52, 211, 153, 0.55)",
      color: "#d1fae5",
    };
  }
  if (intensity < 3) {
    return {
      backgroundColor: "rgba(250, 204, 21, 0.2)",
      borderColor: "rgba(250, 204, 21, 0.6)",
      color: "#fef3c7",
    };
  }
  if (intensity < 7) {
    return {
      backgroundColor: "rgba(249, 115, 22, 0.22)",
      borderColor: "rgba(251, 146, 60, 0.65)",
      color: "#ffedd5",
    };
  }
  return {
    backgroundColor: "rgba(244, 63, 94, 0.24)",
    borderColor: "rgba(251, 113, 133, 0.7)",
    color: "#ffe4e6",
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [wpmByType, setWpmByType] = useState([]);
  const [accuracyByType, setAccuracyByType] = useState([]);
  const [weakKeys, setWeakKeys] = useState([]);
  const [keyboardHeatmap, setKeyboardHeatmap] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    totalRecords: 0,
    hasMore: false,
  });
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("thisYear");
  const [dashboardTheme, setDashboardTheme] = useState(() =>
    typeof window === "undefined"
      ? "current"
      : window.localStorage.getItem("growtyping.dashboardTheme") || "current",
  );
  const [bestRecordByType, setBestRecordByType] = useState({});
  const [allTimeBestByType, setAllTimeBestByType] = useState({});
  const [username, setUsername] = useState("User");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewingUserStats, setViewingUserStats] = useState(null);
  const [viewingUserBestRecords, setViewingUserBestRecords] = useState({});
  const [viewingUserStreak, setViewingUserStreak] = useState(0);
  const [loadingButtons, setLoadingButtons] = useState({});

  const fetchDashboard = async (selectedRange) => {
    try {
      setLoading(true);
      const statsData = await api.get(`GrowTyping/v1/stats/dashboard?range=${selectedRange}`);
      setStats(statsData.data.data);
      const wpmData = await api.get(`GrowTyping/v1/stats/average-wpm?range=${selectedRange}`);
      setWpmByType(wpmData.data.data);
      const accuracyData = await api.get(`GrowTyping/v1/stats/average-accuracy?range=${selectedRange}`);
      setAccuracyByType(accuracyData.data.data.map((item) => ({ testType: item._id, averageAccuracy: item.averageAccuracy ?? 0 })));
      const weakKeysData = await api.get(`GrowTyping/v1/stats/weak-keys?range=${selectedRange}`);
      setWeakKeys(weakKeysData.data.data);
      const heatmapData = await api.get(`GrowTyping/v1/stats/keyboard-heatmap?range=${selectedRange}`);
      setKeyboardHeatmap(heatmapData.data.data);
      const progressData = await api.get(`GrowTyping/v1/stats/daily-progress?range=${selectedRange}`);
      setDailyProgress(progressData.data.data);
      const streakData = await api.get(`GrowTyping/v1/stats/streak`);
      setStreak(streakData.data.data.streak || 0);
      const historyData = await api.get(`GrowTyping/v1/stats/history?range=${selectedRange}&page=1&limit=${HISTORY_PAGE_SIZE}`);
      const historyDataSet = historyData.data.data;
      setHistory(historyDataSet.items);
      setHistoryPagination(historyDataSet.pagination);
      setBestRecordByType(historyDataSet.bestRecords);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllTimeBest = async () => {
      try {
        const allTimeData = await api.get(`GrowTyping/v1/stats/history?page=1&limit=1`);
        setAllTimeBestByType(allTimeData.data.data.bestRecords);
      } catch (err) {
        console.error("Error fetching all-time best:", err);
      }
    };
    fetchAllTimeBest();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.get("GrowTyping/v1/users/getusername");
        setUsername(userData.data.data.username || "User");
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
        setUsername("Guest");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFollowersAndFollowing = async () => {
      try {
        const followersData = await api.get("GrowTyping/v1/users/followers");
        setFollowers(followersData.data.data || []);
        const followingData = await api.get("GrowTyping/v1/users/following");
        setFollowing(followingData.data.data || []);
      } catch (err) {
        console.error("Error fetching followers/following:", err);
      }
    };
    if (isLoggedIn) {
      fetchFollowersAndFollowing();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await api.post("GrowTyping/v1/users/logout");
      clearAccessToken();
      setIsLoggedIn(false);
      window.location.href = "/typing";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const loadMoreHistory = async () => {
    if (!historyPagination.hasMore || historyLoadingMore) return;

    setHistoryLoadingMore(true);
    try {
      const nextPage = historyPagination.page + 1;
      const response = await api.get(
        `GrowTyping/v1/stats/history?range=${range}&page=${nextPage}&limit=${HISTORY_PAGE_SIZE}`,
      );
      const historyData = response.data.data;
      setHistory((currentHistory) => [...currentHistory, ...historyData.items]);
      setHistoryPagination(historyData.pagination);
    } catch (err) {
      console.error("Error loading more typing history:", err);
    } finally {
      setHistoryLoadingMore(false);
    }
  };

  const replayTest = (test) => {
    window.sessionStorage.setItem(
      "growtyping.replayTest",
      JSON.stringify({
        testType: test.testType,
        testText: test.testText,
      }),
    );
    window.location.href = "/typing";
  };

  const viewUserProfile = async (username) => {
    try {
      const response = await api.get(`GrowTyping/v1/users/public-profile/${username}`);
      setViewingUserProfile(response.data.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await api.get(`GrowTyping/v1/users/search?query=${query}`);
      setSearchResults(response.data.data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const isUserFollowing = (userId) => {
    return following.some(f => f._id === userId);
  };

  const handleFollowFromSearch = async (userId) => {
    const isFollowing = isUserFollowing(userId);
    if (isFollowing) {
      try {
        await api.post("GrowTyping/v1/users/unfollow", { userIdToUnfollow: userId });
        const updatedFollowing = await api.get("GrowTyping/v1/users/following");
        setFollowing(updatedFollowing.data.data || []);
        const response = await api.get(`GrowTyping/v1/users/search?query=${searchQuery}`);
        setSearchResults(response.data.data || []);
      } catch (err) {
        console.error("Error unfollowing user:", err);
      }
    } else {
      try {
        await api.post("GrowTyping/v1/users/follow", { userIdToFollow: userId });
        const updatedFollowing = await api.get("GrowTyping/v1/users/following");
        setFollowing(updatedFollowing.data.data || []);
        const response = await api.get(`GrowTyping/v1/users/search?query=${searchQuery}`);
        setSearchResults(response.data.data || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "";
        if (errorMsg.includes("cannot") || errorMsg.includes("yourself")) {
          alert("You can't follow yourself!");
        } else {
          alert("Error following user. Please try again.");
        }
        console.error("Error following user:", err);
      }
    }
  };

  const handleUnfollow = async (userId) => {
    setLoadingButtons(prev => ({ ...prev, [`unfollow-${userId}`]: true }));
    try {
      await api.post("GrowTyping/v1/users/unfollow", { userIdToUnfollow: userId });
      const updatedFollowing = await api.get("GrowTyping/v1/users/following");
      setFollowing(updatedFollowing.data.data || []);
    } catch (err) {
      console.error("Error unfollowing user:", err);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`unfollow-${userId}`]: false }));
    }
  };

  const handleRemoveFollower = async (userId) => {
    setLoadingButtons(prev => ({ ...prev, [`remove-${userId}`]: true }));
    try {
      await api.post("GrowTyping/v1/users/remove-follower", { userIdToRemove: userId });
      const updatedFollowers = await api.get("GrowTyping/v1/users/followers");
      setFollowers(updatedFollowers.data.data || []);
    } catch (err) {
      console.error("Error removing follower:", err);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`remove-${userId}`]: false }));
    }
  };

  const fetchUserStats = async (username) => {
    try {
      const userResponse = await api.get(`GrowTyping/v1/users/public-profile/${username}`);
      const user = userResponse.data.data;
      setViewingUserStats(user);

      const statsResponse = await api.get(`GrowTyping/v1/stats/public/${user._id}`);
      const userStats = statsResponse.data.data;

      const bestRecordsResponse = await api.get(`GrowTyping/v1/stats/public-best/${user._id}`);
      const bestRecords = bestRecordsResponse.data.data;
      setViewingUserBestRecords(bestRecords || {});

      const streakResponse = await api.get(`GrowTyping/v1/stats/public-streak/${user._id}`);
      const streak = streakResponse.data.data.streak || 0;
      setViewingUserStreak(streak);
      setViewingUserStats({
        ...user,
        ...userStats
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setViewingUserStats(null);
    }
  };

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  useEffect(() => {
    window.localStorage.setItem("growtyping.dashboardTheme", dashboardTheme);
  }, [dashboardTheme]);

  const rangeLabel = {
    today: "Today", lastDay: "Last Day", lastWeek: "Last Week",
    lastMonth: "Last Month", last6Months: "Last 6 Months",
    thisYear: "This Year", previousYears: "Previous Years",
  };
  const isLightTheme = dashboardTheme === "light";

  if (loading)
    return (
      <div className={`flex items-center justify-center min-h-screen ${isLightTheme ? "bg-slate-100" : "bg-[#0f0f1a]"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-500 text-lg font-semibold tracking-widest animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );

  return (
    <div
      className={`dashboard min-h-screen font-sans ${isLightTheme ? "dashboard-light text-slate-900" : "text-white"}`}
      style={{
        background: isLightTheme
          ? "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0e7ff 100%)"
          : "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
     
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-black text-sm">GT</span>
          </div> */}
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            GrowTyping
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="today" className="bg-[#1a1a2e]">Today</option>
              <option value="lastDay" className="bg-[#1a1a2e]">Last Day</option>
              <option value="lastWeek" className="bg-[#1a1a2e]">Last Week</option>
              <option value="lastMonth" className="bg-[#1a1a2e]">Last Month</option>
              <option value="last6Months" className="bg-[#1a1a2e]">Last 6 Months</option>
              <option value="thisYear" className="bg-[#1a1a2e]">This Year</option>
              <option value="previousYears" className="bg-[#1a1a2e]">Previous Years</option>
            </select>
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            {[
              ["current", "Current"],
              ["light", "Light"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDashboardTheme(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  dashboardTheme === value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-pressed={dashboardTheme === value}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search users by ID"
              value={searchQuery}
              onChange={handleSearch}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/40 focus:bg-white/10 transition-all w-56"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            )}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                {searchResults.map((user) => {
                  const isFollowing = isUserFollowing(user._id);
                  return (
                    <div key={user._id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 group">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-violet-400">@{user.username}</div>
                        <div className="text-xs text-gray-600">{user.fullname}</div>
                      </div>
                      <button
                        onClick={() => handleFollowFromSearch(user._id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          isFollowing
                            ? "bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 hover:text-rose-300 border-rose-500/30 hover:border-rose-500/60"
                            : "bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 hover:text-violet-300 border-violet-500/30 hover:border-violet-500/60"
                        }`}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
            <span className="text-sm font-semibold text-violet-300">{username}</span>
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-rose-600/20 to-red-600/20 border border-rose-500/30 hover:from-rose-600 hover:to-red-600 px-5 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:text-white transition-all hover:scale-105"
            >
              Logout
            </button>
          )}

          <button
            onClick={() => (window.location.href = "/typing")}
            className="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl transition-all hover:scale-105 text-gray-400 hover:text-white"
            title="Back to Typing"
          >
            <FiArrowLeft size={18} />
          </button>

          <button
            onClick={() => (window.location.href = "/settings")}
            className="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl transition-all hover:scale-105 text-gray-400 hover:text-white"
            title="Settings"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-2xl mx-auto">
        
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Showing stats for <span className="text-violet-400 font-semibold">{rangeLabel[range]}</span>
          </p>
        </div>

       
        <div className="grid grid-cols-4 gap-5 mb-10">
          {[
            { label: "Total Sessions", value: stats.totalSessions || 0, color: "from-violet-600/20 to-violet-800/10", border: "border-violet-500/20", text: "text-violet-400" },
            { label: "Total Time (s)", value: stats.totalTime || 0,  color: "from-cyan-600/20 to-cyan-800/10", border: "border-cyan-500/20", text: "text-cyan-400" },
            { label: "Average WPM", value: stats.avgWpm !== undefined && stats.avgWpm !== null ? stats.avgWpm.toFixed(2) : 0,  color: "from-emerald-600/20 to-emerald-800/10", border: "border-emerald-500/20", text: "text-emerald-400" },
            { label: "Typing Streak ", value: `${streak} days`, color: "from-orange-600/20 to-orange-800/10", border: "border-orange-500/20", text: "text-orange-400" },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group cursor-default`}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{card.label}</div>
              <div className={`text-3xl font-black ${card.text}`}>{card.value}</div>
            </div>
          ))}
        </div>

        
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Best Record — <span className="text-violet-400">{rangeLabel[range]}</span></h2>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {["15s", "30s", "60s", "custom"].map((type) => {
              const record = bestRecordByType[type] || { highestWpm: 0, highestAccuracy: 0, longestDuration: 0 };
              return (
                <div
                  key={type}
                  className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="inline-block bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1 text-xs font-bold text-violet-400 uppercase tracking-wider mb-5">
                    {type} Test
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">WPM</span>
                      <span className="font-black text-lg text-violet-300">{record.highestWpm}</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</span>
                      <span className="font-black text-lg text-emerald-400">{record.highestAccuracy}%</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Duration</span>
                      <span className="font-black text-lg text-cyan-400">{record.longestDuration}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

    
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">All-Time Best <span className="text-amber-400"></span></h2>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {["15s", "30s", "60s", "custom"].map((type) => {
              const record = allTimeBestByType[type] || { highestWpm: 0, highestAccuracy: 0, longestDuration: 0 };
              return (
                <div
                  key={type}
                  className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-5">
                    {type} Test
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">WPM</span>
                      <span className="font-black text-lg text-amber-300">{record.highestWpm}</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</span>
                      <span className="font-black text-lg text-amber-300">{record.highestAccuracy}%</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Duration</span>
                      <span className="font-black text-lg text-amber-300">{record.longestDuration}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Avg WPM by Type</h3>
            </div>
            <svg width="100%" height="220" viewBox="0 0 600 240" preserveAspectRatio="none">
              {(() => {
                const maxWpm = Math.max(50, ...wpmByType.map((item) => item.averageWpm ?? 0));
                const step = Math.ceil(maxWpm / 5);
                return (
                  <>
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const val = i * step;
                      return (
                        <g key={i}>
                          <line x1="35" y1={200 - (val / maxWpm) * 170} x2="580" y2={200 - (val / maxWpm) * 170} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <text x="0" y={200 - (val / maxWpm) * 170 + 4} fontSize="10" fill="#6B7280">{val}</text>
                        </g>
                      );
                    })}
                    <line x1="35" y1="200" x2="580" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  </>
                );
              })()}
              {wpmByType.map((item, index) => {
                const avgWpm = item.averageWpm ?? 0;
                const maxWpm = Math.max(50, ...wpmByType.map((i) => i.averageWpm ?? 0));
                const barHeight = (avgWpm / maxWpm) * 170;
                const layout = getBarLayout(wpmByType.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={index}>
                    <defs>
                      <linearGradient id={`wpmGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <rect x={barX} y={200 - barHeight} width={layout.barWidth} height={barHeight} fill={`url(#wpmGrad${index})`} rx="6" />
                    <text x={barCenter} y={200 - barHeight - 8} textAnchor="middle" fontSize="11" fill="#c4b5fd" fontWeight="bold">{avgWpm.toFixed(1)}</text>
                    <text x={barCenter} y="216" textAnchor="middle" fontSize="11" fill="#6B7280">{item._id}</text>
                  </g>
                );
              })}
            </svg>
          </div>

         
          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Avg Accuracy by Type</h3>
            </div>
            <svg width="100%" height="220" viewBox="0 0 600 240" preserveAspectRatio="none">
              {[0, 20, 40, 60, 80, 100].map((val, idx) => (
                <g key={idx}>
                  <line x1="35" y1={200 - (val / 100) * 170} x2="580" y2={200 - (val / 100) * 170} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x="0" y={200 - (val / 100) * 170 + 4} fontSize="10" fill="#6B7280">{val}</text>
                </g>
              ))}
              <line x1="35" y1="200" x2="580" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {accuracyByType.map((item, index) => {
                const avgAcc = item.averageAccuracy ?? 0;
                const barHeight = (avgAcc / 100) * 170;
                const layout = getBarLayout(accuracyByType.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={index}>
                    <defs>
                      <linearGradient id={`accGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <rect x={barX} y={200 - barHeight} width={layout.barWidth} height={barHeight} fill={`url(#accGrad${index})`} rx="6" />
                    <text x={barCenter} y={200 - barHeight - 8} textAnchor="middle" fontSize="11" fill="#6ee7b7" fontWeight="bold">{avgAcc.toFixed(1)}</text>
                    <text x={barCenter} y="216" textAnchor="middle" fontSize="11" fill="#6B7280">{item.testType}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Top Weak Keys</h3>
            </div>
            <svg width="100%" height="220" viewBox="0 0 600 240" preserveAspectRatio="none">
              {(() => {
                const maxMistakes = Math.max(10, ...weakKeys.map((item) => item.totalMistakes ?? 0));
                const step = Math.ceil(maxMistakes / 5);
                return (
                  <>
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const value = i * step;
                      return (
                        <g key={i}>
                          <line x1="35" y1={200 - (value / maxMistakes) * 170} x2="580" y2={200 - (value / maxMistakes) * 170} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <text x="0" y={200 - (value / maxMistakes) * 170 + 4} fontSize="10" fill="#6B7280">{value}</text>
                        </g>
                      );
                    })}
                    <line x1="35" y1="200" x2="580" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  </>
                );
              })()}
              {weakKeys.map((item, index) => {
                const mistakes = item.totalMistakes ?? 0;
                const maxMistakes = Math.max(10, ...weakKeys.map((keyStat) => keyStat.totalMistakes ?? 0));
                const barHeight = (mistakes / maxMistakes) * 170;
                const layout = getBarLayout(weakKeys.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={item._id || index}>
                    <defs>
                      <linearGradient id={`weakGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#be123c" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <rect x={barX} y={200 - barHeight} width={layout.barWidth} height={barHeight} fill={`url(#weakGrad${index})`} rx="6" />
                    <text x={barCenter} y={200 - barHeight - 8} textAnchor="middle" fontSize="11" fill="#fda4af" fontWeight="bold">{mistakes}</text>
                    <text x={barCenter} y="216" textAnchor="middle" fontSize="11" fill="#6B7280">{item._id}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="lg:col-span-3 bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-rose-500/30 transition-all">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Keyboard Heatmap</h3>
              </div>
              <p className="text-xs text-gray-500">Hover a key to view its mistake rate</p>
            </div>
            {(() => {
              const heatmapByKey = Object.fromEntries(
                keyboardHeatmap.map((keyStat) => [keyStat.key, keyStat]),
              );
              const legacyMaximum = Math.max(
                1,
                ...keyboardHeatmap
                  .filter((keyStat) => !keyStat.attempts)
                  .map((keyStat) => keyStat.mistakes),
              );

              return (
                <>
                  <div className="mx-auto max-w-3xl space-y-2" aria-label="Keyboard mistake heatmap">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div
                        key={row.join("")}
                        className={`flex justify-center gap-1.5 sm:gap-2 ${rowIndex === 1 ? "sm:px-5" : rowIndex === 2 ? "sm:px-12" : ""}`}
                      >
                        {row.map((key) => {
                          const keyStat = heatmapByKey[key];
                          const hasAttemptData = keyStat?.attempts > 0;
                          const label = !keyStat
                            ? `${key.toUpperCase()}: no data yet`
                            : hasAttemptData
                              ? `${key.toUpperCase()}: ${keyStat.mistakes} mistakes in ${keyStat.attempts} attempts (${keyStat.errorRate}% error rate)`
                              : `${key.toUpperCase()}: ${keyStat.mistakes} recorded mistakes`;

                          return (
                            <div
                              key={key}
                              title={label}
                              aria-label={label}
                              className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border font-mono text-sm font-black uppercase shadow-sm transition-transform hover:-translate-y-0.5 sm:h-14 sm:text-lg"
                              style={getHeatmapStyle(keyStat, legacyMaximum)}
                            >
                              {key}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400">
                    {[
                      ["bg-emerald-400", "0% errors"],
                      ["bg-yellow-400", "under 3%"],
                      ["bg-orange-400", "3–7%"],
                      ["bg-rose-400", "7%+"],
                    ].map(([color, label]) => (
                      <span key={label} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
                        {label}
                      </span>
                    ))}
                  </div>
                  {keyboardHeatmap.length === 0 && (
                    <p className="mt-5 text-center text-xs text-gray-500">
                      Complete a typing test to start building your heatmap.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          {[
            {
              title: "WPM Progress",
              valueKey: "avgWpm",
              color: "#a78bfa",
              fill: "rgba(139, 92, 246, 0.14)",
              minimum: 50,
              suffix: " WPM",
            },
            {
              title: "Accuracy Progress",
              valueKey: "avgAccuracy",
              color: "#34d399",
              fill: "rgba(16, 185, 129, 0.14)",
              minimum: 100,
              suffix: "%",
            },
          ].map((chart) => {
            const values = dailyProgress.map((entry) => Number(entry[chart.valueKey] ?? 0));
            const maximum = Math.max(chart.minimum, ...values);
            const points = getTrendPoints(values, maximum);

            return (
              <div key={chart.valueKey} className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chart.color }}></span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">{chart.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{dailyProgress.length} days</span>
                </div>
                {dailyProgress.length === 0 ? (
                  <div className="flex h-[220px] items-center justify-center text-sm text-gray-500">
                    Complete typing tests to see your progress.
                  </div>
                ) : (
                  <svg width="100%" height="220" viewBox="0 0 600 230" preserveAspectRatio="none" aria-label={chart.title}>
                    {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                      const y = 178 - step * 160;
                      return (
                        <g key={step}>
                          <line x1="42" y1={y} x2="578" y2={y} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                          <text x="0" y={y + 4} fill="#6b7280" fontSize="10">{Math.round(maximum * step)}</text>
                        </g>
                      );
                    })}
                    {values.length > 1 && (
                      <polygon
                        points={`42,178 ${points} 578,178`}
                        fill={chart.fill}
                      />
                    )}
                    <polyline points={points} fill="none" stroke={chart.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {values.map((value, index) => {
                      const x = values.length === 1 ? 310 : 42 + (index / (values.length - 1)) * 536;
                      const y = 18 + 160 - (value / maximum) * 160;
                      return <circle key={dailyProgress[index]._id.date} cx={x} cy={y} r="4" fill={chart.color} stroke="#111827" strokeWidth="2" />;
                    })}
                    <text x="42" y="214" fill="#6b7280" fontSize="10">{formatProgressDate(dailyProgress[0]._id.date)}</text>
                    {dailyProgress.length > 1 && (
                      <text x="578" y="214" textAnchor="end" fill="#6b7280" fontSize="10">
                        {formatProgressDate(dailyProgress[dailyProgress.length - 1]._id.date)}
                      </text>
                    )}
                  </svg>
                )}
                {dailyProgress.length > 0 && (
                  <p className="mt-2 text-right text-xs text-gray-500">
                    Latest: <span className="font-semibold" style={{ color: chart.color }}>{values.at(-1).toFixed(1)}{chart.suffix}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

       
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/20 transition-all">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-white">Followers</h2>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                {followers.length}
              </span>
            </div>
            <div className="p-6">
              {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-sm">No followers yet</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {followers.map((follower) => (
                    <div
                      key={follower._id}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all flex items-center justify-between group"
                    >
                      <button
                        onClick={() => fetchUserStats(follower.username)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">@{follower.username}</div>
                        <div className="text-xs text-gray-500">{follower.fullname}</div>
                      </button>
                      <button
                        onClick={() => handleRemoveFollower(follower._id)}
                        disabled={loadingButtons[`remove-${follower._id}`]}
                        className="ml-2 px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 rounded transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {loadingButtons[`remove-${follower._id}`] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin"></div>
                            <span>Removing...</span>
                          </>
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-white">Following</h2>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                {following.length}
              </span>
            </div>
            <div className="p-6">
              {following.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🔗</div>
                  <div className="text-sm">Not following anyone yet</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {following.map((followingUser) => (
                    <div
                      key={followingUser._id}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
                    >
                      <button
                        onClick={() => fetchUserStats(followingUser.username)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">@{followingUser.username}</div>
                        <div className="text-xs text-gray-500">{followingUser.fullname}</div>
                      </button>
                      <button
                        onClick={() => handleUnfollow(followingUser._id)}
                        disabled={loadingButtons[`unfollow-${followingUser._id}`]}
                        className="ml-2 px-2 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/40 rounded transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {loadingButtons[`unfollow-${followingUser._id}`] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-rose-500/30 border-t-rose-400 rounded-full animate-spin"></div>
                            <span>Unfollowing...</span>
                          </>
                        ) : (
                          "Unfollow"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {viewingUserStats && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 max-h-screen overflow-y-auto">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl my-8">
              <div className="sticky top-0 px-8 py-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">@{viewingUserStats.username}</h2>
                  <p className="text-sm text-gray-400 mt-1">{viewingUserStats.fullname}</p>
                </div>
                <button
                  onClick={() => setViewingUserStats(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-violet-400">{viewingUserStats.totalSessions || 0}</div>
                    <div className="text-sm text-gray-500 mt-1">Total Sessions</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{Math.round(viewingUserStats.totalTime || 0)}</div>
                    <div className="text-sm text-gray-500 mt-1">Total Time (s)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{Math.round(viewingUserStats.avgWpm || 0)}</div>
                    <div className="text-sm text-gray-500 mt-1">Average WPM</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{viewingUserStreak} days</div>
                    <div className="text-sm text-gray-500 mt-1">Typing Streak</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Followers</div>
                    <div className="text-white text-lg font-bold">{viewingUserStats.followers?.length || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Following</div>
                    <div className="text-white text-lg font-bold">{viewingUserStats.following?.length || 0}</div>
                  </div>
                </div>

                {Object.keys(viewingUserBestRecords).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">All-Time Best Records</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(viewingUserBestRecords).map(([testType, records]) => (
                        <div key={testType} className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <div className="text-sm font-semibold text-violet-400 capitalize mb-3">{testType}</div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">Best WPM</span>
                              <span className="text-sm font-bold text-emerald-400">{Math.round(records.highestWpm || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">Best Accuracy</span>
                              <span className="text-sm font-bold text-cyan-400">{Math.round(records.highestAccuracy || 0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">Longest Duration</span>
                              <span className="text-sm font-bold text-orange-400">{Math.round(records.longestDuration || 0)}s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-white">Typing History</h2>
            </div>
            <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              {historyPagination.totalRecords} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/3">
                  {["Date", "Test Type", "WPM", "Accuracy", "Duration", "Chars Typed", "Correct", "Wrong", "Action"].map((th) => (
                    <th key={th} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-600">
                      <div className="text-4xl mb-3">📊</div>
                      <div className="text-sm">No typing history available for this range</div>
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 text-sm text-gray-400">{new Date(item.testDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold rounded-lg px-2.5 py-1">
                          {item.testType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-violet-300">{item.wpm}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-emerald-400">{item.accuracy}%</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-cyan-400">{item.duration}s</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{item.charactersTyped}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-emerald-400">{item.correctChars}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-rose-400">{item.incorrectChars}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => replayTest(item)}
                          className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 transition-colors hover:bg-violet-500/20"
                          title={item.testText ? "Replay the exact test text" : "Retake this duration with a new text"}
                        >
                          Retype
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {historyPagination.hasMore && (
            <div className="flex justify-center border-t border-white/5 px-6 py-5">
              <button
                type="button"
                onClick={loadMoreHistory}
                disabled={historyLoadingMore}
                className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-300 transition-all hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {historyLoadingMore ? "Loading…" : `Load 10 more (${history.length} of ${historyPagination.totalRecords})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
