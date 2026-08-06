import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import api from "../lib/api";

const START_YEAR    = 2026;
const BASE_CELL     = 14;   
const MAX_CELL      = 22;  
const CELL_GAP      = 2;    
const COL_GAP       = 2;    
const MONTH_GAP     = 14;   
const DOW_W         = 16;   
const MONTH_LABEL_H = 20;    
const DAYS_IN_WEEK  = 7;
const MONTHS_SHORT  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];


const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;


function buildMonthSection(year, month, globalStart, globalEnd) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0); 

  const anchor = new Date(firstDay);
  anchor.setDate(anchor.getDate() - anchor.getDay());

  const weeks  = [];
  const cursor = new Date(anchor);

  while (cursor <= lastDay) {
    const week = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const day          = new Date(cursor);
      const inThisMonth  = day.getMonth() === month && day.getFullYear() === year;
      const inGlobal     = day >= globalStart && day <= globalEnd;
      week.push({
        date:        toDateKey(day),
        inRange:     inThisMonth && inGlobal,   
        avgWpm:      0,
        avgAccuracy: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMonthDefs(yearParam) {
  const today = new Date();
  if (yearParam === "lastYear") {
    const end   = new Date(today);
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);

    const defs = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const cap = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= cap) {
      defs.push({ year: cur.getFullYear(), month: cur.getMonth(), globalStart: start, globalEnd: end });
      cur.setMonth(cur.getMonth() + 1);
    }
    return defs;
  } else {
    const yr         = parseInt(yearParam, 10);
    const globalStart = new Date(yr, 0, 1);
    const globalEnd   = yr < today.getFullYear() ? new Date(yr, 11, 31, 23, 59, 59) : new Date(today);
    const maxMonth    = yr < today.getFullYear() ? 11 : today.getMonth();
    const defs = [];
    for (let m = 0; m <= maxMonth; m++) {
      defs.push({ year: yr, month: m, globalStart, globalEnd });
    }
    return defs;
  }
}

function buildAllSections(yearParam) {
  return getMonthDefs(yearParam).map(({ year, month, globalStart, globalEnd }) => ({
    year, month,
    weeks: buildMonthSection(year, month, globalStart, globalEnd),
  }));
}

function populateSections(sections, apiData) {
  const map = {};
  apiData.forEach(d => { map[d.date] = d; });
  return sections.map(sec => ({
    ...sec,
    weeks: sec.weeks.map(week =>
      week.map(cell => {
        const d = map[cell.date];
        return d && cell.inRange
          ? { ...cell, count: d.count, avgWpm: d.avgWpm, avgAccuracy: d.avgAccuracy }
          : cell;
      })
    ),
  }));
}


function computeLayout(sections, cellSize) {
  let x = 0;
  const sectionLayouts = sections.map((sec, si) => {
    if (si > 0) x += MONTH_GAP;          // gap between month groups
    const labelX      = x;
    const colPositions = sec.weeks.map((_, wi) => {
      const pos = x;
      x += cellSize + (wi < sec.weeks.length - 1 ? COL_GAP : 0);
      return pos;
    });
    return { labelX, colPositions };
  });
  return { sectionLayouts, totalWidth: x };
}


function idealCellSize(sections, availablePx) {
  const totalCols  = sections.reduce((s, sec) => s + sec.weeks.length, 0);
  const numSecs    = sections.length;
  if (totalCols === 0 || availablePx <= 0) return BASE_CELL;
  const fixedPx = (totalCols - numSecs) * COL_GAP + Math.max(numSecs - 1, 0) * MONTH_GAP + 16;
  const cell    = Math.floor((availablePx - fixedPx) / totalCols);
  return Math.max(BASE_CELL, Math.min(MAX_CELL, cell));
}



const COLOR_LEVELS = [
  // level 1 – 1 test
  { bg: "rgba(22,163,74,0.22)",  sh: "none",                                                                  bd: "rgba(22,163,74,0.38)" },
  // level 2 – 2-3 tests
  { bg: "rgba(22,163,74,0.45)",  sh: "0 0 4px rgba(22,163,74,0.45)",                                          bd: "rgba(22,163,74,0.60)" },
  // level 3 – 4-6 tests
  { bg: "rgba(22,163,74,0.68)",  sh: "0 0 7px rgba(22,163,74,0.65)",                                          bd: "rgba(22,163,74,0.82)" },
  // level 4 – 7-10 tests
  { bg: "rgba(34,197,94,0.85)",  sh: "0 0 12px rgba(34,197,94,0.75)",                                         bd: "rgba(34,197,94,0.92)" },
  // level 5 – 11+ tests: max glow
  { bg: "rgba(74,222,128,1)",    sh: "0 0 16px rgba(74,222,128,1), 0 0 30px rgba(74,222,128,0.55)",           bd: "#4ade80"               },
];

function getCellColor(count, maxCount) {
  if (!count) return null;


  let level;
  if      (count === 1)  level = 0;   // dim
  else if (count <= 3)   level = 1;
  else if (count <= 6)   level = 2;
  else if (count <= 10)  level = 3;
  else                   level = 4;   // 11+ → always max glow

  
  if (maxCount >= 2 && count === maxCount) level = 4;

  return COLOR_LEVELS[level];
}

function isInViewport(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.9 && r.bottom > 0;
}


export default function HistoryHeatmap({ themeConfig, userId }) {
  const currentYear = new Date().getFullYear();

  const buildYearOptions = useCallback(() => {
    const opts = [{ value: "lastYear", label: "Last 12 Months" }];
    for (let y = START_YEAR; y <= currentYear; y++)
      opts.push({ value: String(y), label: String(y) });
    return opts;
  }, [currentYear]);

  const [yearOptions, setYearOptions]   = useState(buildYearOptions);
  const [selectedYear, setSelectedYear] = useState("lastYear");
  const [sections, setSections]         = useState([]);
  const [cellSize, setCellSize]         = useState(BASE_CELL);
  const [maxCount, setMaxCount]         = useState(1);
  const [totalTests, setTotalTests]     = useState(0);
  const [activeDays, setActiveDays]     = useState(0);
  const [loading, setLoading]           = useState(false);


  const [phase, setPhase]               = useState("idle");
  const [fallReady, setFallReady]       = useState(false);
  const [revealedGlobalIdx, setRevealedGlobalIdx] = useState(-1);
  const sweepRef     = useRef(null);
  const sectionsRef  = useRef([]);
  const totalColsRef = useRef(0);
  const hasAnimated  = useRef(false);
  const dataReady    = useRef(false);


  const [tooltip, setTooltip]  = useState({ visible: false, x: 0, y: 0, cell: null });
  const gridAreaRef = useRef(null);


  const cardRef   = useRef(null);
  const scrollRef = useRef(null); 


  const recalcCellSize = useCallback((sects) => {
    if (!scrollRef.current || !sects.length) return;
    const avail = scrollRef.current.clientWidth - DOW_W - 4;
    const cs    = idealCellSize(sects, avail);
    setCellSize(prev => (prev === cs ? prev : cs));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recalcCellSize(sectionsRef.current));
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcCellSize]);


  const startAnimation = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    dataReady.current   = false;
    clearInterval(sweepRef.current);
    setRevealedGlobalIdx(-1);
    setPhase("fall");
    requestAnimationFrame(() => setTimeout(() => setFallReady(true), 40));
  }, []);


  const fetchData = useCallback(async (year) => {
    hasAnimated.current = false;
    dataReady.current   = false;
    clearInterval(sweepRef.current);

    setLoading(true);
    setPhase("idle");
    setFallReady(false);
    setRevealedGlobalIdx(-1);

    const rawSections = buildAllSections(year);
    sectionsRef.current  = rawSections;
    totalColsRef.current = rawSections.reduce((s, sec) => s + sec.weeks.length, 0);
    setSections(rawSections);
    recalcCellSize(rawSections);

    try {
      const endpoint = userId
        ? `/GrowTyping/v1/stats/public-history-heatmap/${userId}?year=${year}`
        : `/GrowTyping/v1/stats/history-heatmap?year=${year}`;
      const res     = await api.get(endpoint);
      const apiData = res.data?.data || [];

      apiData.forEach(d => {
        const yr = parseInt(d.date.slice(0, 4), 10);
        if (yr > currentYear) {
          setYearOptions(prev =>
            prev.find(o => o.value === String(yr))
              ? prev
              : [...prev, { value: String(yr), label: String(yr) }]
          );
        }
      });

      const populated = populateSections(rawSections, apiData);
      const allCounts = populated.flatMap(sec => sec.weeks.flatMap(w => w.map(c => c.count)));
      const mx     = Math.max(...allCounts, 1);
      const total  = apiData.reduce((s, d) => s + d.count, 0);
      const active = apiData.filter(d => d.count > 0).length;

      sectionsRef.current = populated;
      setSections(populated);
      setMaxCount(mx);
      setTotalTests(total);
      setActiveDays(active);
    } catch (_) { /* keep empty grid */ }

    setLoading(false);
    dataReady.current = true;
    if (isInViewport(cardRef.current)) startAnimation();
  }, [currentYear, userId, recalcCellSize, startAnimation]);

  useEffect(() => { fetchData(selectedYear); }, [selectedYear, fetchData]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && dataReady.current && !hasAnimated.current)
          startAnimation();
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startAnimation]);

  useEffect(() => {
    if (phase !== "fall" || !fallReady) return;
    const t = setTimeout(() => {
      setPhase("sweep");
      setRevealedGlobalIdx(totalColsRef.current); 
    }, 1200);
    return () => clearTimeout(t);
  }, [phase, fallReady]);


  useEffect(() => {
    if (phase !== "sweep") return;
    let cur = totalColsRef.current;
    const tick = () => {
      cur -= 1;
      setRevealedGlobalIdx(cur);
      if (cur <= 0) { clearInterval(sweepRef.current); setPhase("done"); }
    };
    sweepRef.current = setInterval(tick, 18);
    return () => clearInterval(sweepRef.current);
  }, [phase]);


  const handleCellEnter = (e, cell) => {
    if (!cell.inRange) return;
    const cr = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,

      x: cr.left + cr.width / 2,
      y: cr.top,
      cell,
    });
  };
  const handleCellLeave = () => setTooltip(t => ({ ...t, visible: false }));


  const { sectionLayouts, totalWidth } = useMemo(
    () => computeLayout(sections, cellSize),
    [sections, cellSize]
  );

  const gridH = DAYS_IN_WEEK * cellSize + (DAYS_IN_WEEK - 1) * CELL_GAP;

  const sectionGlobalStart = useMemo(() => {
    let acc = 0;
    return sections.map(sec => { const s = acc; acc += sec.weeks.length; return s; });
  }, [sections]);


  const sweepLineX = useMemo(() => {
    if (phase !== "sweep" || revealedGlobalIdx < 0 || !sections.length) return null;
    let acc = 0;
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      if (acc + sec.weeks.length > revealedGlobalIdx) {
        const wi  = revealedGlobalIdx - acc;
        const lx  = (sectionLayouts[si]?.colPositions[wi] ?? 0) + cellSize / 2 - 1;
        return lx;
      }
      acc += sec.weeks.length;
    }
    return null;
  }, [phase, revealedGlobalIdx, sections, sectionLayouts, cellSize]);


  return (
    <div
      ref={cardRef}
      className={`${themeConfig.card} border ${themeConfig.border} p-5 sm:p-6`}
      style={{ position: "relative" }}
    >
      <style>{HEATMAP_CSS}</style>

  
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h2 className={`text-base font-extrabold ${themeConfig.bodyText} flex items-center gap-2`}>
            <span style={{ fontSize: "1.05rem" }}></span> Test Activity Heatmap
          </h2>
          <p className={`text-xs mt-0.5 ${themeConfig.mutedText}`}>
            {totalTests > 0 ? (
              <>
                <strong className={themeConfig.bodyText}>{totalTests}</strong> tests ·{" "}
                <strong className={themeConfig.bodyText}>{activeDays}</strong> active days
              </>
            ) : "No test data for this period"}
          </p>
        </div>

        {/* Dropdown */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${themeConfig.mutedText}`}>
            Period:
          </span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer focus:outline-none ${themeConfig.input}`}
            style={{ minWidth: 138 }}
          >
            {yearOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-2 mb-4" style={{ fontSize: 10, color: "rgba(148,163,184,0.7)" }}>
        <span>Less</span>
        {[0, 0.2, 0.45, 0.72, 1].map((r, i) => {
          const col = r === 0 ? null : getCellColor(r * 10, 10);
          return (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: 3,
              background:  col?.bg ?? "rgba(148,163,184,0.12)",
              boxShadow:   col?.sh ?? "none",
              border:      `1px solid ${col?.bd ?? "rgba(148,163,184,0.2)"}`,
            }} />
          );
        })}
        <span>More</span>
      </div>

      {/* ── Grid wrapper ── */}
      <div ref={scrollRef} style={{ overflowX: "hidden", overflowY: "visible", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>

          {/* Day-of-week labels */}
          <div style={{ flexShrink: 0, width: DOW_W, marginRight: 4, marginTop: MONTH_LABEL_H }}>
            {["", "M", "", "W", "", "F", ""].map((lbl, i) => (
              <div
                key={i}
                style={{
                  height: cellSize, lineHeight: `${cellSize}px`,
                  marginBottom: i < 6 ? CELL_GAP : 0,
                  fontSize: 9, color: "rgba(148,163,184,0.55)",
                  fontWeight: 700, textAlign: "right", userSelect: "none",
                }}
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* Absolutely-positioned grid area */}
          <div
            ref={gridAreaRef}
            style={{
              position: "relative",
              width: totalWidth,
              height: MONTH_LABEL_H + gridH,
              flexShrink: 0,
            }}
          >
            {loading && (
              <div className="hm-loading">
                <span className={`text-xs animate-pulse font-medium ${themeConfig.mutedText}`}>Loading…</span>
              </div>
            )}

            {/* Render each month section */}
            {sections.map((sec, si) => {
              const { labelX, colPositions } = sectionLayouts[si] ?? { labelX: 0, colPositions: [] };
              const secStart = sectionGlobalStart[si] ?? 0;

              return (
                <React.Fragment key={`${sec.year}-${sec.month}`}>

                  {/* Month label */}
                  <span style={{
                    position:   "absolute",
                    left:       labelX,
                    top:        0,
                    height:     MONTH_LABEL_H,
                    lineHeight: `${MONTH_LABEL_H}px`,
                    fontSize:   10,
                    color:      "rgba(148,163,184,0.78)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}>
                    {MONTHS_SHORT[sec.month]}
                  </span>

                  {/* Week columns — only days in this month are inRange */}
                  {sec.weeks.map((week, wi) => {
                    const globalIdx  = secStart + wi;
                    const isRevealed = phase === "done" || (phase === "sweep" && globalIdx >= revealedGlobalIdx);

                    return (
                      <div
                        key={wi}
                        className={fallReady ? "hm-col-animate" : "hm-col"}
                        style={{
                          position:       "absolute",
                          left:           colPositions[wi] ?? 0,
                          top:            MONTH_LABEL_H,
                          width:          cellSize,
                          animationDelay: fallReady ? `${globalIdx * 6}ms` : "0ms",
                        }}
                      >
                        {week.map((cell, di) => {
                          const col     = isRevealed ? getCellColor(cell.count, maxCount) : null;
                          const isEmpty = !cell.inRange;
                          return (
                            <div
                              key={di}
                              className={`hm-cell${!isEmpty && cell.count > 0 ? " hm-cell-active" : ""}`}
                              onMouseEnter={e => handleCellEnter(e, cell)}
                              onMouseLeave={handleCellLeave}
                              style={{
                                width:        cellSize,
                                height:       cellSize,
                                marginBottom: di < 6 ? CELL_GAP : 0,
                                borderRadius: 3,
                                boxSizing:    "border-box",
                                cursor: cell.inRange && cell.count > 0 ? "pointer" : "default",
                                transition: isRevealed
                                  ? "background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease"
                                  : "none",
                                background: col?.bg  ?? (isEmpty ? "transparent" : "rgba(148,163,184,0.1)"),
                                border:    `1px solid ${col?.bd ?? (isEmpty ? "transparent" : "rgba(148,163,184,0.13)")}`,
                                boxShadow: col?.sh ?? "none",
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Sweep line */}
            {phase === "sweep" && sweepLineX !== null && (
              <div className="hm-sweep-line" style={{ left: sweepLineX, top: MONTH_LABEL_H }} />
            )}

          </div>
        </div>
      </div>

      {/* ── Tooltip rendered at fixed viewport position – never clipped ── */}
      {tooltip.visible && tooltip.cell?.inRange && (
        <div
          className="hm-tooltip"
          style={{
            position:      "fixed",
            left:          tooltip.x,
            top:           tooltip.y,
            transform:     "translate(-50%, calc(-100% - 10px))",
            pointerEvents: "none",
            zIndex:        9999,
          }}
        >
          <p className="hm-tt-date">{tooltip.cell.date}</p>
          {tooltip.cell.count > 0 ? (
            <>
              <p><span className="hm-tt-lbl">Tests: </span><strong>{tooltip.cell.count}</strong></p>
              <p><span className="hm-tt-lbl">Avg WPM: </span><strong className="hm-tt-wpm">{tooltip.cell.avgWpm}</strong></p>
              <p><span className="hm-tt-lbl">Avg Acc: </span><strong className="hm-tt-acc">{tooltip.cell.avgAccuracy}%</strong></p>
            </>
          ) : (
            <p className="hm-tt-empty">No tests on this day</p>
          )}
        </div>
      )}
    </div>
  );
}



const HEATMAP_CSS = `
/* columns hidden before animation fires */
.hm-col { opacity: 0; }

/* column fall-in */
.hm-col-animate {
  animation: hmColDrop 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes hmColDrop {
  0%   { transform: translateY(-180px); opacity: 0; }
  55%  { transform: translateY(6px);    opacity: 1; }
  75%  { transform: translateY(-3px); }
  100% { transform: translateY(0);      opacity: 1; }
}

/* sweep line */
.hm-sweep-line {
  position: absolute;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(74,222,128,0)   0%,
    rgba(74,222,128,0.9) 35%,
    rgba(74,222,128,0.9) 65%,
    rgba(74,222,128,0)   100%
  );
  box-shadow: 0 0 10px 3px rgba(74,222,128,0.55);
  pointer-events: none;
  z-index: 20;
  border-radius: 1px;
  transition: left 18ms linear;
}

/* cell hover */
.hm-cell { display: block; }
.hm-cell-active:hover {
  transform: scale(1.45);
  z-index: 10;
  transition: transform 0.1s ease !important;
}

/* tooltip */
.hm-tooltip {
  background:   rgba(8,12,22,0.97);
  border:       1px solid rgba(74,222,128,0.32);
  border-radius: 8px;
  padding:      8px 12px;
  font-size:    11px;
  color:        #e2e8f0;
  min-width:    148px;
  box-shadow:   0 8px 28px rgba(0,0,0,0.65), 0 0 12px rgba(74,222,128,0.12);
  line-height:  1.65;
}
.hm-tt-date {
  font-weight:   700;
  font-size:     10.5px;
  color:         rgba(148,163,184,0.8);
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(74,222,128,0.18);
  padding-bottom: 4px;
}
.hm-tt-lbl   { color: rgba(148,163,184,0.65); }
.hm-tt-wpm   { color: #4ade80; }
.hm-tt-acc   { color: #818cf8; }
.hm-tt-empty { color: rgba(148,163,184,0.45); font-style: italic; }

/* loading */
.hm-loading {
  position:        absolute;
  inset:           0;
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      rgba(0,0,0,0.3);
  border-radius:   6px;
  backdrop-filter: blur(2px);
  z-index:         50;
}
`;
