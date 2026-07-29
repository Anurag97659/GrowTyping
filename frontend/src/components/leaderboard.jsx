import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { FiArrowLeft, FiSettings, FiAward, FiSun, FiMoon, FiClock, FiCalendar } from "react-icons/fi";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "lastWeek", label: "Last Week" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "allTime", label: "All Time" }
];

const TIMERS = [
  { id: "all", label: "All Timers" },
  { id: "15s", label: "15 Seconds" },
  { id: "30s", label: "30 Seconds" },
  { id: "60s", label: "60 Seconds" }
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("allTime");
  const [testType, setTestType] = useState("all");

  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem("growtyping.theme") || "dark";
  });

  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme = isLight ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("growtyping.theme", nextTheme);
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (range) queryParams.append("range", range);
      if (testType) queryParams.append("testType", testType);

      const res = await api.get(`GrowTyping/v1/stats/leaderboard?${queryParams.toString()}`);
      setLeaderboard(res.data.data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [range, testType]);

  const topThree = leaderboard.slice(0, 3);
  const remainingList = leaderboard.slice(3);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-[#0b131e] text-slate-100"
      }`}
    >
      {/* Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg ${
        isLight ? "bg-white/80 border-slate-200" : "bg-[#0f1927]/80 border-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FiAward className="text-slate-950 text-xl font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              GrowTyping Leaderboard
            </h1>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Top Speed Typists Ranking
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

        {/* Filter Controls */}
        <section className={`mb-10 p-6 rounded-2xl border backdrop-blur-md shadow-sm ${
          isLight ? "bg-white border-slate-200" : "bg-[#111c2d]/90 border-slate-800"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Range Filters */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FiCalendar className="text-emerald-400" /> Time Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRange(r.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      range === r.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                        : isLight
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Filters */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FiClock className="text-amber-400" /> Test Duration
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIMERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTestType(t.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      testType === t.id
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                        : isLight
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-amber-400 animate-pulse">Loading Leaderboard Rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center ${
            isLight ? "bg-white border-slate-200" : "bg-[#111c2d] border-slate-800"
          }`}>
            <h3 className="text-lg font-bold mb-1">No rankings available</h3>
            <p className={`text-sm max-w-md mx-auto ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              No typing tests have been recorded yet for the selected filters. Take a test to claim your spot!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
              {/* Silver - 2nd Place */}
              {topThree[1] && (
                <div className={`order-2 md:order-1 p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center relative overflow-hidden ${
                  isLight
                    ? "bg-white border-slate-200 shadow-lg"
                    : "bg-[#111c2d] border-slate-700/80 shadow-xl"
                }`}>
                  <div className="absolute top-0 right-0 px-3 py-1 bg-slate-300 text-slate-900 text-xs font-black rounded-bl-xl uppercase tracking-wider">
                    #2 SILVER
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-black text-2xl flex items-center justify-center mb-3 shadow-md">
                    2
                  </div>
                  <h3 className="font-bold text-lg text-emerald-400">@{topThree[1].username}</h3>
                  <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>{topThree[1].fullname}</p>

                  <div className="w-full space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Speed</span>
                      <span className="font-black text-emerald-400 text-base">{Math.round(topThree[1].highestWpm)} WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Accuracy</span>
                      <span className="font-bold text-teal-400">{Math.round(topThree[1].avgAccuracy)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tests</span>
                      <span className="font-bold text-amber-400">{topThree[1].totalTests}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gold - 1st Place */}
              {topThree[0] && (
                <div className={`order-1 md:order-2 p-7 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center relative overflow-hidden ${
                  isLight
                    ? "bg-gradient-to-b from-amber-500/10 to-white border-amber-400/60 shadow-xl"
                    : "bg-gradient-to-b from-amber-500/15 to-[#111c2d] border-amber-400/50 shadow-2xl"
                }`}>
                  <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-bl-xl uppercase tracking-wider shadow-sm">
                     #1 GOLD
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-3xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                    1
                  </div>
                  <h3 className="font-black text-xl text-amber-400">@{topThree[0].username}</h3>
                  <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>{topThree[0].fullname}</p>

                  <div className="w-full space-y-2.5 pt-3 border-t border-amber-400/20 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Top Speed</span>
                      <span className="font-black text-amber-400 text-lg">{Math.round(topThree[0].highestWpm)} WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Accuracy</span>
                      <span className="font-bold text-teal-400">{Math.round(topThree[0].avgAccuracy)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tests</span>
                      <span className="font-bold text-emerald-400">{topThree[0].totalTests}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bronze - 3rd Place */}
              {topThree[2] && (
                <div className={`order-3 p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center relative overflow-hidden ${
                  isLight
                    ? "bg-white border-slate-200 shadow-lg"
                    : "bg-[#111c2d] border-slate-700/80 shadow-xl"
                }`}>
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-700/80 text-amber-100 text-xs font-black rounded-bl-xl uppercase tracking-wider">
                    #3 BRONZE
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-black text-2xl flex items-center justify-center mb-3 shadow-md">
                    3
                  </div>
                  <h3 className="font-bold text-lg text-emerald-400">@{topThree[2].username}</h3>
                  <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>{topThree[2].fullname}</p>

                  <div className="w-full space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Speed</span>
                      <span className="font-black text-emerald-400 text-base">{Math.round(topThree[2].highestWpm)} WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Accuracy</span>
                      <span className="font-bold text-teal-400">{Math.round(topThree[2].avgAccuracy)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tests</span>
                      <span className="font-bold text-amber-400">{topThree[2].totalTests}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Leaderboard Table (Ranks 4+) */}
            {remainingList.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden shadow-lg ${
                isLight ? "bg-white border-slate-200" : "bg-[#111c2d] border-slate-800"
              }`}>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-400 uppercase tracking-wider">
                  Full Rankings
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                        isLight ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-800/40 text-slate-400 border-slate-800"
                      }`}>
                        <th className="px-6 py-3.5">Rank</th>
                        <th className="px-6 py-3.5">Typist</th>
                        <th className="px-6 py-3.5">Speed (WPM)</th>
                        <th className="px-6 py-3.5">Avg Accuracy</th>
                        <th className="px-6 py-3.5">Total Tests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                      {remainingList.map((user, idx) => {
                        const rankNum = idx + 4;
                        return (
                          <tr
                            key={user._id || idx}
                            className={`transition-colors ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/50"
                            }`}
                          >
                            <td className="px-6 py-4 font-black text-slate-400">
                              #{rankNum}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-emerald-400">@{user.username}</div>
                              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                {user.fullname}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black text-base text-emerald-400">
                              {Math.round(user.highestWpm)} <span className="text-xs text-slate-400 font-normal">WPM</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-teal-400">
                              {Math.round(user.avgAccuracy)}%
                            </td>
                            <td className="px-6 py-4 font-bold text-amber-400">
                              {user.totalTests}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
