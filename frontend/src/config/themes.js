export const themes = {
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
  contrastBw: {
    bg: "from-black via-slate-950 to-black",
    text: "text-white",
    primary: "white",
    card: "bg-black border-white/80 backdrop-blur-md shadow-2xl ring-2 ring-white/60",
    button:
      "bg-white/95 hover:bg-white text-black border-white shadow-xl hover:shadow-white/60 font-bold",
  },

  // Navy & Gold Contrast - Executive professional with high visibility
  contrastNG: {
    bg: "from-slate-950 via-blue-950 to-slate-950",
    text: "text-white",
    primary: "yellow",
    card: "bg-slate-800/95 border-yellow-300/80 backdrop-blur-md shadow-2xl ring-2 ring-yellow-400/50",
    button:
      "bg-gradient-to-r from-yellow-400 to-amber-300 text-slate-950 border-yellow-300 shadow-xl hover:shadow-yellow-400/60 font-bold",
  },

  // Dark & Lime Contrast - Modern tech professional
  contrastLime: {
    bg: "from-slate-950 via-gray-950 to-slate-950",
    text: "text-lime-50",
    primary: "lime",
    card: "bg-slate-800/95 border-lime-400/80 backdrop-blur-md shadow-2xl ring-2 ring-lime-500/50",
    button:
      "bg-gradient-to-r from-lime-400 to-green-400 text-slate-950 border-lime-400 shadow-xl hover:shadow-lime-400/70 font-bold",
  },

  // Charcoal & Cyan Contrast - Professional tech aesthetic
  contrastCyan: {
    bg: "from-gray-950 via-slate-950 to-gray-950",
    text: "text-cyan-100",
    primary: "cyan",
    card: "bg-slate-800/95 border-cyan-300/80 backdrop-blur-md shadow-2xl ring-2 ring-cyan-400/50",
    button:
      "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-400 shadow-xl hover:shadow-cyan-400/70 font-bold",
  },

  // Deep Purple & White Contrast - Clean business professional
  contrastPurple: {
    bg: "from-slate-950 via-purple-950 to-slate-950",
    text: "text-white",
    primary: "purple",
    card: "bg-slate-800/95 border-purple-400/80 backdrop-blur-md shadow-2xl ring-2 ring-purple-500/60",
    button:
      "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-purple-400 shadow-xl hover:shadow-purple-500/70 font-bold",
  },

  // Charcoal & Orange Contrast - Energetic professional
  contrastOrange: {
    bg: "from-slate-950 via-gray-950 to-slate-950",
    text: "text-orange-50",
    primary: "orange",
    card: "bg-slate-800/95 border-orange-400/80 backdrop-blur-md shadow-2xl ring-2 ring-orange-500/50",
    button:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-xl hover:shadow-orange-500/70 font-bold",
  },

  // Deep Blue & White Contrast - Corporate professional
  contrastBlue: {
    bg: "from-slate-950 via-blue-950 to-slate-950",
    text: "text-white",
    primary: "blue",
    card: "bg-slate-800/95 border-blue-400/80 backdrop-blur-md shadow-2xl ring-2 ring-blue-500/60",
    button:
      "bg-gradient-to-r from-blue-500 to-sky-500 text-white border-blue-400 shadow-xl hover:shadow-blue-500/70 font-bold",
  },

  // Charcoal & Red Contrast - Attention-grabbing professional
  contrastRed: {
    bg: "from-slate-950 via-gray-950 to-slate-950",
    text: "text-red-50",
    primary: "red",
    card: "bg-slate-800/95 border-red-400/80 backdrop-blur-md shadow-2xl ring-2 ring-red-500/50",
    button:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400 shadow-xl hover:shadow-red-500/70 font-bold",
  },
};
