import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAYER_COLORS = ["#ff4d4d", "#4daaff", "#4dff91", "#ffd700"];
const SAVED_GAMES_KEY = "srtort_saved_games";
const BOARD_SIZE = 36;

// Hebrew display → English for Claude
const THEME_MAP = {
  "פנטזיה ימי-ביניימית": "medieval fantasy with knights, castles and dragons",
  "שודדי חלל":           "space pirates and alien worlds",
  "מסע תת-ימי":          "underwater ocean adventure with sea creatures",
  "אי הרי-געש":          "volcanic island survival adventure",
  "מכשפים וקסמים":       "wizards, magic spells and enchanted forests",
  "מערות דרקון":         "dragon caves and ancient treasures",
};

const GLOBAL_STYLE = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse  { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes pop    { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  @keyframes glow   { 0%,100%{box-shadow:0 0 8px #f0c04066} 50%{box-shadow:0 0 22px #f0c040cc} }
`;

// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, system, max_tokens: 2000 }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || data.error);
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return JSON.parse(text.replace(/```json\n?|```/g, "").trim());
  } catch {
    return null;
  }
}

// ─── Sound ────────────────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    if (type === "dice") {
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    } else if (type === "card") {
      o.type = "triangle";
      o.frequency.setValueAtTime(523, ctx.currentTime);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
      o.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    } else if (type === "win") {
      [523, 659, 784, 1047].forEach((f, i) => {
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.13);
      });
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    } else if (type === "trap") {
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    } else if (type === "move") {
      o.type = "sine";
      o.frequency.setValueAtTime(440, ctx.currentTime);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    } else if (type === "click") {
      o.frequency.setValueAtTime(800, ctx.currentTime);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    }
    o.start();
    o.stop(ctx.currentTime + 0.7);
  } catch (_) {}
}

// ─── Board helpers ────────────────────────────────────────────────────────────
function posToGrid(pos) {
  const idx = pos - 1;
  const row = Math.floor(idx / 6);
  const colInRow = idx % 6;
  const col = row % 2 === 0 ? colInRow : 5 - colInRow;
  return { row: 5 - row, col };
}

// ─── Die ──────────────────────────────────────────────────────────────────────
function Die({ value, rolling }) {
  const dots = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
  };
  const v = Math.max(1, Math.min(6, value || 1));
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 100 100"
      style={{
        filter: "drop-shadow(0 0 10px #f0c04099)",
        animation: rolling ? "spin 0.12s linear infinite" : "none",
        flexShrink: 0,
      }}
    >
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#1a1a2e" stroke="#f0c040" strokeWidth="4" />
      {(dots[v] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#f0c040" />
      ))}
    </svg>
  );
}

// ─── Saved Games Panel ────────────────────────────────────────────────────────
function SavedGamesPanel({ onLoad, onClose }) {
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || "[]")); } catch {}
  }, []);

  function deleteGame(id) {
    const updated = saved.filter((g) => g.id !== id);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updated));
    setSaved(updated);
  }

  return (
    <div style={overlay}>
      <div style={{ ...card, width: 390, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ color: "#f0c040", fontWeight: 900, fontSize: 20 }}>📁 משחקים שמורים</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        {saved.length === 0 && (
          <div style={{ color: "#444", fontStyle: "italic", textAlign: "center", padding: 24 }}>
            אין משחקים שמורים עדיין.
          </div>
        )}
        {saved.map((g) => (
          <div key={g.id} style={{ background: "#111120", border: "1px solid #1e1e3a", borderRadius: 12, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 30 }}>{g.game?.icon || "🎲"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#f0c040", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {g.game?.title || "משחק לא ידוע"}
              </div>
              <div style={{ color: "#555", fontSize: 11, marginTop: 1 }}>{g.game?.subtitle}</div>
              <div style={{ color: "#444", fontSize: 10, marginTop: 3 }}>
                {new Date(g.savedAt).toLocaleDateString("he-IL")} • {g.players?.map((p) => p.name).join(", ")}
              </div>
            </div>
            <button onClick={() => { playSound("click"); onLoad(g); }} style={btnGold}>טען</button>
            <button onClick={() => deleteGame(g.id)} style={btnGhost}>🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({ event, onClose, loading }) {
  const good = event?.spaceType === "card" || event?.spaceType === "bonus";
  const accent = good ? "#4dff91" : "#ff4d4d";

  // Loading state — waiting for Claude to generate the event
  if (loading) {
    return (
      <div style={overlay}>
        <div style={{ ...card, width: 320, textAlign: "center", border: "1px solid #2a2a4a" }}>
          <div style={{ fontSize: 50, animation: "spin 1s linear infinite", marginBottom: 16 }}>⚙️</div>
          <div style={{ color: "#f0c040", fontSize: 16, fontWeight: 700, animation: "pulse 1.5s ease-in-out infinite" }}>
            הAI מספר מה קרה...
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div style={overlay}>
      <div style={{ ...card, width: 390, textAlign: "center", animation: "pop .22s ease-out", border: `2px solid ${accent}` }}>
        <div style={{ fontSize: 56, marginBottom: 14, animation: "float 2s ease-in-out infinite" }}>
          {event.icon || (good ? "✨" : "💀")}
        </div>
        <div style={{ color: accent, fontWeight: 900, fontSize: 22, marginBottom: 10 }}>
          {event.title}
        </div>
        <div style={{ color: "#aaa", fontSize: 14, lineHeight: 1.65, marginBottom: 18 }}>
          {event.description}
        </div>
        {event.effectText && (
          <div style={{ background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 10, padding: "8px 16px", color: accent, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
            {event.effectText}
          </div>
        )}
        <button
          onClick={() => { playSound("click"); onClose(); }}
          style={{ ...btnPrimary, background: accent, width: "100%", fontSize: 16 }}
        >
          המשך →
        </button>
      </div>
    </div>
  );
}

// ─── Board Display ────────────────────────────────────────────────────────────
function BoardDisplay({ spaces, players }) {
  const grid = Array.from({ length: 6 }, () => Array(6).fill(null));

  for (let pos = 1; pos <= BOARD_SIZE; pos++) {
    const space = spaces[pos - 1];
    if (!space) continue;
    const { row, col } = posToGrid(pos);
    grid[row][col] = space;
  }

  const playerMap = {};
  players.forEach((p, i) => {
    if (p.position > 0 && p.position <= BOARD_SIZE) {
      (playerMap[p.position] ??= []).push(i);
    }
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, width: "100%", maxWidth: 468 }}>
      {grid.map((row, ri) =>
        row.map((space, ci) => {
          if (!space) return <div key={`${ri}-${ci}`} style={{ aspectRatio: "1", background: "#0a0a14" }} />;

          const playersHere = playerMap[space.id] || [];
          const isWin = space.id === BOARD_SIZE;
          const bg =
            isWin                  ? "#f0c04028" :
            space.type === "card"  ? "#4dff9120" :
            space.type === "trap"  ? "#ff4d4d1a" :
            space.type === "bonus" ? "#4daaff1a" :
            "#1a1a2e";
          const border =
            isWin                  ? "#f0c040" :
            space.type === "card"  ? "#4dff9166" :
            space.type === "trap"  ? "#ff4d4d66" :
            space.type === "bonus" ? "#4daaff66" :
            "#2a2a4a";

          return (
            <div
              key={space.id}
              title={space.name}
              style={{
                aspectRatio: "1",
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 7,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                animation: isWin ? "glow 2s ease-in-out infinite" : "none",
              }}
            >
              <div style={{ fontSize: 15, lineHeight: 1, pointerEvents: "none" }}>
                {space.icon || "·"}
              </div>
              <div style={{ color: "#333", fontSize: 8, fontWeight: 700, lineHeight: 1 }}>
                {space.id}
              </div>
              {playersHere.length > 0 && (
                <div style={{ position: "absolute", top: 1, right: 1, display: "flex", flexWrap: "wrap", gap: 1, maxWidth: 20 }}>
                  {playersHere.map((pi) => (
                    <div
                      key={pi}
                      style={{ width: 9, height: 9, borderRadius: "50%", background: PLAYER_COLORS[pi], border: "1px solid #000a", flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, index, isActive }) {
  const color = PLAYER_COLORS[index];
  return (
    <div style={{
      background: isActive ? "#151528" : "#0d0d1a",
      border: `1.5px solid ${isActive ? color : "#1a1a3a"}`,
      borderRadius: 12,
      padding: "9px 13px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      transition: "border-color .2s, background .2s",
    }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#000c", flexShrink: 0 }}>
        {player.name[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: isActive ? color : "#999", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {player.name}
        </div>
        <div style={{ color: "#3a3a5a", fontSize: 10, marginTop: 1 }}>
          משבצת {player.position || "—"}{player.skip ? " · מדלג על תור" : ""}
        </div>
      </div>
      {isActive && <div style={{ color: color, fontSize: 14 }}>▶</div>}
    </div>
  );
}

// ─── Board Legend ─────────────────────────────────────────────────────────────
function BoardLegend() {
  const items = [
    { color: "#4dff9166", label: "מזל" },
    { color: "#ff4d4d66", label: "מלכודת" },
    { color: "#4daaff66", label: "בונוס" },
    { color: "#f0c04066", label: "סיום" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${color}`, background: color + "44" }} />
          <span style={{ color: "#444", fontSize: 11 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed", inset: 0, background: "#000000cc",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
};
const card = {
  background: "#0d0d1a", border: "1px solid #1e1e3a",
  borderRadius: 20, padding: 28,
};
const closeBtn = {
  background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20,
};
const btnPrimary = {
  background: "#f0c040", color: "#0a0a14", border: "none",
  borderRadius: 14, padding: "14px 0", fontSize: 17, fontWeight: 900, cursor: "pointer",
};
const btnGold = {
  background: "#f0c040", color: "#0d0d1a", border: "none",
  borderRadius: 8, padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: 12, flexShrink: 0,
};
const btnGhost = {
  background: "none", border: "1px solid #2a2a4a", color: "#555",
  borderRadius: 8, padding: "6px 11px", cursor: "pointer", fontSize: 12, flexShrink: 0,
};
const input = {
  width: "100%", background: "#1a1a2e", border: "1px solid #2a2a4a",
  borderRadius: 10, padding: "11px 13px", color: "#fff", fontSize: 14, outline: "none",
};
const page = {
  minHeight: "100vh", background: "#0a0a14", fontFamily: "system-ui,-apple-system,sans-serif",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20,
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]             = useState("home");
  const [showSaved, setShowSaved]       = useState(false);

  // Game state
  const [game, setGame]                     = useState(null);
  const [players, setPlayers]               = useState([]);
  const [currentPlayer, setCurrentPlayer]   = useState(0);
  const [diceValue, setDiceValue]           = useState(1);
  const [rolling, setRolling]               = useState(false);
  const [canRoll, setCanRoll]               = useState(true);
  const [log, setLog]                       = useState([]);
  const [activeEvent, setActiveEvent]       = useState(null);
  const [eventLoading, setEventLoading]     = useState(false); // fix: loading indicator for event
  const [winner, setWinner]                 = useState(null);
  const [loadingMsg, setLoadingMsg]         = useState("");
  const [error, setError]                   = useState("");

  // Setup state
  const [playerCount, setPlayerCount]   = useState(2);
  const [playerNames, setPlayerNames]   = useState(["שחקן 1", "שחקן 2", "שחקן 3", "שחקן 4"]);
  const [theme, setTheme]               = useState("");

  // Ref to avoid stale closure in async callbacks
  const playersRef    = useRef(players);
  const currentPRef   = useRef(currentPlayer);
  const ivRef         = useRef(null); // fix: track interval for cleanup

  useEffect(() => { playersRef.current  = players;       }, [players]);
  useEffect(() => { currentPRef.current = currentPlayer; }, [currentPlayer]);

  // fix: clean up interval if component unmounts mid-roll
  useEffect(() => () => { if (ivRef.current) clearInterval(ivRef.current); }, []);

  function addLog(msg) {
    setLog((l) => [...l.slice(-29), msg]);
  }

  // ── Save / Load ──────────────────────────────────────────────────────────────
  function saveGame() {
    playSound("click");
    try {
      const saves = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || "[]");
      saves.unshift({ id: Date.now(), savedAt: Date.now(), game, players, currentPlayer, log });
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(saves.slice(0, 10)));
    } catch {}
  }

  function loadSavedGame(save) {
    setGame(save.game);
    setPlayers(save.players);
    setCurrentPlayer(save.currentPlayer ?? 0);
    setLog(save.log ?? []);
    setWinner(null);
    setActiveEvent(null);
    setEventLoading(false);
    setCanRoll(true);
    setShowSaved(false);
    setScreen("board");
  }

  // ── Generate board ────────────────────────────────────────────────────────────
  async function generateBoard() {
    setError("");
    setScreen("loading");
    setLoadingMsg("🧙 AI מייצר את ההרפתקה שלך...");

    // fix: translate Hebrew theme names to English for Claude
    const englishTheme = THEME_MAP[theme.trim()] || theme.trim() || "whimsical fantasy adventure";

    const data = await callClaude(
      [{
        role: "user",
        content: `Design a board game with the theme: "${englishTheme}".
Return ONLY a JSON object (no extra text):
{
  "title": "Creative Hebrew game title",
  "subtitle": "Short Hebrew tagline",
  "icon": "single emoji",
  "theme": "${englishTheme}",
  "spaces": [
    {"id":1,"type":"normal","name":"Hebrew space name","icon":"emoji"},
    ...
    {"id":36,"type":"win","name":"סיום","icon":"🏆"}
  ]
}
Rules for 36 spaces total:
- type "normal": 20 spaces
- type "card": 7 lucky spaces
- type "trap": 7 bad spaces
- type "bonus": 2 extra movement spaces
- type "win": exactly space 36
All names must be in Hebrew and fit the theme. Return ONLY valid JSON.`,
      }],
      "You are a creative board game designer. Output only valid JSON, no prose, no markdown."
    );

    if (!data?.spaces || data.spaces.length < 10) {
      setError("שגיאה ביצירת לוח המשחק. בדוק את מפתח ה-API ונסה שוב.");
      setScreen("setup");
      return;
    }

    // Ensure exactly 36 spaces
    while (data.spaces.length < BOARD_SIZE) {
      const id = data.spaces.length + 1;
      data.spaces.push({ id, type: id === BOARD_SIZE ? "win" : "normal", name: id === BOARD_SIZE ? "סיום" : `משבצת ${id}`, icon: id === BOARD_SIZE ? "🏆" : "·" });
    }
    data.spaces = data.spaces.slice(0, BOARD_SIZE).map((s, i) => ({ ...s, id: i + 1 }));

    const newPlayers = playerNames.slice(0, playerCount).map((name, i) => ({
      name: name.trim() || `שחקן ${i + 1}`,
      color: PLAYER_COLORS[i],
      position: 0,
      skip: false,
    }));

    setGame(data);
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setLog([`🎲 "${data.title}" מתחיל! ${newPlayers[0].name} עולה ראשון.`]);
    setWinner(null);
    setActiveEvent(null);
    setEventLoading(false);
    setCanRoll(true);
    setScreen("board");
  }

  // ── Dice roll ─────────────────────────────────────────────────────────────────
  function rollDice() {
    if (!canRoll || rolling || activeEvent || eventLoading) return;
    setCanRoll(false);
    setRolling(true);
    playSound("dice");

    let frame = 0;
    const totalFrames = 14;
    // fix: store interval ref for cleanup
    ivRef.current = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      frame++;
      if (frame >= totalFrames) {
        clearInterval(ivRef.current);
        ivRef.current = null;
        const roll = Math.ceil(Math.random() * 6);
        setDiceValue(roll);
        setRolling(false);
        applyRoll(roll);
      }
    }, 75);
  }

  async function applyRoll(roll) {
    const currentPlayers = playersRef.current;
    const cp = currentPRef.current; // fix: use ref instead of stale closure
    const p = currentPlayers[cp];
    const newPos = Math.min(p.position + roll, BOARD_SIZE);
    playSound("move");

    const updatedPlayers = currentPlayers.map((pl, i) =>
      i === cp ? { ...pl, position: newPos } : pl
    );
    setPlayers(updatedPlayers);
    addLog(`🎲 ${p.name} הטיל ${roll} → משבצת ${newPos}`);

    if (newPos >= BOARD_SIZE) {
      playSound("win");
      setWinner(cp);
      addLog(`🏆 ${p.name} ניצח!`);
      setScreen("win");
      return;
    }

    const space = game.spaces[newPos - 1];
    if (space && ["card", "trap", "bonus"].includes(space.type)) {
      playSound(space.type === "trap" ? "trap" : "card");
      // fix: show loading spinner immediately while waiting for Claude
      setEventLoading(true);

      const eventData = await callClaude(
        [{
          role: "user",
          content: `שחקן בשם "${p.name}" נחת על המשבצת "${space.name}" (סוג: ${space.type}) במשחק "${game.theme}".
צור אירוע קצר ודרמטי בעברית. החזר JSON בלבד:
{
  "title": "כותרת קצרה ודרמטית בעברית",
  "description": "שתי משפטים בעברית המתארים מה קרה.",
  "icon": "אמוג'י רלוונטי יחיד",
  "effectText": "התקדם/חזור X משבצות",
  "effect": {"type": "move", "value": 3}
}
עבור מלכודת (trap): value בין -2 ל-4-.
עבור מזל (card): value בין 2 ל-4.
עבור בונוס (bonus): value בין 3 ל-5.
החזר JSON תקני בלבד.`,
        }],
        "אתה מספר סיפורים דרמטי למשחקי לוח. פלט JSON תקני בלבד."
      );

      // fix: Hebrew fallbacks
      const fallbacks = {
        card:  { title: "מזל גדול!", description: "המזל חייך לך. הדרך קדימה פנויה.", icon: "⭐", effectText: "התקדם 2 משבצות", effect: { type: "move", value: 2 } },
        trap:  { title: "מארב!", description: "משהו נורא קרה. אתה נסוג לאחור.", icon: "💀", effectText: "חזור 2 משבצות", effect: { type: "move", value: -2 } },
        bonus: { title: "רוח גבית!", description: "דחיפה בלתי צפויה מקדמת אותך.", icon: "🌟", effectText: "התקדם 4 משבצות", effect: { type: "move", value: 4 } },
      };

      setEventLoading(false);
      setActiveEvent({ ...(eventData || fallbacks[space.type]), spaceType: space.type });
    } else {
      advanceTurn(updatedPlayers, cp);
    }
  }

  function handleEventClose() {
    const event = activeEvent;
    setActiveEvent(null);
    if (!event) return;

    const cp = currentPRef.current;
    let current = [...playersRef.current];

    if (event.effect?.type === "move") {
      const p = current[cp];
      const newPos = Math.max(1, Math.min(BOARD_SIZE, p.position + event.effect.value));
      current[cp] = { ...p, position: newPos };
      setPlayers(current);
      addLog(`  ↳ ${p.name}: ${event.effectText || ""} → משבצת ${newPos}`);

      if (newPos >= BOARD_SIZE) {
        playSound("win");
        setWinner(cp);
        addLog(`🏆 ${p.name} ניצח!`);
        setScreen("win");
        return;
      }
    } else if (event.effect?.type === "skip") {
      current[cp] = { ...current[cp], skip: true };
      setPlayers(current);
    }

    advanceTurn(current, cp);
  }

  // fix: accept currentPlayer as parameter instead of relying on closure
  function advanceTurn(currentPlayers, cp) {
    let next = (cp + 1) % currentPlayers.length;
    // Handle consecutive skips
    let safetyCounter = 0;
    while (currentPlayers[next]?.skip && safetyCounter < currentPlayers.length) {
      const skippedName = currentPlayers[next].name;
      currentPlayers = currentPlayers.map((p, i) => i === next ? { ...p, skip: false } : p);
      addLog(`⏭ ${skippedName} מדלג על התור.`);
      next = (next + 1) % currentPlayers.length;
      safetyCounter++;
    }
    setPlayers(currentPlayers);
    setCurrentPlayer(next);
    addLog(`▶ תור ${currentPlayers[next]?.name || ""}`);
    setCanRoll(true);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────────

  if (screen === "home") {
    return (
      <div style={page}>
        <style>{GLOBAL_STYLE}</style>
        {showSaved && <SavedGamesPanel onLoad={loadSavedGame} onClose={() => setShowSaved(false)} />}

        <div style={{ textAlign: "center", width: "100%", maxWidth: 420 }}>
          <div style={{ fontSize: 90, animation: "float 3s ease-in-out infinite", marginBottom: 8 }}>🎲</div>
          <div style={{ color: "#f0c040", fontWeight: 900, fontSize: 44, letterSpacing: 3, marginBottom: 4 }}>
            SARTORT
          </div>
          <div style={{ color: "#444", fontSize: 14, marginBottom: 40 }}>משחק לוח עם AI</div>

          {error && (
            <div style={{ background: "#ff4d4d15", border: "1px solid #ff4d4d44", borderRadius: 10, padding: 12, color: "#ff4d4d", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button
            onClick={() => { playSound("click"); setError(""); setScreen("setup"); }}
            style={{ ...btnPrimary, display: "block", width: "100%", marginBottom: 12 }}
          >
            🎮 משחק חדש
          </button>
          <button
            onClick={() => { playSound("click"); setShowSaved(true); }}
            style={{ display: "block", width: "100%", background: "none", color: "#f0c040", border: "2px solid #f0c04033", borderRadius: 14, padding: "13px 0", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            📁 טען משחק שמור
          </button>
        </div>
      </div>
    );
  }

  if (screen === "setup") {
    const THEMES = [
      { label: "🏰 פנטזיה ימי-ביניימית", value: "פנטזיה ימי-ביניימית" },
      { label: "🚀 שודדי חלל",           value: "שודדי חלל" },
      { label: "🌊 מסע תת-ימי",          value: "מסע תת-ימי" },
      { label: "🌋 אי הרי-געש",          value: "אי הרי-געש" },
      { label: "🧙 מכשפים וקסמים",       value: "מכשפים וקסמים" },
      { label: "🐉 מערות דרקון",         value: "מערות דרקון" },
    ];
    return (
      <div style={{ ...page, justifyContent: "flex-start", paddingTop: 40 }}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <button onClick={() => { setScreen("home"); setError(""); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, marginBottom: 22 }}>
            ← חזור
          </button>
          <div style={{ color: "#f0c040", fontWeight: 900, fontSize: 28, marginBottom: 26 }}>🎮 הגדרת משחק</div>

          {error && (
            <div style={{ background: "#ff4d4d15", border: "1px solid #ff4d4d44", borderRadius: 10, padding: 12, color: "#ff4d4d", fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#777", fontSize: 13, marginBottom: 10 }}>מספר שחקנים</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => { playSound("click"); setPlayerCount(n); }}
                  style={{ flex: 1, background: playerCount === n ? "#f0c040" : "#1a1a2e", color: playerCount === n ? "#0d0d1a" : "#666", border: `1.5px solid ${playerCount === n ? "#f0c040" : "#2a2a4a"}`, borderRadius: 12, padding: "12px 0", fontSize: 20, fontWeight: 900, cursor: "pointer", transition: "all .15s" }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#777", fontSize: 13, marginBottom: 10 }}>שמות שחקנים</div>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: PLAYER_COLORS[i], flexShrink: 0 }} />
                <input
                  value={playerNames[i]}
                  onChange={(e) => {
                    const n = [...playerNames];
                    n[i] = e.target.value;
                    setPlayerNames(n);
                  }}
                  style={input}
                  placeholder={`שחקן ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={{ color: "#777", fontSize: 13, marginBottom: 10 }}>נושא המשחק (אופציונלי)</div>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="לדוגמה: פיראטים, חלל, ג'ונגל..."
              style={{ ...input, marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { playSound("click"); setTheme(t.value); }}
                  style={{ background: theme === t.value ? "#2a2a4a" : "#111120", border: `1px solid ${theme === t.value ? "#3a3a6a" : "#1e1e3a"}`, borderRadius: 8, padding: "6px 11px", color: theme === t.value ? "#aaa" : "#444", fontSize: 12, cursor: "pointer", transition: "all .15s" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { playSound("click"); generateBoard(); }}
            style={{ ...btnPrimary, display: "block", width: "100%" }}
          >
            🚀 צור הרפתקה!
          </button>
        </div>
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div style={page}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 70, animation: "spin 1.1s linear infinite", marginBottom: 24 }}>⚙️</div>
          <div style={{ color: "#f0c040", fontSize: 20, fontWeight: 700, animation: "pulse 1.5s ease-in-out infinite", marginBottom: 8 }}>
            {loadingMsg || "יוצר את ההרפתקה שלך..."}
          </div>
          <div style={{ color: "#2a2a3a", fontSize: 13 }}>זה עשוי לקחת רגע...</div>
          {error && (
            <div style={{ marginTop: 28, background: "#ff4d4d15", border: "1px solid #ff4d4d44", borderRadius: 12, padding: 16, color: "#ff4d4d", fontSize: 13, maxWidth: 380 }}>
              {error}
              <button onClick={() => setScreen("setup")} style={{ display: "block", margin: "10px auto 0", background: "#ff4d4d", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontSize: 13 }}>
                חזור להגדרות
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "win" && winner !== null) {
    const w = players[winner];
    return (
      <div style={page}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 90, animation: "float 1.8s ease-in-out infinite", marginBottom: 14 }}>🏆</div>
          <div style={{ color: "#f0c040", fontWeight: 900, fontSize: 38, marginBottom: 6 }}>{w?.name} ניצח!</div>
          <div style={{ color: "#444", fontSize: 16, marginBottom: 36 }}>{game?.title}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => { playSound("click"); setWinner(null); setScreen("setup"); }} style={{ ...btnPrimary, padding: "14px 30px" }}>
              🎮 שחק שוב
            </button>
            <button onClick={() => { playSound("click"); setScreen("home"); }} style={{ background: "none", color: "#f0c040", border: "2px solid #f0c04033", borderRadius: 14, padding: "14px 30px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              🏠 בית
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "board" && game) {
    const cp = players[currentPlayer];
    const blocked = !canRoll || rolling || !!activeEvent || eventLoading;
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px 30px" }}>
        <style>{GLOBAL_STYLE}</style>

        {/* fix: show loading overlay OR event modal */}
        {(eventLoading || activeEvent) && (
          <EventModal event={activeEvent} onClose={handleEventClose} loading={eventLoading} />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, width: "100%", maxWidth: 468 }}>
          <div style={{ fontSize: 26 }}>{game.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#f0c040", fontWeight: 900, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {game.title}
            </div>
            <div style={{ color: "#333", fontSize: 11 }}>{game.subtitle}</div>
          </div>
          <button onClick={saveGame} style={btnGhost} title="שמור">💾</button>
          <button onClick={() => { playSound("click"); setScreen("home"); }} style={{ ...btnGhost, fontSize: 18, borderColor: "transparent" }}>✕</button>
        </div>

        <BoardDisplay spaces={game.spaces} players={players} />
        <div style={{ marginTop: 8 }}><BoardLegend /></div>

        <div style={{ width: "100%", maxWidth: 468, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 14 }}>
          {players.map((p, i) => (
            <PlayerCard key={i} player={p} index={i} isActive={i === currentPlayer} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 18 }}>
          <Die value={diceValue} rolling={rolling} />
          <button
            onClick={rollDice}
            disabled={blocked}
            style={{
              ...btnPrimary,
              padding: "14px 38px",
              background: !blocked ? "#f0c040" : "#1a1a2e",
              color:      !blocked ? "#0a0a14" : "#333",
              cursor:     !blocked ? "pointer" : "not-allowed",
              transition: "background .2s, color .2s",
              animation:  !blocked ? "glow 2s ease-in-out infinite" : "none",
            }}
          >
            {rolling ? "מטיל..." : eventLoading ? "AI חושב..." : `🎲 הטל קוביה — ${cp?.name}`}
          </button>
        </div>

        <div style={{ width: "100%", maxWidth: 468, marginTop: 16, background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 14, padding: "10px 14px", maxHeight: 130, overflowY: "auto" }}>
          <div style={{ color: "#2a2a3a", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>יומן משחק</div>
          {[...log].reverse().map((entry, i) => (
            <div key={i} style={{ color: i === 0 ? "#777" : "#333", fontSize: 12, paddingBottom: 3, lineHeight: 1.4 }}>
              {entry}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
