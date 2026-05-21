import { useState } from "react";

// ── Categories ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "הכל",            icon: "✨" },
  { id: "board",     label: "משחקי לוח",      icon: "🎲" },
  { id: "cards",     label: "קלפים",           icon: "🃏" },
  { id: "party",     label: "חברה ומסיבה",    icon: "🎉" },
  { id: "knowledge", label: "ידע וטריוויה",   icon: "🧠" },
  { id: "video",     label: "וידאו",            icon: "🎮" },
  { id: "sports",    label: "ספורט ופעילות",  icon: "⚽" },
];

// ── Templates (inspirations only) ─────────────────────────────────────────────
const GAME_TEMPLATES = [
  { id: "race",        category: "board",     icon: "🏁", color: "#2563eb", title: "מסלול (Race Game)",           description: "כולם רצים לסוף המסלול עם קוביה ומשבצות אירוע.",        example: "מריו קארט קופסה, Candy Land",   format: "board",  topic: "city"    },
  { id: "monopoly",    category: "board",     icon: "💰", color: "#059669", title: "רכוש ומסחר (Monopoly)",      description: "בניית אימפריה כלכלית, לוח נכסים וקלפי הפתעה.",           example: 'מונופול, עיר הנדל"ן',            format: "board",  topic: "city"    },
  { id: "adventure",   category: "board",     icon: "📍", color: "#e11d48", title: "הרפתקה (Adventure)",         description: "לוח פתוח עם אזורים ומשימות שיש להשלים.",                example: "מבוכים ודרקונים, Gloomhaven",    format: "board",  topic: "fantasy" },
  { id: "combat",      category: "board",     icon: "⚔️", color: "#dc2626", title: "קרב שחקנים (Combat)",        description: "HP לכל שחקן, קלפי התקפה והגנה עד שנשאר אחד.",          example: "Hearthstone, קלפי גיבורים",     format: "board",  topic: "fantasy" },
  { id: "strategy",    category: "board",     icon: "♟️", color: "#7c3aed", title: "אסטרטגיה (Strategy)",        description: "ניהול משאבים, בניית כוח ומלחמה על שטחים.",              example: "שחמט, ריסקו, קטאן",             format: "board",  topic: "history" },
  { id: "cooperative", category: "board",     icon: "🤝", color: "#0891b2", title: "שיתוף פעולה (Co-op)",        description: "כולם יחד נגד המשחק — מנצחים יחד או מפסידים יחד.",      example: "פנדמיה, Forbidden Island",      format: "board",  topic: "fantasy" },
  { id: "cards",       category: "cards",     icon: "🃏", color: "#7c3aed", title: "קלפים קלאסי",                description: "חפיסה מרכזית, כל שחקן מחזיק יד ומשחק תורות.",           example: "UNO, טאקי, מלחמה",              format: "party",  topic: "fantasy" },
  { id: "trading",     category: "cards",     icon: "⚡", color: "#d97706", title: "קלפי מסחר (TCG)",            description: "כל שחקן בונה חפיסה מראש ונלחם כנגד יריביו.",             example: "Magic, Pokémon, Yu-Gi-Oh",      format: "party",  topic: "fantasy" },
  { id: "memory",      category: "cards",     icon: "🔍", color: "#0891b2", title: "זיכרון (Memory)",            description: "קלפים הפוכים — מי שמוצא את כל הזוגות מנצח.",            example: "זיכרון, Concentration",         format: "memory", topic: "nature"  },
  { id: "charades",    category: "party",     icon: "🎭", color: "#e11d48", title: "מחוות (Charades)",           description: "מציגים בלי מילים, הצוות מנחש.",                          example: "Charades, פנטומימה",             format: "party",  topic: "movies"  },
  { id: "pictionary",  category: "party",     icon: "🎨", color: "#2563eb", title: "ציור (Pictionary)",          description: "מציירים מילה, הצוות מנחש לפני שנגמר הזמן.",             example: "Pictionary, Skribbl",            format: "party",  topic: "movies"  },
  { id: "truth",       category: "party",     icon: "💬", color: "#059669", title: "אמת או חובה",               description: "כל שחקן בוחר — שאלה אישית או אתגר מצחיק.",              example: "Truth or Dare, בקבוק",           format: "party",  topic: "fantasy" },
  { id: "trivia",      category: "knowledge", icon: "❓", color: "#d97706", title: "טריוויה (Trivia)",           description: "שאלות ידע כלליות, צבירת נקודות וזמן מוגבל.",             example: "פיצוחים, Trivial Pursuit",       format: "trivia", topic: "history" },
  { id: "escape",      category: "knowledge", icon: "🔐", color: "#7c3aed", title: "חדר בריחה (Escape Room)",    description: "חידות מקושרות שמובילות לפתרון — צוות פותר יחד.",        example: "Exit, Lock 'N Load",             format: "escape", topic: "fantasy" },
  { id: "quiz",        category: "knowledge", icon: "📺", color: "#0891b2", title: "תוכנית חידונים (Quiz Show)", description: "מנחה שואל, שחקנים עונים מהר — מי שמנחש מוביל.",         example: "Who Wants to Be a Millionaire", format: "trivia", topic: "history" },
  { id: "platformer",  category: "video",     icon: "🕹️", color: "#dc2626", title: "פלטפורמה (Platformer)",     description: "דמות קופצת על פלטפורמות, אוספת פריטים ומגיעה לסוף.",   example: "מריו, סוניק, Celeste",           format: "digital",topic: "fantasy" },
  { id: "puzzle",      category: "video",     icon: "🧩", color: "#059669", title: "פאזל (Puzzle Game)",         description: "חשיבה לוגית — הזזת חפצים, חיבור צורות, מציאת פתרון.",  example: "Tetris, Portal, Candy Crush",    format: "digital",topic: "space"   },
  { id: "rpg",         category: "video",     icon: "🗡️", color: "#7c3aed", title: "RPG",                        description: "עלילה עם דמויות, ניסיון, רמות ועולם פתוח לחקירה.",     example: "Zelda, Final Fantasy, Stardew",  format: "digital",topic: "fantasy" },
  { id: "sports",      category: "sports",    icon: "⚽", color: "#059669", title: "משחק ספורט",                 description: "מדמה ספורט עם כללים, ניקוד ומהלכים.",                   example: "FIFA, NBA 2K, Wii Sports",       format: "board",  topic: "sports"  },
  { id: "dexterity",   category: "sports",    icon: "🎯", color: "#e11d48", title: "זריזות ידיים (Dexterity)",   description: "פעולות מהירות ומדויקות — מהירות ידיים כנגד הזמן.",      example: "Jenga, Twister, Bop It",         format: "party",  topic: "sports"  },
];

