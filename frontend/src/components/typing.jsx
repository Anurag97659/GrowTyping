import React, { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from "react";
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
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "with",
  "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which",
  "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no",
  "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state",
  "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like",
  "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even",
  "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back",
  "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because",
  "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very",
  "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house",
  "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing",
  "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn",
  "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since",
  "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public",
  "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible",
  "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order",
  "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early",
  "course", "change", "help", "line"
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


export function calculateGrowtypeStats(text, typedChars, totalKeystrokes, elapsedMinutes) {
  if (!text || elapsedMinutes <= 0) {
    return { wpm: 0, rawWpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0, totalTyped: 0 };
  }

  let rawCorrect = 0;
  let rawIncorrect = 0;

  typedChars.forEach((item) => {
    if (item.correct) {
      rawCorrect++;
    } else {
      rawIncorrect++;
    }
  });

  let netCorrectChars = 0;
  const words = text.split(" ");
  let charIdx = 0;

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const wordLen = word.length;
    
    if (charIdx >= typedChars.length) break;

    let wordTypedChars = [];
    let endIdx = charIdx;
    while (endIdx < typedChars.length && text[endIdx] !== " ") {
      wordTypedChars.push(typedChars[endIdx]);
      endIdx++;
    }

    const isCurrentWord = (endIdx === typedChars.length);
    const hasSpaceAfter = (endIdx < typedChars.length && text[endIdx] === " ");

    if (isCurrentWord) {
      let correctInActive = 0;
      for (let i = 0; i < wordTypedChars.length; i++) {
        if (wordTypedChars[i].correct) {
          correctInActive++;
        }
      }
      netCorrectChars += correctInActive;
    } else {
      let wordIs100PercentCorrect = (wordTypedChars.length === wordLen);
      for (let i = 0; i < wordTypedChars.length; i++) {
        if (!wordTypedChars[i].correct) {
          wordIs100PercentCorrect = false;
          break;
        }
      }
      if (hasSpaceAfter && (!typedChars[endIdx] || !typedChars[endIdx].correct)) {
        wordIs100PercentCorrect = false;
      }

      if (wordIs100PercentCorrect) {
        netCorrectChars += wordLen + (hasSpaceAfter ? 1 : 0);
      }
    }

    charIdx = endIdx + (hasSpaceAfter ? 1 : 0);
  }

  const wpm = Math.max(0, Math.round((netCorrectChars / 5) / elapsedMinutes));
  const rawWpm = Math.max(0, Math.round((typedChars.length / 5) / elapsedMinutes));
  const totalPressed = totalKeystrokes || typedChars.length || 1;
  const accuracy = Math.min(100, Math.max(0, Number(((rawCorrect / totalPressed) * 100).toFixed(1))));

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars: rawCorrect,
    incorrectChars: rawIncorrect,
    totalTyped: totalPressed,
  };
}

