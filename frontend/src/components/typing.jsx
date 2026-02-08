import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const WORDS = [
  // Articles
  "a", "an", "the",

  // Pronouns
  "I", "you", "he", "she", "we", "they", "it", "me", "him", "her", "us", "them",
  "my", "your", "his", "her", "our", "their", "mine", "yours", "hers", "ours", "theirs",

  // Common verbs
  "am", "is", "are", "was", "were", "have", "has", "had", "do", "does", "did",
  "say", "says", "said", "go", "goes", "went", "make", "makes", "made", "know", "knows", "knew",
  "see", "sees", "saw", "take", "takes", "took", "come", "comes", "came", "think", "thinks", "thought",
  "get", "gets", "got", "give", "gives", "gave", "feel", "feels", "felt", "look", "looks", "looked",
  "walk", "walks", "walked", "run", "runs", "ran", "read", "reads", "read", "write", "writes", "wrote",
  "play", "plays", "played", "watch", "watches", "watched", "listen", "listens", "listened", "eat", "eats", "ate",
  "drink", "drinks", "drank", "sleep", "sleeps", "slept", "study", "studies", "studied", "teach", "teaches", "taught",
  "buy", "buys", "bought", "sell", "sells", "sold", "call", "calls", "called", "help", "helps", "helped",

  // Common nouns
  "man", "woman", "child", "boy", "girl", "dog", "cat", "bird", "fish", "car", "bike", "house", "apartment", "room", "city", "town",
  "village", "school", "teacher", "student", "friend", "family", "mother", "father", "brother", "sister", "computer", "phone", "screen", 
  "keyboard", "mouse", "chair", "table", "book", "pen", "paper", "bag", "shirt", "shoe", "hat", "door", "window", "garden", "tree", "flower", 
  "river", "lake", "mountain", "road", "street", "food", "water", "coffee", "tea", "milk", "bread", "fruit", "vegetable", "animal", "game", "song",

  // Adjectives
  "quick", "slow", "happy", "sad", "angry", "bright", "dark", "beautiful", "ugly", "small", "large",
  "new", "old", "young", "strong", "weak", "funny", "serious", "easy", "hard", "hot", "cold", "loud", "quiet",
  "tall", "short", "fat", "thin", "heavy", "light", "rich", "poor", "clean", "dirty", "soft", "hard", "sweet", "bitter", "fresh", "stale",

  // Adverbs
  "quickly", "slowly", "carefully", "easily", "happily", "sadly", "silently", "loudly", "well", "badly",
  "always", "never", "often", "sometimes", "usually", "rarely", "today", "yesterday", "tomorrow", "now", "soon", "later",

  // Prepositions & Conjunctions
  "in", "on", "at", "with", "for", "from", "by", "about", "to", "into", "over", "under", "between", "and", "but", "or", "so",
  "because", "if", "when", "while", "as", "than", "like", "after", "before", "during", "without", "within", "about", "above", "below",

  // Miscellaneous common words
  "yes", "no", "maybe", "hello", "hi", "goodbye", "please", "thank", "thanks", "sorry", "welcome", "friend", "home", "school", "work", 
  "day", "night", "morning", "evening", "week", "month", "year", "time", "life", "world", "person", "idea", "problem", "question", "answer",
  "family", "child", "parent", "teacher", "student", "class", "lesson", "story", "game", "song", "music", "movie", "picture", "photo", "letter"
];



const generateText = (count = 200) =>
  Array.from({ length: count })
    .map(() => WORDS[Math.floor(Math.random() * WORDS.length)])
    .join(" ");

const api = axios.create({
  baseURL:
    import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/GrowTyping/v1",
  withCredentials: true,
});

