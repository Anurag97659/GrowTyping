import React, { useEffect, useState } from "react";
import api, { clearAccessToken } from "../lib/api";
import {
  FiSettings,
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiClock,
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";

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
  const gap =
    count === 1 ? 0 : Math.min(24, Math.max(12, (plotWidth / count) * 0.12));
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
      const x =
        values.length === 1
          ? plotLeft + plotWidth / 2
          : plotLeft + (index / (values.length - 1)) * plotWidth;
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

const getHeatmapStyle = (keyStat, legacyMaximum, isLight) => {
  if (!keyStat) {
    return {
      backgroundColor: isLight
        ? "rgba(226, 232, 240, 0.6)"
        : "rgba(255,255,255,0.04)",
      borderColor: isLight
        ? "rgba(203, 213, 225, 0.8)"
        : "rgba(255,255,255,0.1)",
      color: isLight ? "#64748b" : "#6b7280",
    };
  }

  const intensity = keyStat.attempts
    ? keyStat.errorRate
    : (keyStat.mistakes / legacyMaximum) * 10;

  if (intensity === 0) {
    return {
      backgroundColor: isLight
        ? "rgba(16, 185, 129, 0.15)"
        : "rgba(16, 185, 129, 0.18)",
      borderColor: "rgba(52, 211, 153, 0.55)",
      color: isLight ? "#047857" : "#d1fae5",
    };
  }
  if (intensity < 3) {
    return {
      backgroundColor: isLight
        ? "rgba(245, 158, 11, 0.15)"
        : "rgba(250, 204, 21, 0.2)",
      borderColor: "rgba(250, 204, 21, 0.6)",
      color: isLight ? "#b45309" : "#fef3c7",
    };
  }
  if (intensity < 7) {
    return {
      backgroundColor: isLight
        ? "rgba(249, 115, 22, 0.18)"
        : "rgba(249, 115, 22, 0.22)",
      borderColor: "rgba(251, 146, 60, 0.65)",
      color: isLight ? "#c2410c" : "#ffedd5",
    };
  }
  return {
    backgroundColor: isLight
      ? "rgba(244, 63, 94, 0.18)"
      : "rgba(244, 63, 94, 0.24)",
    borderColor: "rgba(251, 113, 133, 0.7)",
    color: isLight ? "#be123c" : "#ffe4e6",
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
      ? "dark"
      : window.localStorage.getItem("growtyping.theme") || "dark",
  );
  const [bestRecordByType, setBestRecordByType] = useState({});
  const [allTimeBestByType, setAllTimeBestByType] = useState({});
  const [username, setUsername] = useState("User");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchDashboard = async (selectedRange) => {
    try {
      setLoading(true);
      const statsData = await api.get(
        `GrowTyping/v1/stats/dashboard?range=${selectedRange}`,
      );
      setStats(statsData.data.data);
      const wpmData = await api.get(
        `GrowTyping/v1/stats/average-wpm?range=${selectedRange}`,
      );
      setWpmByType(wpmData.data.data);
      const accuracyData = await api.get(
        `GrowTyping/v1/stats/average-accuracy?range=${selectedRange}`,
      );
      setAccuracyByType(
        accuracyData.data.data.map((item) => ({
          testType: item._id,
          averageAccuracy: item.averageAccuracy ?? 0,
        })),
      );
      const weakKeysData = await api.get(
        `GrowTyping/v1/stats/weak-keys?range=${selectedRange}`,
      );
      setWeakKeys(weakKeysData.data.data);
      const heatmapData = await api.get(
        `GrowTyping/v1/stats/keyboard-heatmap?range=${selectedRange}`,
      );
      setKeyboardHeatmap(heatmapData.data.data);
      const progressData = await api.get(
        `GrowTyping/v1/stats/daily-progress?range=${selectedRange}`,
      );
      setDailyProgress(progressData.data.data);
      const streakData = await api.get(`GrowTyping/v1/stats/streak`);
      setStreak(streakData.data.data.streak || 0);
      const historyData = await api.get(
        `GrowTyping/v1/stats/history?range=${selectedRange}&page=1&limit=${HISTORY_PAGE_SIZE}`,
      );
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
        const allTimeData = await api.get(
          `GrowTyping/v1/stats/history?page=1&limit=1`,
        );
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

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  useEffect(() => {
    window.localStorage.setItem("growtyping.theme", dashboardTheme);
  }, [dashboardTheme]);

  const rangeLabel = {
    today: "Today",
    lastDay: "Last Day",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    last6Months: "Last 6 Months",
    thisYear: "This Year",
    previousYears: "Previous Years",
  };

  const isLightTheme = dashboardTheme === "light";

  const toggleTheme = () => {
    setDashboardTheme(isLightTheme ? "dark" : "light");
  };

  if (loading)
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${isLightTheme ? "bg-slate-50" : "bg-[#0b131e]"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 text-base font-semibold tracking-wider animate-pulse">
            Loading Analytics Dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isLightTheme
          ? "bg-slate-50 text-slate-900"
          : "bg-[#0b131e] text-slate-100"
      }`}
    >
      {/* Sticky Header Navbar */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between shadow-lg ${
          isLightTheme
            ? "bg-white/80 border-slate-200"
            : "bg-[#0f1927]/80 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-lg">GT</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              GrowTyping Dashboard
            </h1>
            <p
              className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}
            >
              Performance Analytics & Speed Stats
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Range Selector */}
          <div
            className={`flex items-center gap-2 border rounded-xl px-3.5 py-1.5 ${
              isLightTheme
                ? "bg-slate-100 border-slate-300"
                : "bg-slate-800/80 border-slate-700"
            }`}
          >
            <FiCalendar className="text-emerald-400" size={14} />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option
                value="today"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Today
              </option>
              <option
                value="lastDay"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Last Day
              </option>
              <option
                value="lastWeek"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Last Week
              </option>
              <option
                value="lastMonth"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Last Month
              </option>
              <option
                value="last6Months"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Last 6 Months
              </option>
              <option
                value="thisYear"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                This Year
              </option>
              <option
                value="previousYears"
                className={
                  isLightTheme
                    ? "bg-white text-slate-900"
                    : "bg-[#111c2d] text-white"
                }
              >
                Previous Years
              </option>
            </select>
          </div>

          {/* Theme Gear Switch Option */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 flex items-center gap-2 text-xs font-semibold ${
              isLightTheme
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isLightTheme ? (
              <FiMoon className="text-slate-600" size={16} />
            ) : (
              <FiSun className="text-amber-400" size={16} />
            )}
            <span>{isLightTheme ? "Dark Mode" : "Light Mode"}</span>
          </button>

          {/* Username badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-400">
              {username}
            </span>
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              Logout
            </button>
          )}

          <button
            onClick={() => (window.location.href = "/typing")}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              isLightTheme
                ? "bg-slate-100 border-slate-300 text-slate-700"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
            title="Back to Typing"
          >
            <FiArrowLeft size={18} />
          </button>

          <button
            onClick={() => (window.location.href = "/settings")}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              isLightTheme
                ? "bg-slate-100 border-slate-300 text-slate-700"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
            title="Settings"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-2xl mx-auto">
        {/* Title Banner */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Typing Metrics & Analytics
          </h2>
          <p
            className={`mt-1 text-xs font-medium ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}
          >
            Showing test results for{" "}
            <span className="text-emerald-400 font-bold">
              {rangeLabel[range]}
            </span>
          </p>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              label: "Total Sessions",
              value: stats.totalSessions || 0,
              // icon: <FiActivity className="text-emerald-400" size={24} />,
              border: "border-emerald-500/20",
              text: "text-emerald-400",
            },
            {
              label: "Total Time",
              value: `${Math.round(stats.totalTime || 0)} s`,
              // icon: <FiClock className="text-teal-400" size={24} />,
              border: "border-teal-500/20",
              text: "text-teal-400",
            },
            {
              label: "Average WPM",
              value:
                stats.avgWpm !== undefined && stats.avgWpm !== null
                  ? stats.avgWpm.toFixed(1)
                  : 0,
              // icon: <FiZap className="text-amber-400" size={24} />,
              border: "border-amber-500/20",
              text: "text-amber-400",
            },
            {
              label: "Typing Streak",
              value: `${streak} days`,
              // icon: <FiTrendingUp className="text-orange-400" size={24} />,
              border: "border-orange-500/20",
              text: "text-orange-400",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg flex items-center justify-between ${
                isLightTheme
                  ? "bg-white border-slate-200 shadow-sm hover:border-slate-300"
                  : `bg-[#111c2d] ${card.border} hover:border-slate-700`
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {card.label}
                </div>
                <div className={`text-3xl font-black ${card.text}`}>
                  {card.value}
                </div>
              </div>
              {/* <div
                className={`p-3.5 rounded-xl ${isLightTheme ? "bg-slate-100" : "bg-slate-800/60"}`}
              >
                {card.icon}
              </div> */}
            </div>
          ))}
        </div>

        {/* Best Record by Range */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xl font-bold">
              Best Record —{" "}
              <span className="text-emerald-400">{rangeLabel[range]}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {["15s", "30s", "60s", "custom"].map((type) => {
              const record = bestRecordByType[type] || {
                highestWpm: 0,
                highestAccuracy: 0,
                longestDuration: 0,
              };
              return (
                <div
                  key={type}
                  className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                    isLightTheme
                      ? "bg-white border-slate-200 hover:border-emerald-300 shadow-sm"
                      : "bg-[#111c2d] border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                    {type} Test
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        WPM
                      </span>
                      <span className="font-black text-lg text-emerald-400">
                        {record.highestWpm}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Accuracy
                      </span>
                      <span className="font-bold text-teal-400">
                        {record.highestAccuracy}%
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Duration
                      </span>
                      <span className="font-bold text-amber-400">
                        {record.longestDuration}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All-Time Best */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-xl font-bold">
              All-Time Best{" "}
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider ml-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-md">
                Record
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {["15s", "30s", "60s", "custom"].map((type) => {
              const record = allTimeBestByType[type] || {
                highestWpm: 0,
                highestAccuracy: 0,
                longestDuration: 0,
              };
              return (
                <div
                  key={type}
                  className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                    isLightTheme
                      ? "bg-amber-50/60 border-amber-200 hover:border-amber-300 shadow-sm"
                      : "bg-amber-500/5 border-amber-500/20 hover:border-amber-400/40"
                  }`}
                >
                  <div className="inline-block bg-amber-500/15 border border-amber-500/30 rounded-lg px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
                    {type} Test
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        WPM
                      </span>
                      <span className="font-black text-lg text-amber-400">
                        {record.highestWpm}
                      </span>
                    </div>
                    <div className="h-px bg-amber-400/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Accuracy
                      </span>
                      <span className="font-bold text-amber-400">
                        {record.highestAccuracy}%
                      </span>
                    </div>
                    <div className="h-px bg-amber-400/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Duration
                      </span>
                      <span className="font-bold text-amber-400">
                        {record.longestDuration}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts & Graphs Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* WPM by Type */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLightTheme
                ? "bg-white border-slate-200"
                : "bg-[#111c2d] border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Avg WPM by Type
              </h3>
            </div>
            <svg
              width="100%"
              height="220"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
            >
              {(() => {
                const maxWpm = Math.max(
                  50,
                  ...wpmByType.map((item) => item.averageWpm ?? 0),
                );
                const step = Math.ceil(maxWpm / 5);
                return (
                  <>
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const val = i * step;
                      return (
                        <g key={i}>
                          <line
                            x1="35"
                            y1={200 - (val / maxWpm) * 170}
                            x2="580"
                            y2={200 - (val / maxWpm) * 170}
                            stroke={
                              isLightTheme
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(255,255,255,0.05)"
                            }
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y={200 - (val / maxWpm) * 170 + 4}
                            fontSize="10"
                            fill="#6B7280"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}
                    <line
                      x1="35"
                      y1="200"
                      x2="580"
                      y2="200"
                      stroke={
                        isLightTheme
                          ? "rgba(0,0,0,0.12)"
                          : "rgba(255,255,255,0.1)"
                      }
                      strokeWidth="1"
                    />
                  </>
                );
              })()}
              {wpmByType.map((item, index) => {
                const avgWpm = item.averageWpm ?? 0;
                const maxWpm = Math.max(
                  50,
                  ...wpmByType.map((i) => i.averageWpm ?? 0),
                );
                const barHeight = (avgWpm / maxWpm) * 170;
                const layout = getBarLayout(wpmByType.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={index}>
                    <defs>
                      <linearGradient
                        id={`wpmGrad${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity="0.7"
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x={barX}
                      y={200 - barHeight}
                      width={layout.barWidth}
                      height={barHeight}
                      fill={`url(#wpmGrad${index})`}
                      rx="6"
                    />
                    <text
                      x={barCenter}
                      y={200 - barHeight - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#34d399"
                      fontWeight="bold"
                    >
                      {avgWpm.toFixed(1)}
                    </text>
                    <text
                      x={barCenter}
                      y="216"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#6B7280"
                    >
                      {item._id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Accuracy by Type */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLightTheme
                ? "bg-white border-slate-200"
                : "bg-[#111c2d] border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Avg Accuracy by Type
              </h3>
            </div>
            <svg
              width="100%"
              height="220"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
            >
              {[0, 20, 40, 60, 80, 100].map((val, idx) => (
                <g key={idx}>
                  <line
                    x1="35"
                    y1={200 - (val / 100) * 170}
                    x2="580"
                    y2={200 - (val / 100) * 170}
                    stroke={
                      isLightTheme
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(255,255,255,0.05)"
                    }
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y={200 - (val / 100) * 170 + 4}
                    fontSize="10"
                    fill="#6B7280"
                  >
                    {val}
                  </text>
                </g>
              ))}
              <line
                x1="35"
                y1="200"
                x2="580"
                y2="200"
                stroke={
                  isLightTheme ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)"
                }
                strokeWidth="1"
              />
              {accuracyByType.map((item, index) => {
                const avgAcc = item.averageAccuracy ?? 0;
                const barHeight = (avgAcc / 100) * 170;
                const layout = getBarLayout(accuracyByType.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={index}>
                    <defs>
                      <linearGradient
                        id={`accGrad${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop
                          offset="100%"
                          stopColor="#0d9488"
                          stopOpacity="0.7"
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x={barX}
                      y={200 - barHeight}
                      width={layout.barWidth}
                      height={barHeight}
                      fill={`url(#accGrad${index})`}
                      rx="6"
                    />
                    <text
                      x={barCenter}
                      y={200 - barHeight - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#2dd4bf"
                      fontWeight="bold"
                    >
                      {avgAcc.toFixed(1)}
                    </text>
                    <text
                      x={barCenter}
                      y="216"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#6B7280"
                    >
                      {item.testType}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Top Weak Keys */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLightTheme
                ? "bg-white border-slate-200"
                : "bg-[#111c2d] border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Top Weak Keys
              </h3>
            </div>
            <svg
              width="100%"
              height="220"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
            >
              {(() => {
                const maxMistakes = Math.max(
                  10,
                  ...weakKeys.map((item) => item.totalMistakes ?? 0),
                );
                const step = Math.ceil(maxMistakes / 5);
                return (
                  <>
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const value = i * step;
                      return (
                        <g key={i}>
                          <line
                            x1="35"
                            y1={200 - (value / maxMistakes) * 170}
                            x2="580"
                            y2={200 - (value / maxMistakes) * 170}
                            stroke={
                              isLightTheme
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(255,255,255,0.05)"
                            }
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y={200 - (value / maxMistakes) * 170 + 4}
                            fontSize="10"
                            fill="#6B7280"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    })}
                    <line
                      x1="35"
                      y1="200"
                      x2="580"
                      y2="200"
                      stroke={
                        isLightTheme
                          ? "rgba(0,0,0,0.12)"
                          : "rgba(255,255,255,0.1)"
                      }
                      strokeWidth="1"
                    />
                  </>
                );
              })()}
              {weakKeys.map((item, index) => {
                const mistakes = item.totalMistakes ?? 0;
                const maxMistakes = Math.max(
                  10,
                  ...weakKeys.map((keyStat) => keyStat.totalMistakes ?? 0),
                );
                const barHeight = (mistakes / maxMistakes) * 170;
                const layout = getBarLayout(weakKeys.length);
                const barX = layout.x(index);
                const barCenter = barX + layout.barWidth / 2;
                return (
                  <g key={item._id || index}>
                    <defs>
                      <linearGradient
                        id={`weakGrad${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop
                          offset="100%"
                          stopColor="#be123c"
                          stopOpacity="0.7"
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x={barX}
                      y={200 - barHeight}
                      width={layout.barWidth}
                      height={barHeight}
                      fill={`url(#weakGrad${index})`}
                      rx="6"
                    />
                    <text
                      x={barCenter}
                      y={200 - barHeight - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#fda4af"
                      fontWeight="bold"
                    >
                      {mistakes}
                    </text>
                    <text
                      x={barCenter}
                      y="216"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#6B7280"
                    >
                      {item._id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Keyboard Heatmap Full Width Sub-Container */}
          <div
            className={`lg:col-span-3 p-6 rounded-2xl border transition-all ${
              isLightTheme
                ? "bg-white border-slate-200"
                : "bg-[#111c2d] border-slate-800"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Keyboard Heatmap
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Hover a key to view error rate details
              </p>
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
                  <div
                    className="mx-auto max-w-3xl space-y-2"
                    aria-label="Keyboard mistake heatmap"
                  >
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
                              style={getHeatmapStyle(
                                keyStat,
                                legacyMaximum,
                                isLightTheme,
                              )}
                            >
                              {key}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
                    {[
                      ["bg-emerald-400", "0% errors"],
                      ["bg-yellow-400", "under 3%"],
                      ["bg-orange-400", "3–7%"],
                      ["bg-rose-400", "7%+"],
                    ].map(([color, label]) => (
                      <span key={label} className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${color}`}
                        ></span>
                        {label}
                      </span>
                    ))}
                  </div>
                  {keyboardHeatmap.length === 0 && (
                    <p className="mt-5 text-center text-xs text-slate-500">
                      Complete a typing test to start building your keyboard
                      heatmap.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          {[
            {
              title: "WPM Progress Trend",
              valueKey: "avgWpm",
              color: "#10b981",
              fill: "rgba(16, 185, 129, 0.14)",
              minimum: 50,
              suffix: " WPM",
            },
            {
              title: "Accuracy Progress Trend",
              valueKey: "avgAccuracy",
              color: "#14b8a6",
              fill: "rgba(20, 184, 166, 0.14)",
              minimum: 100,
              suffix: "%",
            },
          ].map((chart) => {
            const values = dailyProgress.map((entry) =>
              Number(entry[chart.valueKey] ?? 0),
            );
            const maximum = Math.max(chart.minimum, ...values);
            const points = getTrendPoints(values, maximum);

            return (
              <div
                key={chart.valueKey}
                className={`p-6 rounded-2xl border transition-all ${
                  isLightTheme
                    ? "bg-white border-slate-200"
                    : "bg-[#111c2d] border-slate-800"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: chart.color }}
                    ></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {chart.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    {dailyProgress.length} days
                  </span>
                </div>
                {dailyProgress.length === 0 ? (
                  <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
                    Complete typing tests to see your progress trends.
                  </div>
                ) : (
                  <svg
                    width="100%"
                    height="220"
                    viewBox="0 0 600 230"
                    preserveAspectRatio="none"
                    aria-label={chart.title}
                  >
                    {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                      const y = 178 - step * 160;
                      return (
                        <g key={step}>
                          <line
                            x1="42"
                            y1={y}
                            x2="578"
                            y2={y}
                            stroke={
                              isLightTheme
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(148, 163, 184, 0.15)"
                            }
                            strokeWidth="1"
                          />
                          <text x="0" y={y + 4} fill="#6b7280" fontSize="10">
                            {Math.round(maximum * step)}
                          </text>
                        </g>
                      );
                    })}
                    {values.length > 1 && (
                      <polygon
                        points={`42,178 ${points} 578,178`}
                        fill={chart.fill}
                      />
                    )}
                    <polyline
                      points={points}
                      fill="none"
                      stroke={chart.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {values.map((value, index) => {
                      const x =
                        values.length === 1
                          ? 310
                          : 42 + (index / (values.length - 1)) * 536;
                      const y = 18 + 160 - (value / maximum) * 160;
                      return (
                        <circle
                          key={dailyProgress[index]._id.date}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={chart.color}
                          stroke={isLightTheme ? "#ffffff" : "#111827"}
                          strokeWidth="2"
                        />
                      );
                    })}
                    <text x="42" y="214" fill="#6b7280" fontSize="10">
                      {formatProgressDate(dailyProgress[0]._id.date)}
                    </text>
                    {dailyProgress.length > 1 && (
                      <text
                        x="578"
                        y="214"
                        textAnchor="end"
                        fill="#6b7280"
                        fontSize="10"
                      >
                        {formatProgressDate(
                          dailyProgress[dailyProgress.length - 1]._id.date,
                        )}
                      </text>
                    )}
                  </svg>
                )}
                {dailyProgress.length > 0 && (
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      Each point is the average of all tests completed that day.
                    </span>
                    <span className="shrink-0">
                      Latest:{" "}
                      <span
                        className="font-semibold"
                        style={{ color: chart.color }}
                      >
                        {values.at(-1).toFixed(1)}
                        {chart.suffix}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Typing History Table Sub-Container */}
        <div
          className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
            isLightTheme
              ? "bg-white border-slate-200"
              : "bg-[#111c2d] border-slate-800"
          }`}
        >
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
              <h2 className="text-base font-bold">Typing History</h2>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-lg font-semibold border ${
                isLightTheme
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-slate-800/80 border-slate-700 text-slate-400"
              }`}
            >
              {historyPagination.totalRecords} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr
                  className={
                    isLightTheme
                      ? "bg-slate-50 border-b border-slate-200"
                      : "bg-slate-800/40 border-b border-slate-800"
                  }
                >
                  {[
                    "Date",
                    "Test Type",
                    "WPM",
                    "Accuracy",
                    "Duration",
                    "Chars Typed",
                    "Correct",
                    "Wrong",
                    "Action",
                  ].map((th) => (
                    <th
                      key={th}
                      className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-16 text-slate-500"
                    >
                      <div className="text-sm">
                        No typing history available for this time range
                      </div>
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className={`transition-colors ${
                        isLightTheme
                          ? "hover:bg-slate-50"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-5 py-4 text-xs font-medium text-slate-400">
                        {new Date(item.testDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg px-2.5 py-1">
                          {item.testType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-emerald-400">
                          {item.wpm}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-teal-400">
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-amber-400">
                          {item.duration}s
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                        {item.charactersTyped}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-emerald-400">
                          {item.correctChars}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-rose-400">
                          {item.incorrectChars}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => replayTest(item)}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                          title={
                            item.testText
                              ? "Replay the exact test text"
                              : "Retake this duration"
                          }
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
            <div className="flex justify-center border-t border-slate-200 dark:border-slate-800 px-6 py-4">
              <button
                type="button"
                onClick={loadMoreHistory}
                disabled={historyLoadingMore}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {historyLoadingMore
                  ? "Loading…"
                  : `Load 10 more (${history.length} of ${historyPagination.totalRecords})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
