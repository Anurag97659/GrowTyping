import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiZap,
  FiCopy,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
  FiPlay,
  FiCheck,
  FiSun,
  FiMoon,
  FiUser,
  FiUserMinus,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import api from "../lib/api";

const WORDS = [
  "the",
  "be",
  "of",
  "and",
  "a",
  "to",
  "in",
  "he",
  "have",
  "it",
  "that",
  "for",
  "they",
  "with",
  "as",
  "not",
  "on",
  "she",
  "at",
  "by",
  "this",
  "we",
  "you",
  "do",
  "but",
  "from",
  "or",
  "which",
  "one",
  "would",
  "all",
  "will",
  "there",
  "say",
  "who",
  "make",
  "when",
  "can",
  "more",
  "if",
  "no",
  "man",
  "out",
  "other",
  "so",
  "what",
  "time",
  "up",
  "go",
  "about",
  "than",
  "into",
  "could",
  "state",
  "only",
  "new",
  "year",
  "some",
  "take",
  "come",
  "these",
  "know",
  "see",
  "use",
  "get",
  "like",
  "then",
  "first",
  "any",
  "work",
  "now",
  "may",
  "such",
  "give",
  "over",
  "think",
  "most",
  "even",
  "find",
  "day",
  "also",
  "after",
  "way",
  "many",
  "must",
  "look",
  "before",
  "great",
  "back",
  "through",
  "long",
  "where",
  "much",
  "should",
  "well",
  "people",
  "down",
  "own",
  "just",
  "because",
  "good",
  "each",
  "those",
  "feel",
  "seem",
  "how",
  "high",
  "too",
  "place",
  "little",
  "world",
  "very",
  "still",
  "nation",
  "hand",
  "old",
  "life",
  "tell",
  "write",
  "become",
  "here",
  "show",
  "house",
  "both",
  "between",
  "need",
  "mean",
  "call",
  "develop",
  "under",
  "last",
  "right",
  "move",
  "thing",
  "general",
  "school",
  "never",
  "same",
  "another",
  "begin",
  "while",
  "number",
  "part",
  "turn",
  "real",
  "leave",
  "might",
  "want",
  "point",
  "form",
  "off",
  "child",
  "few",
  "small",
  "since",
  "against",
  "ask",
  "late",
  "home",
  "interest",
  "large",
  "person",
  "end",
  "open",
  "public",
  "follow",
  "during",
  "present",
  "without",
  "again",
  "hold",
  "govern",
  "around",
  "possible",
  "head",
  "consider",
  "word",
  "program",
  "problem",
  "however",
  "lead",
  "system",
  "set",
  "order",
  "eye",
  "plan",
  "run",
  "keep",
  "face",
  "fact",
  "group",
  "play",
  "stand",
  "increase",
  "early",
  "course",
  "change",
  "help",
  "line",
];
const PUNCTUATION_MARKS = [",", ".", "!", "?", ":"];
const SYMBOLS_LIST = ["@", "#", "$", "%", "&", "*", "-", "_", "+", "=", "/"];

function generateText(count = 80, mode = "normal") {
  return Array.from({ length: count })
    .map((_, index) => {
      let token = WORDS[Math.floor(Math.random() * WORDS.length)];
      if ((mode === "punctuation" || mode === "all") && (index + 1) % 7 === 0)
        token +=
          PUNCTUATION_MARKS[
            Math.floor(Math.random() * PUNCTUATION_MARKS.length)
          ];
      if ((mode === "numbers" || mode === "all") && (index + 1) % 6 === 0)
        token += ` ${Math.floor(Math.random() * 900) + 100}`;
      if ((mode === "symbols" || mode === "all") && (index + 1) % 5 === 0)
        token += SYMBOLS_LIST[Math.floor(Math.random() * SYMBOLS_LIST.length)];
      return token;
    })
    .join(" ");
}

function buildLines(text) {
  if (!text) return [];
  const targetLineLength = 65;
  const lines = [];
  let currentLineStart = 0;
  let i = 0;
  while (i < text.length) {
    let nextSpace = text.indexOf(" ", i);
    if (nextSpace === -1) nextSpace = text.length;
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
      text: text.slice(currentLineStart),
    });
  }
  return lines;
}