export default function TypingPage() {
  const navigate = useNavigate();


  const [username, setUsername] = useState("User");
  useEffect(() => {
    api
      .get("/users/getUsername")
      .then((res) => setUsername(String(res.data.data.username).toUpperCase()))
      .catch((error) => {
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        }
        console.error("Error fetching user details:", error);
      });
  }, []);


  const [testType, setTestType] = useState("30s");
  const durationMap = { "15s": 15, "30s": 30, "60s": 60, custom: 0 };

  const [text, setText] = useState("");
  const [typedChars, setTypedChars] = useState([]);


  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

 
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const totalRef = useRef(0);
  const savedRef = useRef(false);
  const weakKeysRef = useRef({});

  useEffect(() => resetTest(), [testType]);

  const resetTest = () => {
    clearInterval(timerRef.current);
    setText(
      testType === "custom"
        ? "The quick brown fox jumps over the lazy dog"
        : generateText(),
    );
    setTypedChars([]);
    setTimeLeft(durationMap[testType]);
    startedRef.current = false;
    finishedRef.current = false;
    savedRef.current = false;
    correctRef.current = 0;
    incorrectRef.current = 0;
    totalRef.current = 0;
    weakKeysRef.current = {};
  };

  const startTimer = () => {
    if (startedRef.current || testType === "custom") return;
    startedRef.current = true;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishedRef.current = true;
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (finishedRef.current) return;
    if (e.key === "Backspace") {
      if (!typedChars.length) return;

      const last = typedChars[typedChars.length - 1];
      if (!last.correct) {
        last.corrected = true;
        setTypedChars((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (e.key.length !== 1 || typedChars.length >= text.length) return;

    startTimer();

    const expected = text[typedChars.length];
    const isCorrect = e.key === expected;

    totalRef.current++; 

    if (isCorrect) {
      correctRef.current++;
    } else {
      incorrectRef.current++;
      weakKeysRef.current[expected] = (weakKeysRef.current[expected] || 0) + 1;
    }

    setTypedChars((prev) => [...prev, { char: e.key, correct: isCorrect }]);
  };

  
const finishTest = async () => {
    if (savedRef.current) return;
    savedRef.current = true;

    const duration =
      testType === "custom"
        ? Math.max(1, Math.round(totalRef.current / 5))
        : durationMap[testType];
    const minutes = duration / 60;
    const wpm = Math.round(correctRef.current / 5 / minutes);
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
      weakKeys: Object.entries(weakKeysRef.current).map(([key, count]) => ({
        key,
        count,
      })),
    };

    try {
      await api.post("/stats/save", payload);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

 
  const elapsed = durationMap[testType] - timeLeft || 1;
  const liveWpm = startedRef.current
    ? Math.round(correctRef.current / 5 / (elapsed / 60))
    : 0;
  const liveAccuracy = totalRef.current
    ? (
        ((totalRef.current - incorrectRef.current) / totalRef.current) *
        100
      ).toFixed(1)
    : 100;



  const [theme, setTheme] = useState("default");

  const themes = {
    default: {
      bg: "from-slate-950 via-slate-900 to-slate-950",
      text: "text-slate-200",
      primary: "blue",
      card: "bg-slate-800/80 border-blue-500/60",
      button: "bg-slate-700 text-slate-100 border-blue-500",
    },

    graphite: {
      bg: "from-zinc-950 via-zinc-900 to-zinc-950",
      text: "text-zinc-200",
      primary: "zinc",
      card: "bg-zinc-800/80 border-zinc-500/60",
      button: "bg-zinc-700 text-zinc-100 border-zinc-500",
    },

    midnight: {
      bg: "from-gray-950 via-gray-900 to-gray-950",
      text: "text-gray-200",
      primary: "gray",
      card: "bg-gray-800/80 border-gray-500/60",
      button: "bg-gray-700 text-gray-100 border-gray-500",
    },

    ocean: {
      bg: "from-sky-950 via-sky-900 to-sky-950",
      text: "text-sky-200",
      primary: "sky",
      card: "bg-sky-800/80 border-sky-500/60",
      button: "bg-sky-700 text-sky-100 border-sky-500",
    },

    emerald: {
      bg: "from-emerald-950 via-emerald-900 to-emerald-950",
      text: "text-emerald-200",
      primary: "emerald",
      card: "bg-emerald-800/80 border-emerald-500/60",
      button: "bg-emerald-700 text-emerald-100 border-emerald-500",
    },

    violet: {
      bg: "from-violet-950 via-violet-900 to-violet-950",
      text: "text-violet-200",
      primary: "violet",
      card: "bg-violet-800/80 border-violet-500/60",
      button: "bg-violet-700 text-violet-100 border-violet-500",
    },

    crimson: {
      bg: "from-red-950 via-red-900 to-red-950",
      text: "text-red-200",
      primary: "red",
      card: "bg-red-800/80 border-red-500/60",
      button: "bg-red-700 text-red-100 border-red-500",
    },

    amber: {
      bg: "from-amber-950 via-amber-900 to-amber-950",
      text: "text-amber-200",
      primary: "amber",
      card: "bg-amber-800/80 border-amber-500/60",
      button: "bg-amber-700 text-amber-100 border-amber-500",
    },

    teal: {
      bg: "from-teal-950 via-teal-900 to-teal-950",
      text: "text-teal-200",
      primary: "teal",
      card: "bg-teal-800/80 border-teal-500/60",
      button: "bg-teal-700 text-teal-100 border-teal-500",
    },

    rose: {
      bg: "from-rose-950 via-rose-900 to-rose-950",
      text: "text-rose-200",
      primary: "rose",
      card: "bg-rose-800/80 border-rose-500/60",
      button: "bg-rose-700 text-rose-100 border-rose-500",
    },
  };

  const currentTheme = themes[theme];

    return (
      <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} font-mono flex flex-col items-center pt-8 outline-none`}
    >

        <div className="w-full flex flex-col items-center gap-6 mb-12">
          <div className={`${currentTheme.card} rounded-lg p-6 w-full max-w-2xl`}>
            <div className="flex items-center justify-between gap-8">
              <button
                onClick={() => navigate("/dashboard")}
                className={`font-semibold hover:${currentTheme.primary}-300 transition-all duration-200 px-4 py-2 rounded hover:bg-${currentTheme.primary}-900/40 ${currentTheme.card}`}
              >
                {username}
              </button>
              <div className="flex gap-3 flex-1 justify-center">
                {["15s", "30s", "60s", "custom"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTestType(m)}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex-1 ${
                      testType === m
                        ? `bg-${currentTheme.primary}-400 text-slate-950 shadow-lg shadow-${currentTheme.primary}-400/60`
                        : `${currentTheme.button}`
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={`px-3 py-2 rounded-lg font-semibold ${currentTheme.button} cursor-pointer hover:bg-opacity-80 transition-all`}
                >
                  {Object.keys(themes).map((t) => (
                    <option key={t} value={t} className="bg-slate-900">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {testType !== "custom" && (
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className={`text-3xl font-bold ${currentTheme.text} animate-pulse drop-shadow-lg`}>
              ⏱ {timeLeft}s
            </div>
            <button
              onClick={resetTest}
              className={`px-6 py-2 ${currentTheme.button} rounded-lg hover:bg-opacity-80 transition-all duration-200`}
            >
              Reset
            </button>
          </div>
        )}

        <div className={`bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-2xl max-w-7xl text-2xl leading-relaxed cursor-text tracking-wide shadow-2xl border border-${currentTheme.primary}-500/70 hover:border-${currentTheme.primary}-400 transition-colors duration-300 h-48 overflow-hidden`}>
          {(() => {
            const charsPerLine = 80;
            const totalLines = Math.ceil(text.length / charsPerLine);
            const currentLineIndex = Math.floor(typedChars.length / charsPerLine);
            const startLine = Math.max(0, currentLineIndex);
            const endLine = Math.min(totalLines, startLine + 3);
            const lines = [];
            for (let lineIdx = startLine; lineIdx < endLine; lineIdx++) {
              const lineStart = lineIdx * charsPerLine;
              const lineEnd = Math.min(text.length, lineStart + charsPerLine);
              const lineText = text.slice(lineStart, lineEnd);
              lines.push(
                <div key={lineIdx} className="whitespace-pre-wrap">
                  {lineText.split("").map((char, i) => {
                    const charIdx = lineStart + i;
                    if (charIdx < typedChars.length) {
                      return (
                        <span
                          key={i}
                          className={
                            typedChars[charIdx].correct
                              ? `text-${currentTheme.primary}-400 font-semibold`
                              : "text-red-400 underline font-semibold"
                          }
                        >
                          {char === " " ? "·" : char}
                        </span>
                      );
                    }
                    if (charIdx === typedChars.length) {
                      return (
                        <span
                          key={i}
                          className={`relative bg-white/20 text-slate-200 border-l-2 border-white animate-pulse font-bold`}
                        >
                          {char === " " ? "·" : char}
                        </span>
                      );
                    }
                    return (
                      <span key={i} className={`text-${currentTheme.primary}-600`}>
                        {char === " " ? "·" : char}
                      </span>
                    );
                  })}
                </div>,
              );
            }
            return lines;
          })()}
        </div>

        <div className="mt-10 text-center font-mono">
          <div className={`${currentTheme.card} rounded-lg px-12 py-6 hover:border-${currentTheme.primary}-400 transition-colors inline-block`}>
            <div className="flex gap-12">
              <div>
                <p className={`text-4xl font-bold ${currentTheme.text} drop-shadow-lg`}>
                  {liveWpm}
                </p>
                <p className={`text-${currentTheme.primary}-300 text-sm mt-2 uppercase tracking-wider`}>
                  WPM
                </p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${currentTheme.text} drop-shadow-lg`}>
                  {liveAccuracy}%
                </p>
                <p className={`text-${currentTheme.primary}-300 text-sm mt-2 uppercase tracking-wider`}>
                  Accuracy
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className={`text-${currentTheme.primary}-500 mt-8 text-sm tracking-wide`}>
          Click the box and start typing
        </p>

        {finishedRef.current && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-${currentTheme.primary}-500/50 rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl`}>
              <h2 className={`text-3xl font-bold ${currentTheme.text} mb-8 text-center`}>
                Test Complete!
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`bg-slate-700/50 rounded-lg p-4 border border-${currentTheme.primary}-500/30`}>
                    <p className={`text-${currentTheme.primary}-300 text-xs uppercase tracking-wider mb-2`}>WPM</p>
                    <p className={`text-3xl font-bold ${currentTheme.text}`}>{Math.round(correctRef.current / 5 / (durationMap[testType] / 60))}</p>
                  </div>
                  <div className={`bg-slate-700/50 rounded-lg p-4 border border-${currentTheme.primary}-500/30`}>
                    <p className={`text-${currentTheme.primary}-300 text-xs uppercase tracking-wider mb-2`}>Accuracy</p>
                    <p className={`text-3xl font-bold ${currentTheme.text}`}>{((correctRef.current / totalRef.current) * 100).toFixed(1)}%</p>
                  </div>
                  <div className={`bg-slate-700/50 rounded-lg p-4 border border-${currentTheme.primary}-500/30`}>
                    <p className={`text-${currentTheme.primary}-300 text-xs uppercase tracking-wider mb-2`}>Correct</p>
                    <p className={`text-2xl font-bold ${currentTheme.text}`}>{correctRef.current}</p>
                  </div>
                  <div className={`bg-slate-700/50 rounded-lg p-4 border border-${currentTheme.primary}-500/30`}>
                    <p className={`text-${currentTheme.primary}-300 text-xs uppercase tracking-wider mb-2`}>Mistakes</p>
                    <p className="text-2xl font-bold text-red-400">{incorrectRef.current}</p>
                  </div>
                </div>
                <button
                  onClick={resetTest}
                  className={`w-full bg-gradient-to-r from-${currentTheme.primary}-500 to-${currentTheme.primary}-400 text-slate-950 font-bold py-3 rounded-lg hover:from-${currentTheme.primary}-400 hover:to-${currentTheme.primary}-300 transition-all duration-200 transform hover:scale-105 shadow-lg`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`w-full ${currentTheme.button} font-bold py-3 rounded-lg transition-all duration-200`}
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }


