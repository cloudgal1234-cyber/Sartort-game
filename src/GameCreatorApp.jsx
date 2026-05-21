import { useState, useEffect, useRef } from "react";

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

// ── Templates ──────────────────────────────────────────────────────────────────
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

// ── Game formats ───────────────────────────────────────────────────────────────
const GAME_FORMATS = [
  { id: "board",   icon: "🎲", label: "לוח משחק",    desc: "מסלול, אסטרטגיה, נכסים" },
  { id: "trivia",  icon: "❓", label: "טריוויה",      desc: "שאלות ותשובות, ידע" },
  { id: "memory",  icon: "🔍", label: "זיכרון",       desc: "זוגות קלפים, ריכוז" },
  { id: "party",   icon: "🎉", label: "מסיבה",        desc: "אמת/חובה, מחוות, ציור" },
  { id: "escape",  icon: "🔐", label: "חדר בריחה",    desc: "חידות ופאזלים" },
  { id: "digital", icon: "🎮", label: "וידאו גיים",   desc: "בקרוב..." },
];

// ── Game topics ────────────────────────────────────────────────────────────────
const TOPIC_PRESETS = [
  { id: "fantasy", label: "פנטזיה",    icon: "🧙", desc: "קסם, דרקונים, גיבורים",      group: "הרפתקה" },
  { id: "space",   label: "חלל",       icon: "🚀", desc: "כוכבים, חייזרים, גלקסיות",   group: "הרפתקה" },
  { id: "ocean",   label: "ים",        icon: "🌊", desc: "פיראטים, אוצרות, עומקים",    group: "הרפתקה" },
  { id: "history", label: "היסטוריה",  icon: "🏛️", desc: "עתיקות, מלחמות, תרבויות",   group: "ידע" },
  { id: "science", label: "מדע",       icon: "🔬", desc: "פיזיקה, כימיה, טכנולוגיה",   group: "ידע" },
  { id: "animals", label: "בעלי חיים", icon: "🦁", desc: "חיות בר, חיות מחמד, טבע",   group: "ידע" },
  { id: "sports",  label: "ספורט",     icon: "⚽", desc: "כדורגל, ריצה, אולימפיאדה",  group: "אקשן" },
  { id: "city",    label: "עיר",       icon: "🏙️", desc: "נדל\"ן, מסחר, בנייה",        group: "אקשן" },
  { id: "nature",  label: "טבע",       icon: "🌿", desc: "יער, צמחים, אקולוגיה",       group: "אקשן" },
  { id: "music",   label: "מוזיקה",    icon: "🎵", desc: "מנגינות, להקות, אמנים",      group: "תרבות" },
  { id: "food",    label: "אוכל",      icon: "🍕", desc: "בישול, מטבח עולמי, שפים",    group: "תרבות" },
  { id: "movies",  label: "קולנוע",    icon: "🎬", desc: "סרטים, טלוויזיה, שחקנים",   group: "תרבות" },
];

// ── Board visual designs ────────────────────────────────────────────────────────
const BOARD_DESIGNS = [
  { id: "pastel",  label: "פסטל",     icon: "🌸", bg: "#fff5f8", accent: "#f08080", cell: "#fce8f2", text: "#2d1520" },
  { id: "space",   label: "חלל",      icon: "🌌", bg: "#0d0d2a", accent: "#6464ff", cell: "#1a1a40", text: "#e0e0ff" },
  { id: "forest",  label: "יער",      icon: "🌲", bg: "#0a1e0a", accent: "#34d399", cell: "#142a14", text: "#d0f8d0" },
  { id: "ocean",   label: "ים",       icon: "🌊", bg: "#061525", accent: "#38bdf8", cell: "#0d2035", text: "#c0e8ff" },
  { id: "lava",    label: "לבה",      icon: "🌋", bg: "#1a0500", accent: "#f97316", cell: "#2d0a00", text: "#ffe0c0" },
  { id: "neon",    label: "ניאון",    icon: "⚡", bg: "#050510", accent: "#a855f7", cell: "#100520", text: "#e8d0ff" },
];

