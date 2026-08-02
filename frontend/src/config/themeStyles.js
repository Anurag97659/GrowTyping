export const THEMES = [
  { id: "glassmorphism", name: "Glassmorphism", description: "Frosted glass panels, glowing blur, backdrop filters" },
  { id: "neomorphism", name: "Neomorphism", description: "Soft extruded 3D surfaces and subtle dual depth shadows" },
  { id: "claymorphism", name: "Claymorphism", description: "Playful rounded 3D clay shapes with soft outer and inner drop shadows" },
  { id: "skeuomorphism", name: "Skeuomorphism", description: "Tactile textures, metallic edges, and realistic bevels" },
  { id: "brutalism", name: "Brutalism", description: "High-contrast thick borders, raw monochrome layout, and hard offset drop shadows" },
  { id: "liquid-glass", name: "Liquid Glass", description: "Fluid chrome sheen, iridescent reflection, and specular gloss" },
  { id: "minimalism", name: "Minimalism", description: "Ultra-clean crisp typography, high whitespace, and razor thin accents" },
  { id: "maximalism", name: "Maximalism", description: "Vibrant multi-color mesh gradients, glowing text, and high energy elements" },
  { id: "terminal", name: "Terminal CRT", description: "Retro green monospaced matrix aesthetic with CRT scanlines" },
  { id: "cyberpunk", name: "Cyberpunk Neon", description: "Futuristic neon pink and cyan glow over dark technical grid" },
  { id: "luxury-gold", name: "Luxury Gold", description: "Deep royal slate base with warm champagne gold gradient accents" }
];