export default function RacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socketRef } = useSocket();
  const { themeConfig, mode, toggleMode } = useTheme();

  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [pageState, setPageState] = useState("landing");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");

  const [room, setRoom] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const [raceText, setRaceText] = useState("");
  const raceTextRef = useRef("");

  const [typedChars, setTypedChars] = useState([]);
  const typedCharsRef = useRef([]);
  typedCharsRef.current = typedChars;

  const [timeLeft, setTimeLeft] = useState(30);
  const [raceStartedAt, setRaceStartedAt] = useState(null);
  const raceTimerRef = useRef(null);

  const containerRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const typingAreaRef = useRef(null);
  const caretRef = useRef(null);
  const activeLetterRef = useRef(null);

  const startedTypingRef = useRef(false);
  const startTimeRef = useRef(null);
  const finishedRef = useRef(false);
  const lastProgressSendRef = useRef(0);

  const [participants, setParticipants] = useState({});
  const [finishedUsers, setFinishedUsers] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get("/GrowTyping/v1/users/me");
        if (res.data?.loggedIn) {
          const uname = res.data.user.username;
          setUsername(uname);
          setLoggedIn(true);
          window.localStorage.setItem("growtyping.username", uname);
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  useEffect(() => {
    const joinCode = searchParams.get("join");
    if (joinCode && username && loggedIn) {
      doJoinRoom(joinCode.toUpperCase());
    }
  }, [username, loggedIn]);

  useEffect(() => {
    const sock = socketRef?.current;
    if (!sock) return;

    const onRoomCreated = (data) => {
      setRoom(data);
      setPageState("lobby");
    };

    const onRoomUpdated = (data) => {
      setRoom(data);
    };

    const onRaceStarted = ({ text, duration, startedAt }) => {
      const newText = text;
      raceTextRef.current = newText;
      setRaceText(newText);
      setTimeLeft(duration);
      setTypedChars([]);
      typedCharsRef.current = [];
      startedTypingRef.current = false;
      startTimeRef.current = null;
      finishedRef.current = false;
      setFinishedUsers([]);
      setParticipants({});
      setRaceStartedAt(startedAt);
      setPageState("racing");
      setTimeout(() => {
        hiddenInputRef.current?.focus();
        containerRef.current?.focus();
      }, 80);
    };

    const onProgressUpdate = ({ username: uname, progress, wpm }) => {
      setParticipants((prev) => ({ ...prev, [uname]: { progress, wpm } }));
    };

    const onUserFinished = (data) => {
      setFinishedUsers((prev) => {
        if (prev.some((p) => p.username === data.username)) return prev;
        return [...prev, data];
      });
    };

    const onRaceEnded = ({ results: res }) => {
      clearInterval(raceTimerRef.current);
      setResults(res);
      setPageState("results");
    };

    const onResetToLobby = () => {
      setPageState("lobby");
      setResults([]);
      setTypedChars([]);
      typedCharsRef.current = [];
      setFinishedUsers([]);
      setParticipants({});
    };

    const onKicked = () => {
      setRoom(null);
      setPageState("landing");
      alert("You were kicked from the room.");
    };

    const onHostChanged = ({ newHost }) => {
      setRoom((prev) => (prev ? { ...prev, host: newHost } : prev));
    };

    const onInviteError = ({ message }) => alert(message);

    sock.on("room-created", onRoomCreated);
    sock.on("room-updated", onRoomUpdated);
    sock.on("race-started", onRaceStarted);
    sock.on("progress-update", onProgressUpdate);
    sock.on("user-finished", onUserFinished);
    sock.on("race-ended", onRaceEnded);
    sock.on("reset-to-lobby", onResetToLobby);
    sock.on("kicked", onKicked);
    sock.on("host-changed", onHostChanged);
    sock.on("invite-error", onInviteError);

    return () => {
      sock.off("room-created", onRoomCreated);
      sock.off("room-updated", onRoomUpdated);
      sock.off("race-started", onRaceStarted);
      sock.off("progress-update", onProgressUpdate);
      sock.off("user-finished", onUserFinished);
      sock.off("race-ended", onRaceEnded);
      sock.off("reset-to-lobby", onResetToLobby);
      sock.off("kicked", onKicked);
      sock.off("host-changed", onHostChanged);
      sock.off("invite-error", onInviteError);
    };
  }, [socketRef]);

  useEffect(() => {
    if (pageState !== "racing" || !raceStartedAt) return;
    const duration = room?.settings?.duration || 30;

    raceTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - raceStartedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(raceTimerRef.current);
        if (!finishedRef.current) handleRaceFinish(true);
      }
    }, 500);

    return () => clearInterval(raceTimerRef.current);
  }, [pageState, raceStartedAt]);

  const allLines = useMemo(() => buildLines(raceText), [raceText]);

  const currentLineIndex = useMemo(() => {
    if (!allLines.length) return 0;
    const idx = allLines.findIndex(
      (line) => typedChars.length >= line.start && typedChars.length < line.end,
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
  }, [typedChars.length, raceText, currentLineIndex, allLines]);

  const renderedLines = useMemo(() => {
    if (!allLines.length) return null;
    const totalLines = allLines.length;
    const startLine = Math.max(
      0,
      Math.min(currentLineIndex - 1, totalLines - 3),
    );
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
                className={
                  isCurrentChar ? "opacity-100 inline" : "opacity-60 inline"
                }
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>,
      );
    }
    return lines;
  }, [allLines, currentLineIndex, typedChars, themeConfig]);

  const broadcastProgress = useCallback(
    (typed) => {
      const now = Date.now();
      if (now - lastProgressSendRef.current < 300) return;
      lastProgressSendRef.current = now;
      const code = room?.code;
      if (!code || !socketRef?.current || !raceTextRef.current) return;
      const progress =
        raceTextRef.current.length > 0
          ? Math.round((typed.length / raceTextRef.current.length) * 100)
          : 0;
      const elapsed = startTimeRef.current
        ? (performance.now() - startTimeRef.current) / 60000
        : 0.01;
      let correct = 0;
      typed.forEach((c) => {
        if (c.correct) correct++;
      });
      const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
      socketRef.current.emit("typing-progress", {
        code,
        username,
        progress,
        wpm,
      });
    },
    [room?.code, username, socketRef],
  );

  const handleRaceFinish = useCallback(
    (timedOut = false) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      clearInterval(raceTimerRef.current);

      const now = performance.now();
      const elapsed = startTimeRef.current
        ? (now - startTimeRef.current) / 60000
        : 0.01;
      const typed = typedCharsRef.current;
      let correct = 0;
      typed.forEach((c) => {
        if (c.correct) correct++;
      });
      const accuracy =
        typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;
      const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
      const time = startTimeRef.current
        ? Math.round((now - startTimeRef.current) / 1000)
        : 0;

      socketRef?.current?.emit("race-finished", {
        code: room?.code,
        username,
        wpm,
        accuracy,
        time,
      });
    },
    [room?.code, username, socketRef],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (pageState !== "racing" || finishedRef.current) return;
      if (e.key === "Escape") return;
      if (e.key === "Tab") {
        e.preventDefault();
        return;
      }

      if (e.key === "Backspace") {
        if (!typedCharsRef.current.length) return;
        setTypedChars((prev) => {
          const next = prev.slice(0, -1);
          typedCharsRef.current = next;
          return next;
        });
        return;
      }

      const text = raceTextRef.current;
      if (e.key.length !== 1 || typedCharsRef.current.length >= text.length)
        return;

      if (!startedTypingRef.current) {
        startedTypingRef.current = true;
        startTimeRef.current = performance.now();
      }

      const currentIdx = typedCharsRef.current.length;
      const expected = text[currentIdx];

      if (e.key === " " && expected !== " ") {
        const nextSpaceIdx = text.indexOf(" ", currentIdx);
        if (nextSpaceIdx !== -1) {
          const skipped = [];
          for (let i = currentIdx; i < nextSpaceIdx; i++) {
            skipped.push({ char: text[i], correct: false, skipped: true });
          }
          skipped.push({ char: " ", correct: false });
          const next = [...typedCharsRef.current, ...skipped];
          typedCharsRef.current = next;
          setTypedChars(next);
          broadcastProgress(next);
          if (next.length >= text.length) handleRaceFinish();
          return;
        }
      }

      const isCorrect = e.key === expected;
      const next = [
        ...typedCharsRef.current,
        { char: e.key, correct: isCorrect },
      ];
      typedCharsRef.current = next;
      setTypedChars(next);
      broadcastProgress(next);
      if (next.length >= text.length) handleRaceFinish();
    },
    [pageState, broadcastProgress, handleRaceFinish],
  );

  const handleCreateRoom = useCallback(() => {
    if (!socketRef?.current || !username) return;
    socketRef.current.emit("create-room", { username });
  }, [socketRef, username]);

  const doJoinRoom = useCallback(
    (code) => {
      if (!code || !socketRef?.current || !username) return;
      setJoinError("");
      socketRef.current.emit("join-room", { code, username }, (response) => {
        if (response?.error) {
          setJoinError(response.error);
        } else {
          setPageState("lobby");
        }
      });
    },
    [socketRef, username],
  );

  const handleJoinRoom = useCallback(() => {
    doJoinRoom(joinCodeInput.trim().toUpperCase());
  }, [joinCodeInput, doJoinRoom]);

  const handleLeaveRoom = useCallback(() => {
    if (!room || !socketRef?.current) return;
    socketRef.current.emit("leave-room", { code: room.code, username });
    setRoom(null);
    setPageState("landing");
    clearInterval(raceTimerRef.current);
  }, [room, socketRef, username]);

  const handleKick = useCallback(
    (targetUsername) => {
      if (!room || !socketRef?.current) return;
      socketRef.current.emit("kick-user", {
        code: room.code,
        hostUsername: username,
        targetUsername,
      });
    },
    [room, socketRef, username],
  );

  const handleUpdateSettings = useCallback(
    (settings) => {
      if (!room || !socketRef?.current) return;
      socketRef.current.emit("update-settings", {
        code: room.code,
        hostUsername: username,
        settings,
      });
    },
    [room, socketRef, username],
  );

  const handleStartRace = useCallback(() => {
    if (!room || !socketRef?.current) return;
    const text = generateText(80, room.settings?.mode || "normal");
    socketRef.current.emit("start-race", {
      code: room.code,
      hostUsername: username,
      text,
    });
  }, [room, socketRef, username]);

  const handlePlayAgain = useCallback(() => {
    if (!room || !socketRef?.current) return;
    socketRef.current.emit("play-again", {
      code: room.code,
      hostUsername: username,
    });
  }, [room, socketRef, username]);

  const handleCopyCode = useCallback(() => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }, [room]);

  const openFriendModal = async () => {
    setShowFriendModal(true);
    setFriendsLoading(true);
    try {
      const res = await api.get("/GrowTyping/v1/users/friends");
      setFriends(res.data?.data || []);
    } catch {
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleInviteFriend = useCallback(
    (friendUsername) => {
      if (!room || !socketRef?.current) return;
      socketRef.current.emit("invite-friend", {
        fromUsername: username,
        toUsername: friendUsername,
        code: room.code,
      });
      setShowFriendModal(false);
      alert(`Invitation sent to ${friendUsername}!`);
    },
    [room, socketRef, username],
  );

  const onDragStart = useCallback(
    (e) => {
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = sidebarWidth;
      e.preventDefault();
    },
    [sidebarWidth],
  );

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const delta = dragStartXRef.current - e.clientX;
      setSidebarWidth(
        Math.max(220, Math.min(420, dragStartWidthRef.current + delta)),
      );
    };
    const onUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const isHost = room?.host === username;
  const participantList = room?.participants || [];
  const myProgress =
    raceText.length > 0
      ? Math.min(100, Math.round((typedChars.length / raceText.length) * 100))
      : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={pageState === "racing" ? 0 : undefined}
      onKeyDown={pageState === "racing" ? handleKeyDown : undefined}
      className={`min-h-screen ${themeConfig.bg} ${themeConfig.bodyText} flex flex-col outline-none transition-colors duration-300`}
      onClick={(e) => {
        if (pageState === "racing") {
          const tag = e.target.tagName;
          if (
            !["BUTTON", "SELECT", "INPUT", "A", "OPTION"].includes(tag) &&
            !e.target.closest("button") &&
            !e.target.closest("a")
          ) {
            hiddenInputRef.current?.focus();
            containerRef.current?.focus();
          }
        }
      }}
    >
      {/* Hidden input — same pattern as typing.jsx: locked value + onChange noop */}
      {pageState === "racing" && (
        <input
          ref={hiddenInputRef}
          type="text"
          aria-label="Race Typing Input"
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          autoFocus
          onKeyDown={handleKeyDown}
          onChange={() => {}}
          value=""
        />
      )}

      {/* ── NAVBAR ─── */}
      <div
        className={`${themeConfig.card} border-b ${themeConfig.border} px-4 sm:px-8 py-3 flex items-center justify-between flex-wrap gap-3`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`text-xl font-extrabold tracking-tight ${themeConfig.accent} hover:opacity-80 transition-opacity`}
          >
            GrowTyping
          </button>
          {room?.code && (
            <div className="flex items-center gap-2">
              <span className={`text-xs ${themeConfig.mutedText}`}>Room:</span>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${themeConfig.cardInset} border ${themeConfig.border}`}
              >
                <span className="font-mono font-bold text-sm tracking-widest text-amber-400">
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`text-xs ${codeCopied ? "text-green-400" : themeConfig.mutedText} hover:opacity-80 transition-opacity`}
                  title="Copy room code"
                >
                  {codeCopied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleMode}
            className={`p-2 ${themeConfig.buttonSecondary} transition-all`}
            title="Toggle theme mode"
          >
            {mode === "dark" ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>

          {pageState === "lobby" && isHost && (
            <button
              onClick={() => setSettingsOpen((p) => !p)}
              className={`px-3 py-2 text-xs font-semibold ${settingsOpen ? themeConfig.buttonPrimary : themeConfig.buttonSecondary} flex items-center gap-2 transition-all`}
            >
              <FiSettings size={14} /> Settings
            </button>
          )}

          {pageState === "lobby" && isHost && (
            <button
              onClick={openFriendModal}
              className={`px-3 py-2 text-xs font-semibold ${themeConfig.buttonSecondary} flex items-center gap-2 transition-all`}
            >
              <FiUsers size={14} /> Invite Friends
            </button>
          )}

          <div
            className={`px-3 py-2 text-xs font-bold ${themeConfig.buttonSecondary} flex items-center gap-2`}
          >
            <FiUser size={13} />
            {username.toUpperCase()}
          </div>

          {room && (
            <button
              onClick={handleLeaveRoom}
              className="px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
            >
              <FiLogOut size={14} /> Leave
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ───── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── LANDING ──── */}
        {pageState === "landing" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg">
              <div className="text-center mb-10">
                {/* <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 mb-5 shadow-2xl shadow-purple-500/30" style={{ animation: "racePulse 2.5s ease-in-out infinite" }}>
                  <FiZap size={36} color="white" />
                </div> */}
                <h1
                  className={`text-4xl font-black ${themeConfig.headingText || themeConfig.bodyText} mb-2`}
                >
                  Race Mode
                </h1>
                <p className={`${themeConfig.mutedText} text-sm`}>
                  Compete against friends in real-time typing races
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Create Room */}
                <button
                  onClick={handleCreateRoom}
                  disabled={!loggedIn}
                  className={`group relative overflow-hidden w-full p-6 rounded-2xl border ${themeConfig.border} ${themeConfig.card} hover:border-amber-500/60 transition-all duration-300 text-left`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-4">
                    {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FiZap size={22} className="text-amber-400" />
                    </div> */}
                    <div>
                      <div
                        className={`font-bold text-base ${themeConfig.bodyText}`}
                      >
                        Create Room
                      </div>
                      <div
                        className={`text-xs ${themeConfig.mutedText} mt-0.5`}
                      >
                        Start a new race and invite friends
                      </div>
                    </div>
                    <FiChevronRight
                      className={`ml-auto ${themeConfig.mutedText} group-hover:translate-x-1 transition-transform`}
                    />
                  </div>
                </button>

                {/* Join Room */}
                <div
                  className={`relative overflow-hidden w-full p-6 rounded-2xl border ${themeConfig.border} ${themeConfig.card}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                      <FiUsers size={22} className="text-purple-400" />
                    </div> */}
                    <div>
                      <div
                        className={`font-bold text-base ${themeConfig.bodyText}`}
                      >
                        Join Room
                      </div>
                      <div
                        className={`text-xs ${themeConfig.mutedText} mt-0.5`}
                      >
                        Enter a code to join an existing race
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={joinCodeInput}
                      onChange={(e) =>
                        setJoinCodeInput(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                      placeholder="Enter room code…"
                      maxLength={6}
                      className={`flex-1 px-4 py-2.5 rounded-xl ${themeConfig.input} font-mono text-sm tracking-widest placeholder:tracking-normal placeholder:font-sans`}
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinCodeInput.trim() || !loggedIn}
                      className={`px-4 py-2.5 rounded-xl ${themeConfig.buttonPrimary} text-sm font-semibold disabled:opacity-40 transition-all`}
                    >
                      Join
                    </button>
                  </div>
                  {joinError && (
                    <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                      <FiAlertCircle size={12} /> {joinError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOBBY ─── */}
        {pageState === "lobby" && room && (
          <>
            <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-10">
              <div className="mb-8">
                <h2
                  className={`text-2xl font-black ${themeConfig.bodyText} mb-1`}
                >
                  Race Lobby
                </h2>
                <p className={`text-sm ${themeConfig.mutedText}`}>
                  {isHost
                    ? "You are the host. Start the race when ready."
                    : "Waiting for the host to start the race…"}
                </p>
              </div>

              {/* Settings preview strip */}
              <div
                className={`flex items-center gap-4 mb-6 px-4 py-3 rounded-xl ${themeConfig.cardInset} border ${themeConfig.border}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className={themeConfig.mutedText}>Duration:</span>
                  <span className={`font-semibold ${themeConfig.bodyText}`}>
                    {room.settings?.duration}s
                  </span>
                </div>
                <div className={`w-px h-4 border-l ${themeConfig.border}`} />
                <div className="flex items-center gap-2 text-sm">
                  <span className={themeConfig.mutedText}>Mode:</span>
                  <span
                    className={`font-semibold ${themeConfig.bodyText} capitalize`}
                  >
                    {room.settings?.mode}
                  </span>
                </div>
                <div className={`w-px h-4 border-l ${themeConfig.border}`} />
                <div className="flex items-center gap-2 text-sm">
                  <span className={themeConfig.mutedText}>Players:</span>
                  <span className={`font-semibold ${themeConfig.bodyText}`}>
                    {participantList.length}
                  </span>
                </div>
              </div>

              {/* Participant cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {participantList.map((p) => (
                  <div
                    key={p.username}
                    className={`relative flex items-center gap-3 p-4 rounded-2xl border ${themeConfig.border} ${themeConfig.card}`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                      style={{
                        background: `hsl(${(p.username.charCodeAt(0) * 50) % 360}, 65%, 50%)`,
                      }}
                    >
                      {p.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-sm truncate ${themeConfig.bodyText}`}
                      >
                        {p.username}
                        {p.username === room.host && (
                          <span className="ml-2 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${themeConfig.mutedText}`}>
                        Ready
                      </div>
                    </div>
                    {isHost && p.username !== username && (
                      <button
                        onClick={() => handleKick(p.username)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title={`Kick ${p.username}`}
                      >
                        <FiUserMinus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isHost ? (
                <div className="flex justify-center">
                  <button
                    onClick={handleStartRace}
                    className="px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      boxShadow: "0 10px 30px rgba(245,158,11,0.4)",
                    }}
                  >
                    <FiPlay size={20} /> Start Race
                  </button>
                </div>
              ) : (
                <div
                  className={`text-center text-sm ${themeConfig.mutedText} mt-4 animate-pulse`}
                >
                  Waiting for the host to start…
                </div>
              )}
            </div>

            {/* Settings Sidebar */}
            {settingsOpen && isHost && (
              <div
                style={{
                  width: sidebarWidth,
                  minWidth: 220,
                  maxWidth: 420,
                  position: "relative",
                  flexShrink: 0,
                }}
                className={`border-l ${themeConfig.border} ${themeConfig.card} flex flex-col overflow-y-auto`}
              >
                {/* Drag handle */}
                <div
                  onMouseDown={onDragStart}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    cursor: "col-resize",
                    zIndex: 10,
                  }}
                  className="hover:bg-white/10 transition-colors"
                />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3
                      className={`font-bold text-sm ${themeConfig.bodyText} flex items-center gap-2`}
                    >
                      <FiSettings size={14} /> Race Settings
                    </h3>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className={`p-1.5 rounded-lg ${themeConfig.mutedText} hover:opacity-80`}
                    >
                      <FiX size={14} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label
                      className={`block text-xs font-semibold ${themeConfig.mutedText} mb-2 uppercase tracking-wider`}
                    >
                      Duration
                    </label>
                    <div
                      className={`flex gap-2 ${themeConfig.cardInset} p-1.5 rounded-xl`}
                    >
                      {[15, 30, 60].map((d) => (
                        <button
                          key={d}
                          onClick={() => handleUpdateSettings({ duration: d })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            room.settings?.duration === d
                              ? themeConfig.buttonPrimary
                              : `${themeConfig.mutedText} hover:opacity-80`
                          }`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      className={`block text-xs font-semibold ${themeConfig.mutedText} mb-2 uppercase tracking-wider`}
                    >
                      Text Mode
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "normal",
                        "punctuation",
                        "numbers",
                        "symbols",
                        "all",
                      ].map((m) => (
                        <button
                          key={m}
                          onClick={() => handleUpdateSettings({ mode: m })}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                            room.settings?.mode === m
                              ? themeConfig.buttonPrimary
                              : `${themeConfig.mutedText} hover:opacity-80`
                          }`}
                        >
                          {m === "all"
                            ? "All (Words + Numbers + Symbols + Punctuation)"
                            : m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RACING ─────── */}
        {pageState === "racing" && (
          <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto">
            {/* Timer */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`text-4xl font-black ${timeLeft <= 5 ? "text-red-500" : themeConfig.accent} transition-colors`}
              >
                {timeLeft}s
              </div>
              <div className={`text-sm font-semibold ${themeConfig.mutedText}`}>
                {myProgress}% complete
              </div>
            </div>

            {/* Live participant progress */}
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {participantList.map((p) => {
                const prog =
                  p.username === username
                    ? myProgress
                    : participants[p.username]?.progress || 0;
                const wpm =
                  p.username === username
                    ? startTimeRef.current
                      ? Math.round(
                          typedChars.filter((c) => c.correct).length /
                            5 /
                            ((performance.now() - startTimeRef.current) /
                              60000),
                        )
                      : 0
                    : participants[p.username]?.wpm || 0;
                const finished = finishedUsers.some(
                  (f) => f.username === p.username,
                );

                return (
                  <div
                    key={p.username}
                    className={`p-3 rounded-xl border ${themeConfig.border} ${themeConfig.card}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-semibold ${p.username === username ? themeConfig.accent : themeConfig.bodyText}`}
                      >
                        {p.username}
                        {p.username === room?.host && (
                          <span className="ml-1 text-[9px] text-amber-400">
                            👑
                          </span>
                        )}
                        {finished && (
                          <span className="ml-1 text-[9px] text-green-400">
                            ✓
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs font-bold ${themeConfig.accent}`}
                      >
                        {wpm} WPM
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(0,0,0,0.15)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${prog}%`,
                          background:
                            p.username === username
                              ? "linear-gradient(90deg, #f59e0b, #d97706)"
                              : "linear-gradient(90deg, #8b5cf6, #6d28d9)",
                        }}
                      />
                    </div>
                    <div
                      className={`text-right text-[10px] ${themeConfig.mutedText} mt-1`}
                    >
                      {prog}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Typing area — identical structure to typing.jsx */}
            <div
              ref={typingAreaRef}
              onClick={() => {
                hiddenInputRef.current?.focus();
                containerRef.current?.focus();
              }}
              className={`typing-container relative w-full text-2xl sm:text-3xl leading-relaxed cursor-text min-h-[180px] flex flex-col items-center justify-center select-none overflow-hidden py-4 px-4 sm:px-8 ${themeConfig.card} border ${themeConfig.border} rounded-2xl`}
            >
              {/* Caret — same as typing.jsx */}
              <div
                ref={caretRef}
                className={`grow-caret grow-caret-blink ${themeConfig.accent}`}
                style={{ backgroundColor: "currentColor" }}
              />
              {renderedLines}
            </div>

            <p className={`text-center text-xs ${themeConfig.mutedText} mt-3`}>
              Click the typing area and start typing • Press Esc to cancel
            </p>
          </div>
        )}

        {/* ── RESULTS ────────── */}
        {pageState === "results" && (
          <div className="flex-1 flex items-start justify-center p-6 lg:p-10 overflow-y-auto">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 mb-4 shadow-xl">
                  <FiZap size={28} color="white" />
                </div>
                <h2 className={`text-3xl font-black ${themeConfig.bodyText}`}>
                  Race Results
                </h2>
              </div>

              <div
                className={`rounded-2xl border ${themeConfig.border} ${themeConfig.card} overflow-hidden mb-6`}
              >
                <div
                  className={`px-5 py-3 border-b ${themeConfig.border} grid grid-cols-4 gap-2`}
                >
                  {["Rank", "Player", "WPM", "Accuracy"].map((h) => (
                    <span
                      key={h}
                      className={`text-xs font-bold ${themeConfig.mutedText} uppercase tracking-wider ${h === "WPM" || h === "Accuracy" ? "text-center" : ""}`}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {[...results]
                  .sort((a, b) => b.wpm - a.wpm)
                  .map((r, idx) => (
                    <div
                      key={r.username}
                      className={`px-5 py-4 border-b ${themeConfig.border} grid grid-cols-4 gap-2 items-center last:border-0 ${r.username === username ? "bg-amber-500/5" : ""}`}
                    >
                      <div
                        className="font-black text-xl"
                        style={{
                          color:
                            ["#f59e0b", "#94a3b8", "#cd7f32"][idx] || "#6b7280",
                        }}
                      >
                        {["🥇", "🥈", "🥉"][idx] || `#${idx + 1}`}
                      </div>
                      <div
                        className={`font-semibold text-sm ${themeConfig.bodyText}`}
                      >
                        {r.username}
                        {r.username === username && (
                          <span
                            className={`ml-1.5 text-[10px] ${themeConfig.mutedText}`}
                          >
                            (you)
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-center font-black text-lg ${themeConfig.accent}`}
                      >
                        {r.wpm}
                      </div>
                      <div
                        className={`text-center text-sm font-semibold ${themeConfig.bodyText}`}
                      >
                        {r.accuracy}%
                      </div>
                    </div>
                  ))}
                {results.length === 0 && (
                  <div
                    className={`px-5 py-8 text-center ${themeConfig.mutedText} text-sm`}
                  >
                    No results recorded yet.
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {isHost && (
                  <button
                    onClick={handlePlayAgain}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 text-white transition-all hover:scale-105 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
                    }}
                  >
                    <FiPlay size={15} /> Play Again
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 ${themeConfig.buttonSecondary} transition-all`}
                >
                  <FiLogOut size={15} /> Leave Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FRIEND INVITE MODAL ── */}
      {showFriendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFriendModal(false);
          }}
        >
          <div
            className={`w-full max-w-md ${themeConfig.card} rounded-2xl border ${themeConfig.border} shadow-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className={`font-black text-lg ${themeConfig.bodyText} flex items-center gap-2`}
              >
                <FiUsers size={18} /> Invite Friends
              </h3>
              <button
                onClick={() => setShowFriendModal(false)}
                className={`p-1.5 rounded-lg ${themeConfig.mutedText} hover:opacity-80`}
              >
                <FiX size={16} />
              </button>
            </div>

            {friendsLoading ? (
              <div
                className={`text-center py-8 ${themeConfig.mutedText} text-sm`}
              >
                Loading friends…
              </div>
            ) : friends.length === 0 ? (
              <div
                className={`text-center py-8 ${themeConfig.mutedText} text-sm`}
              >
                No friends yet. Add friends from the{" "}
                <button
                  className="underline"
                  onClick={() => navigate("/friends")}
                >
                  Friends page
                </button>
                .
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {friends.map((friend) => (
                  <div
                    key={friend._id || friend.username}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${themeConfig.border} ${themeConfig.cardInset}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          background: `hsl(${(friend.username?.charCodeAt(0) * 50) % 360}, 65%, 50%)`,
                        }}
                      >
                        {friend.username?.[0]?.toUpperCase()}
                      </div>
                      <span
                        className={`text-sm font-semibold ${themeConfig.bodyText}`}
                      >
                        {friend.username}
                      </span>
                    </div>
                    <button
                      onClick={() => handleInviteFriend(friend.username)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      }}
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes racePulse {
          0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.4); transform: scale(1); }
          50%       { box-shadow: 0 0 50px rgba(245,158,11,0.5); transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