// ── Theme mappings ─────────────────────────────────────────────────────────────
const TOPIC_TO_SARTORT = {
  fantasy: "medieval", city: "medieval", history: "medieval",
  ocean: "ocean", sports: "ocean", food: "ocean",
  space: "space", science: "space", nature: "space",
  animals: "dragons", movies: "dragons", music: "dragons",
};
const FORMAT_TO_SARTORT = {
  board: null, trivia: "space", memory: "space", party: "medieval",
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
      padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      border: "none", borderBottom: active ? `2px solid ${C.indigo}` : "2px solid transparent",
      background: active ? C.bg3 : "transparent", color: active ? C.indigoText : C.text2, transition: "all .15s",
      whiteSpace: "nowrap",
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

// ── Live Preview ───────────────────────────────────────────────────────────────
function LivePreview({ format, topic, customTopic, customTopicIcon, gameTitle, themeColor, playerName, logoFile, boardDesign }) {
  const tc = themeColor || "#f08080";
  const pn = playerName || "שחקן 1";
  const topicObj = TOPIC_PRESETS.find(t => t.id === topic) || TOPIC_PRESETS[0];
  const displayIcon = customTopic ? (customTopicIcon || "⭐") : topicObj.icon;
  const displayLabel = customTopic || topicObj.label;
  const design = BOARD_DESIGNS.find(d => d.id === boardDesign) || BOARD_DESIGNS[0];
  const isDark = boardDesign && boardDesign !== "pastel";

  return (
    <div style={{ background: isDark ? design.bg : C.bg0, border: `1px solid ${isDark ? design.accent + "55" : tc + "44"}`, borderRadius: 14, padding: 16, position: "sticky", top: 76, transition: "all .3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${isDark ? design.accent + "33" : C.border}` }}>
        <span style={{ fontSize: 10, color: isDark ? design.accent : C.text3, fontWeight: 700, letterSpacing: 1 }}>LIVE PREVIEW</span>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ fontSize: 10, background: isDark ? design.cell : C.bg3, color: isDark ? design.text : C.text3, borderRadius: 4, padding: "2px 7px" }}>
            {design.icon} {design.label}
          </span>
          <span style={{ fontSize: 10, background: isDark ? design.cell : C.bg3, color: isDark ? design.text : C.text3, borderRadius: 4, padding: "2px 7px" }}>
            {displayIcon} {displayLabel}
          </span>
        </div>
      </div>
      <div style={{ padding: 12, borderRadius: 10, background: isDark ? design.cell : C.bg2, border: `1px solid ${isDark ? design.accent + "33" : tc + "33"}`, transition: "all .3s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? design.accent : tc }}>{gameTitle || "ללא שם"}</span>
          {logoFile && <img src={logoFile} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "cover" }} />}
        </div>

        {(!format || format === "board") && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 10 }}>
              {["🏁 סוף", `${displayIcon} 3`, "✨ קלף", pn].map((t, i) => (
                <div key={i} style={{ background: isDark ? design.bg : C.bg3, border: i === 3 ? `1px solid ${isDark ? design.accent : tc}88` : `1px solid ${isDark ? design.accent + "22" : C.border2}`, borderRadius: 6, padding: "6px 4px", textAlign: "center", fontSize: 9, color: i === 3 ? (isDark ? design.accent : tc) : (isDark ? design.text : C.text2), fontWeight: i === 3 ? 700 : "normal" }}>{t}</div>
              ))}
            </div>
            <div style={{ background: isDark ? design.accent : tc, borderRadius: 8, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>🎲 הטל קוביה</div>
          </div>
        )}

        {format === "trivia" && (
          <div>
            <div style={{ background: isDark ? design.bg : C.bg3, borderRadius: 8, padding: "10px 12px", textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: isDark ? design.text : C.text2, margin: "0 0 4px" }}>שאלה על {displayLabel}: מה הוא...?</p>
              <span style={{ fontSize: 10, color: "#d97706" }}>⏳ זמן: 30 שניות</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["א.", "ב.", "ג.", "ד."].map(a => (
                <div key={a} style={{ background: isDark ? design.bg : C.bg3, border: `1px solid ${isDark ? design.accent + "33" : C.border2}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: isDark ? design.text : C.text2 }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        {format === "memory" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 8 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ aspectRatio: "1", background: i < 2 ? (isDark ? design.accent + "33" : "#b8edb844") : (isDark ? design.bg : `${tc}22`), border: `1px solid ${i < 2 ? (isDark ? design.accent + "88" : "#4a9a4a44") : (isDark ? design.accent + "22" : C.border2)}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{i < 2 ? displayIcon : "?"}</div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: isDark ? design.text : C.text3, textAlign: "center" }}>1/8 זוגות • {pn}</div>
          </div>
        )}

        {format === "party" && (
          <div>
            <div style={{ background: isDark ? design.bg : "#e8f4ff", border: `2px solid ${isDark ? design.accent + "44" : "#4daaff33"}`, borderRadius: 12, padding: "14px", textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: isDark ? design.accent : "#6090b0", marginBottom: 6 }}>💬 אמת — {pn}</div>
              <div style={{ fontSize: 12, color: isDark ? design.text : "#2d1520" }}>מה הדבר הכי מביך שקרה לך?</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: isDark ? design.cell : "#e8f4ff", borderRadius: 8, padding: "7px 0", textAlign: "center", fontSize: 11, color: isDark ? design.accent : "#2060a0", fontWeight: 700 }}>💬 אמת</div>
              <div style={{ flex: 1, background: isDark ? design.cell : "#fff0e8", borderRadius: 8, padding: "7px 0", textAlign: "center", fontSize: 11, color: isDark ? design.text : "#c04820", fontWeight: 700 }}>🔥 חובה</div>
            </div>
          </div>
        )}

        {format === "escape" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🔐</div>
            <p style={{ fontSize: 11, color: isDark ? design.text : C.text2, marginBottom: 10, marginTop: 0 }}>חידה {displayIcon}: "אני גבוה בצעירותי..."</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              <div style={{ flex: 1, background: isDark ? design.bg : C.bg0, border: `1px solid ${isDark ? design.accent + "44" : C.border}`, borderRadius: 8, padding: "8px", fontSize: 11, color: isDark ? design.text : C.text3 }}>הקלד תשובה...</div>
              <div style={{ background: isDark ? design.accent : tc, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</div>
            </div>
          </div>
        )}

        {format === "digital" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎮</div>
            <div style={{ fontSize: 13, color: isDark ? design.text : C.text3, fontWeight: 600 }}>בקרוב...</div>
            <div style={{ fontSize: 11, color: isDark ? design.accent : C.text3, marginTop: 4 }}>וידאו גיים {displayIcon} {displayLabel}</div>
          </div>
        )}

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${isDark ? design.accent + "22" : C.border}` }}>
          <pre style={{ fontSize: 8, color: isDark ? design.accent + "aa" : "#888", fontFamily: "monospace", background: isDark ? design.bg : C.bg0, borderRadius: 6, padding: "6px 8px", margin: 0, overflow: "auto" }}>{`{"format":"${format||"board"}","topic":"${customTopic || topic||"fantasy"}","design":"${boardDesign||"pastel"}"}`}</pre>
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

// ── AI Simulation logic ────────────────────────────────────────────────────────
function runSimulation(format, topic, playerCount = 3) {
  const GAMES = 100;
  const wins = Array(playerCount).fill(0);
  const turnCounts = [];

  if (format === "board") {
    for (let g = 0; g < GAMES; g++) {
      const positions = Array(playerCount).fill(0);
      let turns = 0;
      let winner = -1;
      while (winner === -1 && turns < 400) {
        for (let p = 0; p < playerCount && winner === -1; p++) {
          const roll = Math.ceil(Math.random() * 6);
          positions[p] = Math.min(positions[p] + roll, 30);
          if (positions[p] >= 30) winner = p;
        }
        turns++;
      }
      if (winner === -1) winner = positions.indexOf(Math.max(...positions));
      wins[winner]++;
      turnCounts.push(turns);
    }
  } else if (format === "trivia") {
    for (let g = 0; g < GAMES; g++) {
      const scores = Array(playerCount).fill(0).map(() => 0);
      for (let q = 0; q < 10; q++) {
        for (let p = 0; p < playerCount; p++) {
          if (Math.random() < 0.55) scores[p]++;
        }
      }
      const maxScore = Math.max(...scores);
      const winner = scores.indexOf(maxScore);
      wins[winner]++;
      turnCounts.push(10);
    }
  } else if (format === "memory") {
    for (let g = 0; g < GAMES; g++) {
      const scores = Array(playerCount).fill(0).map(() => Math.floor(Math.random() * 8));
      const winner = scores.indexOf(Math.max(...scores));
      wins[winner]++;
      turnCounts.push(Math.floor(Math.random() * 20) + 16);
    }
  } else if (format === "party") {
    for (let g = 0; g < GAMES; g++) {
      const winner = Math.floor(Math.random() * playerCount);
      wins[winner]++;
      turnCounts.push(Math.floor(Math.random() * 10) + 5);
    }
  } else if (format === "escape") {
    for (let g = 0; g < GAMES; g++) {
      const winner = 0;
      wins[winner]++;
      turnCounts.push(Math.floor(Math.random() * 15) + 10);
    }
  } else {
    for (let g = 0; g < GAMES; g++) {
      const winner = Math.floor(Math.random() * playerCount);
      wins[winner]++;
      turnCounts.push(Math.floor(Math.random() * 8) + 3);
    }
  }

  const avgTurns = Math.round(turnCounts.reduce((a, b) => a + b, 0) / GAMES);
  const maxWins = Math.max(...wins);
  const dominance = (maxWins / GAMES) * 100;
  const balanced = dominance < 45;

  return { wins, avgTurns, dominance: Math.round(dominance), balanced, playerCount };
}

function analyzeGame(format, topic, gameTitle, boardDesign, simData) {
  const issues = [];
  const suggestions = [];
  let score = 100;

  if (!gameTitle || gameTitle.length < 3) {
    issues.push({ type: "warn", text: "שם המשחק קצר מדי — שם טוב מושך שחקנים" });
    score -= 8;
  }
  if (format === "board" && boardDesign === "pastel") {
    suggestions.push("נסה עיצוב 'חלל' או 'ים' — הם נראים מרשימים יותר ללוח");
  }
  if (format === "digital") {
    issues.push({ type: "info", text: "וידאו גיים בקרוב — בינתיים יופעל כמשחק לוח" });
    score -= 5;
  }
  if (format === "trivia" && topic === "city") {
    suggestions.push("טריוויה על עיר יכולה להיות צרה מדי — שקול 'היסטוריה' או 'מדע'");
  }
  if (format === "escape" && topic === "food") {
    suggestions.push("חדר בריחה עם נושא אוכל מפתיע! הוסף חידות יצירתיות");
  }

  if (simData) {
    const { dominance, balanced, avgTurns, wins, playerCount } = simData;
    if (!balanced) {
      const bestPlayer = wins.indexOf(Math.max(...wins));
      issues.push({ type: "error", text: `איזון: שחקן ${bestPlayer + 1} מנצח ${dominance}% מהמשחקים — קשה מדי לשאר` });
      score -= 18;
      suggestions.push(`הוסף מנגנון נגד שחקן מוביל (קלף עונש, קיצור מסלול לאחרים)`);
    }
    if (avgTurns < 5) {
      issues.push({ type: "warn", text: `המשחק קצר מדי — ממוצע ${avgTurns} תורות בלבד` });
      score -= 10;
      suggestions.push("הוסף אירועי ביניים שמאריכים את המשחק");
    }
    if (avgTurns > 60) {
      issues.push({ type: "warn", text: `המשחק ארוך מדי — ממוצע ${avgTurns} תורות` });
      score -= 8;
      suggestions.push("שקול להוסיף קיצורי מסלול או תנאי ניצחון מהיר");
    }
    if (balanced && avgTurns >= 5 && avgTurns <= 60) {
      suggestions.push("✅ האיזון טוב! המשחק מאוזן היטב בין שחקנים");
    }
  } else {
    suggestions.push("הרץ סימולציה לניתוח איזון מדויק");
    score -= 5;
  }

  suggestions.push("הוסף הסבר חוקים ברור בתחילת המשחק");
  if (format === "board") suggestions.push("שקול להוסיף קלפי הפתעה שמשנים את הדינמיקה");

  return { issues, suggestions, score: Math.max(0, score) };
}

// ── ScoreRing ─────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 34, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke={C.border} strokeWidth={7} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 900, color }}>{score}</span>
        <span style={{ fontSize: 9, color: C.text3 }}>ציון</span>
      </div>
    </div>
  );
}

// ── Colab chat bot responses ───────────────────────────────────────────────────
const BOT_REPLIES = {
  format: {
    board:   "לוח משחק — מעולה! שקול להוסיף משבצות אירוע ייחודיות 🎲",
    trivia:  "טריוויה — כיף! בטוח שהשאלות מאוזנות בקושי? 📚",
    memory:  "זיכרון — אינטואיטיבי ופשוט, מצוין! 🧠",
    party:   "מסיבה — נהדר לקבוצות! הוסף אתגרים יצירתיים 🎉",
    escape:  "חדר בריחה — מרגש! ודא שהחידות מחוברות לסיפור 🔐",
    digital: "וידאו גיים — שאפו! בקרוב נוכל לבנות אותו 🎮",
  },
  topic: {
    fantasy: "פנטזיה — נושא קלאסי! הדרקונים מחכים 🧙",
    space:   "חלל — אחלה! אל תשכח את הכוכבים הנופלים 🚀",
    sports:  "ספורט — דינמי ותחרותי! ⚽",
    animals: "בעלי חיים — חמוד ומושך לכל גיל 🦁",
    history: "היסטוריה — מעניין ומחנך 🏛️",
    science: "מדע — שאלות ניסויים ייתנו אווירה מגניבה 🔬",
    ocean:   "ים — עמוק ומסתורי! 🌊",
    city:    "עיר — נדל\"ן? מסחר? נושא מושלם ללוח 🏙️",
    nature:  "טבע — נעים ורגוע 🌿",
    music:   "מוזיקה — אפשר לשלב צלילים? 🎵",
    food:    "אוכל — כולם אוהבים! 🍕",
    movies:  "קולנוע — שאלות טריוויה על סרטים 🎬",
  },
};

// ── Emoji picker rows ──────────────────────────────────────────────────────────
const EMOJI_OPTIONS = [
  "⭐","🌟","💫","🔥","❄️","🌈","🌀","💎","🏆","👑",
  "🦄","🐉","🦊","🐺","🦋","🦅","🐬","🐙","🌸","🌵",
  "🍄","🍀","🌙","☀️","⚡","🌊","🏔️","🌋","🗺️","🔮",
  "⚔️","🛡️","🪄","🎭","🎪","🎨","🎯","🚀","🛸","🌌",
];

// ── Invent Topic Panel ─────────────────────────────────────────────────────────
function InventTopicPanel({ customTopic, setCustomTopic, customIcon, setCustomIcon, customDesc, setCustomDesc, onClear }) {
  const [open, setOpen] = useState(false);
  const isActive = !!customTopic;

  return (
    <div style={{ marginTop: 4, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isActive ? "#f0808010" : C.bg0,
          border: `2px ${isActive ? "solid" : "dashed"} ${isActive ? C.indigo : C.border}`,
          borderRadius: 12, padding: "11px 14px", cursor: "pointer", transition: "all .2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{isActive ? (customIcon || "⭐") : "✨"}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.indigoText : C.text2 }}>
              {isActive ? customTopic : "המצאת נושא משלך?"}
            </div>
            <div style={{ fontSize: 10, color: C.text3 }}>
              {isActive ? (customDesc || "נושא מומצא") : "לחץ כדי להגדיר עולם משחק ייחודי"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isActive && (
            <button
              onClick={e => { e.stopPropagation(); onClear(); setOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 14, padding: "0 4px" }}
            >✕</button>
          )}
          <span style={{ fontSize: 12, color: C.text3 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 10, padding: 16, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Name */}
          <div>
            <label style={st.label}>שם הנושא / העולם שהמצאת</label>
            <input
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder='לדוגמה: ממלכת הגמדים הטסים, כוכב הצבים הגלאקטיים...'
              style={{ ...st.input, fontSize: 13, borderColor: customTopic ? C.indigo : C.border }}
              autoFocus
            />
          </div>

          {/* Icon picker */}
          <div>
            <label style={st.label}>בחר אייקון לנושא שלך</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  onClick={() => setCustomIcon(em)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: `2px solid ${customIcon === em ? C.indigo : C.border}`,
                    background: customIcon === em ? "#f0808018" : C.bg2,
                    cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .12s",
                  }}
                >{em}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={st.label}>תאר בקצרה את העולם שהמצאת (אופציונלי)</label>
            <textarea
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              placeholder="לדוגמה: עולם שבו גמדים עם כנפיים שולטים בארצות מעופפות ונלחמים בעורבים ענקיים..."
              rows={3}
              style={{ ...st.input, resize: "vertical", lineHeight: 1.6, fontSize: 12 }}
            />
          </div>

          {/* Preview card */}
          {customTopic && (
            <div style={{ background: C.bg2, border: `2px solid ${C.indigo}44`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0808018", border: `2px solid ${C.indigo}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {customIcon || "⭐"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>{customTopic}</div>
                {customDesc && <div style={{ fontSize: 11, color: C.text3, marginTop: 3, lineHeight: 1.4 }}>{customDesc}</div>}
                <div style={{ fontSize: 10, color: C.indigoText, marginTop: 4, fontWeight: 600 }}>✓ נושא מומצא — ייושם על המשחק</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(false)}
            style={{ ...st.btnIndigo, justifyContent: "center", padding: "10px 0" }}
            disabled={!customTopic}
          >
            {customTopic ? `✓ אשר נושא: ${customIcon || "⭐"} ${customTopic}` : "הכנס שם נושא כדי לאשר"}
          </button>
        </div>
      )}
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
  const [customTopic,      setCustomTopic]      = useState("");
  const [customTopicIcon,  setCustomTopicIcon]  = useState("⭐");
  const [customTopicDesc,  setCustomTopicDesc]  = useState("");
  const [boardDesign,      setBoardDesign]      = useState("pastel");
  const [aiPrompt,         setAiPrompt]         = useState("");
  const [gameTitle,        setGameTitle]        = useState("");
  const [themeColor,       setThemeColor]       = useState("#f08080");
  const [playerName,       setPlayerName]       = useState("שחקן 1");
  const [logoFile,         setLogoFile]         = useState(null);

  // AI tab state
  const [simRunning,  setSimRunning]  = useState(false);
  const [simDone,     setSimDone]     = useState(false);
  const [simData,     setSimData]     = useState(null);
  const [simProgress, setSimProgress] = useState(0);

  // Colab tab state
  const [roomCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [colabMsgs, setColabMsgs] = useState([
    { from: "bot", name: "🤖 GameBot", text: "שלום! אני עוזר ה-AI. שנה פורמט או נושא — אתן פידבק מיידי.", ts: Date.now() - 90000 },
    { from: "user2", name: "👤 דנה", text: "חיכיתי לזה! נשתף עיצוב?", ts: Date.now() - 45000 },
  ]);
  const [colabInput, setColabInput]   = useState("");
  const [members] = useState([
    { name: "אתה", role: "יוצר ראשי", color: "#f08080", online: true },
    { name: "דנה", role: "עוזר",       color: "#34d399", online: true },
    { name: "יוסי", role: "צופה",      color: "#60a5fa", online: false },
  ]);
  const chatEndRef = useRef(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [colabMsgs]);

  // Bot reacts to format/topic changes
  const prevFormatRef = useRef(gameFormat);
  const prevTopicRef  = useRef(gameTopic);
  useEffect(() => {
    if (tab !== "colab") return;
    if (prevFormatRef.current !== gameFormat) {
      const reply = BOT_REPLIES.format[gameFormat] || "שינוי מעניין!";
      setTimeout(() => {
        setColabMsgs(prev => [...prev, { from: "bot", name: "🤖 GameBot", text: reply, ts: Date.now() }]);
      }, 800);
    }
    prevFormatRef.current = gameFormat;
  }, [gameFormat, tab]);
  useEffect(() => {
    if (tab !== "colab") return;
    if (prevTopicRef.current !== gameTopic) {
      const reply = BOT_REPLIES.topic[gameTopic] || "נושא מעניין!";
      setTimeout(() => {
        setColabMsgs(prev => [...prev, { from: "bot", name: "🤖 GameBot", text: reply, ts: Date.now() }]);
      }, 800);
    }
    prevTopicRef.current = gameTopic;
  }, [gameTopic, tab]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

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
      { id: Date.now().toString(), title: gameTitle, template: selectedTemplate?.id || "race", format: gameFormat, topic: customTopic || gameTopic, topicDesc: customTopic ? customTopicDesc : "", author: "אתה" },
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

  function startSimulation() {
    setSimRunning(true);
    setSimDone(false);
    setSimData(null);
    setSimProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const result = runSimulation(gameFormat, gameTopic, 3);
        setSimData(result);
        setSimRunning(false);
        setSimDone(true);
      }
      setSimProgress(Math.min(progress, 100));
    }, 120);
  }

  function sendColabMsg(e) {
    e.preventDefault();
    if (!colabInput.trim()) return;
    const msg = { from: "me", name: "אתה", text: colabInput, ts: Date.now() };
    setColabMsgs(prev => [...prev, msg]);
    setColabInput("");
    // Bot auto-replies occasionally
    if (Math.random() < 0.6) {
      const replies = [
        "רעיון מעולה! 🎯",
        "מסכים — בואו נמשיך לבנות",
        "אולי נוסיף עוד אירועים?",
        "נשמע מגניב! האיזון נראה טוב",
        "AI מנתח: הכיוון הזה מבטיח 📊",
      ];
      setTimeout(() => {
        setColabMsgs(prev => [...prev, { from: "bot", name: "🤖 GameBot", text: replies[Math.floor(Math.random() * replies.length)], ts: Date.now() }]);
      }, 1200);
    }
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  const analysis = analyzeGame(gameFormat, gameTopic, gameTitle, boardDesign, simDone ? simData : null);
  const visibleTemplates = categoryFilter === "all" ? GAME_TEMPLATES : GAME_TEMPLATES.filter(t => t.category === categoryFilter);

  return (
    <div style={st.page}>
      <style>{`
        @keyframes pop { 0%{transform:translateX(-50%) scale(.85);opacity:0} 100%{transform:translateX(-50%) scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
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
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TabBtn active={tab === "home"}      onClick={() => setTab("home")}>🏠 דף הבית</TabBtn>
          <TabBtn active={tab === "create"}    onClick={() => { setTab("create"); if (!selectedTemplate) { setGameFormat("board"); setGameTopic("fantasy"); } }}>🎨 סטודיו</TabBtn>
          <TabBtn active={tab === "ai"}        onClick={() => setTab("ai")}>🤖 AI מנתח</TabBtn>
          <TabBtn active={tab === "colab"}     onClick={() => setTab("colab")}>👥 בנייה משותפת</TabBtn>
          <TabBtn active={tab === "community"} onClick={() => setTab("community")}>🌍 קהילה</TabBtn>
          <button onClick={onBack} style={{ ...st.btnGhost, marginRight: 8, padding: "7px 14px", fontSize: 12 }}>← חזור</button>
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

        {/* ── Create / Studio tab ── */}
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
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>על מה המשחק — ישפיע על איקונים, צבעים ותוכן הגיים</div>

                {/* Group tabs */}
                {["הרפתקה", "ידע", "אקשן", "תרבות"].map(group => {
                  const groupTopics = TOPIC_PRESETS.filter(t => t.group === group);
                  return (
                    <div key={group} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{group}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                        {groupTopics.map(t => {
                          const active = gameTopic === t.id && !customTopic;
                          return (
                            <button key={t.id} onClick={() => { setGameTopic(t.id); setCustomTopic(""); }}
                              style={{
                                background: active ? "#f0808018" : C.bg0,
                                border: `2px solid ${active ? C.indigo : C.border}`,
                                borderRadius: 12, padding: "10px 8px", cursor: "pointer", textAlign: "center",
                                transition: "all .15s", boxShadow: active ? `0 0 0 2px ${C.indigo}33` : "none",
                              }}>
                              <div style={{ fontSize: 20, marginBottom: 3 }}>{t.icon}</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: active ? C.indigoText : C.text1 }}>{t.label}</div>
                              <div style={{ fontSize: 9, color: C.text3, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Invent your own topic */}
                <InventTopicPanel
                  customTopic={customTopic}
                  setCustomTopic={setCustomTopic}
                  customIcon={customTopicIcon}
                  setCustomIcon={setCustomTopicIcon}
                  customDesc={customTopicDesc}
                  setCustomDesc={setCustomTopicDesc}
                  onClear={() => { setCustomTopic(""); setCustomTopicIcon("⭐"); setCustomTopicDesc(""); }}
                />
              </div>

              {/* Section 3: board design */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>עיצוב לוח / ערכת נושא</div>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>בחר אווירה ויזואלית — ישפיע על צבעים ומראה המשחק</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {BOARD_DESIGNS.map(d => (
                    <button key={d.id} onClick={() => setBoardDesign(d.id)}
                      style={{
                        border: `2px solid ${boardDesign === d.id ? d.accent : C.border}`,
                        borderRadius: 12, padding: "14px 8px", cursor: "pointer", textAlign: "center",
                        background: d.bg, transition: "all .2s",
                        boxShadow: boardDesign === d.id ? `0 0 0 3px ${d.accent}44` : "none",
                      }}>
                      <div style={{ fontSize: 24, marginBottom: 5 }}>{d.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: d.accent }}>{d.label}</div>
                      <div style={{ marginTop: 6, display: "flex", gap: 3, justifyContent: "center" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.bg, border: `1.5px solid ${d.accent}` }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.accent }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.cell, border: `1.5px solid ${d.accent}` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 4: details */}
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
            <LivePreview format={gameFormat} topic={gameTopic} customTopic={customTopic} customTopicIcon={customTopicIcon} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} boardDesign={boardDesign} />
          </div>
        )}

        {/* ── AI Analysis tab ── */}
        {tab === "ai" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Score header */}
              <div style={{ ...st.card, display: "flex", alignItems: "center", gap: 20 }}>
                <ScoreRing score={analysis.score} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.text1, marginBottom: 4 }}>ניתוח AI — {gameTitle || "ללא שם"}</div>
                  <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>
                    {GAME_FORMATS.find(f => f.id === gameFormat)?.icon} {GAME_FORMATS.find(f => f.id === gameFormat)?.label} •{" "}
                    {TOPIC_PRESETS.find(t => t.id === gameTopic)?.icon} {TOPIC_PRESETS.find(t => t.id === gameTopic)?.label} •{" "}
                    {BOARD_DESIGNS.find(d => d.id === boardDesign)?.icon} {BOARD_DESIGNS.find(d => d.id === boardDesign)?.label}
                  </div>
                  <div style={{ fontSize: 11, color: analysis.score >= 80 ? "#34d399" : analysis.score >= 60 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
                    {analysis.score >= 80 ? "✅ מצוין! המשחק נראה מאוזן ומוכן" : analysis.score >= 60 ? "⚠️ טוב — עם כמה שיפורים יהיה מעולה" : "❌ דרוש שיפור — קרא את הבעיות"}
                  </div>
                </div>
                <button onClick={() => setTab("create")} style={{ ...st.btnGhost, fontSize: 12 }}>✏️ ערוך משחק</button>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div style={st.card}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 14 }}>🔍 בעיות שזוהו</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analysis.issues.map((issue, i) => {
                      const colors = { error: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "❌" }, warn: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", icon: "⚠️" }, info: { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", icon: "ℹ️" } };
                      const s = colors[issue.type] || colors.info;
                      return (
                        <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14 }}>{s.icon}</span>
                          <span style={{ fontSize: 13, color: s.text, lineHeight: 1.5 }}>{issue.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 14 }}>💡 הצעות לשיפור</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", background: C.bg0, borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 12, color: "#f08080", fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>🎮 סימולציה — 100 משחקים אוטומטיים</div>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>שחקנים רובוטיים מנגנים את המשחק שלך 100 פעמים ובודקים איזון</div>

                {!simRunning && !simDone && (
                  <button onClick={startSimulation} style={{ ...st.btnIndigo, width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14 }}>
                    ▶ הרץ סימולציה
                  </button>
                )}

                {simRunning && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.text2, animation: "pulse 1s infinite" }}>⚙️ מריץ {simProgress} / 100 משחקים...</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.indigo }}>{simProgress}%</span>
                    </div>
                    <div style={{ background: C.bg0, borderRadius: 8, height: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <div style={{ height: "100%", background: `linear-gradient(90deg, #f08080, #FFB3C6)`, width: `${simProgress}%`, borderRadius: 8, transition: "width .1s" }} />
                    </div>
                  </div>
                )}

                {simDone && simData && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "ממוצע תורות", value: simData.avgTurns, unit: "תורות" },
                        { label: "ניצחון מקסימלי", value: `${simData.dominance}%`, unit: `שחקן ${simData.wins.indexOf(Math.max(...simData.wins)) + 1}` },
                        { label: "איזון", value: simData.balanced ? "✅" : "⚠️", unit: simData.balanced ? "מאוזן" : "לא מאוזן" },
                      ].map((stat, i) => (
                        <div key={i} style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: C.indigo, marginBottom: 2 }}>{stat.value}</div>
                          <div style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>{stat.label}</div>
                          <div style={{ fontSize: 10, color: C.text2 }}>{stat.unit}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text2, marginBottom: 8 }}>ניצחונות לפי שחקן (100 משחקים)</div>
                      {simData.wins.map((w, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.text2, marginBottom: 3 }}>
                            <span>שחקן {i + 1}</span><span>{w} ניצחונות ({w}%)</span>
                          </div>
                          <div style={{ background: C.bg0, borderRadius: 4, height: 8, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${w}%`, background: i === simData.wins.indexOf(Math.max(...simData.wins)) ? "#f08080" : "#60a5fa", borderRadius: 4, transition: "width .5s" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={startSimulation} style={{ ...st.btnGhost, width: "100%", textAlign: "center", justifyContent: "center", fontSize: 12 }}>↺ הרץ שוב</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: live preview */}
            <LivePreview format={gameFormat} topic={gameTopic} customTopic={customTopic} customTopicIcon={customTopicIcon} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} boardDesign={boardDesign} />
          </div>
        )}

        {/* ── Colab tab ── */}
        {tab === "colab" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Room header */}
              <div style={{ ...st.card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 2 }}>👥 חדר יצירה משותפת</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>שתף את קוד החדר עם חברים — כולם עורכים בזמן אמת</div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: "#f08080", letterSpacing: 3, background: C.bg0, border: `2px dashed ${C.border}`, borderRadius: 10, padding: "6px 16px" }}>{roomCode}</div>
                  <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>קוד חדר</div>
                </div>
              </div>

              {/* Chat */}
              <div style={{ ...st.card, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 13, color: C.text1 }}>
                  💬 צ'אט — {colabMsgs.length} הודעות
                </div>
                <div style={{ height: 320, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {colabMsgs.map((msg, i) => {
                    const isMe = msg.from === "me";
                    const isBot = msg.from === "bot";
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: isBot ? "#f0808022" : isMe ? "#f08080" : "#60a5fa22", border: `1px solid ${isBot ? "#f0808044" : isMe ? "#f08080" : "#60a5fa44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                          {isBot ? "🤖" : isMe ? "👤" : "👤"}
                        </div>
                        <div style={{ maxWidth: "70%" }}>
                          <div style={{ fontSize: 9, color: C.text3, marginBottom: 3, textAlign: isMe ? "left" : "right" }}>
                            {msg.name} • {fmtTime(msg.ts)}
                          </div>
                          <div style={{ background: isMe ? "#f08080" : isBot ? C.bg0 : "#eff6ff", color: isMe ? "#fff" : C.text1, borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "8px 13px", fontSize: 13, lineHeight: 1.5, border: isMe ? "none" : `1px solid ${C.border}` }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendColabMsg} style={{ display: "flex", gap: 10, padding: "12px 18px", borderTop: `1px solid ${C.border}`, background: C.bg0 }}>
                  <input value={colabInput} onChange={e => setColabInput(e.target.value)}
                    placeholder="שלח הודעה לצוות..."
                    style={{ ...st.input, flex: 1, fontSize: 13 }} />
                  <button type="submit" style={{ ...st.btnIndigo, padding: "9px 16px", fontSize: 13 }}>שלח</button>
                </form>
              </div>

              {/* Shared game state */}
              <div style={st.card}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 14 }}>🔄 מצב המשחק המשותף (עדכון חי)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "צורת משחק", value: `${GAME_FORMATS.find(f => f.id === gameFormat)?.icon} ${GAME_FORMATS.find(f => f.id === gameFormat)?.label}` },
                    { label: "נושא", value: `${TOPIC_PRESETS.find(t => t.id === gameTopic)?.icon} ${TOPIC_PRESETS.find(t => t.id === gameTopic)?.label}` },
                    { label: "עיצוב", value: `${BOARD_DESIGNS.find(d => d.id === boardDesign)?.icon} ${BOARD_DESIGNS.find(d => d.id === boardDesign)?.label}` },
                  ].map((item, i) => (
                    <div key={i} style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: C.text3 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTab("create")} style={{ ...st.btnIndigo, marginTop: 12, width: "100%", justifyContent: "center" }}>✏️ ערוך עכשיו בסטודיו</button>
              </div>
            </div>

            {/* Members sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={st.card}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 14 }}>חברי הצוות</div>
                {members.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color + "22", border: `2px solid ${m.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, position: "relative", flexShrink: 0 }}>
                      👤
                      <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: m.online ? "#34d399" : "#9ca3af", border: "1.5px solid #fff" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.role}</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 4, padding: "8px 12px", background: C.bg0, borderRadius: 8, border: `1px dashed ${C.border}`, textAlign: "center", fontSize: 12, color: C.text3, cursor: "pointer" }}
                  onClick={() => { navigator.clipboard?.writeText(roomCode); showToast(`קוד החדר ${roomCode} הועתק!`); }}>
                  ➕ שתף קוד: {roomCode}
                </div>
              </div>

              <LivePreview format={gameFormat} topic={gameTopic} customTopic={customTopic} customTopicIcon={customTopicIcon} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} boardDesign={boardDesign} />
            </div>
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
                      const PRESET_IDS = ["fantasy","space","sports","animals","history","science","ocean","city","nature","music","food","movies"];
                      const rawTopic = game.topic || "fantasy";
                      const isPreset = PRESET_IDS.includes(rawTopic);
                      onStartGame({
                        themeId: resolveThemeId(game),
                        format: game.format || "board",
                        topic: isPreset ? rawTopic : "fantasy",
                        customTopic: isPreset ? null : rawTopic,
                        customTopicDesc: isPreset ? null : (game.topicDesc || null),
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
