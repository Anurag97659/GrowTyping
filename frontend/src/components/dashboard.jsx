import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSettings, FiArrowLeft } from "react-icons/fi";


const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [wpmByType, setWpmByType] = useState([]);
  const [accuracyByType, setAccuracyByType] = useState([]);
  const [weakKeys, setWeakKeys] = useState([]);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("thisYear");
  const [bestRecordByType, setBestRecordByType] = useState({});
  const [allTimeBestByType, setAllTimeBestByType] = useState({});
  const [username, setUsername] = useState("User");

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API ,
    withCredentials: true,
  });

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

      const streakData = await api.get(`GrowTyping/v1/stats/streak`);
      setStreak(streakData.data.data.streak || 0);

      const historyData = await api.get(
        `GrowTyping/v1/stats/history?range=${selectedRange}`,
      );
      const hist = historyData.data.data;
      setHistory(hist);

      const recordByType = {};
      hist.forEach((h) => {
        if (!recordByType[h.testType]) {
          recordByType[h.testType] = {
            highestWpm: h.wpm,
            highestAccuracy: h.accuracy,
            longestDuration: h.duration,
          };
        } else {
          recordByType[h.testType].highestWpm = Math.max(
            recordByType[h.testType].highestWpm,
            h.wpm,
          );
          recordByType[h.testType].highestAccuracy = Math.max(
            recordByType[h.testType].highestAccuracy,
            h.accuracy,
          );
          recordByType[h.testType].longestDuration = Math.max(
            recordByType[h.testType].longestDuration,
            h.duration,
          );
        }
      });
      setBestRecordByType(recordByType);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllTimeBest = async () => {
      try {
        const allTimeData = await api.get(`GrowTyping/v1/stats/history`);
        const hist = allTimeData.data.data;

        const recordByType = {};
        hist.forEach((h) => {
          if (!recordByType[h.testType]) {
            recordByType[h.testType] = {
              highestWpm: h.wpm,
              highestAccuracy: h.accuracy,
              longestDuration: h.duration,
            };
          } else {
            recordByType[h.testType].highestWpm = Math.max(
              recordByType[h.testType].highestWpm,
              h.wpm,
            );
            recordByType[h.testType].highestAccuracy = Math.max(
              recordByType[h.testType].highestAccuracy,
              h.accuracy,
            );
            recordByType[h.testType].longestDuration = Math.max(
              recordByType[h.testType].longestDuration,
              h.duration,
            );
          }
        });

        setAllTimeBestByType(recordByType);
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
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-500 text-lg">Loading...</div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen font-sans">
     
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 uppercase tracking-wider">
          Dashboard
        </h1>
        
        <div className="w-full flex justify-between items-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg rounded-full px-6 py-3 font-semibold text-white hover:scale-105 transition-transform text-sm uppercase">
            {username}
          </div>
          <div className="bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-700">
            <label className="mr-2 font-semibold text-gray-300 text-sm">
              Select Range:
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-gray-600 rounded-lg p-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white text-sm"
            >
              <option value="today">Today</option>
              <option value="lastDay">Last Day</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="thisYear">This Year</option>
              <option value="previousYears">Previous Years</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/typing")}
              className="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg rounded-full p-3 flex items-center justify-center hover:from-gray-600 hover:to-gray-500 hover:scale-105 transition-all text-white"
              title="Back to Typing"
            >
              <FiArrowLeft size={20} />
            </button>
            <button
              onClick={() => (window.location.href = "/settings")}
              className="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg rounded-full p-3 flex items-center justify-center hover:from-gray-600 hover:to-gray-500 hover:scale-105 transition-all text-white"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Sessions",
            value: stats.totalSessions || 0,
            color: "from-green-600 to-green-800",
          },
          {
            label: "Total Time (s)",
            value: stats.totalTime || 0,
            color: "from-green-600 to-green-800",
          },
          {
            label: "Average WPM",
            value:
              stats.avgWpm !== undefined && stats.avgWpm !== null
                ? stats.avgWpm.toFixed(2)
                : 0,
            color: "from-green-600 to-green-800",
          },
          {
            label: "Typing Streak",
            value: streak,
            color: "from-green-600 to-green-800",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} shadow-2xl rounded-2xl p-6 text-center transform hover:scale-105 transition-all border border-gray-600`}
          >
            <div className="text-gray-200 font-medium text-sm">{card.label}</div>
            <div className="text-3xl font-bold mt-3 text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">
          Best Record in {range === "today" ? "Today" : range === "lastDay" ? "Last Day" : range === "lastWeek" ? "Last Week" : range === "lastMonth" ? "Last Month" : range === "last6Months" ? "Last 6 Months" : range === "thisYear" ? "This Year" : "Previous Years"}
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {["15s", "30s", "60s", "custom"].map((type) => {
            const record = bestRecordByType[type] || {
              highestWpm: 0,
              highestAccuracy: 0,
              longestDuration: 0,
            };
            return (
              <div
                key={type}
                className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all border border-gray-600"
              >
                <div className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wide">
                  {type} Test
                </div>
                <div className="text-gray-300 mb-2">
                  WPM: <span className="font-bold text-blue-400">{record.highestWpm}</span>
                </div>
                <div className="text-gray-300 mb-2">
                  Accuracy:{" "}
                  <span className="font-bold text-green-400">{record.highestAccuracy}%</span>
                </div>
                <div className="text-gray-300">
                  Duration:{" "}
                  <span className="font-bold text-purple-400">{record.longestDuration}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">
          All-Time Best Record
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {["15s", "30s", "60s", "custom"].map((type) => {
            const record = allTimeBestByType[type] || {
              highestWpm: 0,
              highestAccuracy: 0,
              longestDuration: 0,
            };
            return (
              <div
                key={type}
                className="bg-gradient-to-br from-yellow-900 to-yellow-800 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all border border-yellow-600"
              >
                <div className="text-yellow-300 font-semibold mb-4 text-sm uppercase tracking-wide">
                  {type} Test
                </div>
                <div className="text-gray-200 mb-2">
                  WPM: <span className="font-bold text-yellow-300">{record.highestWpm}</span>
                </div>
                <div className="text-gray-200 mb-2">
                  Accuracy:{" "}
                  <span className="font-bold text-yellow-300">{record.highestAccuracy}%</span>
                </div>
                <div className="text-gray-200">
                  Duration:{" "}
                  <span className="font-bold text-yellow-300">{record.longestDuration}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl rounded-2xl p-6 border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Average WPM by Test Type
          </h2>
          <svg width="100%" height="220">
            {(() => {
              const maxWpm = Math.max(
                50,
                ...wpmByType.map((item) => item.averageWpm ?? 0),
              );
              const step = Math.ceil(maxWpm / 6);

              return (
                <>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const val = i * step;
                    return (
                      <g key={i}>
                        <line
                          x1="30"
                          y1={200 - (val / maxWpm) * 180}
                          x2="500"
                          y2={200 - (val / maxWpm) * 180}
                          stroke="#374151"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y={200 - (val / maxWpm) * 180 + 4}
                          fontSize="12"
                          fill="#9CA3AF"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}
                  <line
                    x1="30"
                    y1="200"
                    x2="500"
                    y2="200"
                    stroke="#60A5FA"
                    strokeWidth="1.5"
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
              const barHeight = (avgWpm / maxWpm) * 180;

              return (
                <g key={index}>
                  <rect
                    x={index * 60 + 40}
                    y={200 - barHeight}
                    width="40"
                    height={barHeight}
                    fill={`rgb(96,165,250,${0.5 + avgWpm / maxWpm})`}
                    rx="6"
                  />
                  <text
                    x={index * 60 + 60}
                    y={200 - barHeight - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#93C5FD"
                  >
                    {avgWpm.toFixed(1)}
                  </text>
                  <text
                    x={index * 60 + 60}
                    y={215}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9CA3AF"
                  >
                    {item._id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl rounded-2xl p-6 border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            Average Accuracy by Test Type (%)
          </h2>
          <svg width="100%" height="220">
            {[0, 20, 40, 60, 80, 100].map((val, idx) => (
              <g key={idx}>
                <line
                  x1="30"
                  y1={200 - (val / 100) * 180}
                  x2="500"
                  y2={200 - (val / 100) * 180}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y={200 - (val / 100) * 180 + 4}
                  fontSize="12"
                  fill="#9CA3AF"
                >
                  {val}
                </text>
              </g>
            ))}
            <line
              x1="30"
              y1="200"
              x2="500"
              y2="200"
              stroke="#4ADE80"
              strokeWidth="1.5"
            />
            {accuracyByType.map((item, index) => {
              const avgAcc = item.averageAccuracy ?? 0;
              const barHeight = (avgAcc / 100) * 180;

              return (
                <g key={index}>
                  <rect
                    x={index * 60 + 40}
                    y={200 - barHeight}
                    width="40"
                    height={barHeight}
                    fill={`rgb(74,222,128,${0.5 + avgAcc / 100})`}
                    rx="6"
                  />
                  <text
                    x={index * 60 + 60}
                    y={200 - barHeight - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#86EFAC"
                  >
                    {avgAcc.toFixed(1)}
                  </text>
                  <text
                    x={index * 60 + 60}
                    y={215}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9CA3AF"
                  >
                    {item.testType}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl rounded-2xl p-6 border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 text-red-400">
            Top Weak Keys
          </h2>
          <svg width="100%" height="220">
            {(() => {
              const maxMistakes = Math.max(
                10,
                ...weakKeys.map((item) => item.totalMistakes ?? 0),
              );
              const step = Math.ceil(maxMistakes / 6);

              return (
                <>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const val = i * step;
                    return (
                      <g key={i}>
                        <line
                          x1="30"
                          y1={200 - (val / maxMistakes) * 180}
                          x2="500"
                          y2={200 - (val / maxMistakes) * 180}
                          stroke="#374151"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y={200 - (val / maxMistakes) * 180 + 4}
                          fontSize="12"
                          fill="#9CA3AF"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}
                  <line
                    x1="30"
                    y1="200"
                    x2="500"
                    y2="200"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                  />
                </>
              );
            })()}

            {weakKeys.map((item, index) => {
              const mistakes = item.totalMistakes ?? 0;
              const maxMistakes = Math.max(
                10,
                ...weakKeys.map((i) => i.totalMistakes ?? 0),
              );
              const barHeight = (mistakes / maxMistakes) * 180;

              return (
                <g key={index}>
                  <rect
                    x={index * 60 + 40}
                    y={200 - barHeight}
                    width="40"
                    height={barHeight}
                    fill={`rgb(239,68,68,${0.5 + mistakes / maxMistakes})`}
                    rx="6"
                  />
                  <text
                    x={index * 60 + 60}
                    y={200 - barHeight - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#FCA5A5"
                  >
                    {mistakes}
                  </text>
                  <text
                    x={index * 60 + 60}
                    y={215}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9CA3AF"
                  >
                    {item._id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl rounded-2xl p-6 border border-gray-600 overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 text-gray-100">
          Typing History
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-gray-300">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-t-xl">
              <tr>
                {[
                  "Date",
                  "Test Type",
                  "WPM",
                  "Accuracy (%)",
                  "Duration (s)",
                  "Characters Typed",
                  "Correct Chars",
                  "Wrong Chars",
                ].map((th) => (
                  <th
                    key={th}
                    className="px-6 py-4 border-b border-gray-600 text-left font-semibold text-gray-200"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    No typing history available
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    className={
                      idx % 2 === 0
                        ? "bg-gray-800 hover:bg-gray-700 transition-all border-b border-gray-700"
                        : "bg-gray-750 hover:bg-gray-700 transition-all border-b border-gray-700"
                    }
                  >
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(item.testDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-blue-400 font-medium">{item.testType}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">{item.wpm}</td>
                    <td className="px-6 py-4 text-yellow-400 font-medium">{item.accuracy}</td>
                    <td className="px-6 py-4 text-purple-400 font-medium">{item.duration}</td>
                    <td className="px-6 py-4 text-gray-300">{item.charactersTyped}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">{item.correctChars}</td>
                    <td className="px-6 py-4 text-red-400 font-medium">{item.incorrectChars}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
