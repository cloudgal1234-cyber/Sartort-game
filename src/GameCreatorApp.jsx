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

// ── Templates ─────────────────────────────────────────────────────────────────
const GAME_TEMPLATES = [
  // Board
  { id: "race",        category: "board",     icon: "🏁", color: "#2563eb", title: "מסלול (Race Game)",           description: "כולם רצים לסוף המסלול עם קוביה ומשבצות אירוע.",        example: "מריו קארט קופסה, Candy Land" },
  { id: "monopoly",    category: "board",     icon: "💰", color: "#059669", title: "רכוש ומסחר (Monopoly)",      description: "בניית אימפריה כלכלית, לוח נכסים וקלפי הפתעה.",           example: 'מונופול, עיר הנדל"ן' },
  { id: "adventure",   category: "board",     icon: "📍", color: "#e11d48", title: "הרפתקה (Adventure)",         description: "לוח פתוח עם אזורים ומשימות שיש להשלים.",                example: "מבוכים ודרקונים, Gloomhaven" },
  { id: "combat",      category: "board",     icon: "⚔️", color: "#dc2626", title: "קרב שחקנים (Combat)",        description: "HP לכל שחקן, קלפי התקפה והגנה עד שנשאר אחד.",          example: "Hearthstone, קלפי גיבורים" },
  { id: "strategy",    category: "board",     icon: "♟️", color: "#7c3aed", title: "אסטרטגיה (Strategy)",        description: "ניהול משאבים, בניית כוח ומלחמה על שטחים.",              example: "שחמט, ריסקו, קטאן" },
  { id: "cooperative", category: "board",     icon: "🤝", color: "#0891b2", title: "שיתוף פעולה (Co-op)",        description: "כולם יחד נגד המשחק — מנצחים יחד או מפסידים יחד.",      example: "פנדמיה, Forbidden Island" },
  // Cards
  { id: "cards",       category: "cards",     icon: "🃏", color: "#7c3aed", title: "קלפים קלאסי",                description: "חפיסה מרכזית, כל שחקן מחזיק יד ומשחק תורות.",           example: "UNO, טאקי, מלחמה" },
  { id: "trading",     category: "cards",     icon: "⚡", color: "#d97706", title: "קלפי מסחר (TCG)",            description: "כל שחקן בונה חפיסה מראש ונלחם כנגד יריביו.",             example: "Magic, Pokémon, Yu-Gi-Oh" },
  { id: "memory",      category: "cards",     icon: "🔍", color: "#0891b2", title: "זיכרון (Memory)",            description: "קלפים הפוכים — מי שמוצא את כל הזוגות מנצח.",            example: "זיכרון, Concentration" },
  // Party
  { id: "charades",    category: "party",     icon: "🎭", color: "#e11d48", title: "מחוות (Charades)",           description: "מציגים בלי מילים, הצוות מנחש.",                          example: "Charades, פנטומימה" },
  { id: "pictionary",  category: "party",     icon: "🎨", color: "#2563eb", title: "ציור (Pictionary)",          description: "מציירים מילה, הצוות מנחש לפני שנגמר הזמן.",             example: "Pictionary, Skribbl" },
  { id: "truth",       category: "party",     icon: "💬", color: "#059669", title: "אמת או חובה",               description: "כל שחקן בוחר — שאלה אישית או אתגר מצחיק.",              example: "Truth or Dare, בקבוק" },
  // Knowledge
  { id: "trivia",      category: "knowledge", icon: "❓", color: "#d97706", title: "טריוויה (Trivia)",           description: "שאלות ידע כלליות, צבירת נקודות וזמן מוגבל.",             example: "פיצוחים, Trivial Pursuit" },
  { id: "escape",      category: "knowledge", icon: "🔐", color: "#7c3aed", title: "חדר בריחה (Escape Room)",    description: "חידות מקושרות שמובילות לפתרון — צוות פותר יחד.",        example: "Exit, Lock 'N Load" },
  { id: "quiz",        category: "knowledge", icon: "📺", color: "#0891b2", title: "תוכנית חידונים (Quiz Show)", description: "מנחה שואל, שחקנים עונים מהר — מי שמנחש מוביל.",         example: "Who Wants to Be a Millionaire" },
  // Video
  { id: "platformer",  category: "video",     icon: "🕹️", color: "#dc2626", title: "פלטפורמה (Platformer)",     description: "דמות קופצת על פלטפורמות, אוספת פריטים ומגיעה לסוף.",   example: "מריו, סוניק, Celeste" },
  { id: "puzzle",      category: "video",     icon: "🧩", color: "#059669", title: "פאזל (Puzzle Game)",         description: "חשיבה לוגית — הזזת חפצים, חיבור צורות, מציאת פתרון.",  example: "Tetris, Portal, Candy Crush" },
  { id: "rpg",         category: "video",     icon: "🗡️", color: "#7c3aed", title: "RPG",                        description: "עלילה עם דמויות, ניסיון, רמות ועולם פתוח לחקירה.",     example: "Zelda, Final Fantasy, Stardew" },
  // Sports
  { id: "sports",      category: "sports",    icon: "⚽", color: "#059669", title: "משחק ספורט",                 description: "מדמה ספורט עם כללים, ניקוד ומהלכים.",                   example: "FIFA, NBA 2K, Wii Sports" },
  { id: "dexterity",   category: "sports",    icon: "🎯", color: "#e11d48", title: "זריזות ידיים (Dexterity)",   description: "פעולות מהירות ומדויקות — מהירות ידיים כנגד הזמן.",      example: "Jenga, Twister, Bop It" },
];

