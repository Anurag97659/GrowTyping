import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { clearAccessToken } from "../lib/api";
import { FaGithub } from "react-icons/fa";
import {
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiAward,
  FiGrid,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiClock,
  FiRotateCcw,
  FiCheckCircle,
  FiStar,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const WORDS = [
  "a", "an", "the", "I", "you", "he", "she", "we", "they", "it", "me", "him", "her", "us", "them",
  "my", "your", "his", "our", "their", "mine", "yours", "in", "on", "at", "with", "for", "from",
  "by", "about", "to", "into", "over", "under", "between", "and", "but", "or", "so", "because",
  "if", "when", "while", "as", "than", "like", "after", "before", "during", "without", "am", "is",
  "are", "was", "were", "have", "has", "had", "do", "does", "did", "say", "says", "said", "go",
  "goes", "went", "make", "makes", "made", "know", "knows", "knew", "see", "sees", "saw", "take",
  "takes", "took", "come", "comes", "came", "think", "thinks", "thought", "get", "gets", "got",
  "give", "gives", "gave", "feel", "feels", "felt", "look", "looks", "looked", "walk", "walks",
  "walked", "run", "runs", "ran", "read", "reads", "write", "writes", "wrote", "play", "plays",
  "played", "watch", "watches", "watched", "listen", "listens", "listened", "eat", "eats", "ate",
  "drink", "drinks", "drank", "sleep", "sleeps", "slept", "study", "studies", "studied", "teach",
  "teaches", "taught", "buy", "buys", "bought", "sell", "sells", "sold", "call", "calls",
  "called", "help", "helps", "helped", "man", "woman", "child", "boy", "girl", "baby", "adult",
  "person", "mother", "father", "brother", "sister", "son", "daughter", "friend", "teacher",
  "student", "doctor", "nurse", "patient", "manager", "employee", "leader", "athlete", "artist",
  "musician", "actor", "dancer", "author", "writer", "poet", "painter", "car", "bike", "bus",
  "train", "plane", "ship", "truck", "house", "building", "room", "apartment", "office", "school",
  "hospital", "door", "window", "wall", "floor", "roof", "garden", "tree", "flower", "plant",
  "rock", "mountain", "book", "pen", "pencil", "paper", "notebook", "computer", "phone", "screen",
  "keyboard", "mouse", "table", "chair", "desk", "bed", "sofa", "lamp", "clock", "picture",
  "bag", "box", "backpack", "shirt", "shoe", "hat", "coat", "pants", "dress", "skirt", "tie",
  "apple", "banana", "orange", "lemon", "grape", "strawberry", "watermelon", "peach", "pear",
  "cherry", "tomato", "potato", "carrot", "onion", "garlic", "rice", "wheat", "bread", "chicken",
  "beef", "fish", "cheese", "butter", "egg", "honey", "salt", "sugar", "water", "coffee", "tea",
  "milk", "juice", "quick", "slow", "small", "large", "big", "tiny", "short", "tall", "thin",
  "thick", "wide", "long", "round", "new", "old", "young", "ancient", "modern", "fresh", "clean",
  "dirty", "bright", "dark", "light", "strong", "weak", "soft", "hard", "smooth", "rough",
  "happy", "sad", "calm", "excited", "brave", "funny", "serious", "beautiful", "hot", "cold",
  "warm", "cool", "loud", "quiet", "sweet", "rich", "free", "rare", "quickly", "slowly",
  "carefully", "easily", "happily", "silently", "well", "always", "never", "often", "sometimes",
  "usually", "rarely", "today", "yesterday", "tomorrow", "now", "soon", "later", "early", "late"
];

const PUNCTUATION_MARKS = [",", ".", "!", "?", ":", ";"];
const SYMBOLS_LIST = ["@", "#", "$", "%", "&", "*", "-", "_", "+", "=", "/", "<", ">"];

const generateText = (count = 200, mode = "normal") =>
  Array.from({ length: count })
    .map((_, index) => {
      let token = WORDS[Math.floor(Math.random() * WORDS.length)];
      const addPunctuation = mode === "punctuation" || mode === "all";
      const addNumbers = mode === "numbers" || mode === "all";
      const addSymbols = mode === "symbols" || mode === "all";

      if (addPunctuation && (index + 1) % 7 === 0) {
        token += PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
      }
      if (addNumbers && (index + 1) % 6 === 0) {
        token += ` ${Math.floor(Math.random() * 9000) + 1000}`;
      }
      if (addSymbols && (index + 1) % 5 === 0) {
        token += SYMBOLS_LIST[Math.floor(Math.random() * SYMBOLS_LIST.length)];
      }

      return token;
    })
    .join(" ");

export default function TypingPage() {
  const navigate = useNavigate();
  const { themeId, mode, themeConfig, THEMES, setThemeId, toggleMode } = useTheme();

  const [username, setUsername] = useState("Guest");
  const [loggedIn, setLoggedIn] = useState(false);

  // Synchronously capture queued replay test from sessionStorage before initial state creation
  const queuedReplayRef = useRef(null);
  const replayCheckedRef = useRef(false);
  if (!replayCheckedRef.current) {
    replayCheckedRef.current = true;
    try {
      const raw = window.sessionStorage.getItem("growtyping.replayTest");
      if (raw) {
        queuedReplayRef.current = JSON.parse(raw);
        window.sessionStorage.removeItem("growtyping.replayTest");
      }
    } catch { /* ignore */ }
  }

  const handleLogout = async () => {
    try {
      await api.post("/GrowTyping/v1/users/logout");
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      clearAccessToken();
      setLoggedIn(false);
      setUsername("Guest");
      navigate("/login");
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const meRes = await api.get("/GrowTyping/v1/users/me");
        if (meRes.data?.loggedIn) {
          setUsername(meRes.data.user.username.toUpperCase());
          setLoggedIn(true);
        }
      } catch (err) {}
    };
    checkLogin();
  }, []);

  // Initialize testType state directly from queued replay (if present)
  const [testType, setTestType] = useState(() => {
    const replay = queuedReplayRef.current;
    if (replay?.testType && ["15s", "30s", "60s", "custom"].includes(replay.testType)) {
      return replay.testType;
    }
    return "30s";
  });

  const [textMode, setTextMode] = useState("normal");
  const durationMap = useMemo(() => ({ "15s": 15, "30s": 30, "60s": 60, custom: 0 }), []);

  // Initialize text state directly from queued replay text (if present)
  const [text, setText] = useState(() => {
    const replay = queuedReplayRef.current;
    if (replay && typeof replay.testText === "string" && replay.testText.trim().length > 0) {
      return replay.testText;
    }
    const type = replay?.testType || "30s";
    return type === "custom"
      ? "The quick brown fox jumps over the lazy dog"
      : generateText(200, "normal");
  });

  const [typedChars, setTypedChars] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => durationMap[queuedReplayRef.current?.testType] || 30);
  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  // Ref to always hold the current text string to avoid stale closure issues in finishTest / setInterval
  const textRef = useRef(text);
  textRef.current = text;

  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const totalRef = useRef(0);
  const savedRef = useRef(false);
  const weakKeysRef = useRef({});
  const keyStatsRef = useRef({});
  const startTimeRef = useRef(null);
  const finalDurationRef = useRef(null);
  const appliedResetRef = useRef(`${testType}:${textMode}`);

  const resetTest = useCallback(
    () => {
      clearInterval(timerRef.current);
      timerRef.current = null;

      // Clear replay reference on manual reset so new random text is generated
      queuedReplayRef.current = null;

      const newText =
        testType === "custom"
          ? "The quick brown fox jumps over the lazy dog"
          : generateText(200, textMode);

      textRef.current = newText;
      setText(newText);
      setTypedChars([]);
      setTimeLeft(durationMap[testType]);
      startedRef.current = false;
      finishedRef.current = false;
      savedRef.current = false;
      startTimeRef.current = null;
      finalDurationRef.current = null;
      correctRef.current = 0;
      incorrectRef.current = 0;
      totalRef.current = 0;
      weakKeysRef.current = {};
      keyStatsRef.current = {};
    },
    [testType, textMode, durationMap]
  );

  useEffect(() => {
    const resetKey = `${testType}:${textMode}`;
    if (appliedResetRef.current === resetKey) return;
    appliedResetRef.current = resetKey;
    resetTest();
  }, [testType, textMode, resetTest]);

  const startTimer = useCallback(() => {
    if (timerRef.current || testType === "custom") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          finishedRef.current = true;
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [testType]);

  const finishTest = async () => {
    if (savedRef.current) return;
    savedRef.current = true;

    let duration;
    if (testType === "custom") {
      const elapsedMs = Date.now() - startTimeRef.current;
      duration = Math.max(1, Math.ceil(elapsedMs / 1000));
    } else {
      duration = durationMap[testType];
    }

    finalDurationRef.current = duration;
    const minutes = duration / 60;
    const wpm = minutes > 0 ? Math.round(correctRef.current / 5 / minutes) : 0;
    const accuracy = totalRef.current
      ? Number(((correctRef.current / totalRef.current) * 100).toFixed(2))
      : 0;

    const payload = {
      wpm,
      accuracy,
      duration,
      charactersTyped: totalRef.current,
      correctChars: correctRef.current,
      incorrectChars: incorrectRef.current,
      testType,
      testText: textRef.current || text,
      weakKeys: Object.entries(weakKeysRef.current).map(([key, count]) => ({
        key,
        mistakeCount: count,
      })),
      keyStats: Object.entries(keyStatsRef.current).map(([key, stats]) => ({
        key,
        attempts: stats.attempts,
        mistakeCount: stats.mistakeCount,
      })),
    };

    try {
      await api.post("/GrowTyping/v1/stats/save", payload);
    } catch (err) {
      if (err.response?.status === 401) {
        console.info("Guest mode: stats not saved");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      resetTest();
      return;
    }

    if (finishedRef.current) return;
    if (e.key === "Backspace") {
      if (!typedChars.length) return;
      setTypedChars((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key.length !== 1 || typedChars.length >= text.length) return;
    if (!startedRef.current) {
      startedRef.current = true;
      startTimeRef.current = Date.now();
    }
    if (testType !== "custom") {
      startTimer();
    }
    const expected = text[typedChars.length];
    const isCorrect = e.key === expected;
    const key = /^[a-z]$/i.test(expected) ? expected.toLowerCase() : null;

    totalRef.current++;

    if (key) {
      keyStatsRef.current[key] ??= { attempts: 0, mistakeCount: 0 };
      keyStatsRef.current[key].attempts++;
    }

    if (isCorrect) {
      correctRef.current++;
    } else {
      incorrectRef.current++;
      if (key) {
        weakKeysRef.current[key] = (weakKeysRef.current[key] || 0) + 1;
        keyStatsRef.current[key].mistakeCount++;
      }
    }

    const newTyped = [...typedChars, { char: e.key, correct: isCorrect }];
    setTypedChars(newTyped);

    if (testType === "custom" && newTyped.length === text.length) {
      finishedRef.current = true;
      finishTest();
    }
  };

  // Render centered lines with charsPerLine set to 65 to ensure ZERO text clipping on left or right
  const renderedLines = useMemo(() => {
    if (!text) return null;
    const charsPerLine = 65;
    const totalLines = Math.ceil(text.length / charsPerLine);
    const currentLineIndex = Math.floor(typedChars.length / charsPerLine);
    const startLine = Math.max(0, Math.min(currentLineIndex - 1, totalLines - 3));
    const endLine = Math.min(totalLines, startLine + 3);

    const lines = [];
    for (let lineIdx = startLine; lineIdx < endLine; lineIdx++) {
      const lineStart = lineIdx * charsPerLine;
      const lineEnd = Math.min(text.length, lineStart + charsPerLine);
      const lineText = text.slice(lineStart, lineEnd);
      const isCurrentLine = lineIdx === currentLineIndex;

      lines.push(
        <div
          key={lineIdx}
          className={`whitespace-pre text-center transition-opacity duration-150 leading-relaxed font-mono ${
            isCurrentLine ? "opacity-100" : "opacity-40"
          }`}
        >
          {lineText.split("").map((char, i) => {
            const charIdx = lineStart + i;

            if (charIdx < typedChars.length) {
              return (
                <span
                  key={i}
                  className={
                    typedChars[charIdx].correct
                      ? `${themeConfig.accent} font-medium inline`
                      : "text-red-500 underline font-medium inline"
                  }
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            }

            if (charIdx === typedChars.length) {
              return (
                <span
                  key={i}
                  className="inline border-l-2 border-current animate-pulse font-medium relative -ml-[1px]"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            }

            return (
              <span key={i} className="opacity-60 inline">
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>
      );
    }
    return lines;
  }, [text, typedChars, themeConfig]);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} font-mono flex flex-col items-center justify-between outline-none transition-colors duration-300 pb-6`}
    >
      {/* Top Header Bar */}
      <div className={` ${themeConfig.card} border-b ${themeConfig.border} mt-10 ml-4 mr-4  py-4 px-4 sm:px-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${themeConfig.accent}`}>
              GrowTyping
            </h1>
            <p className={`text-xs ${themeConfig.mutedText} tracking-widest uppercase`}>
              Master Your Typing Speed
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Time Mode Selectors */}
            <div className={`flex gap-1 ${themeConfig.cardInset} p-1`}>
              {["15s", "30s", "60s", "custom"].map((m) => (
                <button
                  key={m}
                  onClick={() => setTestType(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    testType === m
                      ? `${themeConfig.buttonPrimary}`
                      : `${themeConfig.mutedText} hover:${themeConfig.bodyText}`
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Text Mode Selector */}
            <select
              value={textMode}
              onChange={(e) => setTextMode(e.target.value)}
              className={`px-3 py-1.5 text-xs font-medium ${themeConfig.input} cursor-pointer`}
              title="Typing text mode"
            >
              <option value="normal">Normal</option>
              <option value="punctuation">Punctuation</option>
              <option value="numbers">Numbers</option>
              <option value="symbols">Symbols</option>
              <option value="all">All</option>
            </select>

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
              className={`p-2 ${themeConfig.buttonSecondary} transition-all`}
              title="Toggle Dark / Light Mode"
            >
              {mode === "dark" ? <FiSun className="text-sm" /> : <FiMoon className="text-sm" />}
            </button>

            {/* User Dropdown */}
            <div className="relative group">
              <button
                onClick={() => (loggedIn ? navigate("/dashboard") : navigate("/login"))}
                className={`px-4 py-2 text-xs font-bold ${themeConfig.buttonSecondary} flex items-center gap-2`}
                title={username}
              >
                <FiUser className="text-sm" />
                <span>{username}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>

              <div className={`absolute right-0 top-full mt-2 w-48 ${themeConfig.card} shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2 border ${themeConfig.border}`}>
                {loggedIn ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiGrid className="text-sm" /> Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/settings")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiSettings className="text-sm" /> Settings
                    </button>
                    <button
                      onClick={() => navigate("/friends")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiUsers className="text-sm" /> Friends
                    </button>
                    <button
                      onClick={() => navigate("/leaderboard")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiAward className="text-sm" /> Leaderboard
                    </button>
                    <div className={`my-1 border-t ${themeConfig.border}`}></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiLogOut className="text-sm" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiLogIn className="text-sm" /> Login
                    </button>
                    <button
                      onClick={() => navigate("/registration")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiUserPlus className="text-sm" /> Register
                    </button>
                    <button
                      onClick={() => navigate("/leaderboard")}
                      className={`w-full text-left px-3 py-2 text-xs font-medium ${themeConfig.bodyText} hover:bg-black/10 rounded-lg transition-colors flex items-center gap-2`}
                    >
                      <FiAward className="text-sm" /> Leaderboard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Screen Middle Section */}
      <div className="w-full max-w-[90rem] flex-grow flex flex-col items-center justify-center px-6 md:px-12 my-auto">
        {/* Timer Section */}
        {testType !== "custom" && (
          <div className="mb-6">
            <div className={`text-3xl sm:text-4xl font-black ${themeConfig.accent} flex items-center gap-2 drop-shadow`}>
              <FiClock className="text-2xl" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Extra Wide Centered Typing Text Area (Preserving Container Size, Fitting 65 Chars per Line Perfectly) */}
        <div className="w-full text-2xl sm:text-3xl md:text-4xl leading-relaxed cursor-text min-h-[180px] flex flex-col items-center justify-center select-none overflow-hidden py-4 px-4 sm:px-8">
          {renderedLines}
        </div>

        {/* Reset Button */}
        <button
          onClick={() => resetTest()}
          className={`px-6 py-2.5 ${themeConfig.buttonSecondary} mt-6 flex items-center gap-2 font-semibold text-sm transition-all`}
        >
          <FiRotateCcw className="text-base" /> Reset
        </button>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col items-center pt-4">
        <p className={`text-xs ${themeConfig.mutedText} mb-2 tracking-wider text-center`}>
          Start typing to begin • Press Escape to reset
        </p>

        {/* GitHub Repository Footer Link */}
        <a
          href="https://github.com/Anurag97659/GrowTyping"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 ${themeConfig.mutedText} hover:${themeConfig.accent} transition-colors duration-200 text-xs font-medium`}
        >
          <FaGithub className="text-base" />
          <span>GitHub Repository</span>
        </a>
      </div>

      {/* Test Results Modal */}
      {finishedRef.current && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${themeConfig.card} max-w-xl w-full mx-auto overflow-hidden shadow-2xl border ${themeConfig.border}`}>
            <div className={`p-6 border-b ${themeConfig.border} text-center`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${themeConfig.accent} mb-2 flex items-center justify-center gap-2`}>
                {correctRef.current / totalRef.current > 0.95 ? (
                  <>
                    <FiStar className="text-amber-400 text-base" /> Exceptional Performance
                  </>
                ) : correctRef.current / totalRef.current > 0.85 ? (
                  <>
                    <FiCheckCircle className="text-emerald-400 text-base" /> Great Job
                  </>
                ) : (
                  "Test Result"
                )}
              </p>
              <h2 className={`text-3xl font-extrabold ${themeConfig.bodyText}`}>
                Test Completed
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`${themeConfig.cardInset} p-4 text-center`}>
                  <p className={`text-xs font-bold uppercase ${themeConfig.mutedText} mb-1`}>
                    Speed (WPM)
                  </p>
                  <p className={`text-4xl font-black ${themeConfig.accent}`}>
                    {Math.round(correctRef.current / 5 / (finalDurationRef.current / 60))}
                  </p>
                </div>

                <div className={`${themeConfig.cardInset} p-4 text-center`}>
                  <p className={`text-xs font-bold uppercase ${themeConfig.mutedText} mb-1`}>
                    Accuracy
                  </p>
                  <p className="text-4xl font-black text-emerald-400">
                    {((correctRef.current / (totalRef.current || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className="text-emerald-400 font-semibold mb-1">Correct</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{correctRef.current}</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className="text-red-400 font-semibold mb-1">Mistakes</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{incorrectRef.current}</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className={`${themeConfig.mutedText} font-semibold mb-1`}>Duration</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{finalDurationRef.current}s</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className={`${themeConfig.mutedText} font-semibold mb-1`}>Total Keys</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{totalRef.current}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => resetTest()}
                  className={`py-3 px-4 ${themeConfig.buttonPrimary} font-bold text-sm`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`py-3 px-4 ${themeConfig.buttonSecondary} font-bold text-sm`}
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
