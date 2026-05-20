import { useState } from "react";

// ── Templates ─────────────────────────────────────────────────────────────────
const GAME_TEMPLATES = [
  {
    id: "race", icon: "🏆", color: "#2563eb",
    title: "לוח מסלול (Race Game)",
    description: 'משחק שבו כולם רצים לסוף המסלול. כולל קוביה, משבצות מסלול וקלפי "התקדם/חזור".',
    example: "מרוץ מכוניות, מריו קארט קופסה",
  },
  {
    id: "monopoly", icon: "💰", color: "#059669",
    title: "קנייה ומכירה (Monopoly Style)",
    description: "בניית אימפריה כלכלית. לוח נכסים סגור, כסף התחלתי לכל שחקן וקלפי הפתעה.",
    example: 'מונופול, עיר הנדל"ן',
  },
  {
    id: "cards", icon: "🃏", color: "#7c3aed",
    title: "קלפים בלבד (Cards Only)",
    description: "אין לוח בכלל. המשחק מבוסס כולו על חפיסת קלפים שמשנים את חוקי המשחק.",
    example: "UNO, מלחמה, טאקי",
  },
  {
    id: "trivia", icon: "❓", color: "#d97706",
    title: "חידות ואתגרים (Trivia)",
    description: "משחק לימודי או חברתי המבוסס על שאלות, צבירת נקודות וזמן מוגבל לכל תשובה.",
    example: "פיצוחים, טריוויה עולמית",
  },
  {
    id: "adventure", icon: "📍", color: "#e11d48",
    title: "משימות בעולם (Adventure)",
    description: "לוח פתוח המחולק לאזורים/מחוזות. השחקנים נעים חופשית להשלים משימות ולנצח.",
    example: "משחקי תפקידים, מבוכים ודרקונים",
  },
  {
    id: "combat", icon: "⚔️", color: "#dc2626",
    title: "קרב שחקנים (Combat)",
    description: "לכל שחקן יש נקודות חיים (HP). משתמשים בקלפי התקפה והגנה עד שנשאר האחרון.",
    example: "קלפי קרב, גיבורי על",
  },
];

// ── Shared style tokens ────────────────────────────────────────────────────────
const C = {
  bg0: "#fff0f5", bg1: "#fff5f8", bg2: "#ffffff", bg3: "#fce8f2",
  border: "#f0d8e8", border2: "#e8c8d8",
  text1: "#2d1520", text2: "#a07888", text3: "#c0909e",
  indigo: "#f08080", indigoHover: "#e86868", indigoText: "#c06060",
};