// ── Game formats (HOW to play) ─────────────────────────────────────────────────
const GAME_FORMATS = [
  { id: "board",   icon: "🎲", label: "לוח משחק",    desc: "מסלול, אסטרטגיה, נכסים" },
  { id: "trivia",  icon: "❓", label: "טריוויה",      desc: "שאלות ותשובות, ידע" },
  { id: "memory",  icon: "🔍", label: "זיכרון",       desc: "זוגות קלפים, ריכוז" },
  { id: "party",   icon: "🎉", label: "מסיבה",        desc: "אמת/חובה, מחוות, ציור" },
  { id: "escape",  icon: "🔐", label: "חדר בריחה",    desc: "חידות ופאזלים" },
  { id: "digital", icon: "🎮", label: "וידאו גיים",   desc: "בקרוב..." },
];

// ── Game topics (WHAT the game is about) ──────────────────────────────────────
const TOPIC_PRESETS = [
  { id: "fantasy", label: "פנטזיה",    icon: "🧙" },
  { id: "space",   label: "חלל",       icon: "🚀" },
  { id: "sports",  label: "ספורט",     icon: "⚽" },
  { id: "animals", label: "בעלי חיים", icon: "🦁" },
  { id: "history", label: "היסטוריה",  icon: "🏛️" },
  { id: "science", label: "מדע",       icon: "🔬" },
  { id: "ocean",   label: "ים",        icon: "🌊" },
  { id: "city",    label: "עיר",       icon: "🏙️" },
  { id: "nature",  label: "טבע",       icon: "🌿" },
  { id: "music",   label: "מוזיקה",    icon: "🎵" },
  { id: "food",    label: "אוכל",      icon: "🍕" },
  { id: "movies",  label: "קולנוע",    icon: "🎬" },
];

