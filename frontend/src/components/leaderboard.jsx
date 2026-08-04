import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import {
  FiArrowLeft,
  FiAward,
  FiClock,
  FiCalendar,
  FiSun,
  FiMoon,
  FiUser,
  FiZap,
  FiSearch,
} from "react-icons/fi";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "lastDay", label: "Last Day" },
  { id: "lastWeek", label: "Last Week" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "allTime", label: "All Time" },
];

const TIMERS = [
  { id: "all", label: "All Timers" },
  { id: "15s", label: "15 Seconds" },
  { id: "30s", label: "30 Seconds" },
  { id: "60s", label: "60 Seconds" },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { themeConfig, mode, toggleMode, themeId, setThemeId, THEMES } = useTheme();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("allTime");
  const [testType, setTestType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredLeaderboard = leaderboard.filter((item) =>
    (item.username || item.user?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = filteredLeaderboard.slice(0, 3);
  const remainingList = filteredLeaderboard.slice(3);

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} p-4 sm:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className={`flex items-center justify-between p-4 ${themeConfig.card} border ${themeConfig.border}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/typing")}
              className={`p-2.5 ${themeConfig.buttonSecondary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FiArrowLeft className="text-base" /> Typing Page
            </button>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${themeConfig.accent}`}>
              Global Leaderboard
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

        {/* Filter Controls Bar */}
        <div className={`p-6 ${themeConfig.card} border ${themeConfig.border} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${themeConfig.mutedText} mr-2 flex items-center gap-1`}>
              <FiCalendar className="text-sm" /> Time Range:
            </span>
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  range === r.id
                    ? themeConfig.buttonPrimary
                    : `${themeConfig.buttonSecondary} opacity-70 hover:opacity-100`
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className={`text-xs font-bold uppercase tracking-wider ${themeConfig.mutedText} mr-2 flex items-center gap-1`}>
              <FiClock className="text-sm" /> Duration:
            </span>
            {TIMERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTestType(t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  testType === t.id
                    ? themeConfig.buttonPrimary
                    : `${themeConfig.buttonSecondary} opacity-70 hover:opacity-100`
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-md">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${themeConfig.mutedText}`} />
          <input
            type="text"
            placeholder="Search typists by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 text-xs ${themeConfig.input}`}
          />
        </div>

        {loading ? (
          <div className={`p-12 text-center ${themeConfig.card} border ${themeConfig.border}`}>
            <p className={`text-lg font-medium animate-pulse ${themeConfig.mutedText}`}>
              Fetching leaderboard rankings...
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* 2nd Place (Silver) */}
                {topThree[1] && (
                  <div className={`${themeConfig.card} p-6 border-2 border-slate-400/60 shadow-xl text-center relative flex flex-col justify-between order-2 md:order-1`}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-lg mb-3 shadow-md">
                      2
                    </div>
                    <h3 className={`text-xl font-black ${themeConfig.bodyText} truncate`}>
                      {topThree[1].username || topThree[1].user?.username || "Typist"}
                    </h3>
                    <p className="text-3xl font-extrabold text-slate-300 my-3">
                      {topThree[1].wpm || topThree[1].highestWpm || 0} <span className="text-xs font-normal">WPM</span>
                    </p>
                    <span className={`text-xs ${themeConfig.mutedText}`}>
                      Accuracy: {topThree[1].accuracy || topThree[1].avgAccuracy || 100}%
                    </span>
                  </div>
                )}

                {/* 1st Place (Gold Highlight) */}
                {topThree[0] && (
                  <div className={`${themeConfig.card} p-6 border-2 border-amber-400 shadow-2xl text-center relative flex flex-col justify-between order-1 md:order-2 scale-105 bg-gradient-to-b from-amber-500/10 to-transparent`}>
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black flex items-center justify-center text-xl mb-3 shadow-lg">
                      1
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Champion</span>
                    <h3 className={`text-2xl font-black ${themeConfig.accent} truncate`}>
                      {topThree[0].username || topThree[0].user?.username || "Typist"}
                    </h3>
                    <p className={`text-4xl font-black ${themeConfig.accent} my-3`}>
                      {topThree[0].wpm || topThree[0].highestWpm || 0} <span className="text-xs font-normal">WPM</span>
                    </p>
                    <span className={`text-xs ${themeConfig.mutedText}`}>
                      Accuracy: {topThree[0].accuracy || topThree[0].avgAccuracy || 100}%
                    </span>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {topThree[2] && (
                  <div className={`${themeConfig.card} p-6 border-2 border-amber-700/60 shadow-xl text-center relative flex flex-col justify-between order-3`}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-lg mb-3 shadow-md">
                      3
                    </div>
                    <h3 className={`text-xl font-black ${themeConfig.bodyText} truncate`}>
                      {topThree[2].username || topThree[2].user?.username || "Typist"}
                    </h3>
                    <p className="text-3xl font-extrabold text-amber-600 my-3">
                      {topThree[2].wpm || topThree[2].highestWpm || 0} <span className="text-xs font-normal">WPM</span>
                    </p>
                    <span className={`text-xs ${themeConfig.mutedText}`}>
                      Accuracy: {topThree[2].accuracy || topThree[2].avgAccuracy || 100}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Rankings Table */}
            <div className={`${themeConfig.card} p-6 border ${themeConfig.border} space-y-4`}>
              <h2 className={`text-lg font-extrabold ${themeConfig.bodyText}`}>Typist Rankings</h2>

              {filteredLeaderboard.length === 0 ? (
                <div className={`p-8 text-center ${themeConfig.cardInset}`}>
                  <p className={`text-sm ${themeConfig.mutedText}`}>
                    No typists found matching your filter options.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${themeConfig.border} ${themeConfig.mutedText} font-bold uppercase tracking-wider`}>
                        <th className="py-3 px-4 w-16">Rank</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Speed</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">Test Count</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeConfig.border}`}>
                      {filteredLeaderboard.map((item, idx) => (
                        <tr key={item._id || idx} className="hover:bg-black/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${
                              idx === 0
                                ? "bg-amber-400 text-black font-extrabold"
                                : idx === 1
                                ? "bg-slate-300 text-black font-extrabold"
                                : idx === 2
                                ? "bg-amber-700 text-white font-extrabold"
                                : `${themeConfig.cardInset}`
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
                            <FiUser className={themeConfig.mutedText} />
                            <span>{item.username || item.user?.username || "Guest Typist"}</span>
                          </td>
                          <td className={`py-3.5 px-4 font-black ${themeConfig.accent}`}>
                            {item.wpm || item.highestWpm || 0} WPM
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">
                            {item.accuracy || item.avgAccuracy || 100}%
                          </td>
                          <td className={`py-3.5 px-4 ${themeConfig.mutedText}`}>
                            {item.totalTests || item.testsCompleted || 1} tests
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
