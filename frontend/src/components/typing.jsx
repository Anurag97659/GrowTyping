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



  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-green-400 font-mono flex flex-col items-center pt-8 outline-none"
    >

      <div className="w-full flex flex-col items-center gap-6 mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent drop-shadow-lg">
          GrowTyping
        </h1>
        <div className="bg-gray-800/70 border border-green-500/70 rounded-lg p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-green-400 font-semibold hover:text-green-300 transition-all duration-200 px-4 py-2 rounded hover:bg-green-900/40 border border-green-500/70"
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
                      ? "bg-green-400 text-gray-950 shadow-lg shadow-green-400/60"
                      : "bg-gray-700 text-green-400 hover:bg-gray-600 border border-green-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {testType !== "custom" && (
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="text-3xl font-bold text-green-400 animate-pulse drop-shadow-lg">
            ⏱ {timeLeft}s
          </div>
          <button
            onClick={resetTest}
            className="px-6 py-2 bg-gray-700 text-green-400 border border-green-500 rounded-lg hover:bg-gray-600 hover:text-green-300 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      )}

      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl max-w-7xl text-2xl leading-relaxed cursor-text tracking-wide shadow-2xl border border-green-500/70 hover:border-green-400 transition-colors duration-300 h-48 overflow-hidden">
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
                            ? "text-green-400 font-semibold"
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
                        className="bg-green-400 text-gray-950 animate-pulse font-bold rounded-[1px] px-[1px]"
                      >
                        {char === " " ? "·" : char}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="text-green-600">
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

      <div className="mt-10 text-center text-green-400 font-mono">
        <div className="bg-gray-800/70 border border-green-500/70 rounded-lg px-12 py-6 hover:border-green-400 transition-colors inline-block">
          <div className="flex gap-12">
            <div>
              <p className="text-4xl font-bold text-green-400 drop-shadow-lg">
                {liveWpm}
              </p>
              <p className="text-green-300 text-sm mt-2 uppercase tracking-wider">
                WPM
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400 drop-shadow-lg">
                {liveAccuracy}%
              </p>
              <p className="text-green-300 text-sm mt-2 uppercase tracking-wider">
                Accuracy
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-green-500 mt-8 text-sm tracking-wide">
        Click the box and start typing{" "}
      </p>
    </div>
  );
}