const st = {
  page:     { minHeight: "100vh", background: C.bg1, color: C.text1, fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl" },
  header:   { position: "sticky", top: 0, zIndex: 50, background: "rgba(255,245,248,0.95)", borderBottom: `1px solid ${C.border}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(8px)" },
  main:     { maxWidth: 1100, margin: "0 auto", padding: "28px 16px" },
  card:     { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 },
  input:    { width: "100%", background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", color: C.text1, fontSize: 14, outline: "none", boxSizing: "border-box" },
  btnIndigo:{ background: "#f08080", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { background: C.bg3, color: C.text2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" },
  label:    { display: "block", fontSize: 12, fontWeight: 600, color: C.text3, marginBottom: 6 },
  divider:  { borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 20 },
};

// ── TabBtn ─────────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      border: "none", borderBottom: active ? `2px solid ${C.indigo}` : "2px solid transparent",
      background: active ? C.bg3 : "transparent",
      color: active ? C.indigoText : C.text2,
      transition: "all .15s",
    }}>{children}</button>
  );
}

// ── Live Preview ───────────────────────────────────────────────────────────────
function LivePreview({ template, gameTitle, themeColor, playerName, logoFile }) {
  if (!template) return null;
  return (
    <div style={{ background: C.bg0, border: `1px solid ${themeColor}44`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>תצוגה חיה</span>
        <span style={{ fontSize: 9, background: C.bg3, color: C.text3, borderRadius: 4, padding: "2px 6px", fontFamily: "monospace" }}>LIVE PREVIEW</span>
      </div>
      <div style={{ padding: 12, borderRadius: 10, background: C.bg2, border: `1px solid ${themeColor}33` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: themeColor }}>{gameTitle || "ללא שם"}</span>
          {logoFile && <img src={logoFile} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "cover" }} />}
        </div>

        {template.id === "race" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
              {["🏁 סוף", "משבצת 3", "✨ קלף", playerName || "שחקן 1"].map((t, i) => (
                <div key={i} style={{ background: C.bg3, border: i === 0 ? "1px solid #34d39944" : `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 4px", textAlign: "center", fontSize: 9, color: i === 0 ? "#34d399" : i === 3 ? "#818cf8" : C.text2, fontWeight: i === 3 ? 700 : "normal" }}>{t}</div>
              ))}
            </div>
            <div style={{ background: themeColor, borderRadius: 8, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>🎲 הטל קוביה</div>
          </div>
        )}

        {template.id === "monopoly" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: C.text2 }}>כסף של <span style={{ color: "#818cf8", fontWeight: 700 }}>{playerName || "שחקן 1"}</span>:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>$1,500</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[["שדרות רוטשילד", C.indigo], ["רחוב הרצל", "#059669"]].map(([name, c]) => (
                <div key={name} style={{ background: C.bg3, borderRight: `4px solid ${c}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: C.text2 }}>{name}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "cards" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: C.text3, marginBottom: 8, marginTop: 0 }}>חפיסת קלפים מרכזית (50 קלפים)</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[{ t: "טאקי", c: "#7c3aed" }, { t: "+2", c: C.bg3 }, { t: playerName || "שחקן 1", c: C.bg3 }].map(({ t, c }, i) => (
                <div key={i} style={{ width: 42, height: 60, background: c, borderRadius: 8, border: `1px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "trivia" && (
          <div>
            <div style={{ background: C.bg3, borderRadius: 8, padding: "10px 12px", textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: "#ccc", margin: "0 0 4px" }}>שאלה: מהו המרכיב העיקרי בשוקולד?</p>
              <span style={{ fontSize: 10, color: "#fbbf24" }}>⏳ זמן: 30 שניות</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["א. קקאו", "ב. סוכר"].map(a => (
                <div key={a} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, color: C.text2 }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        {template.id === "adventure" && (
          <div style={{ background: C.bg3, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#ccc", marginBottom: 4 }}>📍 מיקום: <span style={{ color: "#818cf8", fontWeight: 700 }}>{playerName || "שחקן 1"}</span> ביער המסתורין</div>
            <div style={{ fontSize: 10, color: "#fbbf24" }}>📜 משימה: מצא את מפתח הזהב!</div>
          </div>
        )}

        {template.id === "combat" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#ccc" }}>{playerName || "שחקן 1"}</span>
              <span style={{ color: "#f87171", fontWeight: 700, fontFamily: "monospace" }}>HP: 100/100</span>
            </div>
            <div style={{ background: C.bg3, height: 8, borderRadius: 4, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ background: "#dc2626", height: "100%", width: "100%", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "#2d1010", border: "1px solid #dc262644", borderRadius: 6, padding: "6px 0", textAlign: "center", fontSize: 11, color: "#f87171" }}>⚔️ התקפה</div>
              <div style={{ flex: 1, background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "6px 0", textAlign: "center", fontSize: 11, color: C.text2 }}>🛡️ מגן</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>Config generated:</span>
          <pre style={{ fontSize: 8, color: "#555", fontFamily: "monospace", background: C.bg0, borderRadius: 6, padding: "6px 8px", margin: "4px 0 0", overflow: "auto" }}>
{`{"engine":"forge-v1","template":"${template.id}","title":"${(gameTitle || "").replace(/"/g, "'")}","player":"${(playerName || "").replace(/"/g, "'")}"}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Community Game Card ────────────────────────────────────────────────────────
function GameCard({ game, onPlay }) {
  const tpl = GAME_TEMPLATES.find(t => t.id === game.template) || GAME_TEMPLATES[0];
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
          <div style={{ fontSize: 11, color: C.text3 }}>יוצר: {game.author} • {tpl.title.split(" ")[0]}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#b8edb822", color: "#4a9a4a", border: "1px solid #b8edb866" }}>✓ מוכן</span>
        <button
          onClick={() => onPlay && onPlay(game)}
          style={{ background: "#f08080", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
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
export default function GameCreatorApp({ onBack }) {
  const [gamesList, setGamesList] = useState([
    { id: "1", title: "מרוץ הדרקונים", template: "race",   author: "חיים" },
    { id: "2", title: "טריוויה טק",    template: "trivia", author: "מערכת" },
  ]);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const [tab,              setTab]             = useState("home");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt,         setAiPrompt]         = useState("");
  const [gameTitle,        setGameTitle]         = useState("");
  const [themeColor,       setThemeColor]        = useState("#4f46e5");
  const [playerName,       setPlayerName]        = useState("שחקן 1");
  const [logoFile,         setLogoFile]          = useState(null);

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
    let tpl = GAME_TEMPLATES[0];
    if (p.includes("כסף") || p.includes("מונופול") || p.includes("לקנות")) tpl = GAME_TEMPLATES[1];
    else if (p.includes("קלף") || p.includes("אוני") || p.includes("חפיסה"))  tpl = GAME_TEMPLATES[2];
    else if (p.includes("חידה") || p.includes("שאלה") || p.includes("טריוויה")) tpl = GAME_TEMPLATES[3];
    else if (p.includes("משימה") || p.includes("עולם") || p.includes("מפה"))  tpl = GAME_TEMPLATES[4];
    else if (p.includes("קרב") || p.includes("חיים") || p.includes("מכות"))   tpl = GAME_TEMPLATES[5];
    setSelectedTemplate(tpl);
    setGameTitle(aiPrompt.substring(0, 24) + (aiPrompt.length > 24 ? "..." : ""));
    setTab("create");
  }

  function handleSave() {
    if (!gameTitle.trim()) { alert("אנא הכנס שם למשחק"); return; }
    setGamesList(prev => [
      { id: Date.now().toString(), title: gameTitle, template: selectedTemplate?.id || "race", author: "אתה" },
      ...prev,
    ]);
    setTab("community");
  }

  function goCreate(tpl) {
    setSelectedTemplate(tpl);
    setGameTitle(`המשחק שלי — ${tpl.title.split(" ")[0]}`);
    setTab("create");
  }

  return (
    <div style={st.page}>
      <style>{`@keyframes pop { 0%{transform:translateX(-50%) scale(.85);opacity:0} 100%{transform:translateX(-50%) scale(1);opacity:1} }`}</style>
      <Toast msg={toast} />
      {/* Header */}
      <header style={st.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoFile
            ? <img src={logoFile} alt="Logo" style={{ width: 38, height: 38, borderRadius: 9, objectFit: "cover", border: `1px solid ${C.border}` }} />
            : <div style={{ width: 38, height: 38, background: "#FFB3C6", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff" }}>🎲</div>
          }
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#f08080" }}>GameForge Engine</div>
            <div style={{ fontSize: 11, color: C.text3 }}>מחולל המשחקים של Sartort</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <TabBtn active={tab === "home"}      onClick={() => setTab("home")}>🏠 דף הבית</TabBtn>
          <TabBtn active={tab === "create"}    onClick={() => { setTab("create"); if (!selectedTemplate) setSelectedTemplate(GAME_TEMPLATES[0]); }}>🎨 סטודיו עיצוב</TabBtn>
          <TabBtn active={tab === "community"} onClick={() => setTab("community")}>🌍 קהילה</TabBtn>
          <button onClick={onBack} style={{ ...st.btnGhost, marginRight: 10, padding: "7px 14px", fontSize: 12 }}>← חזור ל-Sartort</button>
        </div>
      </header>

      {/* Main content */}
      <main style={st.main}>

        {/* ── Home tab ── */}
        {tab === "home" && (
          <div>
            {/* AI banner */}
            <div style={{ position: "relative", borderRadius: 20, background: "linear-gradient(135deg, #ffe0ec, #fff5f8, #e8f0ff)", border: `1px solid #f0c0d0`, padding: "28px 28px 32px", marginBottom: 36, overflow: "hidden" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f0808018", color: "#f08080", border: "1px solid #f0808033", marginBottom: 12 }}>✨ יצירה חכמה מתיאור</span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2d1520", margin: "0 0 8px" }}>יש לך רעיון למשחק בראש?</h2>
              <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 520 }}>
                תאר את המשחק שלך במילים פשוטות, והמערכת תתאים לך את התבנית הנכונה ותפתח את סטודיו העיצוב.
              </p>
              <form onSubmit={handleAICreate} style={{ display: "flex", gap: 8, maxWidth: 560 }}>
                <input
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="לדוגמה: מרוץ מכוניות מטורף בשילוב שאלות טריוויה וכסף..."
                  style={{ ...st.input, flex: 1 }}
                />
                <button type="submit" style={{ ...st.btnIndigo, whiteSpace: "nowrap", flexShrink: 0 }}>✨ צור משחק</button>
              </form>
            </div>

            {/* Template grid */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>תבניות משחק מוכנות</h3>
              <p style={{ fontSize: 12, color: C.text3, margin: "0 0 20px" }}>בחר בסיס מוכן והתחל לשנות פרטים, קלפים וצבעים</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
              {GAME_TEMPLATES.map(tpl => (
                <div key={tpl.id} onClick={() => goCreate(tpl)}
                  style={{ ...st.card, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "border-color .15s, background .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0a0c0"; e.currentTarget.style.background = "#fff0f5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg2; }}
                >
                  <div>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: tpl.color + "22", border: `1px solid ${tpl.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>{tpl.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text1, marginBottom: 8 }}>{tpl.title}</div>
                    <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, margin: "0 0 14px" }}>{tpl.description}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11 }}>
                    <span style={{ color: "#444" }}>דוגמה: {tpl.example}</span>
                    <span style={{ color: C.indigoText, fontWeight: 600 }}>בחר ←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Create tab ── */}
        {tab === "create" && selectedTemplate && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
            {/* Config panel */}
            <div style={st.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 18, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: selectedTemplate.color + "22", border: `1px solid ${selectedTemplate.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{selectedTemplate.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text1 }}>התאמת בסיס: {selectedTemplate.title}</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>שנה פרטים כדי לעצב את המשחק שלך</div>
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
                <label style={st.label}>תיקון שם ברירת מחדל בלוח</label>
                <div style={{ background: `${C.indigo}08`, border: `1px solid ${C.indigo}22`, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.6, margin: 0 }}>
                    המערכת זיהתה שם ברירת מחדל <strong style={{ color: C.text1 }}>"אלון"</strong> בטקסט הלוח. הוא יוחלף אוטומטית בשם שתכתוב כאן.
                  </p>
                </div>
                <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder='הכנס שם שחקן / כותרת' style={st.input} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={st.label}>העלאת לוגו ייעודי</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ ...st.btnGhost, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    📁 בחר קובץ לוגו
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                  </label>
                  {logoFile && <span style={{ fontSize: 11, color: "#34d399" }}>✓ הקובץ נטען</span>}
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                <button onClick={handleSave} style={{ ...st.btnIndigo, flex: 1, justifyContent: "center", fontSize: 14, padding: "12px 0" }}>📤 שמור ושתף עם הקהילה</button>
                <button onClick={() => setTab("home")} style={{ ...st.btnGhost, fontSize: 12 }}>ביטול</button>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ position: "sticky", top: 76 }}>
              <LivePreview template={selectedTemplate} gameTitle={gameTitle} themeColor={themeColor} playerName={playerName} logoFile={logoFile} />
            </div>
          </div>
        )}

        {/* ── Community tab ── */}
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
              {gamesList.map(g => <GameCard key={g.id} game={g} onPlay={(game) => showToast(`🎲 "${game.title}" — בקרוב תוכל לשחק ישירות מהקהילה!`)} />)}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
