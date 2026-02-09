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
    import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
  withCredentials: true,
});

export default function TypingPage() {
  const navigate = useNavigate();


  const [username, setUsername] = useState("User");
  useEffect(() => {
    api
      .get("GrowTyping/v1/users/getUsername")
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



  const [theme, setTheme] = useState("cyberpunk");

 const themes = {
  // High-end industry themes - Updated for high card contrast and readable dropdown text

  // Luxury Gold & Navy - Sophisticated enterprise feel
  "luxury-gold": {
    bg: "from-slate-950 via-indigo-950 to-amber-950",
    text: "text-amber-100",
    primary: "amber",
    card: "bg-slate-800/95 border-amber-400/60 backdrop-blur-md shadow-xl",
    button: "bg-gradient-to-r from-amber-500/90 to-amber-400/90 text-slate-900 border-amber-400 shadow-lg hover:shadow-amber-400/50"
  },

  // Cyberpunk Neon - Tech/futuristic with vibrant accents
  "cyberpunk": {
    bg: "from-slate-950 via-purple-950 to-pink-950",
    text: "text-slate-100",
    primary: "pink",
    card: "bg-slate-800/95 border-purple-400/50 backdrop-blur-lg shadow-2xl ring-1 ring-purple-500/30",
    button: "bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-fuchsia-500/90 text-slate-50 border-purple-400/50 shadow-lg hover:shadow-purple-400/40 glow"
  },

  // Monaco GP - Racing luxury with metallic silver
  "monaco": {
    bg: "from-zinc-950 via-blue-950 to-zinc-900",
    text: "text-zinc-50",
    primary: "blue",
    card: "bg-zinc-700/95 border-blue-400/70 backdrop-blur-md shadow-2xl ring-1 ring-blue-400/30",
    button: "bg-gradient-to-r from-blue-500/90 to-emerald-500/90 text-slate-900 border-blue-400 shadow-xl hover:shadow-emerald-400/40"
  },

  // Dubai Skyline - Warm desert luxury with sapphire accents
  "dubai": {
    bg: "from-orange-950 via-amber-950 to-sky-950",
    text: "text-slate-50",
    primary: "sky",
    card: "bg-slate-800/95 border-sky-400/60 backdrop-blur-lg shadow-xl ring-1 ring-sky-400/30",
    button: "bg-gradient-to-r from-sky-400/90 to-orange-400/90 text-slate-900 border-sky-400 shadow-xl hover:shadow-orange-400/50"
  },

  // Tokyo Night - Japanese minimalism with indigo gradients
  "tokyo-night": {
    bg: "from-indigo-950 via-slate-950 to-violet-950",
    text: "text-slate-100",
    primary: "indigo",
    card: "bg-slate-800/95 border-indigo-400/50 backdrop-blur-md shadow-xl ring-1 ring-indigo-500/30",
    button: "bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-slate-50 border-indigo-400 shadow-lg hover:shadow-indigo-400/40"
  },

  // Silicon Valley - Professional tech with green innovation accents
  "silicon": {
    bg: "from-stone-950 via-emerald-950 to-stone-950",
    text: "text-emerald-100",
    primary: "emerald",
    card: "bg-stone-800/95 border-emerald-400/60 backdrop-blur-md shadow-xl ring-1 ring-emerald-400/30",
    button: "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-900 border-emerald-400 shadow-lg hover:shadow-emerald-400/50"
  },

  // Beverly Hills - Sunset gradient luxury
  "beverly": {
    bg: "from-rose-950 via-orange-950 to-amber-950",
    text: "text-slate-50",
    primary: "amber",
    card: "bg-slate-800/95 border-orange-400/60 backdrop-blur-lg shadow-2xl ring-1 ring-orange-400/30",
    button: "bg-gradient-to-r from-orange-400/90 to-rose-400/90 text-slate-900 border-orange-400 shadow-xl hover:shadow-rose-400/50"
  },

  // Nordic Minimal - Clean icy blue with silver
  "nordic": {
    bg: "from-blue-950 via-slate-950 to-cyan-950",
    text: "text-cyan-100",
    primary: "cyan",
    card: "bg-slate-800/95 border-cyan-400/50 backdrop-blur-md shadow-xl ring-1 ring-cyan-400/30",
    button: "bg-gradient-to-r from-cyan-400/90 to-blue-400/90 text-slate-900 border-cyan-400 shadow-lg hover:shadow-cyan-400/50"
  },

  // Vegas Gold - Casino luxury with champagne gradients
  "vegas": {
    bg: "from-amber-950 via-yellow-950 to-rose-950",
    text: "text-slate-50",
    primary: "yellow",
    card: "bg-slate-800/95 border-yellow-400/70 backdrop-blur-lg shadow-2xl ring-1 ring-yellow-400/30",
    button: "bg-gradient-to-r from-yellow-400/90 to-amber-400/90 text-slate-900 border-yellow-400 shadow-xl hover:shadow-amber-400/50"
  },

  // Shanghai Neon - Oriental luxury with magenta accents
  "shanghai": {
    bg: "from-fuchsia-950 via-rose-950 to-pink-950",
    text: "text-slate-100",
    primary: "fuchsia",
    card: "bg-slate-800/95 border-fuchsia-400/60 backdrop-blur-lg shadow-xl ring-1 ring-fuchsia-500/30",
    button: "bg-gradient-to-r from-fuchsia-500/90 to-pink-500/90 text-slate-50 border-fuchsia-400 shadow-xl hover:shadow-pink-400/40"
  }
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


