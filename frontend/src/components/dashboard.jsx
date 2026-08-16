import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
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
  FiX,
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

const CustomChartTooltip = ({ active, payload, label, formatTime }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 backdrop-blur-md min-w-[200px]">
        <p className="font-extrabold text-slate-200 border-b border-slate-700/60 pb-1.5 flex items-center justify-between">
          <span> Date: {label}</span>
        </p>
        <div className="space-y-1.5 pt-0.5">
          <p className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
            <span> Avg Speed:</span>
            <span className="font-bold">{data.avgWpm} WPM</span>
          </p>
          <p className="flex items-center justify-between gap-4 text-indigo-400 font-medium">
            <span> Avg Accuracy:</span>
            <span className="font-bold">{data.avgAccuracy}%</span>
          </p>
          <p className="flex items-center justify-between gap-4 text-amber-400 font-medium">
            <span>Tests Given:</span>
            <span className="font-bold">{data.count}</span>
          </p>
          <p className="flex items-center justify-between gap-4 text-cyan-400 font-medium border-t border-slate-800 pt-1.5">
            <span> Total Time:</span>
            <span className="font-bold">{formatTime ? formatTime(data.totalTime) : `${data.totalTime}s`}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md min-w-[160px]">
        <p className="font-extrabold text-slate-200 border-b border-slate-700/60 pb-1 mb-1 font-mono">
           Test Mode: {label}
        </p>
        <p className="flex items-center justify-between gap-3 text-emerald-400 font-medium">
          <span> Avg Speed:</span>
          <span className="font-bold">{data.avgWpm} WPM</span>
        </p>
        <p className="flex items-center justify-between gap-3 text-indigo-400 font-medium">
          <span> Avg Accuracy:</span>
          <span className="font-bold">{data.avgAccuracy}%</span>
        </p>
        {data.totalTests !== undefined && (
          <p className="flex items-center justify-between gap-3 text-amber-400 font-medium">
            <span> Total Tests:</span>
            <span className="font-bold">{data.totalTests}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomWeakKeyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md min-w-[140px]">
        <p className="font-extrabold text-rose-400 border-b border-slate-700/60 pb-1 mb-1 font-mono">
          Key: <span className="uppercase text-slate-100 font-black">{data.key}</span>
        </p>
        <p className="flex items-center justify-between gap-3 text-slate-300 font-medium">
          <span> Mistakes:</span>
          <span className="font-bold text-rose-400">{data.mistakes}</span>
        </p>
      </div>
    );
  }
  return null;
};

const getTestKeyStats = (test) =>
  Object.fromEntries(
    (Array.isArray(test?.keyStats) ? test.keyStats : [])
      .filter((stat) => stat?.key)
      .map((stat) => [
        String(stat.key).toLowerCase(),
        {
          attempts: Number(stat.attempts) || 0,
          mistakes: Number(stat.mistakeCount) || 0,
        },
      ])
  );

function TestDetailsModal({ test, themeConfig, onClose }) {
  if (!test) return null;

  const keyStats = getTestKeyStats(test);
  const wrongKeys = Object.entries(keyStats)
    .map(([key, stat]) => ({ key, ...stat }))
    .filter((stat) => stat.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes || b.attempts - a.attempts);
  const heatClass = ({ attempts, mistakes }) => {
    if (!attempts) return "bg-slate-500/15 border-slate-500/30 text-slate-400";
    const errorRate = mistakes / attempts;
    if (errorRate >= 0.4) return "bg-rose-500/80 border-rose-300 text-white";
    if (errorRate >= 0.2) return "bg-orange-500/75 border-orange-300 text-white";
    if (errorRate > 0) return "bg-amber-400/75 border-amber-200 text-slate-950";
    return "bg-emerald-500/70 border-emerald-200 text-white";
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-details-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${themeConfig.card} border ${themeConfig.border} shadow-2xl`}>
        <header className={`sticky top-0 z-10 flex items-start justify-between gap-4 border-b ${themeConfig.border} ${themeConfig.card} p-5`}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>Test details</p>
            <h2 id="test-details-title" className={`mt-1 text-xl font-black ${themeConfig.bodyText}`}>
              {test.testType} typing test
            </h2>
            <p className={`mt-1 text-xs ${themeConfig.mutedText}`}>
              {test.testDate || test.createdAt ? new Date(test.testDate || test.createdAt).toLocaleString() : "Recent test"}
            </p>
          </div>
          <button type="button" onClick={onClose} className={`p-2 ${themeConfig.buttonSecondary}`} aria-label="Close test details">
            <FiX className="text-lg" />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Speed", `${test.wpm || 0} WPM`, "text-cyan-400"],
              ["Accuracy", `${Number(test.accuracy || 0).toFixed(1)}%`, "text-emerald-400"],
              ["Duration", `${test.duration || 0}s`, "text-amber-400"],
              ["Typed", test.charactersTyped || 0, themeConfig.bodyText],
              ["Correct", test.correctChars || 0, "text-emerald-400"],
              ["Wrong", test.incorrectChars || 0, "text-rose-400"],
            ].map(([label, value, color]) => (
              <div key={label} className={`${themeConfig.cardInset} border ${themeConfig.border} p-3`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>{label}</p>
                <p className={`mt-1 text-lg font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className={`${themeConfig.cardInset} border ${themeConfig.border} p-4`}>
            <h3 className={`text-sm font-extrabold ${themeConfig.bodyText}`}>Statement typed</h3>
            {test.testText ? (
              <p className={`mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg border ${themeConfig.border} bg-black/10 p-3 text-xs leading-6 ${themeConfig.bodyText}`}>
                {test.testText}
              </p>
            ) : (
              <p className={`mt-3 text-xs ${themeConfig.mutedText}`}>The statement for this older test was not saved.</p>
            )}
          </div>

          <div>
            <div className={`${themeConfig.cardInset} border ${themeConfig.border} p-4`}>
              <h3 className={`text-sm font-extrabold ${themeConfig.bodyText}`}>Wrong keys typed</h3>
              <p className={`mt-1 text-xs ${themeConfig.mutedText}`}>Wrong presses compared with total attempts for each key.</p>
              {wrongKeys.length ? (
                <div className="mt-4 max-h-40 space-y-1 overflow-y-auto pr-1">
                  {wrongKeys.map(({ key, mistakes, attempts }) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-rose-500/10 px-3 py-2 text-xs">
                      <span className="font-black text-rose-400">{key.toUpperCase()}</span>
                      <span className={themeConfig.mutedText}>{mistakes} wrong / {attempts} total</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`mt-4 text-xs ${themeConfig.mutedText}`}>No wrong-key data was recorded for this test.</p>
              )}
            </div>
          </div>

          <div className={`${themeConfig.cardInset} border ${themeConfig.border} p-4`}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className={`text-sm font-extrabold ${themeConfig.bodyText}`}>Per-test keyboard heatmap</h3>
                <p className={`mt-1 text-xs ${themeConfig.mutedText}`}>Green = no errors; yellow, orange, and red = higher error rate.</p>
              </div>
              <span className={`text-[10px] ${themeConfig.mutedText}`}>Hover a key for attempts and errors</span>
            </div>
            <div className="mt-5 space-y-2 overflow-x-auto pb-1">
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex min-w-max justify-center gap-2">
                  {row.map((key) => {
                    const stat = keyStats[key] || { attempts: 0, mistakes: 0 };
                    return (
                      <div key={key} className={`group relative flex h-14 w-14 flex-col items-center justify-center rounded-lg border shadow-sm ${heatClass(stat)}`}>
                        <span className="text-sm font-black uppercase">{key}</span>
                        <span className="text-[9px] font-medium">{stat.attempts ? `${stat.mistakes}/${stat.attempts}` : "—"}</span>
                        <div className={`pointer-events-none absolute left-1/2 z-20 w-32 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950 p-2 text-center text-[10px] text-slate-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${
                          rowIndex === KEYBOARD_ROWS.length - 1 ? "bottom-full mb-2" : "top-full mt-2"
                        }`}>
                          <p className="font-black">{key.toUpperCase()}</p>
                          <p>Attempts: {stat.attempts}</p>
                          <p>Errors: {stat.mistakes}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
  const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);

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

  // Recharts combined line graph data
  const rechartsData = dailyProgress.map((p) => {
    const raw = p._id?.date || p._id || p.date || "";
    let dateStr = "";
    if (raw) {
      const d = new Date(raw);
      dateStr = isNaN(d.getTime()) ? String(raw).slice(5) : `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return {
      date: dateStr,
      avgWpm: Math.round(p.avgWpm || 0),
      avgAccuracy: Number((p.avgAccuracy || 0).toFixed(1)),
      count: p.count || p.testsCount || p.totalTests || 0,
      totalTime: p.totalTime || 0,
    };
  });

  
  const modeStatsFromApi = dashboardStats?.modeStats || {};

  const STANDARD_TYPES = ["15s", "30s", "60s", "custom"];
  const allKnownTypes = new Set(STANDARD_TYPES);

  Object.keys(modeStatsFromApi).forEach((t) => allKnownTypes.add(t));
  Object.keys(bestRecords).forEach((t) => allKnownTypes.add(t));
  historyList.forEach((item) => {
    if (item.testType) allKnownTypes.add(item.testType);
  });

  const wpmByTypeMap = {};
  const accByTypeMap = {};
  const cntByTypeMap = {};
  historyList.forEach((item) => {
    const t = item.testType || "other";
    wpmByTypeMap[t] = (wpmByTypeMap[t] || 0) + (item.wpm || 0);
    accByTypeMap[t] = (accByTypeMap[t] || 0) + (item.accuracy || 0);
    cntByTypeMap[t] = (cntByTypeMap[t] || 0) + 1;
  });

  const combinedTypeStats = Array.from(allKnownTypes).map((t) => {
    if (modeStatsFromApi[t]) {
      return {
        type: t,
        avgWpm: modeStatsFromApi[t].avgWpm,
        avgAccuracy: modeStatsFromApi[t].avgAccuracy,
        totalTests: modeStatsFromApi[t].totalTests,
      };
    }
    const cnt = cntByTypeMap[t] || 0;
    return {
      type: t,
      avgWpm: cnt > 0 ? Math.round((wpmByTypeMap[t] / cnt) * 10) / 10 : 0,
      avgAccuracy: cnt > 0 ? Math.round((accByTypeMap[t] / cnt) * 10) / 10 : 0,
      totalTests: cnt,
    };
  });

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
                  {/* <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiZap className={`text-base ${themeConfig.accent}`} />
                  </div> */}
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
                  {/* <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiActivity className="text-base text-emerald-400" />
                  </div> */}
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
                  {/* <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiCheckCircle className="text-base text-indigo-400" />
                  </div> */}
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
                  {/* <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiLayers className="text-base text-amber-400" />
                  </div> */}
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
                  {/* <div className={`p-2 rounded-lg ${themeConfig.cardInset}`}>
                    <FiClock className="text-base text-cyan-400" />
                  </div> */}
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





            {/* Enhanced Progress Graphs Section - Combined Recharts Line Chart */}
            {dailyProgress.length > 0 && (
              <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-4`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className={`text-base font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
                      Speed, Accuracy & Activity Progression
                    </h3>
                    <p className={`text-xs ${themeConfig.mutedText}`}>
                      Daily typing speed (WPM), accuracy (%), tests given, and typing time
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${themeConfig.cardInset} ${themeConfig.accent}`}>
                      Latest WPM: {Math.round(dailyProgress[dailyProgress.length - 1]?.avgWpm || 0)}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                      Latest Acc: {Number(dailyProgress[dailyProgress.length - 1]?.avgAccuracy || 0).toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400">
                      Latest Tests: {dailyProgress[dailyProgress.length - 1]?.count || dailyProgress[dailyProgress.length - 1]?.testsCount || 0}
                    </span>
                  </div>
                </div>

                <div className={`${themeConfig.cardInset} p-4 rounded-xl h-[340px] w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={rechartsData}
                      margin={{
                        top: 10,
                        right: 60,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#34d399"
                        tick={{ fill: "#34d399", fontSize: 11 }}
                        domain={[0, 'auto']}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#818cf8"
                        tick={{ fill: "#818cf8", fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <YAxis
                        yAxisId="count"
                        orientation="right"
                        stroke="#f59e0b"
                        tick={{ fill: "#f59e0b", fontSize: 11 }}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                        dx={30}
                      />
                      <Tooltip content={<CustomChartTooltip formatTime={formatTime} />} />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgWpm"
                        name="Avg Speed (WPM)"
                        stroke="#34d399"
                        strokeWidth={2.5}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgAccuracy"
                        name="Avg Accuracy (%)"
                        stroke="#818cf8"
                        strokeWidth={2.5}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        yAxisId="count"
                        type="monotone"
                        dataKey="count"
                        name="Tests Given"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── History Activity Heatmap ─────────────────────────────── */}
            <HistoryHeatmap themeConfig={themeConfig} />

            {/* Bar Charts Row: Combined Performance by Test Type (15s, 30s, 60s, custom) | Top Weak Keys */}
            {(combinedTypeStats.length > 0 || topWeakKeys.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Combined Grouped Bar Chart: WPM & Accuracy by Test Type */}
                <div className={`lg:col-span-2 ${themeConfig.card} p-5 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      <h3 className={`text-xs font-extrabold uppercase tracking-widest ${themeConfig.mutedText}`}>
                        Performance by Test Type (WPM & Accuracy)
                      </h3>
                    </div>
                    <p className={`text-[11px] ${themeConfig.mutedText}`}>Side-by-side comparison per mode</p>
                  </div>

                  <div className={`${themeConfig.cardInset} p-3 rounded-xl h-[230px] w-full`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={combinedTypeStats}
                        barGap={0}
                        barCategoryGap="25%"
                        margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis
                          dataKey="type"
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                        <Bar
                          dataKey="avgWpm"
                          name="Avg WPM"
                          fill="#34d399"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="avgAccuracy"
                          name="Avg Accuracy (%)"
                          fill="#818cf8"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart 2: Top Weak Keys (Horizontal Flipped Layout) */}
                <div className={`${themeConfig.card} p-5 border ${themeConfig.border} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest ${themeConfig.mutedText}`}>
                      Top Weak Keys
                    </h3>
                  </div>
                  {topWeakKeys.length === 0 ? (
                    <p className={`text-xs ${themeConfig.mutedText} py-12 text-center`}>No error data for this range</p>
                  ) : (
                    <div className={`${themeConfig.cardInset} p-3 rounded-xl h-[230px] w-full`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={topWeakKeys}
                          margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                          <XAxis
                            type="number"
                            stroke="#94a3b8"
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            allowDecimals={false}
                          />
                          <YAxis
                            dataKey="key"
                            type="category"
                            stroke="#94a3b8"
                            tick={{ fill: "#fb7185", fontSize: 12, fontWeight: "bold" }}
                            width={30}
                          />
                          <Tooltip content={<CustomWeakKeyTooltip />} />
                          <Bar
                            dataKey="mistakes"
                            name="Mistakes"
                            fill="#fb7185"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Best Records Cards */}
            

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
                        <tr
                          key={item._id || idx}
                          onClick={() => setSelectedHistoryTest(item)}
                          className="cursor-pointer hover:bg-black/5 transition-colors"
                          title="View test details"
                        >
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
                              onClick={(event) => {
                                event.stopPropagation();
                                handleReplayTest(item);
                              }}
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
      <TestDetailsModal
        test={selectedHistoryTest}
        themeConfig={themeConfig}
        onClose={() => setSelectedHistoryTest(null)}
      />
    </div>
  );
}
