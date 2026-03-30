import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WORDS = [
  // ============================================================
  // BASIC GRAMMAR
  // ============================================================
  
  // Articles
  "a", "an", "the",

  // Pronouns
  "I", "you", "he", "she", "we", "they", "it", "me", "him", "her", "us", "them",
  "my", "your", "his", "her", "our", "their", "mine", "yours", "hers", "ours", "theirs",

  // Prepositions & Conjunctions
  "in", "on", "at", "with", "for", "from", "by", "about", "to", "into", "over", "under",
  "between", "and", "but", "or", "so", "because", "if", "when", "while", "as", "than",
  "like", "after", "before", "during", "without", "within", "above", "below",

  // ============================================================
  // COMMON VERBS
  // ============================================================
  "am", "is", "are", "was", "were", "have", "has", "had", "do", "does", "did",
  "say", "says", "said", "go", "goes", "went", "make", "makes", "made",
  "know", "knows", "knew", "see", "sees", "saw", "take", "takes", "took",
  "come", "comes", "came", "think", "thinks", "thought",
  "get", "gets", "got", "give", "gives", "gave", "feel", "feels", "felt",
  "look", "looks", "looked", "walk", "walks", "walked",
  "run", "runs", "ran", "read", "reads", "write", "writes", "wrote",
  "play", "plays", "played", "watch", "watches", "watched",
  "listen", "listens", "listened", "eat", "eats", "ate",
  "drink", "drinks", "drank", "sleep", "sleeps", "slept",
  "study", "studies", "studied", "teach", "teaches", "taught",
  "buy", "buys", "bought", "sell", "sells", "sold",
  "call", "calls", "called", "help", "helps", "helped",

  // ============================================================
  // PEOPLE & FAMILY
  // ============================================================
  "man", "woman", "child", "boy", "girl", "baby", "adult", "person",
  "mother", "father", "brother", "sister", "son", "daughter",
  "grandmother", "grandfather", "parent", "grandparent", "family",
  "friend", "teacher", "student", "doctor", "nurse", "patient",
  "manager", "employee", "employer", "colleague", "leader",
  "athlete", "artist", "musician", "actor", "dancer",
  "author", "writer", "poet", "painter", "sculptor",

  // ============================================================
  // ANIMALS
  // ============================================================
  "dog", "cat", "bird", "fish", "lion", "tiger", "elephant", "bear",
  "cow", "horse", "pig", "sheep", "goat", "mouse", "rabbit",
  "snake", "lizard", "frog", "butterfly", "bee", "ant", "spider",
  "eagle", "owl", "penguin", "dolphin", "shark", "whale",
  "deer", "fox", "wolf", "monkey", "zebra", "giraffe",

  // ============================================================
  // COMMON OBJECTS & THINGS
  // ============================================================
  "car", "bike", "bus", "train", "plane", "ship", "truck", "taxi",
  "house", "building", "room", "apartment", "office", "school",
  "hospital", "church", "shop", "restaurant", "hotel", "airport",
  "door", "window", "wall", "floor", "roof", "garden", "tree",
  "flower", "plant", "grass", "bush", "rock", "mountain",
  "book", "pen", "pencil", "paper", "notebook", "newspaper",
  "computer", "phone", "screen", "keyboard", "mouse", "printer",
  "table", "chair", "desk", "bed", "sofa", "lamp", "clock",
  "picture", "photo", "statue", "monument", "bridge",
  "bag", "box", "suitcase", "backpack", "wallet", "purse",

  // ============================================================
  // CLOTHING & ACCESSORIES
  // ============================================================
  "shirt", "shoe", "hat", "coat", "pants", "dress", "skirt", "tie",
  "sock", "glove", "scarf", "boot", "sandal", "sweater", "jacket",
  "jeans", "shorts", "vest", "belt", "bracelet", "necklace", "ring",
  "sunglasses", "glasses", "watch", "earring", "brooch",

  // ============================================================
  // FOOD & DRINK
  // ============================================================
  
  // Fruits
  "apple", "banana", "orange", "lemon", "lime", "grape", "strawberry",
  "blueberry", "watermelon", "melon", "peach", "pear", "plum", "cherry",
  "coconut", "pineapple", "mango", "papaya", "kiwi", "avocado",

  // Vegetables
  "tomato", "potato", "carrot", "lettuce", "cabbage", "spinach",
  "broccoli", "cauliflower", "celery", "cucumber", "onion", "garlic",
  "pepper", "chili", "bean", "pea", "corn",

  // Grains & Staples
  "rice", "wheat", "barley", "oats", "quinoa", "pasta", "noodle", "bread",

  // Proteins
  "chicken", "beef", "pork", "lamb", "fish", "shrimp", "crab", "lobster", "oyster",

  // Dairy & Condiments
  "cheese", "yogurt", "butter", "cream", "egg", "honey", "salt", "sugar", "spice",

  // Beverages
  "water", "coffee", "tea", "milk", "juice", "smoothie", "cocktail", "wine", "beer", "whiskey", "vodka",

  // Cooking & Dining
  "cooking", "baking", "grilling", "frying", "boiling", "steaming", "roasting",
  "recipe", "ingredient", "portion", "serving", "cuisine", "dish", "meal",
  "breakfast", "lunch", "dinner", "snack", "dessert", "beverage",
  "flavor", "taste", "aroma", "spicy", "sweet", "bitter", "sour",

  // ============================================================
  // ADJECTIVES & DESCRIPTORS
  // ============================================================
  
  // Size & Shape
  "quick", "slow", "small", "large", "big", "tiny", "short", "tall",
  "thin", "thick", "fat", "wide", "narrow", "long", "round", "sharp",

  // Quality & Condition
  "new", "old", "young", "ancient", "modern", "fresh", "stale",
  "clean", "dirty", "neat", "messy", "bright", "dark", "light",
  "strong", "weak", "soft", "hard", "smooth", "rough",

  // Emotions & Feelings (Adjectives)
  "happy", "sad", "angry", "calm", "excited", "bored", "scared", "brave",
  "funny", "serious", "beautiful", "ugly", "pretty", "handsome",

  // Temperature
  "hot", "cold", "warm", "cool", "lukewarm", "freezing", "boiling",

  // Sound & Intensity
  "loud", "quiet", "silent", "noisy", "calm", "peaceful",
  "sweet", "bitter", "salty", "sour",

  // Value & Status
  "rich", "poor", "valuable", "cheap", "expensive", "free", "rare",

  // ============================================================
  // ADVERBS
  // ============================================================
  "quickly", "slowly", "carefully", "easily", "happily", "sadly",
  "silently", "loudly", "well", "badly", "better", "best",
  "always", "never", "often", "sometimes", "usually", "rarely",
  "today", "yesterday", "tomorrow", "now", "soon", "later", "early", "late",

  // ============================================================
  // TIME & CALENDAR
  // ============================================================
  "day", "night", "morning", "evening", "afternoon", "noon", "midnight",
  "week", "month", "year", "century", "decade", "hour", "minute", "second",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
  "spring", "summer", "autumn", "fall", "winter", "season",

  // ============================================================
  // BASIC CONCEPTS & COMMON WORDS
  // ============================================================
  "yes", "no", "maybe", "perhaps", "certainly", "definitely",
  "hello", "hi", "goodbye", "bye", "please", "thank", "thanks",
  "sorry", "welcome", "okay", "ok", "alright", "fine",
  "home", "work", "life", "time", "world", "idea", "problem", "question",
  "answer", "lesson", "story", "game", "song", "music", "movie", "letter",
  "number", "figure", "digit", "amount", "count", "total", "sum",

  // ============================================================
  // TECHNOLOGY & COMPUTING
  // ============================================================
  "software", "hardware", "internet", "website", "email", "password",
  "database", "server", "client", "network", "code", "program", "algorithm",
  "data", "cloud", "application", "system", "update", "install",
  "download", "upload", "backup", "restore", "virus", "malware", "firewall",
  "encryption", "digital", "virtual", "cache", "memory", "processor",
  "graphics", "monitor", "printer", "scanner", "router", "modem",
  "wireless", "bluetooth", "interface", "plugin", "extension", "browser",
  "console", "debug", "compile", "execute", "function", "variable", "constant",
  "array", "object", "string", "integer", "boolean", "script", "markup",
  "framework", "library", "package", "module", "repository", "commit",
  "branch", "merge", "pull", "push", "clone",

  // ============================================================
  // BUSINESS & PROFESSIONAL
  // ============================================================
  "business", "company", "corporation", "enterprise", "industry", "market",
  "economy", "finance", "investment", "profit", "revenue", "expense",
  "salary", "wage", "bonus", "contract", "agreement", "negotiation",
  "client", "customer", "vendor", "supplier", "partner", "employee",
  "manager", "director", "executive", "department", "division", "branch",
  "headquarters", "office", "conference", "meeting", "presentation", "proposal",
  "report", "document", "spreadsheet", "budget", "forecast", "strategy",
  "goal", "target", "performance", "quality", "productivity", "efficiency",
  "innovation", "leadership", "management", "organization", "planning",
  "scheduling", "deadline", "project", "task", "milestone", "phase",
  "launch", "release", "startup", "growth", "success", "failure",

  // ============================================================
  // SCIENCE & NATURE
  // ============================================================
  
  // Fields of Science
  "science", "physics", "chemistry", "biology", "geology", "astronomy",
  "ecology", "mathematics", "statistics", "engineering", "medicine",

  // Scientific Concepts
  "experiment", "hypothesis", "theory", "research", "discovery", "innovation",
  "element", "atom", "molecule", "compound", "reaction", "energy",
  "force", "motion", "gravity", "light", "sound", "heat", "temperature",
  "pressure", "velocity", "acceleration", "density", "mass", "weight", "volume",

  // Life Sciences
  "species", "organism", "cell", "tissue", "organ", "system", "process",
  "evolution", "extinction", "adaptation", "mutation", "genetics", "dna",
  "protein", "enzyme", "hormone", "antibody", "vaccine", "disease",
  "symptom", "diagnosis", "treatment", "medicine", "drug", "therapy", "surgery",

  // Natural Phenomena
  "climate", "weather", "season", "temperature", "tornado", "hurricane",
  "earthquake", "volcano", "glacier", "waterfall", "cave", "canyon",

  // ============================================================
  // SPORTS & RECREATION
  // ============================================================
  
  // Sports
  "sport", "football", "basketball", "baseball", "soccer", "tennis", "golf",
  "hockey", "cricket", "rugby", "volleyball", "badminton", "table-tennis",

  // Water Sports
  "swimming", "diving", "surfing", "boating", "sailing", "kayaking",

  // Winter Sports
  "skiing", "snowboarding", "ice-skating", "sledding",

  // Land Activities
  "cycling", "skateboarding", "running", "jogging", "walking", "hiking", "climbing",

  // Combat Sports
  "boxing", "wrestling", "martial_arts", "karate", "judo", "taekwondo",

  // Fitness & Training
  "yoga", "pilates", "gym", "fitness", "exercise", "workout", "training",

  // Sports Terms
  "coach", "athlete", "player", "team", "league", "championship",
  "tournament", "match", "game", "competition", "score", "goal", "point",
  "win", "loss", "draw", "tie", "victory", "defeat", "championship",
  "medal", "trophy", "prize", "champion", "spectator", "audience",
  "stadium", "arena", "court", "field", "pitch", "track",

  // ============================================================
  // TRAVEL & PLACES
  // ============================================================
  
  // Transportation
  "travel", "journey", "trip", "vacation", "holiday", "adventure",
  "destination", "airport", "train", "station", "bus", "taxi", "plane",
  "helicopter", "ship", "boat", "yacht", "cruise", "ferry",

  // Accommodations
  "hotel", "resort", "inn", "hostel", "motel", "cabin", "lodge",
  "camping", "tent", "picnic",

  // Geographic Features
  "beach", "island", "ocean", "sea", "coast", "shore", "lake", "river",
  "forest", "jungle", "desert", "valley", "canyon", "cave",
  "waterfall", "volcano", "glacier", "mountain", "hill", "plain",

  // Landmarks & Attractions
  "monument", "museum", "gallery", "temple", "church", "castle",
  "palace", "ruins", "landmark", "bridge", "tunnel", "park",

  // Travel Documents & Items
  "passport", "visa", "ticket", "luggage", "suitcase", "backpack",
  "map", "compass", "camera", "guidebook",

  // ============================================================
  // EMOTIONS & FEELINGS
  // ============================================================
  "emotion", "feeling", "love", "hate", "joy", "sorrow", "grief",
  "fear", "anxiety", "worry", "panic", "hope", "despair", "excitement",
  "boredom", "frustration", "relief", "peace", "anger", "rage",
  "confidence", "doubt", "pride", "shame", "envy", "jealousy",
  "gratitude", "ingratitude", "regret", "forgiveness", "resentment",
  "courage", "cowardice", "determination", "hesitation", "passion", "apathy",
  "empathy", "sympathy", "compassion", "cruelty", "kindness", "rudeness",
  "politeness", "arrogance", "humility", "modesty", "vanity",

  // ============================================================
  // ART & CULTURE
  // ============================================================
  
  // Visual Arts
  "art", "artist", "painting", "sculpture", "drawing", "sketch",
  "canvas", "brush", "palette", "color", "shade", "tone", "texture",
  "composition", "perspective", "shadow", "highlight", "portrait",
  "landscape", "still_life", "abstract", "realistic", "surreal",

  // Art Movements
  "impressionist", "expressionist", "cubist", "baroque", "renaissance",
  "modernist", "contemporary", "vintage", "antique", "collectible",

  // Venues & Events
  "gallery", "museum", "exhibition", "performance", "show", "concert",

  // Performing Arts
  "theater", "drama", "comedy", "tragedy", "play", "musical", "opera",
  "ballet", "dance", "dancer", "choreography", "costume", "makeup",
  "stage", "curtain", "spotlight", "audience", "applause", "encore",

  // Literature
  "literature", "novel", "poetry", "poem", "short_story", "essay",
  "script", "dialogue", "monologue", "narrative", "character",
  "protagonist", "antagonist", "plot", "conflict", "resolution",
  "climax", "ending", "beginning", "middle", "chapter", "page",

  // ============================================================
  // WEATHER & CLIMATE
  // ============================================================
  "weather", "climate", "temperature", "wind", "breeze", "gale",
  "sunshine", "cloud", "rain", "snow", "sleet", "hail", "frost",
  "dew", "mist", "fog", "humidity", "pressure", "atmospheric",
  "storm", "thunder", "lightning", "blizzard", "cyclone", "tornado",
  "hurricane", "monsoon", "drought", "flood", "earthquake",
  "forecast", "season", "sunny", "cloudy", "rainy", "snowy",
  "windy", "humid", "dry", "mild", "extreme", "warm", "cool",

  // ============================================================
  // EDUCATION & LEARNING
  // ============================================================
  
  // Institutions
  "school", "university", "college", "academy", "institute",
  "classroom", "lecture_hall", "library", "laboratory", "campus",

  // Education-related
  "lecture", "seminar", "workshop", "course", "class", "subject",
  "curriculum", "syllabus", "lesson", "assignment", "homework",
  "exam", "test", "quiz", "project", "presentation",

  // Grades & Achievements
  "grade", "mark", "score", "pass", "fail", "excellent", "good",
  "certificate", "degree", "diploma", "bachelor", "master", "doctorate",

  // Academic Work
  "thesis", "dissertation", "research", "study", "paper", "report",
  "bibliography", "footnote", "citation", "reference",

  // Learning Concepts
  "education", "learning", "knowledge", "wisdom", "intelligence",
  "skill", "talent", "ability", "potential", "achievement",
  "success", "failure", "improvement", "progress", "development",
  "growth", "understanding", "comprehension", "memorization",

  // People in Education
  "mentor", "tutor", "instructor", "professor", "lecturer",
  "scholar", "academic", "student", "pupil", "peer", "classmate",
  "alumni", "graduate", "researcher", "teacher",

  // ============================================================
  // ADDITIONAL COMMON WORDS & CONCEPTS
  // ============================================================
  
  // Generic Objects
  "thing", "stuff", "matter", "object", "item", "piece", "part",
  "whole", "aspect", "element", "component", "section",

  // Structure & Organization
  "chapter", "page", "line", "word", "sentence", "paragraph",
  "structure", "framework", "outline", "format", "layout",

  // Shapes & Patterns
  "shape", "form", "pattern", "design", "style", "fashion",
  "trend", "mode", "circle", "square", "triangle", "rectangle",
  "number", "digit", "symbol", "sign", "mark", "point", "dot",

  // Methods & Processes
  "method", "technique", "approach", "procedure", "process",
  "operation", "function", "action", "activity", "event",

  // Purpose & Goals
  "purpose", "goal", "objective", "aim", "intention", "plan",
  "scheme", "project", "ideal", "vision", "dream", "aspiration",

  // Concepts & Ideas
  "concept", "theory", "belief", "opinion", "view", "perspective",
  "stance", "attitude", "mindset", "principle", "rule", "law",

  // Atmosphere & Environment
  "atmosphere", "environment", "setting", "context", "situation",
  "circumstance", "condition", "state", "status", "position",
  "rank", "level", "degree", "stage", "phase", "period",

  // History & Time
  "history", "era", "epoch", "age", "generation", "decade",
  "century", "period", "ancient", "medieval", "modern", "contemporary",
  "past", "present", "future", "tradition", "heritage", "legacy",
];