export const getThemeConfig = (themeId = "glassmorphism", mode = "dark") => {
  const isDark = mode === "dark";

  switch (themeId) {
    case "neomorphism":
      return {
        id: "neomorphism",
        mode,
        bg: isDark ? "bg-[#1e232a]" : "bg-[#e0e5ec]",
        bodyText: isDark ? "text-slate-100" : "text-slate-800",
        mutedText: isDark ? "text-slate-400" : "text-slate-500",
        card: isDark
          ? "bg-[#1e232a] shadow-[8px_8px_16px_#14171c,-8px_-8px_16px_#282f38] border border-slate-700/30 rounded-2xl"
          : "bg-[#e0e5ec] shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff] border border-white/60 rounded-2xl",
        cardInset: isDark
          ? "bg-[#1a1e24] shadow-[inset_4px_4px_8px_#111418,inset_-4px_-4px_8px_#232830] rounded-xl"
          : "bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] rounded-xl",
        buttonPrimary: isDark
          ? "bg-[#1e232a] text-cyan-400 shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] hover:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38] transition-all font-semibold rounded-xl"
          : "bg-[#e0e5ec] text-blue-600 shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] transition-all font-semibold rounded-xl",
        buttonSecondary: isDark
          ? "bg-[#1e232a] text-slate-300 shadow-[3px_3px_6px_#14171c,-3px_-3px_6px_#282f38] hover:text-white rounded-xl"
          : "bg-[#e0e5ec] text-slate-600 shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] hover:text-slate-900 rounded-xl",
        input: isDark
          ? "bg-[#1a1e24] text-slate-100 shadow-[inset_3px_3px_6px_#111418,inset_-3px_-3px_6px_#232830] border-none focus:outline-none rounded-xl"
          : "bg-[#e0e5ec] text-slate-800 shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] border-none focus:outline-none rounded-xl",
        accent: isDark ? "text-cyan-400" : "text-blue-600",
        border: isDark ? "border-slate-700/40" : "border-slate-300/60",
      };

    case "claymorphism":
      return {
        id: "claymorphism",
        mode,
        bg: isDark ? "bg-[#121824]" : "bg-[#f0f4f8]",
        bodyText: isDark ? "text-slate-100" : "text-slate-800",
        mutedText: isDark ? "text-slate-400" : "text-slate-500",
        card: isDark
          ? "bg-[#1a2332] rounded-3xl border border-indigo-500/20 shadow-[0_20px_30px_rgba(0,0,0,0.5),inset_0_-8px_12px_rgba(0,0,0,0.4),inset_0_8px_12px_rgba(255,255,255,0.06)]"
          : "bg-white rounded-3xl border border-indigo-100 shadow-[0_20px_30px_rgba(100,116,139,0.15),inset_0_-8px_12px_rgba(203,213,225,0.4),inset_0_8px_12px_rgba(255,255,255,0.9)]",
        cardInset: isDark
          ? "bg-[#141b28] rounded-2xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)]"
          : "bg-[#f8fafc] rounded-2xl shadow-[inset_0_4px_8px_rgba(148,163,184,0.2)]",
        buttonPrimary: isDark
          ? "bg-indigo-600 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3),inset_0_4px_6px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all font-bold"
          : "bg-indigo-500 text-white rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.35),inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all font-bold",
        buttonSecondary: isDark
          ? "bg-[#222c3d] text-slate-200 rounded-2xl shadow-[0_6px_14px_rgba(0,0,0,0.3),inset_0_-3px_4px_rgba(0,0,0,0.2),inset_0_3px_4px_rgba(255,255,255,0.1)] hover:bg-[#2a374c] transition-all font-medium"
          : "bg-[#e2e8f0] text-slate-700 rounded-2xl shadow-[0_6px_14px_rgba(148,163,184,0.2),inset_0_-3px_4px_rgba(0,0,0,0.1),inset_0_3px_4px_rgba(255,255,255,0.6)] hover:bg-[#cbd5e1] transition-all font-medium",
        input: isDark
          ? "bg-[#141b28] text-slate-100 rounded-2xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] border border-slate-700/50 p-3 focus:outline-none"
          : "bg-[#f1f5f9] text-slate-800 rounded-2xl shadow-[inset_0_4px_8px_rgba(148,163,184,0.2)] border border-slate-200 p-3 focus:outline-none",
        accent: isDark ? "text-indigo-400" : "text-indigo-600",
        border: isDark ? "border-indigo-500/30" : "border-indigo-200",
      };

    case "skeuomorphism":
      return {
        id: "skeuomorphism",
        mode,
        bg: isDark ? "bg-[#13161c]" : "bg-[#e5e9f0]",
        bodyText: isDark ? "text-slate-100" : "text-slate-900",
        mutedText: isDark ? "text-slate-400" : "text-slate-600",
        card: isDark
          ? "bg-gradient-to-b from-[#222733] to-[#1a1e27] border-2 border-t-slate-600/50 border-b-slate-900/80 border-x-slate-700/60 rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]"
          : "bg-gradient-to-b from-[#ffffff] to-[#f0f3f8] border-2 border-t-white border-b-slate-300 border-x-slate-200 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
        cardInset: isDark
          ? "bg-[#14171f] border border-t-black border-b-slate-700/40 rounded-lg shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)]"
          : "bg-[#e2e7ef] border border-t-slate-400/40 border-b-white rounded-lg shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)]",
        buttonPrimary: isDark
          ? "bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-bold border border-t-amber-300 border-b-amber-700 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-amber-300 hover:to-amber-500 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.6)] transition-all"
          : "bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-bold border border-t-amber-200 border-b-amber-700 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.6)] hover:from-amber-300 hover:to-amber-400 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.4)] transition-all",
        buttonSecondary: isDark
          ? "bg-gradient-to-b from-[#2e3444] to-[#1e222d] text-slate-200 font-semibold border border-t-slate-600 border-b-slate-900 rounded-lg shadow-[0_3px_6px_rgba(0,0,0,0.4)] hover:from-[#353c4e] hover:to-[#242937]"
          : "bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] text-slate-800 font-semibold border border-t-white border-b-slate-400 rounded-lg shadow-[0_3px_6px_rgba(0,0,0,0.08)] hover:from-white hover:to-[#cbd5e1]",
        input: isDark
          ? "bg-[#151821] text-slate-100 border border-t-black border-b-slate-700/60 rounded-lg p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] focus:outline-none"
          : "bg-[#ffffff] text-slate-900 border border-t-slate-400 border-b-slate-200 rounded-lg p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] focus:outline-none",
        accent: isDark ? "text-amber-400" : "text-amber-600",
        border: isDark ? "border-slate-700" : "border-slate-300",
      };

    case "brutalism":
      return {
        id: "brutalism",
        mode,
        bg: isDark ? "bg-[#111111]" : "bg-[#f4f4f0]",
        bodyText: isDark ? "text-yellow-300 font-mono" : "text-black font-mono",
        mutedText: isDark ? "text-slate-400 font-mono" : "text-slate-700 font-mono",
        card: isDark
          ? "bg-[#1c1c1c] border-4 border-yellow-400 shadow-[6px_6px_0px_#facc15] rounded-none"
          : "bg-white border-4 border-black shadow-[6px_6px_0px_#000000] rounded-none",
        cardInset: isDark
          ? "bg-[#282828] border-2 border-yellow-400/80 rounded-none"
          : "bg-[#e5e5e5] border-2 border-black rounded-none",
        buttonPrimary: isDark
          ? "bg-yellow-400 text-black font-black uppercase tracking-wider border-3 border-yellow-400 shadow-[4px_4px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#ffffff] transition-all rounded-none"
          : "bg-yellow-300 text-black font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#000000] transition-all rounded-none",
        buttonSecondary: isDark
          ? "bg-black text-yellow-400 font-bold uppercase border-3 border-yellow-400 shadow-[3px_3px_0px_#facc15] hover:bg-yellow-400 hover:text-black transition-all rounded-none"
          : "bg-white text-black font-bold uppercase border-3 border-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-white transition-all rounded-none",
        input: isDark
          ? "bg-[#222222] text-yellow-300 font-mono border-3 border-yellow-400 p-3 rounded-none focus:outline-none"
          : "bg-white text-black font-mono border-3 border-black p-3 rounded-none focus:outline-none",
        accent: isDark ? "text-yellow-400" : "text-black",
        border: isDark ? "border-yellow-400" : "border-black",
      };

    case "liquid-glass":
      return {
        id: "liquid-glass",
        mode,
        bg: isDark
          ? "bg-gradient-to-br from-slate-950 via-cyan-950/60 to-slate-950"
          : "bg-gradient-to-br from-cyan-50 via-sky-100 to-indigo-50",
        bodyText: isDark ? "text-cyan-50" : "text-slate-900",
        mutedText: isDark ? "text-cyan-200/60" : "text-slate-500",
        card: isDark
          ? "bg-cyan-950/20 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_8px_32px_0_rgba(6,182,212,0.25),inset_0_1px_2px_0_rgba(255,255,255,0.4)] rounded-3xl"
          : "bg-white/40 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(56,189,248,0.2),inset_0_1px_2px_0_rgba(255,255,255,0.9)] rounded-3xl",
        cardInset: isDark
          ? "bg-slate-900/40 border border-cyan-500/20 rounded-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]"
          : "bg-white/30 border border-sky-200/50 rounded-2xl shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
        buttonPrimary: isDark
          ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold rounded-2xl shadow-[0_4px_20px_rgba(34,211,238,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:brightness-110 transition-all"
          : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold rounded-2xl shadow-[0_4px_20px_rgba(14,165,233,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:brightness-110 transition-all",
        buttonSecondary: isDark
          ? "bg-cyan-900/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md rounded-2xl hover:bg-cyan-800/40 transition-all"
          : "bg-white/60 text-slate-700 border border-white backdrop-blur-md rounded-2xl hover:bg-white/80 transition-all",
        input: isDark
          ? "bg-slate-950/50 text-cyan-100 border border-cyan-400/30 rounded-2xl p-3 focus:border-cyan-400 focus:outline-none backdrop-blur-md"
          : "bg-white/60 text-slate-900 border border-sky-200 rounded-2xl p-3 focus:border-sky-400 focus:outline-none backdrop-blur-md",
        accent: isDark ? "text-cyan-300" : "text-sky-600",
        border: isDark ? "border-cyan-400/30" : "border-sky-200/80",
      };

    case "minimalism":
      return {
        id: "minimalism",
        mode,
        bg: isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]",
        bodyText: isDark ? "text-zinc-100" : "text-zinc-900",
        mutedText: isDark ? "text-zinc-400" : "text-zinc-500",
        card: isDark
          ? "bg-[#121212] border border-zinc-800 rounded-lg shadow-sm"
          : "bg-white border border-zinc-200 rounded-lg shadow-sm",
        cardInset: isDark
          ? "bg-[#18181b] border border-zinc-800/60 rounded-md"
          : "bg-[#f4f4f5] border border-zinc-200/60 rounded-md",
        buttonPrimary: isDark
          ? "bg-zinc-100 text-zinc-900 hover:bg-white font-medium rounded-lg transition-colors"
          : "bg-zinc-900 text-zinc-100 hover:bg-black font-medium rounded-lg transition-colors",
        buttonSecondary: isDark
          ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-medium rounded-lg transition-colors"
          : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 font-medium rounded-lg transition-colors",
        input: isDark
          ? "bg-[#141414] text-zinc-100 border border-zinc-800 rounded-lg p-3 focus:border-zinc-500 focus:outline-none"
          : "bg-white text-zinc-900 border border-zinc-300 rounded-lg p-3 focus:border-zinc-600 focus:outline-none",
        accent: isDark ? "text-zinc-100" : "text-zinc-900",
        border: isDark ? "border-zinc-800" : "border-zinc-200",
      };

    case "maximalism":
      return {
        id: "maximalism",
        mode,
        bg: isDark
          ? "bg-gradient-to-tr from-purple-950 via-fuchsia-950 to-rose-950"
          : "bg-gradient-to-tr from-rose-100 via-purple-100 to-sky-100",
        bodyText: isDark ? "text-pink-100 font-bold" : "text-purple-950 font-bold",
        mutedText: isDark ? "text-purple-300" : "text-purple-700",
        card: isDark
          ? "bg-gradient-to-b from-purple-900/60 to-pink-900/60 border-2 border-fuchsia-400/80 shadow-[0_0_30px_rgba(217,70,239,0.3)] rounded-3xl"
          : "bg-white/90 border-2 border-purple-400 shadow-[0_10px_30px_rgba(168,85,247,0.25)] rounded-3xl",
        cardInset: isDark
          ? "bg-purple-950/80 border border-pink-500/40 rounded-2xl"
          : "bg-purple-50/80 border border-purple-200 rounded-2xl",
        buttonPrimary: isDark
          ? "bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 text-white font-extrabold rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:scale-105 transition-all"
          : "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold rounded-full shadow-[0_8px_20px_rgba(192,38,211,0.4)] hover:scale-105 transition-all",
        buttonSecondary: isDark
          ? "bg-fuchsia-900/40 text-pink-200 border border-fuchsia-400/50 rounded-full hover:bg-fuchsia-800/60 transition-all"
          : "bg-purple-100 text-purple-900 border border-purple-300 rounded-full hover:bg-purple-200 transition-all",
        input: isDark
          ? "bg-purple-950/70 text-pink-100 border-2 border-fuchsia-500/60 rounded-2xl p-3 focus:outline-none"
          : "bg-white text-purple-900 border-2 border-purple-400 rounded-2xl p-3 focus:outline-none",
        accent: isDark ? "text-fuchsia-300" : "text-purple-600",
        border: isDark ? "border-fuchsia-400/60" : "border-purple-300",
      };

    case "terminal":
      return {
        id: "terminal",
        mode,
        bg: isDark ? "bg-[#050b07]" : "bg-[#0d1610]",
        bodyText: "text-emerald-400 font-mono tracking-wide",
        mutedText: "text-emerald-600 font-mono",
        card: "bg-[#07120a] border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-none",
        cardInset: "bg-[#040906] border border-emerald-600/60 rounded-none",
        buttonPrimary: "bg-emerald-500 text-black font-mono font-bold uppercase border-2 border-emerald-400 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all rounded-none",
        buttonSecondary: "bg-emerald-950 text-emerald-300 font-mono border border-emerald-600 hover:bg-emerald-900 transition-all rounded-none",
        input: "bg-[#020503] text-emerald-400 font-mono border-2 border-emerald-500 p-3 focus:outline-none rounded-none",
        accent: "text-emerald-400",
        border: "border-emerald-500/80",
      };

    case "cyberpunk":
      return {
        id: "cyberpunk",
        mode,
        bg: isDark ? "bg-[#0b0c10]" : "bg-[#0f111a]",
        bodyText: "text-pink-400 font-sans",
        mutedText: "text-cyan-400/70",
        card: "bg-[#1f2833]/90 border border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.3)] rounded-xl",
        cardInset: "bg-[#0b0c10]/80 border border-cyan-400/40 rounded-lg",
        buttonPrimary: "bg-gradient-to-r from-pink-500 to-cyan-500 text-black font-extrabold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:brightness-125 transition-all",
        buttonSecondary: "bg-[#1f2833] text-cyan-300 border border-cyan-400/60 rounded-xl hover:bg-cyan-500/20 transition-all",
        input: "bg-[#0b0c10] text-pink-300 border border-pink-500/70 p-3 rounded-xl focus:border-cyan-400 focus:outline-none",
        accent: "text-pink-400",
        border: "border-pink-500/50",
      };

    case "luxury-gold":
      return {
        id: "luxury-gold",
        mode,
        bg: isDark
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40"
          : "bg-gradient-to-b from-amber-50 via-stone-100 to-amber-100/50",
        bodyText: isDark ? "text-amber-100" : "text-stone-900",
        mutedText: isDark ? "text-amber-300/60" : "text-amber-900/60",
        card: isDark
          ? "bg-slate-900/90 border border-amber-400/40 shadow-[0_15px_35px_rgba(217,119,6,0.15)] rounded-2xl"
          : "bg-white/95 border border-amber-300/80 shadow-[0_15px_35px_rgba(217,119,6,0.1)] rounded-2xl",
        cardInset: isDark
          ? "bg-slate-950/80 border border-amber-500/20 rounded-xl"
          : "bg-amber-50/80 border border-amber-200 rounded-xl",
        buttonPrimary: isDark
          ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all"
          : "bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(217,119,6,0.3)] hover:brightness-110 transition-all",
        buttonSecondary: isDark
          ? "bg-slate-800 text-amber-200 border border-amber-500/30 rounded-xl hover:bg-slate-700 transition-all"
          : "bg-amber-100/80 text-amber-950 border border-amber-300 rounded-xl hover:bg-amber-200/80 transition-all",
        input: isDark
          ? "bg-slate-950 text-amber-100 border border-amber-500/30 rounded-xl p-3 focus:border-amber-400 focus:outline-none"
          : "bg-white text-stone-900 border border-amber-300 rounded-xl p-3 focus:border-amber-500 focus:outline-none",
        accent: isDark ? "text-amber-400" : "text-amber-600",
        border: isDark ? "border-amber-500/30" : "border-amber-300",
      };

    case "glassmorphism":
    default:
      return {
        id: "glassmorphism",
        mode,
        bg: isDark
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
          : "bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-100",
        bodyText: isDark ? "text-slate-100" : "text-slate-900",
        mutedText: isDark ? "text-slate-400" : "text-slate-500",
        card: isDark
          ? "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl"
          : "bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl",
        cardInset: isDark
          ? "bg-slate-950/50 backdrop-blur-md border border-white/5 rounded-xl"
          : "bg-slate-100/60 backdrop-blur-md border border-slate-200/50 rounded-xl",
        buttonPrimary: isDark
          ? "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 rounded-xl transition-all"
          : "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 rounded-xl transition-all",
        buttonSecondary: isDark
          ? "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 backdrop-blur-md rounded-xl transition-all"
          : "bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300/60 rounded-xl transition-all",
        input: isDark
          ? "bg-slate-950/60 text-slate-100 border border-white/10 rounded-xl p-3 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
          : "bg-white/80 text-slate-900 border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none backdrop-blur-md",
        accent: isDark ? "text-indigo-400" : "text-indigo-600",
        border: isDark ? "border-white/10" : "border-slate-200",
      };
  }
};