// ── Theme mapping ──────────────────────────────────────────────────────────────
const TEMPLATE_TO_THEME = {
  race: "medieval", monopoly: "ocean",   adventure: "dragons", combat: "volcano",
  strategy: "medieval", cooperative: "wizards",
  cards: "wizards",  trading: "ocean",   memory: "space",
  charades: "dragons", pictionary: "wizards", truth: "medieval",
  trivia: "space",   escape: "volcano",  quiz: "space",
  platformer: "medieval", puzzle: "space", rpg: "dragons",
  sports: "ocean",   dexterity: "medieval",
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
  label:     { display: "block", fontSize: 12, fontWeight: 600, color: C.text3, marginBottom: 6 },
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

// ── Live Preview ───────────────────────────────────────────────────────────────
function LivePreview({ template, gameTitle, themeColor, playerName, logoFile }) {
  if (!template) return null;
  const tc = themeColor;
  const pn = playerName || "שחקן 1";
  return (
    <div style={{ background: C.bg0, border: `1px solid ${tc}44`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>תצוגה חיה</span>
        <span style={{ fontSize: 9, background: C.bg3, color: C.text3, borderRadius: 4, padding: "2px 6px", fontFamily: "monospace" }}>LIVE PREVIEW</span>
      </div>
      <div style={{ padding: 12, borderRadius: 10, background: C.bg2, border: `1px solid ${tc}33` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: tc }}>{gameTitle || "ללא שם"}</span>
          {logoFile && <img src={logoFile} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "cover" }} />}
        </div>

        {template.id === "race" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
              {["🏁 סוף", "משבצת 3", "✨ קלף", pn].map((t, i) => (
                <div key={i} style={{ background: C.bg3, border: i === 0 ? "1px solid #34d39944" : `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 4px", textAlign: "center", fontSize: 9, color: i === 0 ? "#34d399" : i === 3 ? tc : C.text2, fontWeight: i === 3 ? 700 : "normal" }}>{t}</div>
              ))}
            </div>
            <div style={{ background: tc, borderRadius: 8, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>🎲 הטל קוביה</div>
          </div>
        )}

        {template.id === "monopoly" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: C.text2 }}>כסף של <span style={{ color: tc, fontWeight: 700 }}>{pn}</span>:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>$1,500</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[["שדרות רוטשילד", tc], ["רחוב הרצל", "#059669"]].map(([name, c]) => (
                <div key={name} style={{ background: C.bg3, borderRight: `4px solid ${c}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: C.text2 }}>{name}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "strategy" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3, marginBottom: 8 }}>
              {["♟️","","♛","","♜","","♟️","","♜",""].map((s, i) => (
                <div key={i} style={{ aspectRatio: "1", background: i % 2 === 0 ? C.bg3 : C.bg0, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{s}</div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.text3 }}>
              <span>🔴 {pn}: 4 כוחות</span><span>🔵 יריב: 5 כוחות</span>
            </div>
          </div>
        )}

        {(template.id === "adventure" || template.id === "cooperative") && (
          <div style={{ background: C.bg3, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.text2, marginBottom: 4 }}>📍 <span style={{ color: tc, fontWeight: 700 }}>{pn}</span> {template.id === "cooperative" ? "ביחד עם הצוות" : "ביער המסתורין"}</div>
            <div style={{ fontSize: 10, color: "#d97706" }}>📜 משימה: {template.id === "cooperative" ? "הצילו את הממלכה!" : "מצא את מפתח הזהב!"}</div>
          </div>
        )}

        {template.id === "combat" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: C.text2 }}>{pn}</span>
              <span style={{ color: "#f87171", fontWeight: 700, fontFamily: "monospace" }}>HP: 100/100</span>
            </div>
            <div style={{ background: C.bg3, height: 8, borderRadius: 4, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ background: "#dc2626", height: "100%", width: "100%", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "#ffe0e0", border: "1px solid #dc262644", borderRadius: 6, padding: "6px 0", textAlign: "center", fontSize: 11, color: "#dc2626" }}>⚔️ התקפה</div>
              <div style={{ flex: 1, background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 0", textAlign: "center", fontSize: 11, color: C.text2 }}>🛡️ מגן</div>
            </div>
          </div>
        )}

        {(template.id === "cards" || template.id === "trading") && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: C.text3, marginBottom: 8, marginTop: 0 }}>{template.id === "trading" ? `חפיסת ${pn}` : "חפיסה מרכזית (50 קלפים)"}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[{ t: template.id === "trading" ? "⚡ 80" : "טאקי", c: tc }, { t: "+2", c: C.bg3 }, { t: pn, c: C.bg3 }].map(({ t, c }, i) => (
                <div key={i} style={{ width: 42, height: 60, background: c, borderRadius: 8, border: `1px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: i === 0 ? "#fff" : C.text2, fontWeight: 700 }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "memory" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 8 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ aspectRatio: "1", background: i < 2 ? "#b8edb844" : C.bg3, border: `1px solid ${i < 2 ? "#4a9a4a44" : C.border2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{i < 2 ? "🌟" : "?"}</div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.text3, textAlign: "center" }}>{pn}: 1 זוג ✓</div>
          </div>
        )}

        {(template.id === "charades" || template.id === "pictionary") && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: C.bg3, borderRadius: 10, padding: "16px 12px", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>{template.id === "charades" ? "🎭 מחוות" : "🎨 ציור"}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: tc }}>🐉 דרקון</div>
            </div>
            <div style={{ fontSize: 10, color: C.text3 }}>{pn} מציג • 60 שניות</div>
          </div>
        )}

        {template.id === "truth" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 10, padding: "12px 14px", marginBottom: 8, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>💬 אמת</div>
              <div style={{ fontSize: 11, color: C.text1 }}>מה הדבר הכי מביך שקרה לך?</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "#ffe0e044", border: `1px solid ${tc}44`, borderRadius: 8, padding: "6px 0", textAlign: "center", fontSize: 10, color: tc }}>אמת</div>
              <div style={{ flex: 1, background: C.bg3, borderRadius: 8, padding: "6px 0", textAlign: "center", fontSize: 10, color: C.text3 }}>חובה</div>
            </div>
          </div>
        )}

        {template.id === "trivia" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "10px 12px", textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: C.text2, margin: "0 0 4px" }}>שאלה: מהו המרכיב העיקרי בשוקולד?</p>
              <span style={{ fontSize: 10, color: "#d97706" }}>⏳ זמן: 30 שניות</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["א. קקאו", "ב. סוכר"].map(a => (
                <div key={a} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: C.text2 }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "escape" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔐</div>
            <p style={{ fontSize: 10, color: C.text2, marginBottom: 8, marginTop: 0 }}>חידה: "מה בא אחרי לילה?"</p>
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              {["א", "ב", "ג", "ד"].map(l => (
                <div key={l} style={{ width: 32, height: 32, borderRadius: 8, background: C.bg3, border: `1px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.text2 }}>{l}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "quiz" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>📺 לוח תוצאות</div>
              {[pn, "יריב"].map((n, i) => (
                <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: i === 0 ? tc : C.text3, fontWeight: i === 0 ? 700 : "normal" }}>
                  <span>{n}</span><span>{i === 0 ? "250" : "180"} נק'</span>
                </div>
              ))}
            </div>
            <div style={{ background: tc, borderRadius: 8, padding: "6px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>🔔 לחץ להשיב!</div>
          </div>
        )}

        {(template.id === "platformer" || template.id === "rpg") && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 3, marginBottom: 8 }}>
              {["🟫","🟫","🟫","🟫","🟫","🟫","","","🦸","","🌟","","🟫","","🟫","🟫","🟫","🟫"].map((s, i) => (
                <div key={i} style={{ aspectRatio: "1", background: s === "🟫" ? "#d97706" : C.bg3, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{s !== "🟫" ? s : ""}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              {["◀", "▶", "▲"].map(b => (
                <div key={b} style={{ width: 28, height: 28, background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.text2 }}>{b}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "puzzle" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, marginBottom: 8 }}>
              {[tc+"44",tc+"88","transparent",tc+"88",tc+"cc",tc+"44",tc+"cc","transparent","transparent",tc+"44",tc+"88",tc+"44"].map((bg, i) => (
                <div key={i} style={{ aspectRatio: "1", background: bg || C.bg3, border: `1px solid ${C.border2}`, borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.text3, textAlign: "center" }}>🧩 7/16 חלקים מוצבו</div>
          </div>
        )}

        {(template.id === "sports" || template.id === "dexterity") && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", background: C.bg3, borderRadius: 10, padding: "10px", marginBottom: 8 }}>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: tc }}>2</div><div style={{ fontSize: 9, color: C.text3 }}>{pn}</div></div>
              <div style={{ fontSize: 12, color: C.text3 }}>VS</div>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: C.text2 }}>1</div><div style={{ fontSize: 9, color: C.text3 }}>יריב</div></div>
            </div>
            <div style={{ fontSize: 10, color: C.text3 }}>דקה 34 • {template.icon} {template.title.split(" ")[0]}</div>
          </div>
        )}

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <pre style={{ fontSize: 8, color: "#888", fontFamily: "monospace", background: C.bg0, borderRadius: 6, padding: "6px 8px", margin: 0, overflow: "auto" }}>{`{"type":"${template.category}","template":"${template.id}","title":"${(gameTitle||"").replace(/"/g,"'")}","player":"${pn.replace(/"/g,"'")}"}`}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Community Game Card ────────────────────────────────────────────────────────
function GameCard({ game, onPlay }) {
  const tpl = GAME_TEMPLATES.find(t => t.id === game.template) || GAME_TEMPLATES[0];
  const cat = CATEGORIES.find(c => c.id === tpl.category);
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
          <div style={{ fontSize: 11, color: C.text3 }}>יוצר: {game.author} • {cat?.icon} {cat?.label}</div>
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
    <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#ffffff", border: "1px solid #f0d8e8", borderRadius: 14, padding: "14px 24px", boxShadow: "0 8px 32px #f0808033", fontSize: 14, fontWeight: 600, color: "#2d1520", zIndex: 999, textAlign: "center", animation: "pop .2s ease-out", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function GameCreatorApp({ onBack, onStartGame }) {
  const [gamesList, setGamesList] = useState([
    { id: "1", title: "מרוץ הדרקונים", template: "race",    author: "חיים"  },
    { id: "2", title: "טריוויה טק",    template: "trivia",  author: "מערכת" },
    { id: "3", title: "חדר בריחה: ∞",  template: "escape",  author: "מיכל"  },
    { id: "4", title: "פוקמון מקומי",   template: "trading", author: "יוסי"  },
  ]);
  const [toast,             setToast]            = useState(null);
  const [tab,               setTab]              = useState("home");
  const [categoryFilter,    setCategoryFilter]    = useState("all");
  const [selectedTemplate,  setSelectedTemplate]  = useState(null);
  const [aiPrompt,          setAiPrompt]          = useState("");
  const [gameTitle,         setGameTitle]          = useState("");
  const [themeColor,        setThemeColor]         = useState("#f08080");
  const [playerName,        setPlayerName]         = useState("שחקן 1");
  const [logoFile,          setLogoFile]           = useState(null);

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
    let tpl = findTpl("race");
    if      (p.includes("מונופול") || p.includes("לקנות") || p.includes("נכס"))                         tpl = findTpl("monopoly");
    else if (p.includes("שיתוף") || p.includes("יחד") || p.includes("קואופ"))                           tpl = findTpl("cooperative");
    else if (p.includes("אסטרטגיה") || p.includes("שחמט") || p.includes("קטאן") || p.includes("ריסקו")) tpl = findTpl("strategy");
    else if (p.includes("הרפתקה") || p.includes("משימה") || p.includes("מפה"))                          tpl = findTpl("adventure");
    else if (p.includes("קרב") || p.includes("hp") || p.includes("מכות"))                               tpl = findTpl("combat");
    else if (p.includes("פוקמון") || p.includes("מסחר") || p.includes("magic") || p.includes("tcg"))    tpl = findTpl("trading");
    else if (p.includes("זיכרון") || p.includes("זוגות"))                                               tpl = findTpl("memory");
    else if (p.includes("קלף") || p.includes("אוני") || p.includes("חפיסה") || p.includes("טאקי"))     tpl = findTpl("cards");
    else if (p.includes("ציור") || p.includes("pictionary"))                                             tpl = findTpl("pictionary");
    else if (p.includes("מחוות") || p.includes("פנטומימה") || p.includes("charades"))                   tpl = findTpl("charades");
    else if (p.includes("אמת") || p.includes("חובה") || p.includes("dare"))                             tpl = findTpl("truth");
    else if (p.includes("חדר בריחה") || p.includes("escape") || p.includes("נעולים"))                   tpl = findTpl("escape");
    else if (p.includes("תוכנית") || p.includes("מיליון") || p.includes("quiz show"))                   tpl = findTpl("quiz");
    else if (p.includes("חידה") || p.includes("שאלה") || p.includes("טריוויה") || p.includes("ידע"))    tpl = findTpl("trivia");
    else if (p.includes("rpg") || p.includes("עלילה") || p.includes("ניסיון") || p.includes("zelda"))   tpl = findTpl("rpg");
    else if (p.includes("פאזל") || p.includes("puzzle") || p.includes("tetris") || p.includes("לוגי"))  tpl = findTpl("puzzle");
    else if (p.includes("פלטפורמה") || p.includes("קפיצות") || p.includes("מריו"))                      tpl = findTpl("platformer");
    else if (p.includes("ספורט") || p.includes("כדורגל") || p.includes("fifa"))                         tpl = findTpl("sports");
    else if (p.includes("זריזות") || p.includes("jenga") || p.includes("twister"))                      tpl = findTpl("dexterity");
    setSelectedTemplate(tpl);
    setThemeColor(tpl.color);
    setGameTitle(aiPrompt.substring(0, 24) + (aiPrompt.length > 24 ? "..." : ""));
    setTab("create");
  }

  function handleSave() {
    if (!gameTitle.trim()) { showToast("אנא הכנס שם למשחק"); return; }
    setGamesList(prev => [
      { id: Date.now().toString(), title: gameTitle, template: selectedTemplate?.id || "race", author: "אתה" },
      ...prev,
    ]);
    setTab("community");
  }

  function goCreate(tpl) {
    setSelectedTemplate(tpl);
    setThemeColor(tpl.color);
    setGameTitle(`המשחק שלי — ${tpl.title.split(" ")[0]}`);
    setTab("create");
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
          <TabBtn active={tab === "create"}    onClick={() => { setTab("create"); if (!selectedTemplate) setSelectedTemplate(GAME_TEMPLATES[0]); }}>🎨 סטודיו עיצוב</TabBtn>
          <TabBtn active={tab === "community"} onClick={() => setTab("community")}>🌍 קהילה</TabBtn>
          <button onClick={onBack} style={{ ...st.btnGhost, marginRight: 10, padding: "7px 14px", fontSize: 12 }}>← חזור ל-Sartort</button>
        </div>
      </header>

      <main style={st.main}>

        {tab === "home" && (
          <div>
            <div style={{ position: "relative", borderRadius: 20, background: "linear-gradient(135deg, #ffe0ec, #fff5f8, #e8f0ff)", border: `1px solid #f0c0d0`, padding: "28px 28px 32px", marginBottom: 36, overflow: "hidden" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f0808018", color: "#f08080", border: "1px solid #f0808033", marginBottom: 12 }}>✨ יצירה חכמה מתיאור</span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2d1520", margin: "0 0 8px" }}>יש לך רעיון למשחק בראש?</h2>
              <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 520 }}>
                תאר כל סוג משחק — לוח, קלפים, טריוויה, חדר בריחה, RPG, ספורט ועוד. המערכת תבחר את התבנית הנכונה ותפתח את הסטודיו.
              </p>
              <form onSubmit={handleAICreate} style={{ display: "flex", gap: 8, maxWidth: 560 }}>
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="לדוגמה: חדר בריחה מפחיד, RPG פנטזיה, טריוויה ספורט, Pictionary..."
                  style={{ ...st.input, flex: 1 }} />
                <button type="submit" style={{ ...st.btnIndigo, whiteSpace: "nowrap", flexShrink: 0 }}>✨ צור משחק</button>
              </form>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>כל תבניות המשחק</h3>
              <p style={{ fontSize: 12, color: C.text3, margin: "0 0 18px" }}>20 תבניות לכל סוג משחק — לוח, קלפים, מסיבה, ידע, וידאו וספורט</p>
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
                      <span style={{ fontSize: 10, background: C.bg3, color: C.text3, borderRadius: 20, padding: "2px 8px", border: `1px solid ${C.border2}` }}>
                        {CATEGORIES.find(c => c.id === tpl.category)?.label}
                      </span>
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

        {tab === "create" && selectedTemplate && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
            <div style={st.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 18, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: selectedTemplate.color + "22", border: `1px solid ${selectedTemplate.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{selectedTemplate.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text1 }}>התאמת בסיס: {selectedTemplate.title}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>
                    {CATEGORIES.find(c => c.id === selectedTemplate.category)?.icon}{" "}
                    {CATEGORIES.find(c => c.id === selectedTemplate.category)?.label}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={st.label}>שם המשחק שלך</label>
                <input value={gameTitle} onChange={e => setGameTitle(e.target.value)} style={st.input} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={st.label}>צבע ערכת הנושא</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
                    style={{ width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
                  <span style={{ fontSize: 12, color: C.text3, fontFamily: "monospace" }}>{themeColor}</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={st.label}>שם שחקן / כותרת</label>
                <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="הכנס שם שחקן" style={st.input} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={st.label}>העלאת לוגו ייעודי</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ ...st.btnGhost, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    📁 בחר קובץ לוגו
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                  </label>
                  {logoFile && <span style={{ fontSize: 11, color: "#4a9a4a" }}>✓ הקובץ נטען</span>}
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                <button onClick={handleSave} style={{ ...st.btnIndigo, flex: 1, justifyContent: "center", fontSize: 14, padding: "12px 0" }}>📤 שמור ושתף עם הקהילה</button>
                <button onClick={() => setTab("home")} style={{ ...st.btnGhost, fontSize: 12 }}>ביטול</button>
              </div>
            </div>
            <div style={{ position: "sticky", top: 76 }}>
              <LivePreview template={selectedTemplate} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} />
            </div>
          </div>
        )}

        {tab === "community" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>מאגר משחקי הקהילה</h3>
                <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>משחקים שנוצרו ושותפו על ידי משתמשים</p>
              </div>
              <button onClick={() => { setSelectedTemplate(GAME_TEMPLATES[0]); setGameTitle("משחק חדש"); setTab("create"); }}
                style={{ ...st.btnIndigo, fontSize: 12, padding: "9px 14px" }}>➕ צור משחק חדש</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {gamesList.map(g => (
                <GameCard key={g.id} game={g}
                  onPlay={(game) => {
                    const themeId = TEMPLATE_TO_THEME[game.template] || "medieval";
                    if (onStartGame) onStartGame({ themeId });
                    else showToast(`🎲 "${game.title}" — לא ניתן להפעיל כרגע`);
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
