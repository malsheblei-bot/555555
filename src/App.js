import { useState, useRef, useEffect } from "react";
import {
  Home,
  Apple,
  Dumbbell,
  Heart,
  TrendingUp,
  Plus,
  Check,
  X,
  Flame,
  Droplets,
  Star,
  Search,
  Trophy,
  Target,
  Settings,
  Moon,
  Activity,
  ChevronLeft,
} from "lucide-react";

// ─── SEEDED DATA ───────────────────────────────────────────
function genHistory(baseline, variance, seed) {
  let s = seed >>> 0;
  const r = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  let v = baseline;
  const out = [];
  for (let i = 0; i < 365; i++) {
    v += (r() - 0.5) * variance * 0.45;
    v = Math.max(
      baseline - variance * 1.4,
      Math.min(baseline + variance * 1.4, v)
    );
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}
function getGraphData(data, period) {
  if (!data || data.length === 0) return [];
  const n =
    { Week: 7, Month: 30, "3M": 90, "6M": 180, Year: 365 }[period] || 30;
  const raw = data.slice(-Math.min(n, data.length));
  if (raw.length <= 30) return raw;
  const step = Math.ceil(raw.length / 30);
  return raw.filter((_, i) => i % step === 0 || i === raw.length - 1);
}
const fmtSleep = (h) => {
  const hr = Math.floor(h),
    mn = Math.round((h - hr) * 60);
  return mn ? `${hr}h ${mn}m` : `${hr}h`;
};

const HEALTH_METRICS = [
  {
    key: "rr",
    label: "RR",
    name: "Respiratory Rate",
    icon: "🫁",
    value: 20.6,
    unit: "rpm",
    trend: "up",
    trendLabel: "Higher",
    trendColor: "#FF7043",
    min: 10,
    max: 30,
    data: genHistory(16, 3, 42),
  },
  {
    key: "rhr",
    label: "RHR",
    name: "Resting Heart Rate",
    icon: "🩷",
    value: 55.4,
    unit: "bpm",
    trend: "down",
    trendLabel: "Lower",
    trendColor: "#5C9EFF",
    min: 40,
    max: 100,
    data: genHistory(64, 10, 71),
  },
  {
    key: "hrv",
    label: "HRV",
    name: "Heart Rate Variability",
    icon: "〰️",
    value: 40.7,
    unit: "ms",
    trend: "down",
    trendLabel: "Lower",
    trendColor: "#FF7043",
    min: 15,
    max: 90,
    data: genHistory(55, 15, 33),
  },
  {
    key: "spo2",
    label: "SpO2",
    name: "Blood Oxygen",
    icon: "💧",
    value: null,
    unit: "%",
    trend: null,
    trendLabel: null,
    trendColor: "#888",
    min: 90,
    max: 100,
    data: [],
  },
  {
    key: "temp",
    label: "Temp",
    name: "Temperature",
    icon: "🌡️",
    value: null,
    unit: "°F",
    trend: null,
    trendLabel: null,
    trendColor: "#888",
    min: 96,
    max: 101,
    data: [],
  },
  {
    key: "sleep",
    label: "Sleep",
    name: "Sleep Duration",
    icon: "🛏️",
    value: 5.35,
    unit: "h",
    trend: "down",
    trendLabel: "Lower",
    trendColor: "#FF7043",
    min: 3,
    max: 10,
    data: genHistory(7.2, 1.5, 88),
  },
];

const EXERCISES = [
  {
    id: 1,
    name: "Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
    pr: 225,
  },
  {
    id: 2,
    name: "Incline DB Press",
    muscle: "Chest",
    equipment: "Dumbbell",
    pr: 75,
  },
  { id: 3, name: "Push-Up", muscle: "Chest", equipment: "Bodyweight", pr: 50 },
  { id: 4, name: "Squat", muscle: "Legs", equipment: "Barbell", pr: 315 },
  { id: 5, name: "Leg Press", muscle: "Legs", equipment: "Machine", pr: 450 },
  {
    id: 6,
    name: "Romanian Deadlift",
    muscle: "Legs",
    equipment: "Barbell",
    pr: 225,
  },
  { id: 7, name: "Deadlift", muscle: "Back", equipment: "Barbell", pr: 365 },
  { id: 8, name: "Pull-Up", muscle: "Back", equipment: "Bodyweight", pr: 15 },
  { id: 9, name: "Lat Pulldown", muscle: "Back", equipment: "Cable", pr: 160 },
  {
    id: 10,
    name: "Barbell Row",
    muscle: "Back",
    equipment: "Barbell",
    pr: 185,
  },
  {
    id: 11,
    name: "Overhead Press",
    muscle: "Shoulders",
    equipment: "Barbell",
    pr: 135,
  },
  {
    id: 12,
    name: "Lateral Raise",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    pr: 35,
  },
  { id: 13, name: "Bicep Curl", muscle: "Arms", equipment: "Dumbbell", pr: 50 },
  {
    id: 14,
    name: "Tricep Pushdown",
    muscle: "Arms",
    equipment: "Cable",
    pr: 70,
  },
  { id: 15, name: "Plank", muscle: "Core", equipment: "Bodyweight", pr: 120 },
  { id: 16, name: "Cable Crunch", muscle: "Core", equipment: "Cable", pr: 80 },
];

const FOODS = [
  { id: 1, name: "Chicken Breast (100g)", cal: 165, p: 31, c: 0, f: 3.6 },
  { id: 2, name: "Brown Rice (1 cup)", cal: 216, p: 5, c: 45, f: 1.8 },
  { id: 3, name: "Whole Egg", cal: 72, p: 6, c: 0.4, f: 5 },
  { id: 4, name: "Oatmeal (100g dry)", cal: 389, p: 17, c: 66, f: 7 },
  { id: 5, name: "Salmon (100g)", cal: 208, p: 20, c: 0, f: 13 },
  { id: 6, name: "Greek Yogurt (200g)", cal: 130, p: 22, c: 9, f: 0.7 },
  { id: 7, name: "Banana", cal: 89, p: 1.1, c: 23, f: 0.3 },
  { id: 8, name: "Almonds (30g)", cal: 174, p: 6, c: 6, f: 15 },
  { id: 9, name: "Sweet Potato (100g)", cal: 86, p: 1.6, c: 20, f: 0.1 },
  { id: 10, name: "Whey Protein Shake", cal: 120, p: 25, c: 3, f: 1.5 },
  { id: 11, name: "Avocado (half)", cal: 120, p: 1.5, c: 6, f: 11 },
  { id: 12, name: "Cottage Cheese (100g)", cal: 98, p: 11, c: 3.4, f: 4.3 },
  { id: 13, name: "Canned Tuna", cal: 109, p: 25, c: 0, f: 0.8 },
  { id: 14, name: "Steak (100g)", cal: 250, p: 26, c: 0, f: 17 },
  { id: 15, name: "Broccoli (100g)", cal: 34, p: 2.8, c: 7, f: 0.4 },
];

const BARCODE_FOODS = [
  { name: "Kind Bar (40g)", cal: 200, p: 6, c: 23, f: 10 },
  { name: "Premier Protein Shake", cal: 160, p: 30, c: 5, f: 3 },
  { name: "Chobani Greek Yogurt", cal: 90, p: 15, c: 6, f: 0 },
  { name: "RXBAR (52g)", cal: 210, p: 12, c: 24, f: 9 },
];

const AM_ROUTINE = [
  { step: "Cleanse", desc: "Gentle foaming cleanser, 60 seconds" },
  { step: "Tone", desc: "Alcohol-free toner to balance pH" },
  { step: "Vitamin C Serum", desc: "3–4 drops, brightens & protects" },
  { step: "Eye Cream", desc: "Tap gently around orbital bone" },
  { step: "Moisturize", desc: "Lightweight SPF-free moisturizer" },
  { step: "Sunscreen SPF 50+", desc: "Non-negotiable — 2 full fingers" },
];
const PM_ROUTINE = [
  { step: "Oil Cleanse", desc: "Break down SPF and daily impurities" },
  { step: "Foam Cleanse", desc: "Double cleanse for deep clean" },
  { step: "Exfoliate (3×/wk)", desc: "BHA/AHA — ingrown prevention" },
  { step: "Retinol/Serum", desc: "Retinol or niacinamide" },
  { step: "Eye Cream", desc: "Depuff & hydrate overnight" },
  { step: "Night Moisturizer", desc: "Richer cream for overnight repair" },
];
const SHAVE_TIPS = [
  "Always shave with the grain first — never against it on the first pass.",
  "Use a single-blade safety razor to dramatically reduce razor bumps.",
  "Warm your face with a hot towel for 2 minutes before any shave.",
  "Bevel Priming Oil before shave gel creates a smoother, closer glide.",
  "Finish with a soothing balm — never alcohol — to calm the skin.",
  "Exfoliate 24 hours before shaving to lift embedded hairs.",
];

const BG = "#0d0d0f",
  CARD = "#1c1c1e",
  CARD2 = "#252528";
const COLORS = {
  home: "#FF6B35",
  nutrition: "#4CAF50",
  workout: "#2979FF",
  grooming: "#AB47BC",
  progress: "#FF9800",
};

// ─── COMPONENTS ────────────────────────────────────────────
function Ring({ value, max, color, size = 80, label, displayVal = null }) {
  const r = size / 2 - 7,
    circ = 2 * Math.PI * r,
    pct = Math.min(value / max, 1);
  const dash = pct * circ,
    cx = size / 2,
    cy = size / 2;
  const txt = displayVal !== null ? displayVal : value;
  const fs = size > 90 ? 14 : size > 70 ? 11 : 10;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#2e2e32"
          strokeWidth={6}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray .4s" }}
        />
        <text
          x={cx}
          y={cy + fs / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={fs}
          fontWeight="700"
        >
          {txt}
        </text>
      </svg>
      {label && <span style={{ fontSize: 10, color: "#777" }}>{label}</span>}
    </div>
  );
}
function C({ children, p = 16, mb = 12, style = {} }) {
  return (
    <div
      style={{
        background: CARD,
        borderRadius: 16,
        padding: p,
        marginBottom: mb,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function H({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: "#666",
        fontWeight: 600,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        margin: "0 0 10px",
      }}
    >
      {children}
    </p>
  );
}
function VertGauge({ value, min, max, color }) {
  const has = value !== null && value !== undefined;
  const gh = 76,
    tw = 11;
  const pct = has
    ? Math.max(0.06, Math.min(0.94, (value - min) / (max - min)))
    : 0.5;
  const ky = (1 - pct) * (gh - 16) + 8;
  return (
    <div style={{ width: 26, height: gh, position: "relative", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 0,
          bottom: 0,
          width: tw,
          background: "#2a2a2e",
          borderRadius: tw / 2,
        }}
      />
      {has && (
        <>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: tw,
              height: `${gh - ky - 8}px`,
              background: `${color}50`,
              borderRadius: tw / 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: ky,
              transform: "translate(-50%,0)",
              width: 17,
              height: 17,
              background: color,
              borderRadius: "50%",
              border: "2.5px solid #1c1c1e",
              zIndex: 2,
            }}
          />
        </>
      )}
    </div>
  );
}
function MetricCard({ m, onClick }) {
  const has = m.value !== null;
  const dispVal = m.key === "sleep" ? fmtSleep(m.value) : m.value;
  return (
    <button
      onClick={onClick}
      style={{
        background: CARD2,
        borderRadius: 16,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        textAlign: "left",
        border: "1px solid #2a2a2e",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              color: "#777",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 14 }}>{m.icon}</span>
            {m.label}
          </p>
          {has ? (
            <>
              <p style={{ margin: "0 0 8px", lineHeight: 1 }}>
                <span
                  style={{
                    fontSize: m.key === "sleep" ? 22 : 28,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {dispVal}
                </span>
                {m.key !== "sleep" && (
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>
                    {m.unit}
                  </span>
                )}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    background: m.trendColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>
                    {m.trend === "up" ? "↑" : "↓"}
                  </span>
                </div>
                <span
                  style={{ color: m.trendColor, fontSize: 13, fontWeight: 600 }}
                >
                  {m.trendLabel}
                </span>
              </div>
            </>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#444",
                lineHeight: 1.3,
              }}
            >
              No
              <br />
              data
            </p>
          )}
        </div>
        <VertGauge
          value={m.value}
          min={m.min}
          max={m.max}
          color={has ? m.trendColor : "#444"}
        />
      </div>
    </button>
  );
}
function LineChart({ data, color, mk, h = 150 }) {
  if (!data || data.length < 2)
    return (
      <div
        style={{
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#444" }}>No data</p>
      </div>
    );
  const W = 340,
    H = h,
    pl = 4,
    pr = 4,
    pt = 14,
    pb = 20;
  const cW = W - pl - pr,
    cH = H - pt - pb;
  const mn = Math.min(...data),
    mx = Math.max(...data),
    rng = mx - mn || 1;
  const pts = data.map((v, i) => ({
    x: pl + (i / (data.length - 1)) * cW,
    y: pt + cH - ((v - mn) / rng) * cH,
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1],
      p1 = pts[i],
      cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y} ${cx} ${p1.y} ${p1.x} ${p1.y}`;
  }
  const fill = d + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const gid = `g_${mk}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: h, display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f, i) => (
        <line
          key={i}
          x1={pl}
          y1={pt + cH * (1 - f)}
          x2={pl + cW}
          y2={pt + cH * (1 - f)}
          stroke="#2a2a2e"
          strokeWidth="1"
        />
      ))}
      <path d={fill} fill={`url(#${gid})`} />
      <path
        d={d}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── APP ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");

  // ── NUTRITION GOALS ──
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const [proteinGoal, setProteinGoal] = useState(180);
  const [carbsGoal, setCarbsGoal] = useState(250);
  const [fatGoal, setFatGoal] = useState(73);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalSection, setGoalSection] = useState("main");
  const [goalMode, setGoalMode] = useState("grams");
  const [tCal, setTCal] = useState(2200);
  const [tP, setTP] = useState(180);
  const [tC, setTC] = useState(250);
  const [tF, setTF] = useState(73);
  const [tPPct, setTPPct] = useState(33);
  const [tCPct, setTCPct] = useState(45);
  const [tFPct, setTFPct] = useState(22);
  const pctSum = tPPct + tCPct + tFPct;

  // ── SAVED MEALS ──
  const [savedMeals, setSavedMeals] = useState([
    {
      id: 1,
      name: "Breakfast Power Bowl",
      cal: 520,
      p: 35,
      c: 60,
      f: 12,
      fav: false,
    },
    {
      id: 2,
      name: "Post-Workout Shake",
      cal: 350,
      p: 40,
      c: 30,
      f: 8,
      fav: false,
    },
    { id: 3, name: "Chicken & Rice", cal: 480, p: 45, c: 52, f: 8, fav: true },
    {
      id: 4,
      name: "Greek Yogurt + Fruit",
      cal: 230,
      p: 22,
      c: 28,
      f: 3,
      fav: false,
    },
  ]);
  const [newMeal, setNewMeal] = useState({
    name: "",
    cal: "",
    p: "",
    c: "",
    f: "",
  });
  const [addingLibMeal, setAddingLibMeal] = useState(false);
  const [libAddStep, setLibAddStep] = useState("options");
  const [libBarcodeDone, setLibBarcodeDone] = useState(false);
  const [libBarcodeFood, setLibBarcodeFood] = useState(null);
  const libBarcodeRef = useRef(null);
  const sortedMeals = [...savedMeals].sort((a, b) => b.fav - a.fav);
  const toggleFav = (id) =>
    setSavedMeals((p) =>
      p.map((m) => (m.id === id ? { ...m, fav: !m.fav } : m))
    );
  const deleteLibMeal = (id) =>
    setSavedMeals((p) => p.filter((m) => m.id !== id));
  const openLibAdd = () => {
    setAddingLibMeal(true);
    setLibAddStep("options");
    setLibBarcodeDone(false);
    setLibBarcodeFood(null);
    setNewMeal({ name: "", cal: "", p: "", c: "", f: "" });
  };
  const closeLibAdd = () => {
    setAddingLibMeal(false);
    setLibAddStep("options");
    setLibBarcodeDone(false);
    setLibBarcodeFood(null);
    clearTimeout(libBarcodeRef.current);
  };
  const submitLibMeal = () => {
    if (!newMeal.name && !newMeal.cal) return;
    setSavedMeals((p) => [
      ...p,
      {
        id: Date.now(),
        name: newMeal.name || "Custom Meal",
        cal: Number(newMeal.cal) || 0,
        p: Number(newMeal.p) || 0,
        c: Number(newMeal.c) || 0,
        f: Number(newMeal.f) || 0,
        fav: false,
      },
    ]);
    closeLibAdd();
  };
  const saveLibBarcodeFood = () => {
    if (!libBarcodeFood) return;
    setSavedMeals((p) => [
      ...p,
      { id: Date.now(), ...libBarcodeFood, fav: false },
    ]);
    closeLibAdd();
  };

  useEffect(() => {
    if (
      goalSection === "library" &&
      addingLibMeal &&
      libAddStep === "barcode" &&
      !libBarcodeDone
    ) {
      libBarcodeRef.current = setTimeout(() => {
        const f =
          BARCODE_FOODS[Math.floor(Math.random() * BARCODE_FOODS.length)];
        setLibBarcodeFood({ ...f });
        setLibBarcodeDone(true);
      }, 2500);
    }
    return () => clearTimeout(libBarcodeRef.current);
  }, [goalSection, addingLibMeal, libAddStep, libBarcodeDone]);

  // ── MEALS ──
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [nutTab, setNutTab] = useState("diary");
  const [addingMeal, setAddingMeal] = useState(null);
  const [addStep, setAddStep] = useState("options");
  const [foodSearch, setFoodSearch] = useState("");
  const [manual, setManual] = useState({
    name: "",
    cal: "",
    p: "",
    c: "",
    f: "",
  });
  const [saveManual, setSaveManual] = useState(false);
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  const [barcodeFood, setBarcodeFood] = useState(null);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (addStep === "barcode" && !barcodeScanned) {
      barcodeRef.current = setTimeout(() => {
        const f =
          BARCODE_FOODS[Math.floor(Math.random() * BARCODE_FOODS.length)];
        setBarcodeFood({ ...f, id: Date.now() });
        setBarcodeScanned(true);
      }, 2500);
    }
    return () => clearTimeout(barcodeRef.current);
  }, [addStep, barcodeScanned]);

  const openAddMeal = (mk) => {
    setAddingMeal(mk);
    setAddStep("options");
    setFoodSearch("");
    setBarcodeScanned(false);
    setBarcodeFood(null);
    setManual({ name: "", cal: "", p: "", c: "", f: "" });
    setSaveManual(false);
  };
  const closeMealModal = () => {
    setAddingMeal(null);
    setAddStep("options");
    setBarcodeScanned(false);
    setBarcodeFood(null);
    clearTimeout(barcodeRef.current);
  };
  const addFoodToMeal = (food) => {
    setMeals((p) => ({
      ...p,
      [addingMeal]: [...p[addingMeal], { ...food, uid: Date.now() }],
    }));
    closeMealModal();
  };
  const addManualToMeal = () => {
    const f = {
      name: manual.name || "Custom Food",
      cal: Number(manual.cal) || 0,
      p: Number(manual.p) || 0,
      c: Number(manual.c) || 0,
      f: Number(manual.f) || 0,
      uid: Date.now(),
    };
    setMeals((p) => ({ ...p, [addingMeal]: [...p[addingMeal], f] }));
    if (saveManual)
      setSavedMeals((p) => [...p, { ...f, id: Date.now() + 1, fav: false }]);
    closeMealModal();
  };
  const removeFoodFromMeal = (mk, uid) =>
    setMeals((p) => ({ ...p, [mk]: p[mk].filter((f) => f.uid !== uid) }));

  // ── WATER ──
  const [water, setWater] = useState(3);
  const [waterGoalMl, setWaterGoalMl] = useState(2500);
  const [cupSizeMl, setCupSizeMl] = useState(250);
  const [waterGoalOpen, setWaterGoalOpen] = useState(false);
  const [tmpWaterGoal, setTmpWaterGoal] = useState(2500);
  const [tmpCupSize, setTmpCupSize] = useState(250);
  const waterCups = Math.ceil(waterGoalMl / cupSizeMl);
  const waterConsumedMl = water * cupSizeMl;

  // ── QUICK ADD MEAL ──
  const [quickMealOpen, setQuickMealOpen] = useState(false);
  const [quickMealStep, setQuickMealStep] = useState("pick");
  const [quickMealSlot, setQuickMealSlot] = useState(null);
  const [quickMealOption, setQuickMealOption] = useState(null);
  const [quickBarcodeDone, setQuickBarcodeDone] = useState(false);
  const [quickBarcodeFood, setQuickBarcodeFood] = useState(null);
  const quickBarcodeRef = useRef(null);
  const [quickManual, setQuickManual] = useState({
    name: "",
    cal: "",
    p: "",
    c: "",
    f: "",
  });
  const [quickSaveManual, setQuickSaveManual] = useState(false);
  const [quickFoodSearch, setQuickFoodSearch] = useState("");
  const openQuickMeal = () => {
    setQuickMealStep("pick");
    setQuickMealSlot(null);
    setQuickMealOption(null);
    setQuickMealOpen(true);
  };
  const closeQuickMeal = () => {
    setQuickMealOpen(false);
    setQuickMealStep("pick");
    setQuickMealSlot(null);
    setQuickMealOption(null);
    setQuickBarcodeDone(false);
    setQuickBarcodeFood(null);
    clearTimeout(quickBarcodeRef.current);
  };
  const pickQuickMealSlot = (mk) => {
    setQuickMealSlot(mk);
    setQuickMealStep("options");
  };
  const pickQuickMealOption = (opt) => {
    setQuickMealOption(opt);
    setQuickMealStep("input");

    if (opt === "barcode") {
      setQuickBarcodeDone(false);
      setQuickBarcodeFood(null);
    }

    if (opt === "manual") {
      setQuickManual({ name: "", cal: "", p: "", c: "", f: "" });
      setQuickSaveManual(false);
    }

    if (opt === "saved" || opt === "search") {
      setQuickFoodSearch("");
    }
  };
  const addQuickFood = (food) => {
    setMeals((p) => ({
      ...p,
      [quickMealSlot]: [...p[quickMealSlot], { ...food, uid: Date.now() }],
    }));
    closeQuickMeal();
  };
  const submitQuickManual = () => {
    const f = {
      name: quickManual.name || "Custom Food",
      cal: Number(quickManual.cal) || 0,
      p: Number(quickManual.p) || 0,
      c: Number(quickManual.c) || 0,
      f: Number(quickManual.f) || 0,
      uid: Date.now(),
    };
    setMeals((p) => ({ ...p, [quickMealSlot]: [...p[quickMealSlot], f] }));
    if (quickSaveManual)
      setSavedMeals((p) => [...p, { ...f, id: Date.now() + 1, fav: false }]);
    closeQuickMeal();
  };

  useEffect(() => {
    if (
      quickMealStep === "input" &&
      quickMealOption === "barcode" &&
      !quickBarcodeDone
    ) {
      quickBarcodeRef.current = setTimeout(() => {
        const f =
          BARCODE_FOODS[Math.floor(Math.random() * BARCODE_FOODS.length)];
        setQuickBarcodeFood({ ...f, id: Date.now() });
        setQuickBarcodeDone(true);
      }, 2500);
    }
    return () => clearTimeout(quickBarcodeRef.current);
  }, [quickMealStep, quickMealOption, quickBarcodeDone]);

  // ── FITNESS ──
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [exSearch, setExSearch] = useState("");
  const [currentWorkout, setCurrentWorkout] = useState([]);
  const [wrkTab, setWrkTab] = useState("library");
  const [workoutHistory, setWorkoutHistory] = useState([
    {
      id: 1,
      date: "Apr 20",
      name: "Push Day",
      sets: 18,
      volume: 12450,
      duration: 62,
    },
    {
      id: 2,
      date: "Apr 18",
      name: "Pull Day",
      sets: 20,
      volume: 14200,
      duration: 70,
    },
    {
      id: 3,
      date: "Apr 16",
      name: "Leg Day",
      sets: 16,
      volume: 18300,
      duration: 65,
    },
  ]);
  const [prs, setPrs] = useState({
    "Bench Press": 225,
    Squat: 315,
    Deadlift: 365,
    "Overhead Press": 135,
  });
  const [workoutStreak] = useState(8);
  const [restCountdown, setRestCountdown] = useState(null);
  const restRef = useRef(null);
  const addExToWorkout = (ex) => {
    if (!currentWorkout.find((e) => e.exercise.id === ex.id))
      setCurrentWorkout((p) => [
        ...p,
        {
          exercise: ex,
          sets: [{ reps: 10, weight: ex.pr || 100, done: false }],
        },
      ]);
    setWrkTab("build");
  };
  const addSet = (i) =>
    setCurrentWorkout((p) => {
      const u = JSON.parse(JSON.stringify(p));
      const l = u[i].sets[u[i].sets.length - 1];
      u[i].sets.push({ ...l, done: false });
      return u;
    });
  const updateSet = (i, si, field, val) =>
    setCurrentWorkout((p) => {
      const u = JSON.parse(JSON.stringify(p));
      u[i].sets[si][field] = Number(val);
      return u;
    });
  const toggleSetDone = (i, si) => {
    setCurrentWorkout((p) => {
      const u = JSON.parse(JSON.stringify(p));
      u[i].sets[si].done = !u[i].sets[si].done;
      return u;
    });
    setRestCountdown(90);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(
      () =>
        setRestCountdown((v) => {
          if (v <= 1) {
            clearInterval(restRef.current);
            return null;
          }
          return v - 1;
        }),
      1000
    );
  };
  const finishWorkout = () => {
    const vol = currentWorkout.reduce(
      (s, e) =>
        s +
        e.sets
          .filter((st) => st.done)
          .reduce((ss, st) => ss + st.reps * st.weight, 0),
      0
    );
    const sets = currentWorkout.reduce(
      (s, e) => s + e.sets.filter((st) => st.done).length,
      0
    );
    const np = { ...prs };
    currentWorkout.forEach((e) => {
      const mx = Math.max(...e.sets.filter((s) => s.done).map((s) => s.weight));
      if (!np[e.exercise.name] || mx > np[e.exercise.name])
        np[e.exercise.name] = mx;
    });
    setPrs(np);
    setWorkoutHistory((p) => [
      {
        id: Date.now(),
        date: "Apr 22",
        name: "Today's Workout",
        sets,
        volume: vol,
        duration: 45,
      },
      ...p,
    ]);
    setCurrentWorkout([]);
    setWrkTab("history");
  };

  // ── HEALTH ──
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [graphPeriod, setGraphPeriod] = useState("Month");
  const [groomTab, setGroomTab] = useState("monitor");
  const [amChecked, setAmChecked] = useState(new Array(6).fill(false));
  const [pmChecked, setPmChecked] = useState(new Array(6).fill(false));
  const [groomingStreak] = useState(12);
  const [tipIdx, setTipIdx] = useState(0);
  const products = [
    { name: "Bevel Safety Razor", cat: "Shave", rating: 5, note: "Essential" },
    {
      name: "Bevel Priming Oil",
      cat: "Shave",
      rating: 5,
      note: "Pre-shave must",
    },
    { name: "Bevel Shave Gel", cat: "Shave", rating: 4, note: "Smooth lather" },
    {
      name: "Bevel Restoring Balm",
      cat: "Aftershave",
      rating: 5,
      note: "Soothes bumps",
    },
    {
      name: "CeraVe Foaming Cleanser",
      cat: "Skincare",
      rating: 5,
      note: "Daily staple",
    },
    {
      name: "EltaMD UV Clear SPF 46",
      cat: "SPF",
      rating: 5,
      note: "Great for face",
    },
  ];
  const shaveLog = [
    {
      date: "Apr 21",
      bumps: 0,
      method: "Safety Razor",
      rating: 5,
      notes: "Perfect shave",
    },
    {
      date: "Apr 18",
      bumps: 1,
      method: "Safety Razor",
      rating: 4,
      notes: "Minor irritation",
    },
    {
      date: "Apr 15",
      bumps: 0,
      method: "Safety Razor",
      rating: 5,
      notes: "Smooth",
    },
  ];

  // ── PROGRESS ──
  const [progressTab, setProgressTab] = useState("weight");
  const weightLog = [
    { date: "Apr 15", w: 187.5 },
    { date: "Apr 16", w: 187 },
    { date: "Apr 17", w: 186.5 },
    { date: "Apr 18", w: 186.5 },
    { date: "Apr 19", w: 186 },
    { date: "Apr 20", w: 185.5 },
    { date: "Apr 21", w: 185 },
    { date: "Apr 22", w: 185 },
  ];
  const measurements = { Chest: 42, Waist: 34, Hips: 40, Arms: 15, Thighs: 24 };

  // ── COMPUTED ──
  const allFoods = [
    ...meals.breakfast,
    ...meals.lunch,
    ...meals.dinner,
    ...meals.snacks,
  ];
  const totalCal = Math.round(allFoods.reduce((s, f) => s + f.cal, 0));
  const totalProtein = Math.round(allFoods.reduce((s, f) => s + f.p, 0));
  const totalCarbs = Math.round(allFoods.reduce((s, f) => s + f.c, 0));
  const totalFat = Math.round(allFoods.reduce((s, f) => s + f.f, 0));
  const calRemaining = Math.max(calorieGoal - totalCal, 0);
  const muscles = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  const filteredEx = EXERCISES.filter(
    (e) =>
      (muscleFilter === "All" || e.muscle === muscleFilter) &&
      (!exSearch || e.name.toLowerCase().includes(exSearch.toLowerCase()))
  );
  const amDone = amChecked.filter(Boolean).length;
  const pmDone = pmChecked.filter(Boolean).length;

  const openGoalModal = () => {
    setTCal(calorieGoal);
    setTP(proteinGoal);
    setTC(carbsGoal);
    setTF(fatGoal);
    setTPPct(Math.round(((proteinGoal * 4) / calorieGoal) * 100));
    setTCPct(Math.round(((carbsGoal * 4) / calorieGoal) * 100));
    setTFPct(Math.round(((fatGoal * 9) / calorieGoal) * 100));
    setGoalSection("main");
    setGoalOpen(true);
  };
  const saveGoals = () => {
    setCalorieGoal(tCal);
    if (goalMode === "grams") {
      setProteinGoal(tP);
      setCarbsGoal(tC);
      setFatGoal(tF);
    } else {
      setProteinGoal(Math.round((tCal * tPPct) / 100 / 4));
      setCarbsGoal(Math.round((tCal * tCPct) / 100 / 4));
      setFatGoal(Math.round((tCal * tFPct) / 100 / 9));
    }
    setGoalOpen(false);
  };

  // ── RENDER HOME ──
  const renderHome = () => (
    <div style={{ padding: "52px 16px 16px" }}>
      <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
        Wednesday, April 22
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 18px" }}>
        Dashboard 🏆
      </h1>
      <C>
        <H>Calories & Macros</H>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ring
            value={totalCal}
            max={calorieGoal}
            color={COLORS.nutrition}
            size={108}
            displayVal={totalCal}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Ring
                value={totalProtein}
                max={proteinGoal}
                color="#4CAF50"
                size={66}
                label="Protein"
              />
              <Ring
                value={totalCarbs}
                max={carbsGoal}
                color="#2979FF"
                size={66}
                label="Carbs"
              />
              <Ring
                value={totalFat}
                max={fatGoal}
                color="#FF9800"
                size={66}
                label="Fat"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 8,
              }}
            >
              {[
                { l: "Eaten", v: totalCal, c: "#fff" },
                { l: "Goal", v: calorieGoal, c: "#fff" },
                { l: "Left", v: calRemaining, c: COLORS.nutrition },
              ].map((s) => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {s.l}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 13,
                      color: s.c,
                    }}
                  >
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </C>
      <C>
        <H>Activity & Recovery</H>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Ring
            value={6240}
            max={10000}
            color="#00BCD4"
            size={78}
            label="Steps"
            displayVal="6.2k"
          />
          <Ring
            value={7.5}
            max={9}
            color="#7C4DFF"
            size={78}
            label="Sleep"
            displayVal="7.5h"
          />
          <Ring
            value={78}
            max={100}
            color="#66BB6A"
            size={78}
            label="Recovery"
            displayVal="78%"
          />
        </div>
      </C>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {[
          {
            icon: <Droplets size={18} />,
            val: `${water}/${waterCups}`,
            label: "Water cups",
            bg: "#1a3020",
            c: "#4CAF50",
          },
          {
            icon: <Flame size={18} />,
            val: `${workoutStreak} days`,
            label: "Workout Streak",
            bg: "#2d1a0a",
            c: COLORS.home,
          },
          {
            icon: <Star size={18} />,
            val: `${groomingStreak} days`,
            label: "Grooming Streak",
            bg: "#22102b",
            c: COLORS.grooming,
          },
          {
            icon: <Dumbbell size={18} />,
            val: `${currentWorkout.length} ex.`,
            label: "Fitness Queued",
            bg: "#0d1f35",
            c: COLORS.workout,
          },
        ].map((s, i) => (
          <C
            key={i}
            mb={0}
            style={{ display: "flex", gap: 12, alignItems: "center" }}
          >
            <div
              style={{
                background: s.bg,
                borderRadius: 10,
                padding: 9,
                color: s.c,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                {s.val}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                {s.label}
              </p>
            </div>
          </C>
        ))}
      </div>
      <C>
        <H>Quick Actions</H>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <button
            onClick={openQuickMeal}
            style={{
              background: `${COLORS.nutrition}18`,
              border: `1px solid ${COLORS.nutrition}40`,
              borderRadius: 12,
              padding: "16px 10px",
              color: COLORS.nutrition,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            🍽️ Add Meal
          </button>
          <button
            onClick={() => setTab("workout")}
            style={{
              background: `${COLORS.workout}18`,
              border: `1px solid ${COLORS.workout}40`,
              borderRadius: 12,
              padding: "16px 10px",
              color: COLORS.workout,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            💪 Workout
          </button>
        </div>
      </C>

      {/* QUICK ADD MEAL MODAL */}
      {quickMealOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000c",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              background: CARD,
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxWidth: 390,
              margin: "0 auto",
              padding: 20,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {quickMealStep !== "pick" && (
                  <button
                    onClick={() => {
                      setQuickMealStep(
                        quickMealStep === "input" ? "options" : "pick"
                      );
                      setQuickMealOption(null);
                      setQuickBarcodeDone(false);
                      setQuickBarcodeFood(null);
                      clearTimeout(quickBarcodeRef.current);
                    }}
                    style={{
                      background: CARD2,
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      color: "#aaa",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ← Back
                  </button>
                )}
                <h3 style={{ margin: 0, fontSize: 17 }}>
                  {quickMealStep === "pick" && "Add Meal"}
                  {quickMealStep === "options" && (
                    <span style={{ textTransform: "capitalize" }}>
                      {quickMealSlot}
                    </span>
                  )}
                  {quickMealStep === "input" &&
                    (quickMealOption === "saved"
                      ? "Saved Meals"
                      : quickMealOption === "search"
                      ? "بحث"
                      : quickMealOption === "manual"
                      ? "Manual Entry"
                      : "Scan Barcode")}
                </h3>
              </div>
              <button
                onClick={closeQuickMeal}
                style={{
                  background: "#2e2e32",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 8px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {quickMealStep === "pick" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    mk: "breakfast",
                    icon: "🌅",
                    label: "Breakfast",
                    c: "#FF9800",
                  },
                  { mk: "lunch", icon: "☀️", label: "Lunch", c: "#4CAF50" },
                  { mk: "dinner", icon: "🌙", label: "Dinner", c: "#2979FF" },
                  {
                    mk: "snacks",
                    icon: "🍎",
                    label: "Snack",
                    c: COLORS.grooming,
                  },
                ].map((opt) => (
                  <button
                    key={opt.mk}
                    onClick={() => pickQuickMealSlot(opt.mk)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      background: CARD2,
                      border: `1px solid ${opt.c}30`,
                      borderRadius: 16,
                      padding: "18px 10px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: 30 }}>{opt.icon}</span>
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
                    >
                      {opt.label}
                    </span>
                    <span
                      style={{ color: opt.c, fontSize: 11, fontWeight: 600 }}
                    >
                      {meals[opt.mk]?.length || 0} items
                    </span>
                  </button>
                ))}
              </div>
            )}

            {quickMealStep === "options" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  {
                    id: "saved",
                    icon: "📋",
                    title: "Saved Meals",
                    desc: "Choose from your saved meals",
                    c: COLORS.grooming,
                  },
                  {
                    id: "search",
                    icon: "🔍",
                    title: "بحث",
                    desc: "Search the food database",
                    c: "#FFC107",
                  },
                  {
                    id: "manual",
                    icon: "✏️",
                    title: "Manual Entry",
                    desc: "Enter calories & macros manually",
                    c: COLORS.nutrition,
                  },
                  {
                    id: "barcode",
                    icon: "📷",
                    title: "Scan Barcode",
                    desc: "Point camera at a product barcode",
                    c: "#2979FF",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => pickQuickMealOption(opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: CARD2,
                      border: `1px solid ${opt.c}30`,
                      borderRadius: 14,
                      padding: "14px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{opt.icon}</span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#fff",
                        }}
                      >
                        {opt.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {quickMealStep === "input" && quickMealOption === "saved" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: CARD2,
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 12,
                  }}
                >
                  <Search size={14} color="#666" style={{ marginRight: 8 }} />
                  <input
                    value={quickFoodSearch}
                    onChange={(e) => setQuickFoodSearch(e.target.value)}
                    placeholder="Search meals & foods..."
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>
                {sortedMeals
                  .filter(
                    (m) =>
                      !quickFoodSearch ||
                      m.name
                        .toLowerCase()
                        .includes(quickFoodSearch.toLowerCase())
                  )
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => addQuickFood(m)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "11px 4px",
                        borderBottom: "1px solid #2e2e32",
                        cursor: "pointer",
                        color: "#fff",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                          {m.fav ? "⭐ " : ""}
                          {m.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                          {m.p}g P · {m.c}g C · {m.f}g F
                        </p>
                      </div>
                      <span
                        style={{
                          color: COLORS.nutrition,
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {m.cal} kcal
                      </span>
                    </button>
                  ))}
                <p
                  style={{
                    margin: "12px 0 6px",
                    fontSize: 11,
                    color: "#666",
                    fontWeight: 600,
                    letterSpacing: 0.8,
                  }}
                >
                  FOOD DATABASE
                </p>
                {(quickFoodSearch
                  ? FOODS.filter((f) =>
                      f.name
                        .toLowerCase()
                        .includes(quickFoodSearch.toLowerCase())
                    )
                  : FOODS
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => addQuickFood(f)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "11px 4px",
                      borderBottom: "1px solid #2e2e32",
                      cursor: "pointer",
                      color: "#fff",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                        {f.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                        {f.p}g P · {f.c}g C · {f.f}g F
                      </p>
                    </div>
                    <span
                      style={{
                        color: COLORS.nutrition,
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {f.cal}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {quickMealStep === "input" && quickMealOption === "manual" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {[
                  {
                    label: "Meal Name (optional)",
                    key: "name",
                    type: "text",
                    ph: "e.g. My Custom Meal",
                  },
                  {
                    label: "Calories (kcal)",
                    key: "cal",
                    type: "number",
                    ph: "0",
                  },
                  { label: "Protein (g)", key: "p", type: "number", ph: "0" },
                  { label: "Carbs (g)", key: "c", type: "number", ph: "0" },
                  { label: "Fat (g)", key: "f", type: "number", ph: "0" },
                ].map((field) => (
                  <div key={field.key} style={{ marginBottom: 12 }}>
                    <p
                      style={{
                        margin: "0 0 5px",
                        fontSize: 12,
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      {field.label}
                    </p>
                    <input
                      type={field.type}
                      value={quickManual[field.key]}
                      onChange={(e) =>
                        setQuickManual((p) => ({
                          ...p,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.ph}
                      style={{
                        width: "100%",
                        background: CARD2,
                        border: "1px solid #3a3a3e",
                        borderRadius: 10,
                        padding: "11px 14px",
                        color: "#fff",
                        fontSize: 15,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setQuickSaveManual(!quickSaveManual)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    marginBottom: 16,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: quickSaveManual
                        ? COLORS.nutrition
                        : "#2e2e32",
                      border: quickSaveManual ? "none" : "1px solid #444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {quickSaveManual && <Check size={13} color="#fff" />}
                  </div>
                  <span
                    style={{
                      color: quickSaveManual ? COLORS.nutrition : "#888",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Save to My Meals
                  </span>
                </button>
                <button
                  onClick={submitQuickManual}
                  style={{
                    background: COLORS.nutrition,
                    border: "none",
                    borderRadius: 12,
                    padding: "13px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    width: "100%",
                    textTransform: "capitalize",
                  }}
                >
                  Add to {quickMealSlot}
                </button>
              </div>
            )}

            {quickMealStep === "input" && quickMealOption === "barcode" && (
              <div style={{ flex: 1 }}>
                {!quickBarcodeDone ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div
                      style={{
                        width: "100%",
                        height: 200,
                        background: "#0a0a0a",
                        borderRadius: 14,
                        border: "2px solid #2979FF33",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 180,
                          height: 120,
                          border: "2px solid #2979FF",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: "#2979FF",
                            boxShadow: "0 0 10px #2979FF",
                          }}
                        />
                        <p style={{ color: "#2979FF44", fontSize: 11 }}>
                          align barcode here
                        </p>
                      </div>
                    </div>
                    <p style={{ color: "#666", fontSize: 13 }}>
                      🔍 Scanning… hold steady
                    </p>
                  </div>
                ) : (
                  quickBarcodeFood && (
                    <>
                      <C
                        style={{
                          background: `${COLORS.workout}15`,
                          border: `1px solid ${COLORS.workout}40`,
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 12,
                            color: COLORS.workout,
                          }}
                        >
                          ✅ Product Found!
                        </p>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {quickBarcodeFood.name}
                        </p>
                        <div style={{ display: "flex", gap: 16 }}>
                          {[
                            { l: "Cal", v: quickBarcodeFood.cal },
                            { l: "Protein", v: `${quickBarcodeFood.p}g` },
                            { l: "Carbs", v: `${quickBarcodeFood.c}g` },
                            { l: "Fat", v: `${quickBarcodeFood.f}g` },
                          ].map((s) => (
                            <div key={s.l}>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  fontSize: 15,
                                }}
                              >
                                {s.v}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  color: "#666",
                                }}
                              >
                                {s.l}
                              </p>
                            </div>
                          ))}
                        </div>
                      </C>
                      <button
                        onClick={() => addQuickFood(quickBarcodeFood)}
                        style={{
                          background: COLORS.workout,
                          border: "none",
                          borderRadius: 12,
                          padding: "13px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: "pointer",
                          width: "100%",
                          textTransform: "capitalize",
                        }}
                      >
                        Add to {quickMealSlot}
                      </button>
                    </>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ── RENDER NUTRITION ──
  const renderNutrition = () => (
    <div style={{ padding: "52px 16px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 2px" }}>
            🥗 Nutrition
          </h1>
          <p style={{ color: "#666", fontSize: 13, margin: 0 }}>April 22</p>
        </div>
        <button
          onClick={openGoalModal}
          style={{
            background: `${COLORS.nutrition}18`,
            border: `1px solid ${COLORS.nutrition}40`,
            borderRadius: 12,
            padding: "9px 12px",
            color: COLORS.nutrition,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Settings size={17} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["diary", "macros", "water"].map((t) => (
          <button
            key={t}
            onClick={() => setNutTab(t)}
            style={{
              flex: 1,
              background: nutTab === t ? COLORS.nutrition : CARD2,
              color: nutTab === t ? "#fff" : "#666",
              border: "none",
              borderRadius: 10,
              padding: "9px 0",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {nutTab === "diary" && (
        <>
          <C>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#666", fontSize: 13 }}>
                Daily Calories
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: totalCal > calorieGoal ? "#f44336" : "#fff",
                }}
              >
                {totalCal} / {calorieGoal} kcal
              </span>
            </div>
            <div
              style={{
                background: "#2e2e32",
                borderRadius: 6,
                height: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    totalCal > calorieGoal ? "#f44336" : COLORS.nutrition,
                  height: "100%",
                  width: `${Math.min((totalCal / calorieGoal) * 100, 100)}%`,
                  borderRadius: 6,
                  transition: "width .4s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 12,
              }}
            >
              {[
                { l: "Protein", v: totalProtein, c: "#4CAF50" },
                { l: "Carbs", v: totalCarbs, c: "#2979FF" },
                { l: "Fat", v: totalFat, c: "#FF9800" },
              ].map((m) => (
                <div key={m.l} style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: m.c,
                    }}
                  >
                    {m.v}g
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {m.l}
                  </p>
                </div>
              ))}
            </div>
          </C>
          {Object.entries(meals).map(([mk, foods]) => (
            <C key={mk}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 16,
                      textTransform: "capitalize",
                    }}
                  >
                    {mk}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    {foods.reduce((s, f) => s + f.cal, 0)} kcal
                  </p>
                </div>
                <button
                  onClick={() => openAddMeal(mk)}
                  style={{
                    background: COLORS.nutrition,
                    border: "none",
                    borderRadius: 10,
                    padding: "7px 12px",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              {foods.length === 0 && (
                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Tap Add to log food
                </p>
              )}
              {foods.map((f) => (
                <div
                  key={f.uid}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderTop: "1px solid #2e2e32",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                      {f.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                      {f.p}g P · {f.c}g C · {f.f}g F
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontWeight: 700, color: COLORS.nutrition }}>
                      {f.cal}
                    </span>
                    <button
                      onClick={() => removeFoodFromMeal(mk, f.uid)}
                      style={{
                        background: "#3a1a1a",
                        border: "none",
                        borderRadius: 8,
                        padding: "4px 6px",
                        color: "#f44336",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </C>
          ))}
        </>
      )}

      {nutTab === "macros" && (
        <>
          <C>
            <H>Macro Breakdown</H>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Ring
                value={totalProtein}
                max={proteinGoal}
                color="#4CAF50"
                size={100}
                label="Protein"
              />
              <Ring
                value={totalCarbs}
                max={carbsGoal}
                color="#2979FF"
                size={100}
                label="Carbs"
              />
              <Ring
                value={totalFat}
                max={fatGoal}
                color="#FF9800"
                size={100}
                label="Fat"
              />
            </div>
          </C>
          {[
            {
              l: "Protein",
              v: totalProtein,
              g: proteinGoal,
              c: "#4CAF50",
              k: 4,
            },
            {
              l: "Carbohydrates",
              v: totalCarbs,
              g: carbsGoal,
              c: "#2979FF",
              k: 4,
            },
            { l: "Fat", v: totalFat, g: fatGoal, c: "#FF9800", k: 9 },
          ].map((m) => (
            <C key={m.l}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 600 }}>{m.l}</span>
                <span style={{ color: m.c, fontWeight: 700 }}>
                  {m.v}g / {m.g}g
                </span>
              </div>
              <div
                style={{
                  background: "#2e2e32",
                  borderRadius: 6,
                  height: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: m.c,
                    height: "100%",
                    width: `${Math.min((m.v / m.g) * 100, 100)}%`,
                    borderRadius: 6,
                  }}
                />
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#666" }}>
                {m.k} kcal/g · {Math.round(m.v * m.k)} kcal
              </p>
            </C>
          ))}
        </>
      )}

      {nutTab === "water" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => {
                setTmpWaterGoal(waterGoalMl);
                setTmpCupSize(cupSizeMl);
                setWaterGoalOpen(true);
              }}
              style={{
                background: "#03A9F418",
                border: "1px solid #03A9F440",
                borderRadius: 12,
                padding: "9px 12px",
                color: "#03A9F4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Settings size={17} />
            </button>
          </div>
          <C style={{ textAlign: "center", padding: 24 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: "#666" }}>
              Daily Water Intake
            </p>
            <p
              style={{
                margin: "0 0 2px",
                fontSize: 52,
                fontWeight: 800,
                color: "#03A9F4",
              }}
            >
              {waterConsumedMl}
              <span style={{ fontSize: 16, color: "#666" }}> ml</span>
            </p>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              {water} of {waterCups} cups · goal: {waterGoalMl} ml
            </p>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "#0d1f35",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                border: "3px solid #03A9F4",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${Math.min(
                    (waterConsumedMl / waterGoalMl) * 100,
                    100
                  )}%`,
                  background: "#03A9F455",
                  transition: "height .5s",
                }}
              />
              <div style={{ position: "relative", textAlign: "center" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#03A9F4",
                  }}
                >
                  {Math.round((waterConsumedMl / waterGoalMl) * 100)}%
                </p>
                <p style={{ margin: 0, fontSize: 10, color: "#03A9F4aa" }}>
                  {waterConsumedMl}/{waterGoalMl}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setWater(Math.max(0, water - 1))}
                style={{
                  background: "#1a2a3a",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 20px",
                  color: "#03A9F4",
                  fontSize: 20,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                −
              </button>
              <button
                onClick={() => setWater(Math.min(waterCups, water + 1))}
                style={{
                  background: "#03A9F4",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 20px",
                  color: "#fff",
                  fontSize: 15,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                + {cupSizeMl} ml
              </button>
            </div>
          </C>
          <C>
            <H>Hydration Log</H>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Array.from({ length: waterCups }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setWater(i < water ? i : i + 1)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: i < water ? "#03A9F4" : "#2e2e32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Droplets size={15} color={i < water ? "#fff" : "#555"} />
                </button>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#666" }}>
              Each cup = {cupSizeMl} ml · Goal: {waterGoalMl} ml ({waterCups}{" "}
              cups)
            </p>
          </C>

          {waterGoalOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "#000c",
                zIndex: 200,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  background: CARD,
                  borderRadius: "20px 20px 0 0",
                  width: "100%",
                  maxWidth: 390,
                  margin: "0 auto",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <h3 style={{ margin: 0 }}>💧 Water Goals</h3>
                  <button
                    onClick={() => setWaterGoalOpen(false)}
                    style={{
                      background: "#2e2e32",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 8px",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 12,
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  DAILY WATER GOAL (ml)
                </p>
                <input
                  type="number"
                  value={tmpWaterGoal}
                  onChange={(e) => setTmpWaterGoal(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: CARD2,
                    border: "1px solid #03A9F440",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "#03A9F4",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 18,
                    flexWrap: "wrap",
                  }}
                >
                  {[1500, 2000, 2500, 3000, 3500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTmpWaterGoal(v)}
                      style={{
                        background: tmpWaterGoal === v ? "#03A9F4" : CARD2,
                        border: `1px solid ${
                          tmpWaterGoal === v ? "#03A9F4" : "#3a3a3e"
                        }`,
                        borderRadius: 8,
                        padding: "6px 12px",
                        color: tmpWaterGoal === v ? "#fff" : "#888",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 12,
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  CUP SIZE (ml)
                </p>
                <input
                  type="number"
                  value={tmpCupSize}
                  onChange={(e) => setTmpCupSize(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: CARD2,
                    border: "1px solid #03A9F440",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "#03A9F4",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 18,
                    flexWrap: "wrap",
                  }}
                >
                  {[150, 200, 250, 330, 500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTmpCupSize(v)}
                      style={{
                        background: tmpCupSize === v ? "#03A9F4" : CARD2,
                        border: `1px solid ${
                          tmpCupSize === v ? "#03A9F4" : "#3a3a3e"
                        }`,
                        borderRadius: 8,
                        padding: "6px 12px",
                        color: tmpCupSize === v ? "#fff" : "#888",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <C
                  style={{
                    background: "#0d1f35",
                    border: "1px solid #03A9F430",
                    marginBottom: 16,
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#03A9F4",
                      fontWeight: 600,
                    }}
                  >
                    {tmpWaterGoal} ml ÷ {tmpCupSize} ml ={" "}
                    <span style={{ fontWeight: 800 }}>
                      {Math.ceil(tmpWaterGoal / tmpCupSize)} cups/day
                    </span>
                  </p>
                </C>
                <button
                  onClick={() => {
                    setWaterGoalMl(tmpWaterGoal);
                    setCupSizeMl(tmpCupSize);
                    setWater(0);
                    setWaterGoalOpen(false);
                  }}
                  style={{
                    background: "#03A9F4",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Save Goals
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD MEAL MODAL */}
      {addingMeal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000c",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              background: CARD,
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxWidth: 390,
              margin: "0 auto",
              padding: 20,
              maxHeight: "82vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {addStep !== "options" && (
                  <button
                    onClick={() => {
                      setAddStep("options");
                      setBarcodeScanned(false);
                      setBarcodeFood(null);
                      clearTimeout(barcodeRef.current);
                    }}
                    style={{
                      background: CARD2,
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      color: "#aaa",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ← Back
                  </button>
                )}
                <h3 style={{ margin: 0, textTransform: "capitalize" }}>
                  {addStep === "options"
                    ? `Add to ${addingMeal}`
                    : addStep === "barcode"
                    ? "Scan Barcode"
                    : addStep === "saved"
                    ? "Saved Meals"
                    : "Manual Entry"}
                </h3>
              </div>
              <button
                onClick={closeMealModal}
                style={{
                  background: "#2e2e32",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 8px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            {addStep === "options" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  {
                    id: "saved",
                    icon: "📋",
                    title: "Saved Meals",
                    desc: "Choose from your saved meals",
                    c: COLORS.grooming,
                  },
                  {
                    id: "manual",
                    icon: "✏️",
                    title: "Manual Entry",
                    desc: "Enter calories & macros manually",
                    c: COLORS.nutrition,
                  },
                  {
                    id: "barcode",
                    icon: "📷",
                    title: "Scan Barcode",
                    desc: "Point camera at a product barcode",
                    c: "#2979FF",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAddStep(opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: CARD2,
                      border: `1px solid ${opt.c}30`,
                      borderRadius: 14,
                      padding: "14px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{opt.icon}</span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#fff",
                        }}
                      >
                        {opt.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {addStep === "saved" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: CARD2,
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 12,
                  }}
                >
                  <Search size={14} color="#666" style={{ marginRight: 8 }} />
                  <input
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    placeholder="Search..."
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>
                {sortedMeals
                  .filter(
                    (m) =>
                      !foodSearch ||
                      m.name.toLowerCase().includes(foodSearch.toLowerCase())
                  )
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => addFoodToMeal({ ...m, uid: Date.now() })}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "11px 4px",
                        borderBottom: "1px solid #2e2e32",
                        cursor: "pointer",
                        color: "#fff",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                          {m.fav ? "⭐ " : ""}
                          {m.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                          {m.p}g P · {m.c}g C · {m.f}g F
                        </p>
                      </div>
                      <span
                        style={{
                          color: COLORS.nutrition,
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {m.cal} kcal
                      </span>
                    </button>
                  ))}
                {(foodSearch
                  ? FOODS.filter((f) =>
                      f.name.toLowerCase().includes(foodSearch.toLowerCase())
                    )
                  : FOODS
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => addFoodToMeal(f)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "10px 4px",
                      borderBottom: "1px solid #2e2e32",
                      cursor: "pointer",
                      color: "#fff",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                        {f.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                        {f.p}g P · {f.c}g C · {f.f}g F
                      </p>
                    </div>
                    <span
                      style={{
                        color: COLORS.nutrition,
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {f.cal}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {addStep === "manual" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {[
                  {
                    label: "Meal Name (optional)",
                    key: "name",
                    type: "text",
                    ph: "e.g. My Custom Meal",
                  },
                  {
                    label: "Calories (kcal)",
                    key: "cal",
                    type: "number",
                    ph: "0",
                  },
                  { label: "Protein (g)", key: "p", type: "number", ph: "0" },
                  { label: "Carbs (g)", key: "c", type: "number", ph: "0" },
                  { label: "Fat (g)", key: "f", type: "number", ph: "0" },
                ].map((field) => (
                  <div key={field.key} style={{ marginBottom: 12 }}>
                    <p
                      style={{
                        margin: "0 0 5px",
                        fontSize: 12,
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      {field.label}
                    </p>
                    <input
                      type={field.type}
                      value={manual[field.key]}
                      onChange={(e) =>
                        setManual((p) => ({
                          ...p,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.ph}
                      style={{
                        width: "100%",
                        background: CARD2,
                        border: "1px solid #3a3a3e",
                        borderRadius: 10,
                        padding: "11px 14px",
                        color: "#fff",
                        fontSize: 15,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setSaveManual(!saveManual)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    marginBottom: 16,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: saveManual ? COLORS.nutrition : "#2e2e32",
                      border: saveManual ? "none" : "1px solid #444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {saveManual && <Check size={13} color="#fff" />}
                  </div>
                  <span
                    style={{
                      color: saveManual ? COLORS.nutrition : "#888",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Save to My Meals
                  </span>
                </button>
                <button
                  onClick={addManualToMeal}
                  style={{
                    background: COLORS.nutrition,
                    border: "none",
                    borderRadius: 12,
                    padding: "13px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Add to {addingMeal}
                </button>
              </div>
            )}
            {addStep === "barcode" && (
              <div style={{ flex: 1 }}>
                {!barcodeScanned ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div
                      style={{
                        width: "100%",
                        height: 200,
                        background: "#0a0a0a",
                        borderRadius: 14,
                        border: "2px solid #2979FF33",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 180,
                          height: 120,
                          border: "2px solid #2979FF",
                          borderRadius: 8,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: "#2979FF",
                            boxShadow: "0 0 10px #2979FF",
                          }}
                        />
                        <p style={{ color: "#2979FF44", fontSize: 11 }}>
                          align barcode here
                        </p>
                      </div>
                    </div>
                    <p style={{ color: "#666", fontSize: 13 }}>
                      🔍 Scanning… hold steady
                    </p>
                  </div>
                ) : (
                  barcodeFood && (
                    <>
                      <C
                        style={{
                          background: `${COLORS.workout}15`,
                          border: `1px solid ${COLORS.workout}40`,
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 12,
                            color: COLORS.workout,
                          }}
                        >
                          ✅ Product Found!
                        </p>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {barcodeFood.name}
                        </p>
                        <div style={{ display: "flex", gap: 16 }}>
                          {[
                            { l: "Cal", v: barcodeFood.cal },
                            { l: "Protein", v: `${barcodeFood.p}g` },
                            { l: "Carbs", v: `${barcodeFood.c}g` },
                            { l: "Fat", v: `${barcodeFood.f}g` },
                          ].map((s) => (
                            <div key={s.l}>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  fontSize: 15,
                                }}
                              >
                                {s.v}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  color: "#666",
                                }}
                              >
                                {s.l}
                              </p>
                            </div>
                          ))}
                        </div>
                      </C>
                      <button
                        onClick={() => addFoodToMeal(barcodeFood)}
                        style={{
                          background: COLORS.workout,
                          border: "none",
                          borderRadius: 12,
                          padding: "13px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        Add to {addingMeal}
                      </button>
                    </>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NUTRITION SETTINGS MODAL */}
      {goalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000c",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              background: CARD,
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxWidth: 390,
              margin: "0 auto",
              padding: 20,
              maxHeight: "88vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {goalSection !== "main" && (
                  <button
                    onClick={() => {
                      setGoalSection("main");
                      closeLibAdd();
                    }}
                    style={{
                      background: CARD2,
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      color: "#aaa",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ← Back
                  </button>
                )}
                <h3 style={{ margin: 0 }}>
                  {goalSection === "main"
                    ? "Nutrition Settings"
                    : goalSection === "goals"
                    ? "Calorie & Macro Goals"
                    : "Saved Meals"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setGoalOpen(false);
                  setGoalSection("main");
                  closeLibAdd();
                }}
                style={{
                  background: "#2e2e32",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 8px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {goalSection === "main" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  {
                    id: "goals",
                    icon: "🎯",
                    title: "Calorie & Macro Goals",
                    desc: "Set your daily calorie and macro targets",
                    c: COLORS.nutrition,
                  },
                  {
                    id: "library",
                    icon: "📋",
                    title: "Saved Meals",
                    desc: "Add, delete and favourite your saved meals",
                    c: COLORS.grooming,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setGoalSection(opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: CARD2,
                      border: `1px solid ${opt.c}25`,
                      borderRadius: 14,
                      padding: "16px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#fff",
                        }}
                      >
                        {opt.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#666",
                          marginTop: 2,
                        }}
                      >
                        {opt.desc}
                      </p>
                    </div>
                    <span style={{ color: "#555", fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            )}

            {goalSection === "goals" && (
              <>
                <div
                  style={{
                    display: "flex",
                    background: CARD2,
                    borderRadius: 12,
                    padding: 4,
                    marginBottom: 18,
                  }}
                >
                  {["grams", "percent"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setGoalMode(m)}
                      style={{
                        flex: 1,
                        background:
                          goalMode === m ? COLORS.nutrition : "transparent",
                        color: goalMode === m ? "#fff" : "#666",
                        border: "none",
                        borderRadius: 9,
                        padding: "9px 0",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {m === "grams" ? "Grams (g)" : "Percentage (%)"}
                    </button>
                  ))}
                </div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 12,
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  DAILY CALORIE GOAL (kcal)
                </p>
                <input
                  type="number"
                  value={tCal}
                  onChange={(e) => setTCal(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: CARD2,
                    border: "1px solid #3a3a3e",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "#fff",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 16,
                  }}
                />
                {goalMode === "grams" &&
                  [
                    { l: "Protein Goal (g)", v: tP, set: setTP, c: "#4CAF50" },
                    { l: "Carbs Goal (g)", v: tC, set: setTC, c: "#2979FF" },
                    { l: "Fat Goal (g)", v: tF, set: setTF, c: "#FF9800" },
                  ].map(({ l, v, set, c }) => (
                    <div key={l} style={{ marginBottom: 14 }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 12,
                          color: "#888",
                          fontWeight: 600,
                        }}
                      >
                        {l.toUpperCase()}
                      </p>
                      <input
                        type="number"
                        value={v}
                        onChange={(e) => set(Number(e.target.value))}
                        style={{
                          width: "100%",
                          background: CARD2,
                          border: `1px solid ${c}40`,
                          borderRadius: 10,
                          padding: "11px 14px",
                          color: c,
                          fontSize: 16,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                {goalMode === "percent" && (
                  <>
                    {[
                      {
                        l: "Protein %",
                        v: tPPct,
                        set: setTPPct,
                        c: "#4CAF50",
                        d: 4,
                      },
                      {
                        l: "Carbs %",
                        v: tCPct,
                        set: setTCPct,
                        c: "#2979FF",
                        d: 4,
                      },
                      {
                        l: "Fat %",
                        v: tFPct,
                        set: setTFPct,
                        c: "#FF9800",
                        d: 9,
                      },
                    ].map(({ l, v, set, c, d }) => (
                      <div key={l} style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#888",
                              fontWeight: 600,
                            }}
                          >
                            {l.toUpperCase()}
                          </p>
                          <span style={{ color: "#666", fontSize: 12 }}>
                            ≈ {Math.round((tCal * v) / 100 / d)}g
                          </span>
                        </div>
                        <input
                          type="number"
                          value={v}
                          onChange={(e) => set(Number(e.target.value))}
                          style={{
                            width: "100%",
                            background: CARD2,
                            border: `1px solid ${c}40`,
                            borderRadius: 10,
                            padding: "11px 14px",
                            color: c,
                            fontSize: 16,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    ))}
                    <C
                      style={{
                        background: pctSum === 100 ? "#1a3020" : "#3a1a0a",
                        border: `1px solid ${
                          pctSum === 100 ? "#4CAF50" : "#FF9800"
                        }40`,
                        marginBottom: 14,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: pctSum === 100 ? "#4CAF50" : "#FF9800",
                          fontWeight: 600,
                        }}
                      >
                        Total: {pctSum}% {pctSum !== 100 && "(must equal 100%)"}
                      </p>
                    </C>
                  </>
                )}
                <button
                  onClick={saveGoals}
                  disabled={goalMode === "percent" && pctSum !== 100}
                  style={{
                    background:
                      goalMode === "percent" && pctSum !== 100
                        ? "#333"
                        : COLORS.nutrition,
                    border: "none",
                    borderRadius: 12,
                    padding: "14px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor:
                      goalMode === "percent" && pctSum !== 100
                        ? "not-allowed"
                        : "pointer",
                    width: "100%",
                    opacity: goalMode === "percent" && pctSum !== 100 ? 0.5 : 1,
                  }}
                >
                  Save Goals
                </button>
              </>
            )}

            {goalSection === "library" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#666" }}>
                    {savedMeals.length} meals saved
                  </span>
                  {!addingLibMeal ? (
                    <button
                      onClick={openLibAdd}
                      style={{
                        background: COLORS.nutrition,
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 14px",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Plus size={13} />
                      Add Meal
                    </button>
                  ) : (
                    <button
                      onClick={closeLibAdd}
                      style={{
                        background: CARD2,
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 14px",
                        color: "#aaa",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <X size={13} />
                      Cancel
                    </button>
                  )}
                </div>

                {addingLibMeal && (
                  <C
                    style={{
                      border: `1px solid ${COLORS.nutrition}25`,
                      marginBottom: 14,
                    }}
                  >
                    {libAddStep === "options" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px",
                            fontSize: 12,
                            color: "#888",
                            fontWeight: 600,
                          }}
                        >
                          HOW TO ADD?
                        </p>
                        {[
                          {
                            id: "barcode",
                            icon: "📷",
                            title: "Scan Barcode",
                            desc: "Point camera at product barcode",
                            c: "#2979FF",
                          },
                          {
                            id: "manual",
                            icon: "✏️",
                            title: "Manual Entry",
                            desc: "Enter name, calories & macros",
                            c: COLORS.nutrition,
                          },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setLibAddStep(opt.id);
                              setLibBarcodeDone(false);
                              setLibBarcodeFood(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              background: CARD2,
                              border: `1px solid ${opt.c}25`,
                              borderRadius: 12,
                              padding: "13px",
                              cursor: "pointer",
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            <span style={{ fontSize: 22 }}>{opt.icon}</span>
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#fff",
                                }}
                              >
                                {opt.title}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 11,
                                  color: "#666",
                                }}
                              >
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {libAddStep === "barcode" && (
                      <>
                        <button
                          onClick={() => setLibAddStep("options")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#666",
                            fontSize: 12,
                            cursor: "pointer",
                            padding: "0 0 10px",
                            display: "block",
                          }}
                        >
                          ← Back
                        </button>
                        {!libBarcodeDone ? (
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                width: "100%",
                                height: 160,
                                background: "#0a0a0a",
                                borderRadius: 12,
                                border: "2px solid #2979FF33",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 160,
                                  height: 100,
                                  border: "2px solid #2979FF",
                                  borderRadius: 8,
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    background: "#2979FF",
                                    boxShadow: "0 0 10px #2979FF",
                                  }}
                                />
                                <p style={{ color: "#2979FF44", fontSize: 10 }}>
                                  align barcode here
                                </p>
                              </div>
                            </div>
                            <p
                              style={{ color: "#666", fontSize: 12, margin: 0 }}
                            >
                              🔍 Scanning…
                            </p>
                          </div>
                        ) : (
                          libBarcodeFood && (
                            <>
                              <C
                                style={{
                                  background: `${COLORS.workout}15`,
                                  border: `1px solid ${COLORS.workout}40`,
                                  marginBottom: 10,
                                }}
                              >
                                <p
                                  style={{
                                    margin: "0 0 4px",
                                    fontSize: 11,
                                    color: COLORS.workout,
                                  }}
                                >
                                  ✅ Product Found!
                                </p>
                                <p
                                  style={{
                                    margin: "0 0 8px",
                                    fontSize: 15,
                                    fontWeight: 700,
                                  }}
                                >
                                  {libBarcodeFood.name}
                                </p>
                                <div style={{ display: "flex", gap: 14 }}>
                                  {[
                                    { l: "Cal", v: libBarcodeFood.cal },
                                    { l: "Protein", v: `${libBarcodeFood.p}g` },
                                    { l: "Carbs", v: `${libBarcodeFood.c}g` },
                                    { l: "Fat", v: `${libBarcodeFood.f}g` },
                                  ].map((s) => (
                                    <div key={s.l}>
                                      <p
                                        style={{
                                          margin: 0,
                                          fontWeight: 700,
                                          fontSize: 14,
                                        }}
                                      >
                                        {s.v}
                                      </p>
                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: 10,
                                          color: "#666",
                                        }}
                                      >
                                        {s.l}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </C>
                              <button
                                onClick={saveLibBarcodeFood}
                                style={{
                                  background: COLORS.nutrition,
                                  border: "none",
                                  borderRadius: 10,
                                  padding: "11px",
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  cursor: "pointer",
                                  width: "100%",
                                }}
                              >
                                Save to My Meals
                              </button>
                            </>
                          )
                        )}
                      </>
                    )}
                    {libAddStep === "manual" && (
                      <>
                        <button
                          onClick={() => setLibAddStep("options")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#666",
                            fontSize: 12,
                            cursor: "pointer",
                            padding: "0 0 10px",
                            display: "block",
                          }}
                        >
                          ← Back
                        </button>
                        {[
                          {
                            label: "Name",
                            key: "name",
                            type: "text",
                            ph: "e.g. Protein Oats",
                          },
                          {
                            label: "Calories (kcal)",
                            key: "cal",
                            type: "number",
                            ph: "0",
                          },
                          {
                            label: "Protein (g)",
                            key: "p",
                            type: "number",
                            ph: "0",
                          },
                          {
                            label: "Carbs (g)",
                            key: "c",
                            type: "number",
                            ph: "0",
                          },
                          {
                            label: "Fat (g)",
                            key: "f",
                            type: "number",
                            ph: "0",
                          },
                        ].map((field) => (
                          <div key={field.key} style={{ marginBottom: 10 }}>
                            <p
                              style={{
                                margin: "0 0 4px",
                                fontSize: 11,
                                color: "#888",
                                fontWeight: 600,
                              }}
                            >
                              {field.label}
                            </p>
                            <input
                              type={field.type}
                              value={newMeal[field.key]}
                              onChange={(e) =>
                                setNewMeal((p) => ({
                                  ...p,
                                  [field.key]: e.target.value,
                                }))
                              }
                              placeholder={field.ph}
                              style={{
                                width: "100%",
                                background: CARD2,
                                border: "1px solid #3a3a3e",
                                borderRadius: 9,
                                padding: "9px 12px",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        ))}
                        <button
                          onClick={submitLibMeal}
                          style={{
                            background: COLORS.nutrition,
                            border: "none",
                            borderRadius: 10,
                            padding: "11px",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            width: "100%",
                            marginTop: 4,
                          }}
                        >
                          Save Meal
                        </button>
                      </>
                    )}
                  </C>
                )}

                {sortedMeals.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 0",
                      borderBottom:
                        i < sortedMeals.length - 1
                          ? "1px solid #2e2e32"
                          : "none",
                    }}
                  >
                    <button
                      onClick={() => toggleFav(m.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                        fontSize: 18,
                        opacity: m.fav ? 1 : 0.3,
                      }}
                    >
                      ⭐
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#fff",
                          }}
                        >
                          {m.name}
                        </p>
                        {m.fav && (
                          <span
                            style={{
                              background: "#3a2a00",
                              borderRadius: 6,
                              padding: "1px 7px",
                              fontSize: 10,
                              color: "#FFD700",
                              fontWeight: 600,
                            }}
                          >
                            Fav
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                        {m.cal} kcal · {m.p}g P · {m.c}g C · {m.f}g F
                      </p>
                    </div>
                    <button
                      onClick={() => deleteLibMeal(m.id)}
                      style={{
                        background: "#3a1a1a",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 9px",
                        color: "#f44336",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {savedMeals.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#555",
                      padding: "24px 0",
                      fontSize: 13,
                    }}
                  >
                    No saved meals yet.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ── RENDER FITNESS ──
  const renderWorkout = () => (
    <div style={{ padding: "52px 16px 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
        💪 Fitness
      </h1>
      <p style={{ color: "#666", fontSize: 13, margin: "0 0 14px" }}>
        Track · Build · Progress
      </p>
      <div
        style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}
      >
        {[
          { id: "library", l: "Library" },
          {
            id: "build",
            l: `Build${
              currentWorkout.length > 0 ? ` (${currentWorkout.length})` : ""
            }`,
          },
          { id: "history", l: "History" },
          { id: "records", l: "PRs 🏆" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setWrkTab(t.id)}
            style={{
              flexShrink: 0,
              background: wrkTab === t.id ? COLORS.workout : CARD2,
              color: wrkTab === t.id ? "#fff" : "#666",
              border: "none",
              borderRadius: 10,
              padding: "9px 14px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>
      {wrkTab === "library" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: CARD2,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 10,
            }}
          >
            <Search size={14} color="#666" style={{ marginRight: 8 }} />
            <input
              value={exSearch}
              onChange={(e) => setExSearch(e.target.value)}
              placeholder="Search exercises..."
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              overflowX: "auto",
            }}
          >
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setMuscleFilter(m)}
                style={{
                  flexShrink: 0,
                  background: muscleFilter === m ? COLORS.workout : CARD2,
                  color: muscleFilter === m ? "#fff" : "#666",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          {filteredEx.map((ex) => (
            <C key={ex.id} p="12px 14px" mb={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                    {ex.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    {ex.muscle} · {ex.equipment} · PR: {ex.pr} lbs
                  </p>
                </div>
                <button
                  onClick={() => addExToWorkout(ex)}
                  style={{
                    background: currentWorkout.find(
                      (e) => e.exercise.id === ex.id
                    )
                      ? `${COLORS.workout}30`
                      : `${COLORS.workout}18`,
                    border: `1px solid ${COLORS.workout}50`,
                    borderRadius: 10,
                    padding: "7px 12px",
                    color: COLORS.workout,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {currentWorkout.find((e) => e.exercise.id === ex.id)
                    ? "✓ Added"
                    : "+ Add"}
                </button>
              </div>
            </C>
          ))}
        </>
      )}
      {wrkTab === "build" && (
        <>
          {currentWorkout.length === 0 ? (
            <C style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
              <p style={{ color: "#666", margin: "0 0 16px" }}>
                No exercises added.
              </p>
              <button
                onClick={() => setWrkTab("library")}
                style={{
                  background: COLORS.workout,
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 24px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Browse Library
              </button>
            </C>
          ) : (
            <>
              {restCountdown !== null && (
                <C
                  style={{
                    background: "#0d1f35",
                    border: `1px solid ${COLORS.workout}40`,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    ⏱ Rest Timer
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 36,
                      fontWeight: 800,
                      color: COLORS.workout,
                    }}
                  >
                    {restCountdown}s
                  </p>
                  <div
                    style={{
                      background: "#1a2a3a",
                      borderRadius: 6,
                      height: 5,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background: COLORS.workout,
                        height: "100%",
                        width: `${(restCountdown / 90) * 100}%`,
                        borderRadius: 6,
                        transition: "width 1s linear",
                      }}
                    />
                  </div>
                </C>
              )}
              {currentWorkout.map((entry, i) => (
                <C key={i} mb={10}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                        {entry.exercise.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {entry.exercise.muscle} · {entry.exercise.equipment}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, color: "#666" }}>
                      {entry.sets.filter((s) => s.done).length}/
                      {entry.sets.length} sets
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px 1fr 1fr 36px",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    {["Set", "Reps", "lbs", "✓"].map((h) => (
                      <p
                        key={h}
                        style={{
                          margin: 0,
                          fontSize: 11,
                          color: "#666",
                          textAlign: "center",
                        }}
                      >
                        {h}
                      </p>
                    ))}
                  </div>
                  {entry.sets.map((set, si) => (
                    <div
                      key={si}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "36px 1fr 1fr 36px",
                        gap: 6,
                        marginBottom: 6,
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#888",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {si + 1}
                      </p>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(i, si, "reps", e.target.value)
                        }
                        style={{
                          background: CARD2,
                          border: "none",
                          borderRadius: 8,
                          padding: "7px",
                          color: "#fff",
                          fontSize: 14,
                          textAlign: "center",
                          width: "100%",
                          outline: "none",
                        }}
                      />
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(i, si, "weight", e.target.value)
                        }
                        style={{
                          background: CARD2,
                          border: "none",
                          borderRadius: 8,
                          padding: "7px",
                          color: "#fff",
                          fontSize: 14,
                          textAlign: "center",
                          width: "100%",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => toggleSetDone(i, si)}
                        style={{
                          background: set.done
                            ? `${COLORS.workout}30`
                            : "#2e2e32",
                          border: set.done
                            ? `1px solid ${COLORS.workout}`
                            : "1px solid transparent",
                          borderRadius: 8,
                          padding: "7px 0",
                          cursor: "pointer",
                          color: set.done ? COLORS.workout : "#666",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSet(i)}
                    style={{
                      background: `${COLORS.workout}15`,
                      border: `1px solid ${COLORS.workout}30`,
                      borderRadius: 9,
                      padding: "7px 14px",
                      color: COLORS.workout,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    + Add Set
                  </button>
                </C>
              ))}
              <button
                onClick={finishWorkout}
                style={{
                  background: COLORS.workout,
                  border: "none",
                  borderRadius: 14,
                  padding: "15px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  width: "100%",
                  marginTop: 4,
                }}
              >
                ✅ Finish & Save Workout
              </button>
            </>
          )}
        </>
      )}
      {wrkTab === "history" &&
        workoutHistory.map((w) => (
          <C key={w.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                  {w.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#666",
                    marginTop: 2,
                  }}
                >
                  {w.date} · {w.duration} min · {w.sets} sets
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.workout,
                  }}
                >
                  {w.volume.toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                  lbs volume
                </p>
              </div>
            </div>
          </C>
        ))}
      {wrkTab === "records" && (
        <>
          <C mb={10}>
            <H>Personal Records 🏆</H>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
              Auto-updated when you beat your best.
            </p>
          </C>
          {Object.entries(prs).map(([name, val]) => (
            <C key={name} p="12px 14px" mb={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Trophy size={16} color="#FF9800" />
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                    {name}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#FF9800",
                  }}
                >
                  {val} lbs
                </p>
              </div>
            </C>
          ))}
          {EXERCISES.filter((e) => !prs[e.name])
            .slice(0, 5)
            .map((ex) => (
              <C key={ex.id} p="12px 14px" mb={8}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Target size={16} color="#555" />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                      {ex.name}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
                    Not logged yet
                  </p>
                </div>
              </C>
            ))}
        </>
      )}
    </div>
  );

  // ── RENDER HEALTH ──
  const renderMetricDetail = () => {
    const m = selectedMetric;
    const raw = getGraphData(m.data, graphPeriod);
    const mn = raw.length ? Math.min(...raw) : 0,
      mx = raw.length ? Math.max(...raw) : 1;
    const avg = raw.length
      ? Math.round((raw.reduce((a, b) => a + b, 0) / raw.length) * 10) / 10
      : 0;
    return (
      <div style={{ padding: "52px 16px 16px" }}>
        <button
          onClick={() => setSelectedMetric(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 0 16px",
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} />
          Back to Health Monitor
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666" }}>
              {m.icon} {m.name}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {m.key === "sleep" ? fmtSleep(m.value) : m.value}
              <span
                style={{
                  fontSize: 16,
                  color: "#888",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                {m.key !== "sleep" ? m.unit : ""}
              </span>
            </p>
          </div>
          {m.trend && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: `${m.trendColor}18`,
                borderRadius: 20,
                padding: "8px 14px",
                border: `1px solid ${m.trendColor}30`,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: m.trendColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>
                  {m.trend === "up" ? "↑" : "↓"}
                </span>
              </div>
              <span
                style={{ color: m.trendColor, fontSize: 14, fontWeight: 700 }}
              >
                {m.trendLabel}
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            background: CARD2,
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
          }}
        >
          {["Week", "Month", "3M", "6M", "Year"].map((p) => (
            <button
              key={p}
              onClick={() => setGraphPeriod(p)}
              style={{
                flex: 1,
                background:
                  graphPeriod === p
                    ? m.trendColor || COLORS.workout
                    : "transparent",
                color: graphPeriod === p ? "#fff" : "#666",
                border: "none",
                borderRadius: 9,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <C>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: "#666" }}>
              {graphPeriod} trend
            </span>
            <span style={{ fontSize: 12, color: m.trendColor || "#888" }}>
              {raw.length} points
            </span>
          </div>
          {raw.length > 1 ? (
            <LineChart
              data={raw}
              color={m.trendColor || "#888"}
              mk={m.key}
              h={160}
            />
          ) : (
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#444" }}>No data</p>
            </div>
          )}
        </C>
        {raw.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              { l: "Min", v: Math.round(mn * 10) / 10 },
              { l: "Avg", v: avg },
              { l: "Max", v: Math.round(mx * 10) / 10 },
            ].map((s) => (
              <C key={s.l} mb={0} style={{ textAlign: "center", padding: 12 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: m.trendColor || "#fff",
                  }}
                >
                  {m.key === "sleep" ? fmtSleep(s.v) : s.v}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                  {s.l} {m.key !== "sleep" ? m.unit : ""}
                </p>
              </C>
            ))}
          </div>
        )}
        <C
          style={{
            background: `${m.trendColor || COLORS.workout}12`,
            border: `1px solid ${m.trendColor || COLORS.workout}30`,
          }}
        >
          <H>About {m.name}</H>
          <p
            style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.6 }}
          >
            {m.key === "rr" &&
              "Normal resting RR: 12–20 rpm. Elevated RR can indicate stress, illness, or poor recovery."}
            {m.key === "rhr" &&
              "Normal RHR: 50–80 bpm. Lower RHR generally indicates better cardiovascular fitness."}
            {m.key === "hrv" &&
              "HRV above 50ms indicates good recovery. Lower values suggest accumulated fatigue or stress."}
            {m.key === "spo2" &&
              "Healthy SpO₂: 95–100%. Values below 90% require medical attention."}
            {m.key === "temp" &&
              "Normal body temp: 97–99°F. Elevated temp may indicate fever or inflammation."}
            {m.key === "sleep" &&
              "Adults need 7–9 hours of quality sleep for optimal recovery and performance."}
          </p>
        </C>
      </div>
    );
  };

  const renderGrooming = () => {
    if (selectedMetric) return renderMetricDetail();
    return (
      <div style={{ padding: "52px 16px 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
          🏥 Health Monitor
        </h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 14px" }}>
          Vitals · Grooming · Recovery
        </p>
        <div
          style={{
            display: "flex",
            gap: 5,
            marginBottom: 14,
            overflowX: "auto",
          }}
        >
          {["monitor", "am", "pm", "shave", "products"].map((t) => (
            <button
              key={t}
              onClick={() => setGroomTab(t)}
              style={{
                flexShrink: 0,
                background: groomTab === t ? COLORS.grooming : CARD2,
                color: groomTab === t ? "#fff" : "#666",
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {t === "monitor"
                ? "Monitor"
                : t === "am"
                ? "AM"
                : t === "pm"
                ? "PM"
                : t === "shave"
                ? "Shave"
                : "Products"}
            </button>
          ))}
        </div>

        {groomTab === "monitor" && (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
              Tap any metric to view trends
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {HEALTH_METRICS.map((m) => (
                <MetricCard
                  key={m.key}
                  m={m}
                  onClick={() => {
                    setSelectedMetric(m);
                    setGraphPeriod("Month");
                  }}
                />
              ))}
            </div>
          </>
        )}

        {groomTab === "am" && (
          <C>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div>
                <H>Morning Routine ☀️</H>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  {amDone}/{AM_ROUTINE.length} steps
                </p>
              </div>
              <div
                style={{
                  background: `${COLORS.grooming}22`,
                  borderRadius: 20,
                  padding: "6px 12px",
                }}
              >
                <span
                  style={{
                    color: COLORS.grooming,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {Math.round((amDone / AM_ROUTINE.length) * 100)}%
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#2e2e32",
                borderRadius: 6,
                height: 6,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  background: COLORS.grooming,
                  height: "100%",
                  width: `${(amDone / AM_ROUTINE.length) * 100}%`,
                  borderRadius: 6,
                  transition: "width .4s",
                }}
              />
            </div>
            {AM_ROUTINE.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  const n = [...amChecked];
                  n[i] = !n[i];
                  setAmChecked(n);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "11px 0",
                  borderBottom:
                    i < AM_ROUTINE.length - 1 ? "1px solid #2e2e32" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: amChecked[i] ? COLORS.grooming : "#2e2e32",
                    border: amChecked[i] ? "none" : "1px solid #444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {amChecked[i] && <Check size={14} color="#fff" />}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: amChecked[i] ? "#666" : "#fff",
                      textDecoration: amChecked[i] ? "line-through" : "none",
                    }}
                  >
                    {item.step}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
            {amDone === AM_ROUTINE.length && (
              <div
                style={{
                  marginTop: 12,
                  background: `${COLORS.grooming}15`,
                  borderRadius: 12,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <p
                  style={{ margin: 0, color: COLORS.grooming, fontWeight: 700 }}
                >
                  🎉 Morning routine complete!
                </p>
              </div>
            )}
          </C>
        )}

        {groomTab === "pm" && (
          <C>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div>
                <H>Evening Routine 🌙</H>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  {pmDone}/{PM_ROUTINE.length} steps
                </p>
              </div>
              <div
                style={{
                  background: `${COLORS.grooming}22`,
                  borderRadius: 20,
                  padding: "6px 12px",
                }}
              >
                <span
                  style={{
                    color: COLORS.grooming,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {Math.round((pmDone / PM_ROUTINE.length) * 100)}%
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#2e2e32",
                borderRadius: 6,
                height: 6,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  background: COLORS.grooming,
                  height: "100%",
                  width: `${(pmDone / PM_ROUTINE.length) * 100}%`,
                  borderRadius: 6,
                  transition: "width .4s",
                }}
              />
            </div>
            {PM_ROUTINE.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  const n = [...pmChecked];
                  n[i] = !n[i];
                  setPmChecked(n);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "11px 0",
                  borderBottom:
                    i < PM_ROUTINE.length - 1 ? "1px solid #2e2e32" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: pmChecked[i] ? COLORS.grooming : "#2e2e32",
                    border: pmChecked[i] ? "none" : "1px solid #444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pmChecked[i] && <Check size={14} color="#fff" />}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: pmChecked[i] ? "#666" : "#fff",
                      textDecoration: pmChecked[i] ? "line-through" : "none",
                    }}
                  >
                    {item.step}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
            {pmDone === PM_ROUTINE.length && (
              <div
                style={{
                  marginTop: 12,
                  background: `${COLORS.grooming}15`,
                  borderRadius: 12,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <p
                  style={{ margin: 0, color: COLORS.grooming, fontWeight: 700 }}
                >
                  🌙 Evening routine complete!
                </p>
              </div>
            )}
          </C>
        )}

        {groomTab === "shave" && (
          <>
            <C
              style={{
                background: `${COLORS.grooming}12`,
                border: `1px solid ${COLORS.grooming}30`,
              }}
            >
              <H>💡 Bevel Tip of the Day</H>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#ddd",
                }}
              >
                {SHAVE_TIPS[tipIdx]}
              </p>
              <button
                onClick={() => setTipIdx((tipIdx + 1) % SHAVE_TIPS.length)}
                style={{
                  background: `${COLORS.grooming}20`,
                  border: `1px solid ${COLORS.grooming}40`,
                  borderRadius: 9,
                  padding: "7px 14px",
                  color: COLORS.grooming,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Next Tip →
              </button>
            </C>
            <C>
              <H>Shave Log</H>
              {shaveLog.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderBottom:
                      i < shaveLog.length - 1 ? "1px solid #2e2e32" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                        {s.date}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {s.method} · {s.notes}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: s.bumps === 0 ? "#4CAF50" : "#FF9800",
                          fontWeight: 700,
                        }}
                      >
                        {s.bumps === 0 ? "✓ Clean" : `${s.bumps} bumps`}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 2,
                          marginTop: 2,
                        }}
                      >
                        {Array.from({ length: 5 }, (_, j) => (
                          <Star
                            key={j}
                            size={10}
                            color={j < s.rating ? "#FFD700" : "#444"}
                            fill={j < s.rating ? "#FFD700" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </C>
          </>
        )}

        {groomTab === "products" && (
          <C>
            <H>My Product Shelf</H>
            {products.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom:
                    i < products.length - 1 ? "1px solid #2e2e32" : "none",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                    {p.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {p.cat} · {p.note}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star
                      key={j}
                      size={12}
                      color={j < p.rating ? "#FFD700" : "#444"}
                      fill={j < p.rating ? "#FFD700" : "none"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </C>
        )}
      </div>
    );
  };

  // ── RENDER PROGRESS ──
  const renderProgress = () => {
    const minW = Math.min(...weightLog.map((w) => w.w)),
      maxW = Math.max(...weightLog.map((w) => w.w)),
      range = maxW - minW || 1;
    const maxVol = Math.max(...workoutHistory.map((h) => h.volume));
    return (
      <div style={{ padding: "52px 16px 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
          📈 Progress
        </h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 14px" }}>
          Your journey at a glance
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["weight", "measurements", "workouts"].map((t) => (
            <button
              key={t}
              onClick={() => setProgressTab(t)}
              style={{
                flex: 1,
                background: progressTab === t ? COLORS.progress : CARD2,
                color: progressTab === t ? "#fff" : "#666",
                border: "none",
                borderRadius: 10,
                padding: "9px 0",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {progressTab === "weight" && (
          <>
            <C>
              <H>Weight Trend (lbs)</H>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  height: 120,
                  padding: "0 4px",
                }}
              >
                {weightLog.map((w, i) => {
                  const h = ((w.w - minW) / range) * 80 + 20;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 8,
                          color: COLORS.progress,
                          fontWeight: 700,
                        }}
                      >
                        {w.w}
                      </p>
                      <div
                        style={{
                          width: "100%",
                          background:
                            i === weightLog.length - 1
                              ? COLORS.progress
                              : `${COLORS.progress}66`,
                          borderRadius: "4px 4px 0 0",
                          height: `${h}px`,
                        }}
                      />
                      <p style={{ margin: 0, fontSize: 8, color: "#555" }}>
                        {w.date.slice(4)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </C>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              {[
                {
                  l: "Current",
                  v: `${weightLog[weightLog.length - 1].w} lbs`,
                  c: COLORS.progress,
                },
                { l: "Start", v: `${weightLog[0].w} lbs`, c: "#888" },
                {
                  l: "Lost",
                  v: `-${(
                    weightLog[0].w - weightLog[weightLog.length - 1].w
                  ).toFixed(1)} lbs`,
                  c: "#4CAF50",
                },
              ].map((s) => (
                <C
                  key={s.l}
                  mb={0}
                  style={{ textAlign: "center", padding: 12 }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      color: s.c,
                    }}
                  >
                    {s.v}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {s.l}
                  </p>
                </C>
              ))}
            </div>
          </>
        )}
        {progressTab === "measurements" &&
          Object.entries(measurements).map(([key, val]) => (
            <C key={key} p="14px 16px" mb={10}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                  {key}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: COLORS.progress,
                  }}
                >
                  {val}"
                </p>
              </div>
              <div
                style={{
                  background: "#2e2e32",
                  borderRadius: 6,
                  height: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: COLORS.progress,
                    height: "100%",
                    width: `${Math.min((val / 60) * 100, 100)}%`,
                    borderRadius: 6,
                  }}
                />
              </div>
            </C>
          ))}
        {progressTab === "workouts" && (
          <>
            <C>
              <H>Volume per Session</H>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 120,
                  padding: "0 4px",
                }}
              >
                {[...workoutHistory]
                  .slice(0, 5)
                  .reverse()
                  .map((w, i) => {
                    const h = (w.volume / maxVol) * 90 + 10;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 8,
                            color: COLORS.workout,
                            fontWeight: 700,
                          }}
                        >
                          {(w.volume / 1000).toFixed(1)}k
                        </p>
                        <div
                          style={{
                            width: "100%",
                            background: `${COLORS.workout}88`,
                            borderRadius: "4px 4px 0 0",
                            height: `${h}px`,
                          }}
                        />
                        <p style={{ margin: 0, fontSize: 8, color: "#555" }}>
                          {w.date.slice(4)}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </C>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                {
                  l: "Streak",
                  v: `${workoutStreak} days`,
                  c: COLORS.home,
                  e: "🔥",
                },
                {
                  l: "Sessions",
                  v: workoutHistory.length,
                  c: COLORS.workout,
                  e: "💪",
                },
                {
                  l: "Best Volume",
                  v: `${maxVol.toLocaleString()} lbs`,
                  c: COLORS.progress,
                  e: "🏋️",
                },
                {
                  l: "Avg Duration",
                  v: `${Math.round(
                    workoutHistory.reduce((s, w) => s + w.duration, 0) /
                      workoutHistory.length
                  )} min`,
                  c: "#4CAF50",
                  e: "⏱",
                },
              ].map((s) => (
                <C key={s.l} mb={0} style={{ padding: 14 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 22 }}>{s.e}</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: s.c,
                    }}
                  >
                    {s.v}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {s.l}
                  </p>
                </C>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const TABS = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "nutrition", icon: <Apple size={20} />, label: "Nutrition" },
    { id: "workout", icon: <Dumbbell size={20} />, label: "Fitness" },
    { id: "grooming", icon: <Heart size={20} />, label: "Health" },
    { id: "progress", icon: <TrendingUp size={20} />, label: "Progress" },
  ];

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        maxWidth: 390,
        margin: "0 auto",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',Helvetica,sans-serif",
        color: "#fff",
        paddingBottom: 85,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          zIndex: 50,
          background: BG,
          padding: "12px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span>9:41</span>
        <span>●●●●● 5G 🔋</span>
      </div>
      {tab === "home" && renderHome()}
      {tab === "nutrition" && renderNutrition()}
      {tab === "workout" && renderWorkout()}
      {tab === "grooming" && renderGrooming()}
      {tab === "progress" && renderProgress()}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          background: "#18181a",
          borderTop: "1px solid #2a2a2e",
          display: "flex",
          padding: "10px 0 18px",
          zIndex: 100,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              if (t.id !== "grooming") setSelectedMetric(null);
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tab === t.id ? COLORS[t.id] : "#555",
              transition: "color .2s",
            }}
          >
            {t.icon}
            <span style={{ fontSize: 9, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
