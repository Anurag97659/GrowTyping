import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import HistoryHeatmap from "./HistoryHeatmap";
import {
  FiArrowLeft,
  FiZap,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiSun,
  FiMoon,
  FiUser,
  FiRotateCcw,
  FiTrendingUp,
  FiLayers,
  FiLogIn,
  FiAward,
} from "react-icons/fi";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const RANGES = [
  { id: "today", label: "Today" },
  { id: "lastDay", label: "Last Day" },
  { id: "lastWeek", label: "Last Week" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "allTime", label: "All Time" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES } = useTheme();

  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedRange, setSelectedRange] = useState("allTime");

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    avgWpm: 0,
    avgAccuracy: 0,
  });
  const [streak, setStreak] = useState(0);

  // Daily Progress Graph Data
  const [dailyProgress, setDailyProgress] = useState([]);

  // Keyboard Heatmap
  const [keyStatsMap, setKeyStatsMap] = useState({});

  // History & Pagination
  const [historyList, setHistoryList] = useState([]);
  const [bestRecords, setBestRecords] = useState({});
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    hasMore: false,
  });
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  // Fetch telemetry based on selected time range
  const fetchDashboardData = async (range = selectedRange) => {
    try {
      setLoading(true);

      const token = window.localStorage.getItem("growtyping.accessToken");
      if (!token || token === "undefined" || token === "null") {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      setIsGuest(false);

      const [profileRes, dashRes, streakRes, historyRes, heatmapRes, progressRes] =
        await Promise.allSettled([
          api.get("/GrowTyping/v1/users/getuserprofile"),
          api.get(`/GrowTyping/v1/stats/dashboard?range=${range}`),
          api.get("/GrowTyping/v1/stats/streak"),
          api.get(`/GrowTyping/v1/stats/history?range=${range}&page=1&limit=10`),
          api.get(`/GrowTyping/v1/stats/keyboard-heatmap?range=${range}`),
          api.get(`/GrowTyping/v1/stats/daily-progress?range=${range}`),
        ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
        setUserProfile(profileRes.value.data.data);
      }

      if (dashRes.status === "fulfilled" && dashRes.value.data?.data) {
        setDashboardStats(dashRes.value.data.data);
      }

      if (streakRes.status === "fulfilled" && streakRes.value.data?.data) {
        setStreak(streakRes.value.data.data.streak || 0);
      }

      if (historyRes.status === "fulfilled" && historyRes.value.data?.data) {
        const rawHistory = historyRes.value.data.data;
        const items = Array.isArray(rawHistory)
          ? rawHistory
          : Array.isArray(rawHistory?.items)
          ? rawHistory.items
          : [];

        setHistoryList(items);
        setBestRecords(rawHistory?.bestRecords || {});
        setHistoryPagination({
          page: rawHistory?.pagination?.page || 1,
          limit: rawHistory?.pagination?.limit || 10,
          totalRecords: rawHistory?.pagination?.totalRecords || items.length,
          hasMore: rawHistory?.pagination?.hasMore || false,
        });
      }

      if (heatmapRes.status === "fulfilled" && heatmapRes.value.data?.data) {
        const map = {};
        const heatmapList = Array.isArray(heatmapRes.value.data.data)
          ? heatmapRes.value.data.data
          : Array.isArray(heatmapRes.value.data.data?.keyStats)
          ? heatmapRes.value.data.data.keyStats
          : [];

        heatmapList.forEach((item) => {
          if (item.key || item._id) {
            map[item.key || item._id] = item;
          }
        });
        setKeyStatsMap(map);
      }

      if (progressRes.status === "fulfilled" && progressRes.value.data?.data) {
        setDailyProgress(progressRes.value.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedRange);
  }, [selectedRange]);

  // Load 10 more history records
  const handleLoadMoreHistory = async () => {
    if (loadingMoreHistory || !historyPagination.hasMore) return;
    const nextPage = historyPagination.page + 1;

    try {
      setLoadingMoreHistory(true);
      const res = await api.get(
        `/GrowTyping/v1/stats/history?range=${selectedRange}&page=${nextPage}&limit=10`
      );
      const rawData = res.data?.data;
      const newItems = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
        ? rawData.items
        : [];

      setHistoryList((prev) => [...prev, ...newItems]);
      setHistoryPagination({
        page: nextPage,
        limit: 10,
        totalRecords: rawData?.pagination?.totalRecords || historyList.length + newItems.length,
        hasMore: rawData?.pagination?.hasMore || false,
      });
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingMoreHistory(false);
    }
  };

  // Replay Test Action
  const handleReplayTest = (item) => {
    try {
      window.sessionStorage.setItem(
        "growtyping.replayTest",
        JSON.stringify({
          testType: item.testType,
          testText: item.testText || null,
        })
      );
    } catch (e) {}
    navigate("/typing");
  };

  // Format Total Typing Time
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    if (mins > 0) return `${mins}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // ── Graph Data Computations ───────────────────────────────────────────────

  // Line graph: daily WPM & accuracy trend points (with axes)
  const LINE_PL = 45; // plot left (room for Y-axis labels)
  const LINE_PT = 20; // plot top
  const LINE_W  = 540; // plot area width
  const LINE_H  = 120; // plot area height

  const getTrendPoints = (values, maxVal) => {
    if (!values || values.length === 0) return "";
    const max = Math.max(maxVal || 1, 1);
    return values
      .map((val, idx) => {
        const x = values.length === 1
          ? LINE_PL + LINE_W / 2
          : LINE_PL + (idx / (values.length - 1)) * LINE_W;
        const y = LINE_PT + LINE_H - (val / max) * LINE_H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const wpmTrendValues    = dailyProgress.map((p) => Math.round(p.avgWpm || 0));
  const maxWpmInTrend     = Math.max(...wpmTrendValues, 100);
  const accuracyTrendValues = dailyProgress.map((p) => Number((p.avgAccuracy || 0).toFixed(1)));

  // X-axis date labels for line charts
  const xDateLabels = dailyProgress.map((p) => {
    const raw = p._id?.date || p._id || p.date || "";
    if (!raw) return "";
    const d = new Date(raw);
    return isNaN(d) ? String(raw).slice(5) : `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Y-axis ticks helper
  const yTicks = (max, count = 5) =>
    Array.from({ length: count + 1 }, (_, i) => ({
      val: Math.round((max / count) * i),
      pct: i / count,
    }));

  // Bar charts: avg WPM and accuracy by testType computed from historyList
  const wpmByTypeMap  = {};
  const accByTypeMap  = {};
  const cntByTypeMap  = {};
  historyList.forEach((item) => {
    const t = item.testType || "other";
    wpmByTypeMap[t]  = (wpmByTypeMap[t]  || 0) + (item.wpm      || 0);
    accByTypeMap[t]  = (accByTypeMap[t]  || 0) + (item.accuracy || 0);
    cntByTypeMap[t]  = (cntByTypeMap[t]  || 0) + 1;
  });
  const TYPE_ORDER = ["15s", "30s", "60s", "custom"];
  const avgWpmByType = TYPE_ORDER
    .filter((t) => cntByTypeMap[t] > 0)
    .map((t) => ({
      type: t,
      avg: Math.round((wpmByTypeMap[t] / cntByTypeMap[t]) * 10) / 10,
    }));
  const avgAccByType = TYPE_ORDER
    .filter((t) => cntByTypeMap[t] > 0)
    .map((t) => ({
      type: t,
      avg: Math.round((accByTypeMap[t] / cntByTypeMap[t]) * 10) / 10,
    }));

  // Top 5 weak keys from keyStatsMap sorted by mistake count
  const topWeakKeys = Object.entries(keyStatsMap)
    .map(([key, stat]) => ({
      key,
      mistakes: stat.mistakeCount || stat.mistakes || 0,
    }))
    .filter((k) => k.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 5);


  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} p-4 sm:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Navigation with Username display */}
        <div className={`flex items-center justify-between p-4 ${themeConfig.card} border ${themeConfig.border} flex-wrap gap-4`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/typing")}
              className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FiArrowLeft className="text-base" /> Back to Typing
            </button>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${themeConfig.accent}`}>
              Performance Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Username Badge */}
            {userProfile?.username && (
              <div className={`px-3.5 py-1.5 rounded-xl ${themeConfig.cardInset} flex items-center gap-2 text-xs font-extrabold ${themeConfig.accent} border ${themeConfig.border}`}>
                <FiUser className="text-sm" />
                <span>{userProfile.username.toUpperCase()}</span>
              </div>
            )}

            {/* Theme Selector */}
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

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleMode}
              className={`p-2.5 ${themeConfig.buttonSecondary} transition-all`}
              title="Toggle Dark / Light Mode"
            >
              {mode === "dark" ? <FiSun className="text-sm" /> : <FiMoon className="text-sm" />}
            </button>
          </div>
        </div>

        {/* Time Range Filter Buttons Bar */}
        <div className={`p-4 ${themeConfig.card} border ${themeConfig.border} flex items-center justify-between flex-wrap gap-3`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${themeConfig.mutedText} flex items-center gap-1.5`}>
            <FiCalendar className="text-sm" /> Select Time Range:
          </span>

          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRange(r.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRange === r.id
                    ? themeConfig.buttonPrimary
                    : `${themeConfig.buttonSecondary} opacity-70 hover:opacity-100`
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={`p-12 text-center ${themeConfig.card} border ${themeConfig.border}`}>
            <p className={`text-lg font-medium animate-pulse ${themeConfig.mutedText}`}>
              Loading performance telemetry...
            </p>
          </div>
        ) : isGuest ? (
          <div className={`p-12 text-center ${themeConfig.card} border ${themeConfig.border} space-y-4`}>
            <h2 className={`text-2xl font-extrabold ${themeConfig.bodyText}`}>Guest Mode Active</h2>
            <p className={`text-xs ${themeConfig.mutedText} max-w-md mx-auto`}>
              You are currently using guest mode. Please sign in or register to record your typing sessions and view your personal telemetry dashboard.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/login")}
                className={`px-6 py-2.5 ${themeConfig.buttonPrimary} text-xs font-bold flex items-center gap-2`}
              >
                <FiLogIn /> Sign In
              </button>
              <button
                onClick={() => navigate("/registration")}
                className={`px-6 py-2.5 ${themeConfig.buttonSecondary} text-xs font-bold`}
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 5 Core Telemetry Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Peak Speed */}
              <div className={`${themeConfig.card} p-5 border ${themeConfig.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                    Peak Speed
                  </span>
                  <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiZap className={`text-base ${themeConfig.accent}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${themeConfig.accent}`}>
                    {dashboardStats?.highestWpm || Math.max(...Object.values(bestRecords).map(r => r.highestWpm || 0), 0)}
                  </span>
                  <span className={`text-xs font-semibold ${themeConfig.mutedText}`}>WPM</span>
                </div>
                <p className={`text-[11px] ${themeConfig.mutedText} mt-2`}>
                  {selectedRange === "allTime"
                    ? "All-time highest"
                    : `${RANGES.find((r) => r.id === selectedRange)?.label || selectedRange} highest`}
                </p>
              </div>

              {/* Card 2: Average Speed */}
              <div className={`${themeConfig.card} p-5 border ${themeConfig.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                    Average Speed
                  </span>
                  <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiActivity className="text-base text-emerald-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-emerald-400">
                    {Math.round(dashboardStats.avgWpm || 0)}
                  </span>
                  <span className={`text-xs font-semibold ${themeConfig.mutedText}`}>WPM</span>
                </div>
                <p className={`text-[11px] ${themeConfig.mutedText} mt-2`}>Range average</p>
              </div>

              {/* Card 3: Average Accuracy */}
              <div className={`${themeConfig.card} p-5 border ${themeConfig.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                    Accuracy Rate
                  </span>
                  <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiCheckCircle className="text-base text-indigo-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-indigo-400">
                    {Number(dashboardStats.avgAccuracy || 0).toFixed(1)}%
                  </span>
                </div>
                <p className={`text-[11px] ${themeConfig.mutedText} mt-2`}>Keystroke accuracy</p>
              </div>

              {/* Card 4: Total Sessions */}
              <div className={`${themeConfig.card} p-5 border ${themeConfig.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                    Total Sessions
                  </span>
                  <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiLayers className="text-base text-amber-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-amber-400">
                    {dashboardStats.totalSessions || 0}
                  </span>
                  <span className={`text-xs font-semibold ${themeConfig.mutedText}`}>tests</span>
                </div>
                <p className={`text-[11px] ${themeConfig.mutedText} mt-2`}>Completed tests</p>
              </div>

              {/* Card 5: Total Typing Time & Streak */}
              <div className={`${themeConfig.card} p-5 border ${themeConfig.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
                    Total Time & Streak
                  </span>
                  <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiClock className="text-base text-cyan-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-cyan-400">
                    {formatTime(dashboardStats.totalTime)}
                  </span>
                  <span className="text-xs font-bold text-amber-400 mt-1">
                    {streak} Day Streak
                  </span>
                </div>
                <p className={`text-[11px] ${themeConfig.mutedText} mt-2`}>Time spent typing</p>
              </div>
            </div>

            {/* Enhanced Progress Graphs Section */}
            {dailyProgress.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph 1: WPM Speed Progress Trend with X/Y Axes */}
                <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className={`text-base font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
                        <FiTrendingUp className={themeConfig.accent} /> Speed Progression (WPM)
                      </h3>
                      <p className={`text-xs ${themeConfig.mutedText}`}>Daily average speed over time</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${themeConfig.cardInset} ${themeConfig.accent}`}>
                      Latest: {Math.round(dailyProgress[dailyProgress.length - 1]?.avgWpm || 0)} WPM
                    </span>
                  </div>

                  <div className={`${themeConfig.cardInset} pt-4 pb-2 px-2 overflow-x-auto`}>
                    <svg viewBox="0 0 630 175" className="w-full min-w-[420px]">
                      <defs>
                        <linearGradient id="wpmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {/* Y-axis grid lines + labels */}
                      {yTicks(maxWpmInTrend).map((t) => {
                        const yPos = LINE_PT + LINE_H - t.pct * LINE_H;
                        return (
                          <g key={t.val}>
                            <line x1={LINE_PL} x2={LINE_PL + LINE_W} y1={yPos} y2={yPos}
                              stroke="rgba(148,163,184,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
                            <text x={LINE_PL - 6} y={yPos + 4} fill="rgba(148,163,184,0.7)"
                              fontSize="9" textAnchor="end">{t.val}</text>
                          </g>
                        );
                      })}
                      {/* Y-axis line */}
                      <line x1={LINE_PL} x2={LINE_PL} y1={LINE_PT} y2={LINE_PT + LINE_H}
                        stroke="rgba(148,163,184,0.3)" strokeWidth="1"/>
                      {/* X-axis line */}
                      <line x1={LINE_PL} x2={LINE_PL + LINE_W} y1={LINE_PT + LINE_H} y2={LINE_PT + LINE_H}
                        stroke="rgba(148,163,184,0.3)" strokeWidth="1"/>
                      {/* Area fill */}
                      {wpmTrendValues.length > 1 && (
                        <polygon
                          fill="url(#wpmAreaGrad)"
                          points={`${getTrendPoints(wpmTrendValues, maxWpmInTrend)} ${LINE_PL + LINE_W},${LINE_PT + LINE_H} ${LINE_PL},${LINE_PT + LINE_H}`}
                        />
                      )}
                      {/* Trend line */}
                      <polyline fill="none" stroke="#34d399" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        points={getTrendPoints(wpmTrendValues, maxWpmInTrend)}/>
                      {/* Data points */}
                      {wpmTrendValues.map((v, i) => {
                        const x = wpmTrendValues.length === 1 ? LINE_PL + LINE_W / 2
                          : LINE_PL + (i / (wpmTrendValues.length - 1)) * LINE_W;
                        const y = LINE_PT + LINE_H - (v / Math.max(maxWpmInTrend, 1)) * LINE_H;
                        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="#34d399" stroke="#0f172a" strokeWidth="1.5"/>;
                      })}
                      {/* X-axis date labels (show max 6 to avoid clutter) */}
                      {xDateLabels
                        .filter((_, i, arr) => arr.length <= 6 || i % Math.ceil(arr.length / 6) === 0 || i === arr.length - 1)
                        .map((label, i, filtered) => {
                          const origIdx = xDateLabels.indexOf(label);
                          const x = xDateLabels.length === 1 ? LINE_PL + LINE_W / 2
                            : LINE_PL + (origIdx / (xDateLabels.length - 1)) * LINE_W;
                          return (
                            <text key={i} x={x.toFixed(1)} y={LINE_PT + LINE_H + 14}
                              fill="rgba(148,163,184,0.7)" fontSize="9" textAnchor="middle">{label}</text>
                          );
                        })}
                      {/* Y axis label */}
                      <text x="10" y={LINE_PT + LINE_H / 2} fill="rgba(148,163,184,0.6)"
                        fontSize="9" textAnchor="middle" transform={`rotate(-90, 10, ${LINE_PT + LINE_H / 2})`}>WPM</text>
                    </svg>
                  </div>
                </div>

                {/* Graph 2: Accuracy Progress Trend with X/Y Axes */}
                <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className={`text-base font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
                        <FiCheckCircle className="text-indigo-400" /> Accuracy Progression (%)
                      </h3>
                      <p className={`text-xs ${themeConfig.mutedText}`}>Daily average accuracy percentage</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                      Latest: {Number(dailyProgress[dailyProgress.length - 1]?.avgAccuracy || 0).toFixed(1)}%
                    </span>
                  </div>

                  <div className={`${themeConfig.cardInset} pt-4 pb-2 px-2 overflow-x-auto`}>
                    <svg viewBox="0 0 630 175" className="w-full min-w-[420px]">
                      <defs>
                        <linearGradient id="accAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {yTicks(100).map((t) => {
                        const yPos = LINE_PT + LINE_H - t.pct * LINE_H;
                        return (
                          <g key={t.val}>
                            <line x1={LINE_PL} x2={LINE_PL + LINE_W} y1={yPos} y2={yPos}
                              stroke="rgba(148,163,184,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
                            <text x={LINE_PL - 6} y={yPos + 4} fill="rgba(148,163,184,0.7)"
                              fontSize="9" textAnchor="end">{t.val}%</text>
                          </g>
                        );
                      })}
                      <line x1={LINE_PL} x2={LINE_PL} y1={LINE_PT} y2={LINE_PT + LINE_H}
                        stroke="rgba(148,163,184,0.3)" strokeWidth="1"/>
                      <line x1={LINE_PL} x2={LINE_PL + LINE_W} y1={LINE_PT + LINE_H} y2={LINE_PT + LINE_H}
                        stroke="rgba(148,163,184,0.3)" strokeWidth="1"/>
                      {accuracyTrendValues.length > 1 && (
                        <polygon
                          fill="url(#accAreaGrad)"
                          points={`${getTrendPoints(accuracyTrendValues, 100)} ${LINE_PL + LINE_W},${LINE_PT + LINE_H} ${LINE_PL},${LINE_PT + LINE_H}`}
                        />
                      )}
                      <polyline fill="none" stroke="#818cf8" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        points={getTrendPoints(accuracyTrendValues, 100)}/>
                      {accuracyTrendValues.map((v, i) => {
                        const x = accuracyTrendValues.length === 1 ? LINE_PL + LINE_W / 2
                          : LINE_PL + (i / (accuracyTrendValues.length - 1)) * LINE_W;
                        const y = LINE_PT + LINE_H - (v / 100) * LINE_H;
                        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="#818cf8" stroke="#0f172a" strokeWidth="1.5"/>;
                      })}
                      {xDateLabels
                        .filter((_, i, arr) => arr.length <= 6 || i % Math.ceil(arr.length / 6) === 0 || i === arr.length - 1)
                        .map((label, i) => {
                          const origIdx = xDateLabels.indexOf(label);
                          const x = xDateLabels.length === 1 ? LINE_PL + LINE_W / 2
                            : LINE_PL + (origIdx / (xDateLabels.length - 1)) * LINE_W;
                          return (
                            <text key={i} x={x.toFixed(1)} y={LINE_PT + LINE_H + 14}
                              fill="rgba(148,163,184,0.7)" fontSize="9" textAnchor="middle">{label}</text>
                          );
                        })}
                      <text x="10" y={LINE_PT + LINE_H / 2} fill="rgba(148,163,184,0.6)"
                        fontSize="9" textAnchor="middle" transform={`rotate(-90, 10, ${LINE_PT + LINE_H / 2})`}>%</text>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* ── History Activity Heatmap ─────────────────────────────── */}
            <HistoryHeatmap themeConfig={themeConfig} />

            {/* Bar Charts Row: Avg WPM by Type | Avg Accuracy by Type | Top Weak Keys */}
            {(avgWpmByType.length > 0 || topWeakKeys.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bar Chart 1: Avg WPM by Type */}
                <div className={`${themeConfig.card} p-5 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest ${themeConfig.mutedText}`}>Avg WPM by Type</h3>
                  </div>
                  <svg viewBox="0 0 280 160" className="w-full">
                    {(() => {
                      const data = avgWpmByType;
                      const max = Math.max(...data.map(d => d.avg), 1);
                      const PL = 32, PT = 20, PW = 230, PH = 100;
                      const bw = data.length > 0 ? (PW / data.length) - 8 : 40;
                      return (
                        <>
                          <defs>
                            <linearGradient id="wpmBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34d399"/>
                              <stop offset="100%" stopColor="#059669"/>
                            </linearGradient>
                          </defs>
                          {/* Y axis ticks */}
                          {[0, 0.5, 1].map((t) => {
                            const y = PT + PH - t * PH;
                            return (
                              <g key={t}>
                                <line x1={PL} x2={PL + PW} y1={y} y2={y} stroke="rgba(148,163,184,0.1)" strokeWidth="1"/>
                                <text x={PL - 4} y={y + 3} fill="rgba(148,163,184,0.6)" fontSize="8" textAnchor="end">
                                  {Math.round(max * t)}
                                </text>
                              </g>
                            );
                          })}
                          <line x1={PL} x2={PL} y1={PT} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                          <line x1={PL} x2={PL + PW} y1={PT + PH} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                          {data.map((d, i) => {
                            const bh = Math.max((d.avg / max) * PH, 2);
                            const x = PL + i * (PW / data.length) + 4;
                            const y = PT + PH - bh;
                            const mid = x + bw / 2;
                            return (
                              <g key={d.type}>
                                <rect x={x} y={y} width={bw} height={bh} fill="url(#wpmBarGrad)" rx="4"/>
                                <text x={mid} y={y - 4} fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">{d.avg}</text>
                                <text x={mid} y={PT + PH + 13} fill="rgba(148,163,184,0.7)" fontSize="9" textAnchor="middle">{d.type}</text>
                              </g>
                            );
                          })}
                          <text x={PL - 16} y={PT + PH / 2} fill="rgba(148,163,184,0.5)" fontSize="8" textAnchor="middle"
                            transform={`rotate(-90, ${PL - 16}, ${PT + PH / 2})`}>WPM</text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Bar Chart 2: Avg Accuracy by Type */}
                <div className={`${themeConfig.card} p-5 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest ${themeConfig.mutedText}`}>Avg Accuracy by Type</h3>
                  </div>
                  <svg viewBox="0 0 280 160" className="w-full">
                    {(() => {
                      const data = avgAccByType;
                      const max = 100;
                      const PL = 32, PT = 20, PW = 230, PH = 100;
                      const bw = data.length > 0 ? (PW / data.length) - 8 : 40;
                      return (
                        <>
                          <defs>
                            <linearGradient id="accBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2dd4bf"/>
                              <stop offset="100%" stopColor="#0d9488"/>
                            </linearGradient>
                          </defs>
                          {[0, 0.5, 1].map((t) => {
                            const y = PT + PH - t * PH;
                            return (
                              <g key={t}>
                                <line x1={PL} x2={PL + PW} y1={y} y2={y} stroke="rgba(148,163,184,0.1)" strokeWidth="1"/>
                                <text x={PL - 4} y={y + 3} fill="rgba(148,163,184,0.6)" fontSize="8" textAnchor="end">
                                  {Math.round(max * t)}%
                                </text>
                              </g>
                            );
                          })}
                          <line x1={PL} x2={PL} y1={PT} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                          <line x1={PL} x2={PL + PW} y1={PT + PH} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                          {data.map((d, i) => {
                            const bh = Math.max((d.avg / max) * PH, 2);
                            const x = PL + i * (PW / data.length) + 4;
                            const y = PT + PH - bh;
                            const mid = x + bw / 2;
                            return (
                              <g key={d.type}>
                                <rect x={x} y={y} width={bw} height={bh} fill="url(#accBarGrad)" rx="4"/>
                                <text x={mid} y={y - 4} fill="#2dd4bf" fontSize="9" textAnchor="middle" fontWeight="bold">{d.avg}%</text>
                                <text x={mid} y={PT + PH + 13} fill="rgba(148,163,184,0.7)" fontSize="9" textAnchor="middle">{d.type}</text>
                              </g>
                            );
                          })}
                          <text x={PL - 16} y={PT + PH / 2} fill="rgba(148,163,184,0.5)" fontSize="8" textAnchor="middle"
                            transform={`rotate(-90, ${PL - 16}, ${PT + PH / 2})`}>%</text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Bar Chart 3: Top Weak Keys */}
                <div className={`${themeConfig.card} p-5 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest ${themeConfig.mutedText}`}>Top Weak Keys</h3>
                  </div>
                  {topWeakKeys.length === 0 ? (
                    <p className={`text-xs ${themeConfig.mutedText} py-8 text-center`}>No error data for this range</p>
                  ) : (
                    <svg viewBox="0 0 280 160" className="w-full">
                      {(() => {
                        const data = topWeakKeys;
                        const max = Math.max(...data.map(d => d.mistakes), 1);
                        const PL = 32, PT = 20, PW = 230, PH = 100;
                        const bw = data.length > 0 ? (PW / data.length) - 8 : 40;
                        return (
                          <>
                            <defs>
                              <linearGradient id="weakBarGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb7185"/>
                                <stop offset="100%" stopColor="#e11d48"/>
                              </linearGradient>
                            </defs>
                            {[0, 0.5, 1].map((t) => {
                              const y = PT + PH - t * PH;
                              return (
                                <g key={t}>
                                  <line x1={PL} x2={PL + PW} y1={y} y2={y} stroke="rgba(148,163,184,0.1)" strokeWidth="1"/>
                                  <text x={PL - 4} y={y + 3} fill="rgba(148,163,184,0.6)" fontSize="8" textAnchor="end">
                                    {Math.round(max * t)}
                                  </text>
                                </g>
                              );
                            })}
                            <line x1={PL} x2={PL} y1={PT} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                            <line x1={PL} x2={PL + PW} y1={PT + PH} y2={PT + PH} stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
                            {data.map((d, i) => {
                              const bh = Math.max((d.mistakes / max) * PH, 2);
                              const x = PL + i * (PW / data.length) + 4;
                              const y = PT + PH - bh;
                              const mid = x + bw / 2;
                              return (
                                <g key={d.key}>
                                  <rect x={x} y={y} width={bw} height={bh} fill="url(#weakBarGrad)" rx="4"/>
                                  <text x={mid} y={y - 4} fill="#fb7185" fontSize="9" textAnchor="middle" fontWeight="bold">{d.mistakes}</text>
                                  <text x={mid} y={PT + PH + 13} fill="rgba(148,163,184,0.7)" fontSize="9" textAnchor="middle">{d.key}</text>
                                </g>
                              );
                            })}
                            <text x={PL - 16} y={PT + PH / 2} fill="rgba(148,163,184,0.5)" fontSize="8" textAnchor="middle"
                              transform={`rotate(-90, ${PL - 16}, ${PT + PH / 2})`}>Errors</text>
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>

              </div>
            )}

            {/* Best Records Cards */}
            <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-4`}>
              <h2 className={`text-lg font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
                <FiAward className="text-amber-400 text-xl" />{" "}
                {selectedRange === "allTime"
                  ? "All-Time Best Records"
                  : `${RANGES.find((r) => r.id === selectedRange)?.label || selectedRange}'s Best Records`}
              </h2>
              {Object.keys(bestRecords).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(bestRecords).map(([type, record]) => (
                    <div key={type} className={`${themeConfig.cardInset} p-5 space-y-3 border ${themeConfig.border}`}>
                      <span className={`text-xs font-extrabold uppercase ${themeConfig.accent} tracking-wider`}>
                        {type} Mode
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className={themeConfig.mutedText}>Best Speed:</span>
                          <span className={`font-black ${themeConfig.accent}`}>
                            {Math.round(record.highestWpm || 0)} WPM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeConfig.mutedText}>Best Accuracy:</span>
                          <span className="font-black text-emerald-400">
                            {Math.round(record.highestAccuracy || 0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeConfig.mutedText}>Max Duration:</span>
                          <span className="font-black text-amber-400">
                            {record.longestDuration || 0}s
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${themeConfig.mutedText} py-4 text-center`}>
                  No best records recorded for this time range. Complete tests to set new records!
                </p>
              )}
            </div>

            {/* Keyboard Accuracy Heatmap Section with Fixed Tooltip Position */}
            <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-4`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>
                    Keyboard Accuracy & Error Heatmap
                  </h2>
                  <p className={`text-xs ${themeConfig.mutedText}`}>
                    Visual key error telemetry and mistake breakdown
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> High Accuracy
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Occasional Error
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> High Error Key
                  </span>
                </div>
              </div>

              <div className={`${themeConfig.cardInset} p-6 overflow-x-auto pt-10 pb-8`}>
                <div className="min-w-[600px] flex flex-col items-center gap-2">
                  {KEYBOARD_ROWS.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 justify-center">
                      {row.map((char) => {
                        const stat = keyStatsMap[char];
                        const attempts = stat?.attempts || stat?.totalAttempts || 0;
                        const mistakes = stat?.mistakeCount || stat?.mistakes || 0;
                        const errorRate = attempts > 0 ? (mistakes / attempts) * 100 : 0;

                        let colorClass = "bg-slate-700/40 border-slate-600/50 text-slate-400";
                        if (attempts > 0) {
                          if (errorRate === 0) {
                            colorClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                          } else if (errorRate < 15) {
                            colorClass = "bg-amber-500/20 border-amber-500 text-amber-400 font-bold";
                          } else {
                            colorClass = "bg-red-500/20 border-red-500 text-red-400 font-bold";
                          }
                        }

                        return (
                          <div
                            key={char}
                            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all ${colorClass} group relative cursor-default`}
                          >
                            <span className="uppercase text-sm font-extrabold">{char}</span>
                            <span className="text-[9px] opacity-75">{mistakes > 0 ? `${mistakes} err` : "100%"}</span>

                            {/* Crisp Hover Tooltip Positioning Fixed (Below Key with Z-50 Overlay) */}
                            <div className={`absolute top-full mt-2 w-32 p-2 bg-slate-950 text-slate-100 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center border border-slate-700`}>
                              <p className="font-extrabold uppercase text-amber-400">Key '{char}'</p>
                              <p className="text-slate-300">Attempts: {attempts}</p>
                              <p className="text-slate-300">Errors: {mistakes}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Typing Test History Table with Retype & Load 10 More */}
            <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>Typing Session History</h2>
                  <p className={`text-xs ${themeConfig.mutedText}`}>
                    Full list of recorded tests and retype launcher
                  </p>
                </div>
                <span className={`text-xs ${themeConfig.mutedText}`}>
                  {historyPagination.totalRecords} total records
                </span>
              </div>

              {historyList.length === 0 ? (
                <div className={`p-8 text-center ${themeConfig.cardInset}`}>
                  <p className={`text-sm ${themeConfig.mutedText}`}>
                    No typing history recorded for this time range. Complete tests to build history!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${themeConfig.border} ${themeConfig.mutedText} font-bold uppercase tracking-wider`}>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Test Type</th>
                        <th className="py-3.5 px-4">WPM</th>
                        <th className="py-3.5 px-4">Accuracy</th>
                        <th className="py-3.5 px-4">Duration</th>
                        <th className="py-3.5 px-4">Chars Typed</th>
                        <th className="py-3.5 px-4">Correct</th>
                        <th className="py-3.5 px-4">Wrong</th>
                        <th className="py-3.5 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeConfig.border}`}>
                      {historyList.map((item, idx) => (
                        <tr key={item._id || idx} className="hover:bg-black/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            {item.testDate || item.createdAt
                              ? new Date(item.testDate || item.createdAt).toLocaleDateString()
                              : "Recent"}
                          </td>
                          <td className="py-3.5 px-4 font-bold uppercase">{item.testType}</td>
                          <td className={`py-3.5 px-4 font-black ${themeConfig.accent}`}>{item.wpm}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">{item.accuracy}%</td>
                          <td className="py-3.5 px-4 font-bold text-amber-400">{item.duration}s</td>
                          <td className={`py-3.5 px-4 ${themeConfig.mutedText}`}>{item.charactersTyped}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">{item.correctChars || 0}</td>
                          <td className="py-3.5 px-4 font-bold text-red-400">{item.incorrectChars || 0}</td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleReplayTest(item)}
                              className={`px-3 py-1.5 ${themeConfig.buttonPrimary} text-[11px] font-bold flex items-center gap-1.5`}
                              title="Retake this test duration with identical or new text"
                            >
                              <FiRotateCcw className="text-xs" /> Retype
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Load 10 More Button */}
              {historyPagination.hasMore && (
                <div className="flex justify-center pt-4 border-t border-slate-700/30">
                  <button
                    type="button"
                    onClick={handleLoadMoreHistory}
                    disabled={loadingMoreHistory}
                    className={`px-6 py-2.5 ${themeConfig.buttonSecondary} text-xs font-bold flex items-center gap-2`}
                  >
                    {loadingMoreHistory
                      ? "Loading..."
                      : `Load 10 More (${historyList.length} of ${historyPagination.totalRecords})`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