// ── Theme mapping (board game → Sartort theme) ─────────────────────────────────
const TOPIC_TO_SARTORT = {
  fantasy: "medieval", city: "medieval", history: "medieval",
  ocean: "ocean", sports: "ocean", food: "ocean",
  space: "space", science: "space", nature: "space",
  animals: "dragons", movies: "dragons", music: "dragons",
};
const FORMAT_TO_SARTORT = {
  board: null, // use topic mapping
  trivia: "space", memory: "space", party: "medieval",
  escape: "volcano", digital: "dragons",
};

// ── Style tokens ───────────────────────────────────────────────────────────────
const C = {
  bg0: "#fff0f5", bg1: "#fff5f8", bg2: "#ffffff", bg3: "#fce8f2",
  border: "#f0d8e8", border2: "#e8c8d8",
  text1: "#2d1520", text2: "#a07888", text3: "#c0909e",
  indigo: "#f08080", indigoText: "#c06060",
};
const st = {
  page:      { minHeight: "100vh", background: C.bg1, color: C.text1, fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl" },
  header:    { position: "sticky", top: 0, zIndex: 50, background: "rgba(255,245,248,0.95)", borderBottom: `1px solid ${C.border}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(8px)" },
  main:      { maxWidth: 1100, margin: "0 auto", padding: "28px 16px" },
  card:      { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 },
  input:     { width: "100%", background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", color: C.text1, fontSize: 14, outline: "none", boxSizing: "border-box" },
  btnIndigo: { background: "#f08080", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnGhost:  { background: C.bg3, color: C.text2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" },
  label:     { display: "block", fontSize: 12, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
};

// ── TabBtn ─────────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      border: "none", borderBottom: active ? `2px solid ${C.indigo}` : "2px solid transparent",
      background: active ? C.bg3 : "transparent", color: active ? C.indigoText : C.text2, transition: "all .15s",
    }}>{children}</button>
  );
}

// ── Category Filter ────────────────────────────────────────────────────────────
function CatFilter({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
      {CATEGORIES.map(cat => (
        <button key={cat.id} onClick={() => onChange(cat.id)} style={{
          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
          border: `1.5px solid ${active === cat.id ? C.indigo : C.border}`,
          background: active === cat.id ? "#f0808018" : C.bg2,
          color: active === cat.id ? C.indigoText : C.text2, transition: "all .15s",
        }}>{cat.icon} {cat.label}</button>
      ))}
    </div>
  );
}

// ── Live Preview (format-based) ────────────────────────────────────────────────
function LivePreview({ format, topic, gameTitle, themeColor, playerName, logoFile }) {
  const tc = themeColor || "#f08080";
  const pn = playerName || "שחקן 1";
  const topicObj = TOPIC_PRESETS.find(t => t.id === topic) || TOPIC_PRESETS[0];
  return (
    <div style={{ background: C.bg0, border: `1px solid ${tc}44`, borderRadius: 14, padding: 16, position: "sticky", top: 76 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 700, letterSpacing: 1 }}>LIVE PREVIEW</span>
        <span style={{ fontSize: 10, background: C.bg3, color: C.text3, borderRadius: 4, padding: "2px 7px" }}>
          {topicObj.icon} {topicObj.label}
        </span>
      </div>
      <div style={{ padding: 12, borderRadius: 10, background: C.bg2, border: `1px solid ${tc}33` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: tc }}>{gameTitle || "ללא שם"}</span>
          {logoFile && <img src={logoFile} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "cover" }} />}
        </div>

        {(!format || format === "board") && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 10 }}>
              {["🏁 סוף", `${topicObj.icon} 3`, "✨ קלף", pn].map((t, i) => (
                <div key={i} style={{ background: C.bg3, border: i === 0 ? "1px solid #34d39944" : `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 4px", textAlign: "center", fontSize: 9, color: i === 3 ? tc : C.text2, fontWeight: i === 3 ? 700 : "normal" }}>{t}</div>
              ))}
            </div>
            <div style={{ background: tc, borderRadius: 8, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>🎲 הטל קוביה</div>
          </div>
        )}

        {format === "trivia" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "10px 12px", textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: C.text2, margin: "0 0 4px" }}>שאלה על {topicObj.label}: מה הוא...?</p>
              <span style={{ fontSize: 10, color: "#d97706" }}>⏳ זמן: 30 שניות</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["א.", "ב.", "ג.", "ד."].map(a => (
                <div key={a} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: C.text2 }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        {format === "memory" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 8 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ aspectRatio: "1", background: i < 2 ? "#b8edb844" : `${tc}22`, border: `1px solid ${i < 2 ? "#4a9a4a44" : C.border2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{i < 2 ? topicObj.icon : "?"}</div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.text3, textAlign: "center" }}>1/8 זוגות • {pn}</div>
          </div>
        )}

        {format === "party" && (
          <div>
            <div style={{ background: "#e8f4ff", border: "2px solid #4daaff33", borderRadius: 12, padding: "14px", textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#6090b0", marginBottom: 6 }}>💬 אמת — {pn}</div>
              <div style={{ fontSize: 12, color: "#2d1520" }}>מה הדבר הכי מביך שקרה לך?</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "#e8f4ff", borderRadius: 8, padding: "7px 0", textAlign: "center", fontSize: 11, color: "#2060a0", fontWeight: 700 }}>💬 אמת</div>
              <div style={{ flex: 1, background: "#fff0e8", borderRadius: 8, padding: "7px 0", textAlign: "center", fontSize: 11, color: "#c04820", fontWeight: 700 }}>🔥 חובה</div>
            </div>
          </div>
        )}

        {format === "escape" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🔐</div>
            <p style={{ fontSize: 11, color: C.text2, marginBottom: 10, marginTop: 0 }}>חידה {topicObj.icon}: "אני גבוה בצעירותי..."</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              <div style={{ flex: 1, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", fontSize: 11, color: C.text3 }}>הקלד תשובה...</div>
              <div style={{ background: tc, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</div>
            </div>
          </div>
        )}

        {format === "digital" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎮</div>
            <div style={{ fontSize: 13, color: C.text3, fontWeight: 600 }}>בקרוב...</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>וידאו גיים {topicObj.icon} {topicObj.label}</div>
          </div>
        )}

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <pre style={{ fontSize: 8, color: "#888", fontFamily: "monospace", background: C.bg0, borderRadius: 6, padding: "6px 8px", margin: 0, overflow: "auto" }}>{`{"format":"${format||"board"}","topic":"${topic||"fantasy"}","title":"${(gameTitle||"").replace(/"/g,"'")}"}`}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Community Game Card ────────────────────────────────────────────────────────
function GameCard({ game, onPlay }) {
  const tpl = GAME_TEMPLATES.find(t => t.id === game.template) || GAME_TEMPLATES[0];
  const fmt = GAME_FORMATS.find(f => f.id === (game.format || tpl.format));
  const topicObj = TOPIC_PRESETS.find(t => t.id === (game.topic || tpl.topic));
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...st.card, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color .15s, box-shadow .15s", borderColor: hovered ? "#f0a0c0" : C.border, boxShadow: hovered ? "0 4px 18px #f0808018" : "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: tpl.color + "18", border: `2px solid ${tpl.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{tpl.icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text1, marginBottom: 3 }}>{game.title}</div>
          <div style={{ fontSize: 11, color: C.text3 }}>
            {fmt?.icon} {fmt?.label} • {topicObj?.icon} {topicObj?.label} • {game.author}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#b8edb822", color: "#4a9a4a", border: "1px solid #b8edb866" }}>✓ מוכן</span>
        <button
          onClick={() => onPlay && onPlay(game)}
          style={{ background: "#f08080", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e86868"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f08080"; }}
        >▶ שחק</button>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #f0d8e8", borderRadius: 14, padding: "14px 24px", boxShadow: "0 8px 32px #f0808033", fontSize: 14, fontWeight: 600, color: "#2d1520", zIndex: 999, textAlign: "center", animation: "pop .2s ease-out", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function GameCreatorApp({ onBack, onStartGame }) {
  const [gamesList, setGamesList] = useState([
    { id: "1", title: "מרוץ הדרקונים", template: "race",    format: "board",  topic: "fantasy", author: "חיים"  },
    { id: "2", title: "טריוויה חלל",   template: "trivia",  format: "trivia", topic: "space",   author: "מערכת" },
    { id: "3", title: "חדר בריחה: ∞",  template: "escape",  format: "escape", topic: "fantasy", author: "מיכל"  },
    { id: "4", title: "זיכרון בעלי חיים", template: "memory", format: "memory", topic: "animals", author: "יוסי" },
    { id: "5", title: "אמת או חובה ×",  template: "truth",  format: "party",  topic: "fantasy", author: "רותם"  },
  ]);
  const [toast,            setToast]           = useState(null);
  const [tab,              setTab]             = useState("home");
  const [categoryFilter,   setCategoryFilter]   = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [gameFormat,       setGameFormat]       = useState("board");
  const [gameTopic,        setGameTopic]        = useState("fantasy");
  const [aiPrompt,         setAiPrompt]         = useState("");
  const [gameTitle,        setGameTitle]        = useState("");
  const [themeColor,       setThemeColor]       = useState("#f08080");
  const [playerName,       setPlayerName]       = useState("שחקן 1");
  const [logoFile,         setLogoFile]         = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }
  function findTpl(id) { return GAME_TEMPLATES.find(t => t.id === id) || GAME_TEMPLATES[0]; }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoFile(ev.target?.result);
    reader.readAsDataURL(file);
  }

  function handleAICreate(e) {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const p = aiPrompt.toLowerCase();
    let fmt = "board", topic = "fantasy";
    if      (p.includes("טריוויה") || p.includes("שאלה") || p.includes("ידע") || p.includes("quiz"))   { fmt = "trivia"; }
    else if (p.includes("זיכרון") || p.includes("זוגות") || p.includes("memory"))                       { fmt = "memory"; }
    else if (p.includes("אמת") || p.includes("חובה") || p.includes("מחוות") || p.includes("ציור") || p.includes("party")) { fmt = "party"; }
    else if (p.includes("חדר בריחה") || p.includes("escape") || p.includes("חידה"))                    { fmt = "escape"; }
    else if (p.includes("וידאו") || p.includes("מריו") || p.includes("rpg") || p.includes("פאזל"))     { fmt = "digital"; }

    if      (p.includes("פנטזיה") || p.includes("קסם") || p.includes("דרקון"))      topic = "fantasy";
    else if (p.includes("חלל") || p.includes("חייזר") || p.includes("כוכב"))        topic = "space";
    else if (p.includes("ספורט") || p.includes("כדורגל") || p.includes("ריצה"))     topic = "sports";
    else if (p.includes("בעל חיים") || p.includes("חיות") || p.includes("אריה"))   topic = "animals";
    else if (p.includes("היסטוריה") || p.includes("ביניים") || p.includes("עתיק")) topic = "history";
    else if (p.includes("מדע") || p.includes("פיזיקה") || p.includes("כימיה"))     topic = "science";
    else if (p.includes("ים") || p.includes("פיראט") || p.includes("אוקיינוס"))    topic = "ocean";
    else if (p.includes("עיר") || p.includes("מונופול") || p.includes("נכס"))      topic = "city";
    else if (p.includes("טבע") || p.includes("יער") || p.includes("צמח"))          topic = "nature";
    else if (p.includes("מוזיקה") || p.includes("שיר") || p.includes("להקה"))      topic = "music";
    else if (p.includes("אוכל") || p.includes("בישול") || p.includes("שף"))        topic = "food";
    else if (p.includes("סרט") || p.includes("קולנוע") || p.includes("טלוויזיה")) topic = "movies";

    setGameFormat(fmt);
    setGameTopic(topic);
    setGameTitle(aiPrompt.substring(0, 28) + (aiPrompt.length > 28 ? "..." : ""));
    setSelectedTemplate(null);
    setTab("create");
  }

  function handleSave() {
    if (!gameTitle.trim()) { showToast("אנא הכנס שם למשחק"); return; }
    setGamesList(prev => [
      { id: Date.now().toString(), title: gameTitle, template: selectedTemplate?.id || "race", format: gameFormat, topic: gameTopic, author: "אתה" },
      ...prev,
    ]);
    showToast("✓ המשחק נשמר ושותף לקהילה!");
    setTab("community");
  }

  function goCreate(tpl) {
    setSelectedTemplate(tpl);
    setThemeColor(tpl.color);
    setGameTitle(`המשחק שלי — ${tpl.title.split(" ")[0]}`);
    setGameFormat(tpl.format || "board");
    setGameTopic(tpl.topic || "fantasy");
    setTab("create");
  }

  function resolveThemeId(game) {
    const fmt = game.format || "board";
    if (fmt === "board") return TOPIC_TO_SARTORT[game.topic] || "medieval";
    return FORMAT_TO_SARTORT[fmt] || "medieval";
  }

  const visibleTemplates = categoryFilter === "all"
    ? GAME_TEMPLATES
    : GAME_TEMPLATES.filter(t => t.category === categoryFilter);

  return (
    <div style={st.page}>
      <style>{`@keyframes pop { 0%{transform:translateX(-50%) scale(.85);opacity:0} 100%{transform:translateX(-50%) scale(1);opacity:1} }`}</style>
      <Toast msg={toast} />

      <header style={st.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoFile
            ? <img src={logoFile} alt="Logo" style={{ width: 38, height: 38, borderRadius: 9, objectFit: "cover", border: `1px solid ${C.border}` }} />
            : <div style={{ width: 38, height: 38, background: "#FFB3C6", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎲</div>
          }
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#f08080" }}>GameForge Engine</div>
            <div style={{ fontSize: 11, color: C.text3 }}>מחולל כל סוגי המשחקים — Sartort</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <TabBtn active={tab === "home"}      onClick={() => setTab("home")}>🏠 דף הבית</TabBtn>
          <TabBtn active={tab === "create"}    onClick={() => { setTab("create"); if (!selectedTemplate) { setGameFormat("board"); setGameTopic("fantasy"); } }}>🎨 סטודיו עיצוב</TabBtn>
          <TabBtn active={tab === "community"} onClick={() => setTab("community")}>🌍 קהילה</TabBtn>
          <button onClick={onBack} style={{ ...st.btnGhost, marginRight: 10, padding: "7px 14px", fontSize: 12 }}>← חזור ל-Sartort</button>
        </div>
      </header>

      <main style={st.main}>

        {/* ── Home tab ── */}
        {tab === "home" && (
          <div>
            <div style={{ position: "relative", borderRadius: 20, background: "linear-gradient(135deg, #ffe0ec, #fff5f8, #e8f0ff)", border: `1px solid #f0c0d0`, padding: "28px 28px 32px", marginBottom: 36, overflow: "hidden" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f0808018", color: "#f08080", border: "1px solid #f0808033", marginBottom: 12 }}>✨ יצירה חכמה מתיאור</span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2d1520", margin: "0 0 8px" }}>יש לך רעיון למשחק בראש?</h2>
              <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 520 }}>
                תאר כל סוג משחק — לוח, טריוויה, זיכרון, מסיבה, חדר בריחה ועוד. המערכת תבחר <strong>צורת משחק</strong> ו<strong>נושא</strong> מתאימים ותפתח את הסטודיו.
              </p>
              <form onSubmit={handleAICreate} style={{ display: "flex", gap: 8, maxWidth: 560 }}>
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="לדוגמה: טריוויה על חלל, חדר בריחה פנטזיה, זיכרון בעלי חיים..."
                  style={{ ...st.input, flex: 1 }} />
                <button type="submit" style={{ ...st.btnIndigo, whiteSpace: "nowrap", flexShrink: 0 }}>✨ צור משחק</button>
              </form>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>השראות לפי סוג משחק</h3>
              <p style={{ fontSize: 12, color: C.text3, margin: "0 0 18px" }}>לחץ על תבנית כדי להתחיל — תוכל לשנות צורת משחק ונושא בסטודיו</p>
            </div>
            <CatFilter active={categoryFilter} onChange={setCategoryFilter} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {visibleTemplates.map(tpl => (
                <div key={tpl.id} onClick={() => goCreate(tpl)}
                  style={{ ...st.card, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "border-color .15s, background .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0a0c0"; e.currentTarget.style.background = "#fff0f5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg2; }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: tpl.color + "22", border: `1px solid ${tpl.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{tpl.icon}</div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ fontSize: 10, background: C.bg3, color: C.text3, borderRadius: 20, padding: "2px 8px" }}>{GAME_FORMATS.find(f => f.id === tpl.format)?.icon} {GAME_FORMATS.find(f => f.id === tpl.format)?.label}</span>
                        <span style={{ fontSize: 10, background: C.bg0, color: C.text3, borderRadius: 20, padding: "2px 8px" }}>{TOPIC_PRESETS.find(t => t.id === tpl.topic)?.icon} {TOPIC_PRESETS.find(t => t.id === tpl.topic)?.label}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text1, marginBottom: 8 }}>{tpl.title}</div>
                    <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, margin: "0 0 14px" }}>{tpl.description}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11 }}>
                    <span style={{ color: C.text2 }}>{tpl.example}</span>
                    <span style={{ color: C.indigoText, fontWeight: 600 }}>בחר ←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Create tab ── */}
        {tab === "create" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Section 1: format */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>צורת המשחק</div>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>כיצד המשחק מתנהל — מה השחקנים עושים בפועל</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {GAME_FORMATS.map(fmt => (
                    <button key={fmt.id} onClick={() => fmt.id !== "digital" && setGameFormat(fmt.id)}
                      style={{
                        background: gameFormat === fmt.id ? "#f0808018" : C.bg0,
                        border: `2px solid ${gameFormat === fmt.id ? C.indigo : C.border}`,
                        borderRadius: 12, padding: "12px 8px", cursor: fmt.id === "digital" ? "not-allowed" : "pointer",
                        textAlign: "center", opacity: fmt.id === "digital" ? 0.5 : 1, transition: "all .15s",
                      }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{fmt.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: gameFormat === fmt.id ? C.indigoText : C.text1 }}>{fmt.label}</div>
                      <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: topic */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>נושא המשחק</div>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>על מה המשחק — ישפיע על האיקונים, הצבעים והתוכן</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {TOPIC_PRESETS.map(t => (
                    <button key={t.id} onClick={() => setGameTopic(t.id)}
                      style={{
                        padding: "7px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: `2px solid ${gameTopic === t.id ? C.indigo : C.border}`,
                        background: gameTopic === t.id ? "#f0808018" : C.bg0,
                        color: gameTopic === t.id ? C.indigoText : C.text2, transition: "all .15s",
                      }}>{t.icon} {t.label}</button>
                  ))}
                </div>
              </div>

              {/* Section 3: details */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 16 }}>פרטי המשחק</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={st.label}>שם המשחק</label>
                  <input value={gameTitle} onChange={e => setGameTitle(e.target.value)} style={st.input} placeholder="שם מגניב למשחק שלך..." />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={st.label}>צבע ערכת נושא</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
                      style={{ width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
                    <span style={{ fontSize: 12, color: C.text3, fontFamily: "monospace" }}>{themeColor}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={st.label}>שם שחקן ברירת מחדל</label>
                  <input value={playerName} onChange={e => setPlayerName(e.target.value)} style={st.input} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={st.label}>לוגו ייעודי</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ ...st.btnGhost, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      📁 בחר קובץ
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                    </label>
                    {logoFile && <span style={{ fontSize: 11, color: "#4a9a4a" }}>✓ נטען</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleSave} style={{ ...st.btnIndigo, flex: 1, justifyContent: "center", fontSize: 14, padding: "12px 0" }}>📤 שמור ושתף עם הקהילה</button>
                  <button onClick={() => setTab("home")} style={{ ...st.btnGhost, fontSize: 12 }}>ביטול</button>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <LivePreview format={gameFormat} topic={gameTopic} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} />
          </div>
        )}

        {/* ── Community tab ── */}
        {tab === "community" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>מאגר משחקי הקהילה</h3>
                <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>משחקים עם צורות ונושאים שונים — לחץ שחק להתחיל ממש</p>
              </div>
              <button onClick={() => { setSelectedTemplate(null); setGameFormat("board"); setGameTopic("fantasy"); setGameTitle(""); setTab("create"); }}
                style={{ ...st.btnIndigo, fontSize: 12, padding: "9px 14px" }}>➕ צור משחק חדש</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {gamesList.map(g => (
                <GameCard key={g.id} game={g}
                  onPlay={(game) => {
                    if (onStartGame) {
                      onStartGame({
                        themeId: resolveThemeId(game),
                        format: game.format || "board",
                        topic: game.topic || "fantasy",
                        name: game.title,
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