export default function TypingPage() {
  const navigate = useNavigate();
  const { themeId, mode, themeConfig, THEMES, setThemeId, toggleMode, setMode } = useTheme();

  const containerRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const typingAreaRef = useRef(null);
  const wordsWrapperRef = useRef(null);
  const caretRef = useRef(null);
  const activeLetterRef = useRef(null);

  const [lineOffsetY, setLineOffsetY] = useState(0);

  useEffect(() => {
    hiddenInputRef.current?.focus();
    containerRef.current?.focus();
  }, []);

  const [username, setUsername] = useState("Guest");
  const [loggedIn, setLoggedIn] = useState(false);

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
      setThemeId('glassmorphism');
      setMode('dark');
      setLoggedIn(false);
      setUsername('Guest');
      navigate('/login');
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

  const [testType, setTestType] = useState(() => {
    const replay = queuedReplayRef.current;
    if (replay?.testType && ["15s", "30s", "60s", "custom"].includes(replay.testType)) {
      return replay.testType;
    }
    return "30s";
  });

  const [textMode, setTextMode] = useState("normal");
  const durationMap = useMemo(() => ({ "15s": 15, "30s": 30, "60s": 60, custom: 0 }), []);

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
  const typedCharsRef = useRef(typedChars);
  typedCharsRef.current = typedChars;

  const [timeLeft, setTimeLeft] = useState(() => durationMap[queuedReplayRef.current?.testType] || 30);
  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  const textRef = useRef(text);
  textRef.current = text;

  const savedRef = useRef(false);
  const weakKeysRef = useRef({});
  const keyStatsRef = useRef({});
  const startTimeRef = useRef(null);
  const totalKeystrokesRef = useRef(0);
  const finalDurationRef = useRef(null);
  const finalStatsRef = useRef({ wpm: 0, rawWpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0, totalTyped: 0 });
  const appliedResetRef = useRef(`${testType}:${textMode}`);

  const resetTest = useCallback(
    () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
      queuedReplayRef.current = null;

      const newText =
        testType === "custom"
          ? "The quick brown fox jumps over the lazy dog"
          : generateText(200, textMode);

      textRef.current = newText;
      setText(newText);
      setTypedChars([]);
      typedCharsRef.current = [];
      setTimeLeft(durationMap[testType]);
      setLineOffsetY(0);
      startedRef.current = false;
      finishedRef.current = false;
      savedRef.current = false;
      startTimeRef.current = null;
      totalKeystrokesRef.current = 0;
      finalDurationRef.current = null;
      finalStatsRef.current = { wpm: 0, rawWpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0, totalTyped: 0 };
      weakKeysRef.current = {};
      keyStatsRef.current = {};
      setTimeout(() => {
        hiddenInputRef.current?.focus();
        containerRef.current?.focus();
      }, 0);
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

    const now = performance.now();
    const startTime = startTimeRef.current || now - 1000;
    const elapsedMs = Math.max(100, now - startTime);
    const durationInSeconds = elapsedMs / 1000;
    const elapsedMinutes = durationInSeconds / 60;

    const duration = testType === "custom" ? Math.max(1, Math.round(durationInSeconds)) : durationMap[testType];
    const stats = calculateGrowtypeStats(textRef.current || text, typedCharsRef.current, totalKeystrokesRef.current, elapsedMinutes);

    finalDurationRef.current = duration;
    finalStatsRef.current = { ...stats, duration };

    const payload = {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      duration,
      charactersTyped: stats.totalTyped,
      correctChars: stats.correctChars,
      incorrectChars: stats.incorrectChars,
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

  const tabPressedRef = useRef(false);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      resetTest();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      tabPressedRef.current = true;
      return;
    }

    if (e.key === "Enter" && tabPressedRef.current) {
      e.preventDefault();
      tabPressedRef.current = false;
      resetTest();
      return;
    }

    tabPressedRef.current = false;

    if (finishedRef.current) return;

    if (e.key === "Backspace") {
      totalKeystrokesRef.current++;
      if (!typedChars.length) return;
      setTypedChars((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key.length !== 1 || typedChars.length >= text.length) return;

    if (!startedRef.current) {
      startedRef.current = true;
      startTimeRef.current = performance.now();
    }
    if (testType !== "custom") {
      startTimer();
    }

    totalKeystrokesRef.current++;
    const currentIdx = typedChars.length;
    const expected = text[currentIdx];

    
    if (e.key === " " && expected !== " ") {
      const nextSpaceIdx = text.indexOf(" ", currentIdx);
      if (nextSpaceIdx !== -1) {
        const skippedChars = [];
        for (let i = currentIdx; i < nextSpaceIdx; i++) {
          skippedChars.push({ char: text[i], correct: false, skipped: true });
        }
        skippedChars.push({ char: " ", correct: false });
        const newTyped = [...typedChars, ...skippedChars];
        setTypedChars(newTyped);
        if (testType === "custom" && newTyped.length >= text.length) {
          finishedRef.current = true;
          finishTest();
        }
        return;
      }
    }

    const isCorrect = (e.key === expected);
    const key = /^[a-z]$/i.test(expected) ? expected.toLowerCase() : null;

    if (key) {
      keyStatsRef.current[key] ??= { attempts: 0, mistakeCount: 0 };
      keyStatsRef.current[key].attempts++;
    }

    if (!isCorrect && key) {
      weakKeysRef.current[key] = (weakKeysRef.current[key] || 0) + 1;
      keyStatsRef.current[key].mistakeCount++;
    }

    const newTyped = [...typedChars, { char: e.key, correct: isCorrect }];
    setTypedChars(newTyped);

    if (testType === "custom" && newTyped.length >= text.length) {
      finishedRef.current = true;
      finishTest();
    }
  };

  const allLines = useMemo(() => {
    if (!text) return [];
    const targetLineLength = 65;
    const lines = [];
    let currentLineStart = 0;
    let i = 0;

    while (i < text.length) {
      let nextSpace = text.indexOf(" ", i);
      if (nextSpace === -1) {
        nextSpace = text.length;
      }

      const wordEnd = nextSpace < text.length ? nextSpace + 1 : text.length;
      const currentLineLength = wordEnd - currentLineStart;

      if (currentLineLength > targetLineLength && i > currentLineStart) {
        lines.push({
          start: currentLineStart,
          end: i,
          text: text.slice(currentLineStart, i),
        });
        currentLineStart = i;
      }

      i = wordEnd;
    }

    if (currentLineStart < text.length) {
      lines.push({
        start: currentLineStart,
        end: text.length,
        text: text.slice(currentLineStart, text.length),
      });
    }

    return lines;
  }, [text]);

  const currentLineIndex = useMemo(() => {
    if (!allLines.length) return 0;
    const idx = allLines.findIndex(
      (line) => typedChars.length >= line.start && typedChars.length < line.end
    );
    return idx !== -1 ? idx : allLines.length - 1;
  }, [allLines, typedChars.length]);

  
  useLayoutEffect(() => {
    if (activeLetterRef.current && typingAreaRef.current && caretRef.current) {
      const letterRect = activeLetterRef.current.getBoundingClientRect();
      const containerRect = typingAreaRef.current.getBoundingClientRect();

      let x = letterRect.left - containerRect.left;
      const y = letterRect.top - containerRect.top;
      const h = letterRect.height || 36;

      const currentLine = allLines[currentLineIndex];
      if (currentLine && typedChars.length >= currentLine.end) {
        x += letterRect.width;
      }

      caretRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      caretRef.current.style.height = `${h}px`;
    }
  }, [typedChars.length, text, currentLineIndex, allLines]);

  const renderedLines = useMemo(() => {
    if (!allLines.length) return null;
    const totalLines = allLines.length;
    const startLine = Math.max(0, Math.min(currentLineIndex - 1, totalLines - 3));
    const endLine = Math.min(totalLines, startLine + 3);

    const lines = [];
    for (let lineIdx = startLine; lineIdx < endLine; lineIdx++) {
      const line = allLines[lineIdx];
      const isCurrentLine = lineIdx === currentLineIndex;

      lines.push(
        <div
          key={lineIdx}
          className={`whitespace-pre text-center transition-opacity duration-150 leading-relaxed font-mono ${
            isCurrentLine ? "opacity-100" : "opacity-40"
          }`}
        >
          {line.text.split("").map((char, i) => {
            const charIdx = line.start + i;
            const isCurrentChar = charIdx === typedChars.length;

            if (charIdx < typedChars.length) {
              return (
                <span
                  key={i}
                  ref={isCurrentChar ? activeLetterRef : null}
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

            return (
              <span
                key={i}
                ref={isCurrentChar ? activeLetterRef : null}
                className={isCurrentChar ? "opacity-100 inline" : "opacity-60 inline"}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>
      );
    }
    return lines;
  }, [allLines, currentLineIndex, typedChars, themeConfig]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        const tag = e.target.tagName;
        if (
          !["BUTTON", "SELECT", "INPUT", "A", "OPTION"].includes(tag) &&
          !e.target.closest("button") &&
          !e.target.closest("a") &&
          !e.target.closest("select")
        ) {
          hiddenInputRef.current?.focus();
          containerRef.current?.focus();
        }
      }}
      className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} font-mono flex flex-col items-center justify-between outline-none transition-colors duration-300 pb-6`}
    >
      
      <input
        ref={hiddenInputRef}
        type="text"
        aria-label="Typing Input Box"
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
        autoFocus
        onKeyDown={handleKeyDown}
        onChange={() => {}}
        value=""
      />

     
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

      
        <div
          ref={typingAreaRef}
          onClick={() => hiddenInputRef.current?.focus()}
          className="typing-container relative w-full text-2xl sm:text-3xl md:text-4xl leading-relaxed cursor-text min-h-[180px] flex flex-col items-center justify-center select-none overflow-hidden py-4 px-4 sm:px-8"
        >
         
          <div
            ref={caretRef}
            className={`grow-caret grow-caret-blink ${themeConfig.accent}`}
            style={{ backgroundColor: "currentColor" }}
          />

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
          Start typing to begin • Press Esc or Tab + Enter to reset
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
                {finalStatsRef.current.accuracy > 95 ? (
                  <>
                    <FiStar className="text-amber-400 text-base" /> Exceptional Performance
                  </>
                ) : finalStatsRef.current.accuracy > 85 ? (
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
                    {finalStatsRef.current.wpm}
                  </p>
                  <p className={`text-[11px] mt-1 ${themeConfig.mutedText}`}>
                    Raw: <span className="font-bold">{finalStatsRef.current.rawWpm}</span> WPM
                  </p>
                </div>

                <div className={`${themeConfig.cardInset} p-4 text-center`}>
                  <p className={`text-xs font-bold uppercase ${themeConfig.mutedText} mb-1`}>
                    Accuracy
                  </p>
                  <p className="text-4xl font-black text-emerald-400">
                    {finalStatsRef.current.accuracy}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className="text-emerald-400 font-semibold mb-1">Correct</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{finalStatsRef.current.correctChars}</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className="text-red-400 font-semibold mb-1">Mistakes</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{finalStatsRef.current.incorrectChars}</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className={`${themeConfig.mutedText} font-semibold mb-1`}>Duration</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{finalStatsRef.current.duration}s</p>
                </div>
                <div className={`${themeConfig.cardInset} p-3`}>
                  <p className={`${themeConfig.mutedText} font-semibold mb-1`}>Total Keys</p>
                  <p className={`text-lg font-bold ${themeConfig.bodyText}`}>{finalStatsRef.current.totalTyped}</p>
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