const generateText = (count = 200) =>
  Array.from({ length: count })
    .map(() => WORDS[Math.floor(Math.random() * WORDS.length)])
    .join(" ");

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API || "http://localhost:8000/",
  withCredentials: true,
});

export default function TypingPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("Guest");
  const [loggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState("cyberpunk");
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const checkLoginAndLoadTheme = async () => {
      try {
        const meRes = await api.get("/GrowTyping/v1/users/me");
        if (meRes.data.loggedIn) {
          setUsername(meRes.data.user.username.toUpperCase());
          setLoggedIn(true);
          try {
            const profileRes = await api.get("/GrowTyping/v1/users/getuserprofile");
            if (profileRes.data.data.theme) {
              setTheme(profileRes.data.data.theme);
            }
          } catch (err) {
            console.error("Failed to load theme:", err);
          }
        }
      } catch(err){}
      setThemeLoaded(true);
    };
    
    checkLoginAndLoadTheme();
  }, []);

  useEffect(() => {
    if (themeLoaded && loggedIn && theme) {
      const saveTheme = async () => {
        try {
          await api.post("/GrowTyping/v1/users/updatetheme", { theme });
        } catch (err) {
          console.error("Failed to save theme:", err);
        }
      };
      saveTheme();
    }
  }, [theme, loggedIn, themeLoaded]);

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
  const startTimeRef = useRef(null);
  const finalDurationRef = useRef(null);

  useEffect(() => resetTest(), [testType]);

  const resetTest = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
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
    startTimeRef.current = null;
    finalDurationRef.current = null;
    correctRef.current = 0;
    incorrectRef.current = 0;
    totalRef.current = 0;
    weakKeysRef.current = {};
  };

  const startTimer = () => {
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

    totalRef.current++;

    if (isCorrect) {
      correctRef.current++;
    } else {
      incorrectRef.current++;
      weakKeysRef.current[expected] = (weakKeysRef.current[expected] || 0) + 1;
    }

    const newTyped = [...typedChars, { char: e.key, correct: isCorrect }];
    setTypedChars(newTyped);

    if (testType === "custom" && newTyped.length === text.length) {
      finishedRef.current = true;
      finishTest();
    }
  };

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
      weakKeys: Object.entries(weakKeysRef.current).map(([key, count]) => ({
        key,
        count,
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

  const elapsed =
    testType === "custom" && startTimeRef.current
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      : Math.max(1, durationMap[testType] - timeLeft);

  const liveWpm = startedRef.current
    ? Math.round(correctRef.current / 5 / (elapsed / 60))
    : 0;

  const liveAccuracy = totalRef.current
    ? (
        ((totalRef.current - incorrectRef.current) / totalRef.current) *
        100
      ).toFixed(1)
    : 100;

  const themes = {
    // High-end industry themes - Updated for high card contrast and readable dropdown text

    // Luxury Gold & Navy - Sophisticated enterprise feel
    "luxury-gold": {
      bg: "from-slate-950 via-indigo-950 to-amber-950",
      text: "text-amber-100",
      primary: "amber",
      card: "bg-slate-800/95 border-amber-400/60 backdrop-blur-md shadow-xl",
      button:
        "bg-gradient-to-r from-amber-500/90 to-amber-400/90 text-slate-900 border-amber-400 shadow-lg hover:shadow-amber-400/50",
    },

    // Cyberpunk Neon - Tech/futuristic with vibrant accents
    cyberpunk: {
      bg: "from-slate-950 via-purple-950 to-pink-950",
      text: "text-slate-100",
      primary: "pink",
      card: "bg-slate-800/95 border-purple-400/50 backdrop-blur-lg shadow-2xl ring-1 ring-purple-500/30",
      button:
        "bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-fuchsia-500/90 text-slate-50 border-purple-400/50 shadow-lg hover:shadow-purple-400/40 glow",
    },

    // Monaco GP - Racing luxury with metallic silver
    monaco: {
      bg: "from-zinc-950 via-blue-950 to-zinc-900",
      text: "text-zinc-50",
      primary: "blue",
      card: "bg-zinc-700/95 border-blue-400/70 backdrop-blur-md shadow-2xl ring-1 ring-blue-400/30",
      button:
        "bg-gradient-to-r from-blue-500/90 to-emerald-500/90 text-slate-900 border-blue-400 shadow-xl hover:shadow-emerald-400/40",
    },

    // Dubai Skyline - Warm desert luxury with sapphire accents
    dubai: {
      bg: "from-orange-950 via-amber-950 to-sky-950",
      text: "text-slate-50",
      primary: "sky",
      card: "bg-slate-800/95 border-sky-400/60 backdrop-blur-lg shadow-xl ring-1 ring-sky-400/30",
      button:
        "bg-gradient-to-r from-sky-400/90 to-orange-400/90 text-slate-900 border-sky-400 shadow-xl hover:shadow-orange-400/50",
    },

    // Tokyo Night - Japanese minimalism with indigo gradients
    "tokyo-night": {
      bg: "from-indigo-950 via-slate-950 to-violet-950",
      text: "text-slate-100",
      primary: "indigo",
      card: "bg-slate-800/95 border-indigo-400/50 backdrop-blur-md shadow-xl ring-1 ring-indigo-500/30",
      button:
        "bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-slate-50 border-indigo-400 shadow-lg hover:shadow-indigo-400/40",
    },

    // Silicon Valley - Professional tech with green innovation accents
    silicon: {
      bg: "from-stone-950 via-emerald-950 to-stone-950",
      text: "text-emerald-100",
      primary: "emerald",
      card: "bg-stone-800/95 border-emerald-400/60 backdrop-blur-md shadow-xl ring-1 ring-emerald-400/30",
      button:
        "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-900 border-emerald-400 shadow-lg hover:shadow-emerald-400/50",
    },

    // Beverly Hills - Sunset gradient luxury
    beverly: {
      bg: "from-rose-950 via-orange-950 to-amber-950",
      text: "text-slate-50",
      primary: "amber",
      card: "bg-slate-800/95 border-orange-400/60 backdrop-blur-lg shadow-2xl ring-1 ring-orange-400/30",
      button:
        "bg-gradient-to-r from-orange-400/90 to-rose-400/90 text-slate-900 border-orange-400 shadow-xl hover:shadow-rose-400/50",
    },

    // Nordic Minimal - Clean icy blue with silver
    nordic: {
      bg: "from-blue-950 via-slate-950 to-cyan-950",
      text: "text-cyan-100",
      primary: "cyan",
      card: "bg-slate-800/95 border-cyan-400/50 backdrop-blur-md shadow-xl ring-1 ring-cyan-400/30",
      button:
        "bg-gradient-to-r from-cyan-400/90 to-blue-400/90 text-slate-900 border-cyan-400 shadow-lg hover:shadow-cyan-400/50",
    },

    // Vegas Gold - Casino luxury with champagne gradients
    vegas: {
      bg: "from-amber-950 via-yellow-950 to-rose-950",
      text: "text-slate-50",
      primary: "yellow",
      card: "bg-slate-800/95 border-yellow-400/70 backdrop-blur-lg shadow-2xl ring-1 ring-yellow-400/30",
      button:
        "bg-gradient-to-r from-yellow-400/90 to-amber-400/90 text-slate-900 border-yellow-400 shadow-xl hover:shadow-amber-400/50",
    },

    // Shanghai Neon - Oriental luxury with magenta accents
    shanghai: {
      bg: "from-fuchsia-950 via-rose-950 to-pink-950",
      text: "text-slate-100",
      primary: "fuchsia",
      card: "bg-slate-800/95 border-fuchsia-400/60 backdrop-blur-lg shadow-xl ring-1 ring-fuchsia-500/30",
      button:
        "bg-gradient-to-r from-fuchsia-500/90 to-pink-500/90 text-slate-50 border-fuchsia-400 shadow-xl hover:shadow-pink-400/40",
    },

    // Professional Themes

    // Corporate Blue - Enterprise banking/finance feel
    corporate: {
      bg: "from-slate-900 via-blue-950 to-slate-900",
      text: "text-slate-50",
      primary: "blue",
      card: "bg-slate-800/80 border-blue-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500 shadow-md hover:shadow-blue-500/40",
    },

    // Apple Minimalist - Clean, elegant, professional
    minimalist: {
      bg: "from-gray-950 via-slate-900 to-gray-950",
      text: "text-slate-100",
      primary: "slate",
      card: "bg-slate-800/70 border-slate-600/30 backdrop-blur-sm shadow-md",
      button:
        "bg-slate-700/80 hover:bg-slate-600 text-slate-100 border-slate-500/40 shadow-sm hover:shadow-slate-500/30",
    },

    // Material Design - Google-inspired professional
    material: {
      bg: "from-gray-900 via-blue-950 to-gray-900",
      text: "text-blue-50",
      primary: "blue",
      card: "bg-slate-800/75 border-blue-500/30 backdrop-blur-md shadow-lg",
      button:
        "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg hover:shadow-blue-500/50",
    },

    // Microsoft Office - Professional productivity feel
    office: {
      bg: "from-slate-900 via-slate-800 to-slate-900",
      text: "text-slate-50",
      primary: "sky",
      card: "bg-slate-700/80 border-sky-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-sky-600/90 hover:bg-sky-500 text-white border-sky-500 shadow-md hover:shadow-sky-500/50",
    },

    // IBM Data Science - Technical, analytical professional
    technical: {
      bg: "from-gray-950 via-slate-900 to-gray-900",
      text: "text-cyan-100",
      primary: "cyan",
      card: "bg-slate-800/80 border-cyan-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 border-cyan-500 shadow-md hover:shadow-cyan-500/50",
    },

    // LinkedIn Professional - Corporate networking aesthetic
    linkedin: {
      bg: "from-slate-950 via-blue-950 to-slate-950",
      text: "text-slate-100",
      primary: "blue",
      card: "bg-slate-800/75 border-blue-700/40 backdrop-blur-sm shadow-md",
      button:
        "bg-blue-700/90 hover:bg-blue-600 text-white border-blue-600 shadow-lg hover:shadow-blue-600/40",
    },

    // AWS Orange - Cloud professional/developer feel
    cloud: {
      bg: "from-orange-950 via-slate-900 to-orange-950",
      text: "text-slate-100",
      primary: "orange",
      card: "bg-slate-800/80 border-orange-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-orange-600/90 hover:bg-orange-500 text-white border-orange-500 shadow-md hover:shadow-orange-500/50",
    },

    // GitHub Professional - Developer-friendly professional
    github: {
      bg: "from-gray-950 via-slate-900 to-gray-900",
      text: "text-gray-100",
      primary: "green",
      card: "bg-slate-800/70 border-green-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-green-600/90 hover:bg-green-500 text-white border-green-500 shadow-md hover:shadow-green-500/50",
    },

    // Finance Pro - Banking/trading platform aesthetic
    finance: {
      bg: "from-slate-950 via-emerald-950 to-slate-950",
      text: "text-emerald-50",
      primary: "emerald",
      card: "bg-slate-800/80 border-emerald-600/40 backdrop-blur-sm shadow-lg",
      button:
        "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500 shadow-md hover:shadow-emerald-500/50",
    },

    // High Contrast Themes for Professionals

    // Black & White Contrast - Maximum accessibility and readability
    "contrastBw": {
      bg: "from-black via-slate-950 to-black",
      text: "text-white",
      primary: "white",
      card: "bg-black border-white/80 backdrop-blur-md shadow-2xl ring-2 ring-white/60",
      button:
        "bg-white/95 hover:bg-white text-black border-white shadow-xl hover:shadow-white/60 font-bold",
    },

    // Navy & Gold Contrast - Executive professional with high visibility
    "contrastNG": {
      bg: "from-slate-950 via-blue-950 to-slate-950",
      text: "text-white",
      primary: "yellow",
      card: "bg-slate-800/95 border-yellow-300/80 backdrop-blur-md shadow-2xl ring-2 ring-yellow-400/50",
      button:
        "bg-gradient-to-r from-yellow-400 to-amber-300 text-slate-950 border-yellow-300 shadow-xl hover:shadow-yellow-400/60 font-bold",
    },

    // Dark & Lime Contrast - Modern tech professional
    "contrastLime": {
      bg: "from-slate-950 via-gray-950 to-slate-950",
      text: "text-lime-50",
      primary: "lime",
      card: "bg-slate-800/95 border-lime-400/80 backdrop-blur-md shadow-2xl ring-2 ring-lime-500/50",
      button:
        "bg-gradient-to-r from-lime-400 to-green-400 text-slate-950 border-lime-400 shadow-xl hover:shadow-lime-400/70 font-bold",
    },

    // Charcoal & Cyan Contrast - Professional tech aesthetic
    "contrastCyan": {
      bg: "from-gray-950 via-slate-950 to-gray-950",
      text: "text-cyan-100",
      primary: "cyan",
      card: "bg-slate-800/95 border-cyan-300/80 backdrop-blur-md shadow-2xl ring-2 ring-cyan-400/50",
      button:
        "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-400 shadow-xl hover:shadow-cyan-400/70 font-bold",
    },

    // Deep Purple & White Contrast - Clean business professional
    "contrastPurple": {
      bg: "from-slate-950 via-purple-950 to-slate-950",
      text: "text-white",
      primary: "purple",
      card: "bg-slate-800/95 border-purple-400/80 backdrop-blur-md shadow-2xl ring-2 ring-purple-500/60",
      button:
        "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-purple-400 shadow-xl hover:shadow-purple-500/70 font-bold",
    },

    // Charcoal & Orange Contrast - Energetic professional
    "contrastOrange": {
      bg: "from-slate-950 via-gray-950 to-slate-950",
      text: "text-orange-50",
      primary: "orange",
      card: "bg-slate-800/95 border-orange-400/80 backdrop-blur-md shadow-2xl ring-2 ring-orange-500/50",
      button:
        "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-xl hover:shadow-orange-500/70 font-bold",
    },

    // Deep Blue & White Contrast - Corporate professional
    "contrastBlue": {
      bg: "from-slate-950 via-blue-950 to-slate-950",
      text: "text-white",
      primary: "blue",
      card: "bg-slate-800/95 border-blue-400/80 backdrop-blur-md shadow-2xl ring-2 ring-blue-500/60",
      button:
        "bg-gradient-to-r from-blue-500 to-sky-500 text-white border-blue-400 shadow-xl hover:shadow-blue-500/70 font-bold",
    },

    // Charcoal & Red Contrast - Attention-grabbing professional
    "contrastRed": {
      bg: "from-slate-950 via-gray-950 to-slate-950",
      text: "text-red-50",
      primary: "red",
      card: "bg-slate-800/95 border-red-400/80 backdrop-blur-md shadow-2xl ring-2 ring-red-500/50",
      button:
        "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400 shadow-xl hover:shadow-red-500/70 font-bold",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} font-mono flex flex-col items-center pt-8 outline-none`}
    >
      <div className="w-full bg-slate-950/40 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight text-${currentTheme.primary}-400`}>
              GrowTyping
            </h1>
            <p className="text-xs md:text-sm text-slate-400 tracking-widest uppercase">
              Master Your Typing Speed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-1">
              {["15s", "30s", "60s", "custom"].map((m) => (
                <button
                  key={m}
                  onClick={() => setTestType(m)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                    testType === m
                      ? `text-${currentTheme.primary}-400 bg-slate-800`
                      : "text-slate-400 hover:text-slate-200"
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
                className="px-3 py-1.5 text-sm rounded bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
              >
                {Object.keys(themes).map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-slate-100">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() =>
                loggedIn ? navigate("/dashboard") : navigate("/login")
              }
              className={`px-5 py-2.5 text-sm font-bold text-${currentTheme.primary}-400 bg-slate-800/60 border border-${currentTheme.primary}-500/40 rounded-lg hover:bg-slate-700 hover:border-${currentTheme.primary}-400/70 transition-all duration-200 shadow-lg hover:shadow-${currentTheme.primary}-500/30`}
              title={username}
            >
               {username}
            </button>
          </div>
        </div>
      </div>

      {testType !== "custom" && (
        <div className="flex flex-col items-center mb-16 gap-10 mt-14">
          <div
            className={`text-3xl font-bold ${currentTheme.text} animate-pulse drop-shadow-lg`}
          >
            ⏱ {timeLeft}s
          </div>
          {/* <button
            onClick={resetTest}
            className={`px-6 py-2 ${currentTheme.button} rounded-lg hover:bg-opacity-80 transition-all duration-200`}
          >
            Reset
          </button> */}
        </div>
      )}

      <div className="max-w-7xl w-full px-6 md:px-10 text-3xl leading-relaxed tracking-wide cursor-text h-48 overflow-hidden box-border flex-grow">
        {(() => {
          const charsPerLine = 70;
          const totalLines = Math.ceil(text.length / charsPerLine);
          const currentLineIndex = Math.floor(typedChars.length / charsPerLine);
          // Always show 3 lines when possible, with current line in the middle
          const startLine = Math.max(0, Math.min(currentLineIndex - 1, totalLines - 3));
          const endLine = Math.min(totalLines, startLine + 3);
          const lines = [];
          for (let lineIdx = startLine; lineIdx < endLine; lineIdx++) {
            const lineStart = lineIdx * charsPerLine;
            const lineEnd = Math.min(text.length, lineStart + charsPerLine);
            const lineText = text.slice(lineStart, lineEnd);
            const isCurrentLine = lineIdx === currentLineIndex;
            lines.push(
              <div key={lineIdx} className={`whitespace-pre text-left transition-opacity duration-200 ${
                isCurrentLine ? "opacity-100" : "opacity-50"
              }`}>
                {lineText.split("").map((char, i) => {
                  const charIdx = lineStart + i;

                  if (charIdx < typedChars.length) {
                    return (
                      <span
                        key={i}
                        className={
                          typedChars[charIdx].correct
                            ? `text-${currentTheme.primary}-300 font-semibold`
                            : "text-red-400 underline font-semibold"
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
                        className="relative bg-white/15 text-white border-l-2 border-white animate-pulse font-bold"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  }

                  return (
                    <span key={i} className="text-white/70">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  );
                })}
              </div>,
            );
          }
          return lines;
        })()}
      </div>
        <button
            onClick={resetTest}
            className={`px-6 py-2 ${currentTheme.button} rounded-lg hover:bg-opacity-80 transition-all duration-200`}
          >
            Reset
          </button>
      <p
        className={`text-${currentTheme.primary}-500 mt-auto pt-16 pb-8 text-sm tracking-wide text-center`}
      >
        Start typing to begin • Press Escape to reset
      </p>

      {finishedRef.current && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-${currentTheme.primary}-500/30 rounded-3xl max-w-2xl w-full mx-auto shadow-2xl overflow-hidden`}
          >
          
            <div className={`bg-gradient-to-r from-${currentTheme.primary}-600/20 to-${currentTheme.primary}-500/10 border-b border-${currentTheme.primary}-500/20 px-8 py-8`}>
              <div className="text-center mb-2">
                <p className={`text-${currentTheme.primary}-400 text-sm font-semibold uppercase tracking-widest mb-3`}>
                  {correctRef.current / totalRef.current > 0.95 ? "⭐ Exceptional Performance!" 
                   : correctRef.current / totalRef.current > 0.85 ? "✓ Great Job!" 
                   : correctRef.current / totalRef.current > 0.75 ? "Good Result" 
                   : "Room for Improvement"}
                </p>
              </div>
              <h2 className={`text-4xl font-bold ${currentTheme.text} text-center`}>
                Test Completed
              </h2>
              <div className={`h-1 w-12 bg-gradient-to-r from-${currentTheme.primary}-500 to-${currentTheme.primary}-400 mx-auto mt-4 rounded-full`}></div>
            </div>

            
            <div className="px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`bg-slate-800/60 hover:bg-slate-800/80 border border-${currentTheme.primary}-500/30 rounded-2xl p-6 transition-all duration-200 group`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-${currentTheme.primary}-400 text-xs font-bold uppercase tracking-widest`}>
                      Words Per Minute
                    </p>
                    
                  </div>
                  <p className={`text-5xl font-black ${currentTheme.text} mb-2`}>
                    {Math.round(correctRef.current / 5 / (finalDurationRef.current / 60))}
                  </p>
                  <div className="w-full bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${currentTheme.primary}-500 to-${currentTheme.primary}-400 transition-all duration-500`}
                      style={{ width: `${Math.min(100, (Math.round(correctRef.current / 5 / (finalDurationRef.current / 60)) / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`bg-slate-800/60 hover:bg-slate-800/80 border ${((correctRef.current / totalRef.current) * 100) > 90 ? `border-green-500/30` : `border-${currentTheme.primary}-500/30`} rounded-2xl p-6 transition-all duration-200 group`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`${((correctRef.current / totalRef.current) * 100) > 90 ? `text-green-400` : `text-${currentTheme.primary}-400`} text-xs font-bold uppercase tracking-widest`}>
                      Accuracy
                    </p>
                  </div>
                  <p className={`${((correctRef.current / totalRef.current) * 100) > 90 ? `text-green-400` : `text-${currentTheme.primary}-400`} text-5xl font-black mb-2`}>
                    {((correctRef.current / totalRef.current) * 100).toFixed(1)}%
                  </p>
                  <div className="w-full bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${((correctRef.current / totalRef.current) * 100) > 90 ? `bg-gradient-to-r from-green-500 to-green-400` : `bg-gradient-to-r from-${currentTheme.primary}-500 to-${currentTheme.primary}-400`} transition-all duration-500`}
                      style={{ width: `${((correctRef.current / totalRef.current) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      
                <div className={`bg-slate-800/40 border border-green-500/30 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all`}>
                  <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">Correct</p>
                  <p className="text-green-400 text-3xl font-bold">{correctRef.current}</p>
                  <p className="text-slate-500 text-xs mt-1">characters</p>
                </div>
                <div className={`bg-slate-800/40 border border-red-500/30 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all`}>
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">Mistakes</p>
                  <p className="text-red-400 text-3xl font-bold">{incorrectRef.current}</p>
                  <p className="text-slate-500 text-xs mt-1">errors</p>
                </div>
                <div className={`bg-slate-800/40 border border-${currentTheme.primary}-500/30 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all`}>
                  <p className={`text-${currentTheme.primary}-400 text-xs font-semibold uppercase tracking-wider mb-2`}>Duration</p>
                  <p className={`text-${currentTheme.primary}-400 text-3xl font-bold`}>
                    {finalDurationRef.current}s
                  </p>
                  <p className="text-slate-500 text-xs mt-1">seconds</p>
                </div>
                <div className={`bg-slate-800/40 border border-${currentTheme.primary}-500/30 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all`}>
                  <p className={`text-${currentTheme.primary}-400 text-xs font-semibold uppercase tracking-wider mb-2`}>Total</p>
                  <p className={`text-${currentTheme.primary}-400 text-3xl font-bold`}>{totalRef.current}</p>
                  <p className="text-slate-500 text-xs mt-1">total keys</p>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 mb-8">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Performance Breakdown</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Accuracy Rate</span>
                    <span className={`font-bold ${((correctRef.current / totalRef.current) * 100) > 90 ? `text-green-400` : `text-${currentTheme.primary}-400`}`}>
                      {((correctRef.current / totalRef.current) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Error Rate</span>
                    <span className={`font-bold ${((incorrectRef.current / totalRef.current) * 100) > 10 ? `text-red-400` : `text-green-400`}`}>
                      {((incorrectRef.current / totalRef.current) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={resetTest}
                  className={`bg-gradient-to-r from-${currentTheme.primary}-600 to-${currentTheme.primary}-500 hover:from-${currentTheme.primary}-500 hover:to-${currentTheme.primary}-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded-xl border border-slate-600/50 transition-all duration-200 hover:border-slate-500`}
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
