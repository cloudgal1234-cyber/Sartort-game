import { useState, useEffect, useRef } from "react";
import { THEMES } from "./gameData.js";
import GameCreatorApp from "./GameCreatorApp.jsx";
import { TriviaGame, MemoryGame, PartyGame, EscapeGame } from "./MiniGames.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAYER_COLORS = ["#ff4d4d", "#4daaff", "#4dff91", "#ffd700"];
const SAVED_GAMES_KEY = "srtort_saved_games";
const BOARD_SIZE = 36;

const GLOBAL_STYLE = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse  { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes pop    { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes glow   { 0%,100%{box-shadow:0 0 8px #f0808066} 50%{box-shadow:0 0 22px #f08080cc} }
`;

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

// ─── Board helper ─────────────────────────────────────────────────────────────
function posToGrid(pos) {
  const idx = pos - 1;
  const row = Math.floor(idx / 6);
  const colInRow = idx % 6;
  const col = row % 2 === 0 ? colInRow : 5 - colInRow;
  return { row: 5 - row, col };
}

function randomEvent(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Die ──────────────────────────────────────────────────────────────────────
function Die({ value, rolling }) {
  const dots = {
    1: [[50,50]], 2: [[28,28],[72,72]], 3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]], 5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
  };
  const v = Math.max(1, Math.min(6, value || 1));
  return (
    <svg width="64" height="64" viewBox="0 0 100 100"
      style={{ filter:"drop-shadow(0 0 10px #f0808099)", animation: rolling ? "spin 0.12s linear infinite" : "none", flexShrink:0 }}>
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#FFB3C6" stroke="#F08080" strokeWidth="4"/>
      {(dots[v]||[]).map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r="9" fill="white"/>)}
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
    const updated = saved.filter(g => g.id !== id);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updated));
    setSaved(updated);
  }
  return (
    <div style={overlay}>
      <div style={{ ...card, width:390, maxHeight:"80vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ color:"#f0c040", fontWeight:900, fontSize:20 }}>📁 משחקים שמורים</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        {saved.length === 0 && <div style={{ color:"#444", fontStyle:"italic", textAlign:"center", padding:24 }}>אין משחקים שמורים עדיין.</div>}
        {saved.map(g => (
          <div key={g.id} style={{ background:"#fff0f5", border:"1px solid #f0d8e8", borderRadius:12, padding:14, marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:30 }}>{g.game?.icon||"🎲"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:"#f08080", fontWeight:700, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.game?.title||"משחק"}</div>
              <div style={{ color:"#b09090", fontSize:11 }}>{g.game?.subtitle}</div>
              <div style={{ color:"#c0a0a8", fontSize:10, marginTop:3 }}>{new Date(g.savedAt).toLocaleDateString("he-IL")} • {g.players?.map(p=>p.name).join(", ")}</div>
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
function EventModal({ event, onClose }) {
  if (!event) return null;
  const good = event.spaceType === "card" || event.spaceType === "bonus";
  const accent = good ? "#4dff91" : "#ff4d4d";
  return (
    <div style={overlay}>
      <div style={{ ...card, width:360, textAlign:"center", animation:"pop .22s ease-out", border:`2px solid ${accent}` }}>
        <div style={{ fontSize:56, marginBottom:14, animation:"float 2s ease-in-out infinite" }}>{event.icon}</div>
        <div style={{ color:accent, fontWeight:900, fontSize:22, marginBottom:10 }}>{event.title}</div>
        <div style={{ color:"#aaa", fontSize:14, lineHeight:1.65, marginBottom:18 }}>{event.description}</div>
        {event.effectText && (
          <div style={{ background:`${accent}18`, border:`1px solid ${accent}44`, borderRadius:10, padding:"8px 16px", color:accent, fontSize:13, fontWeight:700, marginBottom:18 }}>
            {event.effectText}
          </div>
        )}
        <button onClick={() => { playSound("click"); onClose(); }} style={{ ...btnPrimary, background:accent, width:"100%", fontSize:16 }}>
          המשך →
        </button>
      </div>
    </div>
  );
}

// ─── Board Display ────────────────────────────────────────────────────────────
function BoardDisplay({ spaces, players }) {
  const grid = Array.from({ length:6 }, () => Array(6).fill(null));
  for (let pos=1; pos<=BOARD_SIZE; pos++) {
    const space = spaces[pos-1];
    if (!space) continue;
    const { row, col } = posToGrid(pos);
    grid[row][col] = space;
  }
  const playerMap = {};
  players.forEach((p,i) => {
    if (p.position>0 && p.position<=BOARD_SIZE) (playerMap[p.position]??=[]).push(i);
  });

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:3, width:"100%", maxWidth:468 }}>
      {grid.map((row,ri) => row.map((space,ci) => {
        if (!space) return <div key={`${ri}-${ci}`} style={{ aspectRatio:"1", background:"#fff5f8" }}/>;
        const playersHere = playerMap[space.id]||[];
        const isWin = space.id===BOARD_SIZE;
        const bg = isWin?"#f0808028": space.type==="card"?"#4dff9130": space.type==="trap"?"#ff4d4d22": space.type==="bonus"?"#4daaff22":"#fce8f2";
        const border = isWin?"#f08080": space.type==="card"?"#4dff9188": space.type==="trap"?"#ff4d4d88": space.type==="bonus"?"#4daaff88":"#f0c8dc";
        return (
          <div key={space.id} title={space.name}
            style={{ aspectRatio:"1", background:bg, border:`1.5px solid ${border}`, borderRadius:7, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", animation:isWin?"glow 2s ease-in-out infinite":"none" }}>
            <div style={{ fontSize:15, lineHeight:1, pointerEvents:"none" }}>{space.icon||"·"}</div>
            <div style={{ color:"#333", fontSize:8, fontWeight:700 }}>{space.id}</div>
            {playersHere.length>0 && (
              <div style={{ position:"absolute", top:1, right:1, display:"flex", flexWrap:"wrap", gap:1, maxWidth:20 }}>
                {playersHere.map(pi => <div key={pi} style={{ width:9, height:9, borderRadius:"50%", background:PLAYER_COLORS[pi], border:"1px solid #000a", flexShrink:0 }}/>)}
              </div>
            )}
          </div>
        );
      }))}
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, index, isActive }) {
  const color = PLAYER_COLORS[index];
  return (
    <div style={{ background:isActive?"#fff0f5":"#ffffff", border:`1.5px solid ${isActive?color:"#f0d8e8"}`, borderRadius:12, padding:"9px 13px", display:"flex", alignItems:"center", gap:9, transition:"border-color .2s" }}>
      <div style={{ width:30, height:30, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#fff", flexShrink:0 }}>
        {player.name[0]?.toUpperCase()}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:isActive?color:"#c0909e", fontWeight:700, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{player.name}</div>
        <div style={{ color:"#d0b0c0", fontSize:10, marginTop:1 }}>משבצת {player.position||"—"}{player.skip?" · מדלג":"" }</div>
      </div>
      {isActive && <div style={{ color, fontSize:14 }}>▶</div>}
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const overlay  = { position:"fixed", inset:0, background:"rgba(200,100,120,0.22)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 };
const card     = { background:"#ffffff", border:"1px solid #f0d8e8", borderRadius:20, padding:28 };
const closeBtn = { background:"none", border:"none", color:"#c0a0b0", cursor:"pointer", fontSize:20 };
const btnPrimary = { background:"#f08080", color:"#ffffff", border:"none", borderRadius:14, padding:"14px 0", fontSize:17, fontWeight:900, cursor:"pointer" };
const btnGold  = { background:"#f08080", color:"#ffffff", border:"none", borderRadius:8, padding:"6px 13px", cursor:"pointer", fontWeight:700, fontSize:12, flexShrink:0 };
const btnGhost = { background:"none", border:"1px solid #f0d0e0", color:"#c0909e", borderRadius:8, padding:"6px 11px", cursor:"pointer", fontSize:12, flexShrink:0 };
const input    = { width:"100%", background:"#fff0f5", border:"1px solid #f0d0e0", borderRadius:10, padding:"11px 13px", color:"#2d1520", fontSize:14, outline:"none" };
const page     = { minHeight:"100vh", background:"#fff5f8", fontFamily:"system-ui,-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 };

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("home");
  const [showSaved, setShowSaved]     = useState(false);
  const [game, setGame]               = useState(null);
  const [players, setPlayers]         = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue]     = useState(1);
  const [rolling, setRolling]         = useState(false);
  const [canRoll, setCanRoll]         = useState(true);
  const [log, setLog]                 = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [winner, setWinner]           = useState(null);

  // Setup state
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(["שחקן 1", "שחקן 2", "שחקן 3", "שחקן 4"]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);

  // Mini-game state
  const [activeFormat,          setActiveFormat]          = useState(null);
  const [activeTopic,           setActiveTopic]           = useState(null);
  const [activeCustomTopic,     setActiveCustomTopic]     = useState(null);
  const [activeCustomTopicDesc, setActiveCustomTopicDesc] = useState(null);
  const [activeName,            setActiveName]            = useState(null);

  const playersRef  = useRef(players);
  const currentPRef = useRef(currentPlayer);
  const ivRef       = useRef(null);

  useEffect(() => { playersRef.current  = players;       }, [players]);
  useEffect(() => { currentPRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => () => { if (ivRef.current) clearInterval(ivRef.current); }, []);

  function addLog(msg) { setLog(l => [...l.slice(-29), msg]); }

  // ── Save / Load ──────────────────────────────────────────────────────────────
  function saveGame() {
    playSound("click");
    try {
      const saves = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || "[]");
      saves.unshift({ id:Date.now(), savedAt:Date.now(), game, players, currentPlayer, log });
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(saves.slice(0, 10)));
    } catch {}
  }

  function loadSavedGame(save) {
    setGame(save.game); setPlayers(save.players);
    setCurrentPlayer(save.currentPlayer??0); setLog(save.log??[]);
    setWinner(null); setActiveEvent(null); setCanRoll(true);
    setShowSaved(false); setScreen("board");
  }

  // ── Start game ───────────────────────────────────────────────────────────────
  function startGame() {
    const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];
    const newPlayers = playerNames.slice(0, playerCount).map((name, i) => ({
      name: name.trim() || `שחקן ${i+1}`,
      color: PLAYER_COLORS[i],
      position: 0,
      skip: false,
    }));
    setGame(theme);
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setLog([`🎲 "${theme.title}" מתחיל! ${newPlayers[0].name} עולה ראשון.`]);
    setWinner(null); setActiveEvent(null); setCanRoll(true);
    setScreen("board");
  }

  // ── Dice ─────────────────────────────────────────────────────────────────────
  function rollDice() {
    if (!canRoll || rolling || activeEvent) return;
    setCanRoll(false); setRolling(true);
    playSound("dice");
    let frame = 0;
    ivRef.current = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      frame++;
      if (frame >= 14) {
        clearInterval(ivRef.current); ivRef.current = null;
        const roll = Math.ceil(Math.random() * 6);
        setDiceValue(roll); setRolling(false);
        applyRoll(roll);
      }
    }, 75);
  }

  function applyRoll(roll) {
    const currentPlayers = playersRef.current;
    const cp = currentPRef.current;
    const p  = currentPlayers[cp];
    const newPos = Math.min(p.position + roll, BOARD_SIZE);
    playSound("move");

    const updated = currentPlayers.map((pl,i) => i===cp ? {...pl, position:newPos} : pl);
    setPlayers(updated);
    addLog(`🎲 ${p.name} הטיל ${roll} → משבצת ${newPos}`);

    if (newPos >= BOARD_SIZE) {
      playSound("win");
      setWinner(cp);
      addLog(`🏆 ${p.name} ניצח!`);
      setScreen("win");
      return;
    }

    const space = game.spaces[newPos - 1];
    if (space && ["card","trap","bonus"].includes(space.type)) {
      playSound(space.type === "trap" ? "trap" : "card");
      const event = randomEvent(game.events[space.type]);
      setActiveEvent({ ...event, spaceType: space.type });
    } else {
      advanceTurn(updated, cp);
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
      addLog(`  ↳ ${p.name}: ${event.effectText} → משבצת ${newPos}`);
      if (newPos >= BOARD_SIZE) {
        playSound("win"); setWinner(cp);
        addLog(`🏆 ${p.name} ניצח!`); setScreen("win"); return;
      }
    }
    advanceTurn(current, cp);
  }

  function advanceTurn(currentPlayers, cp) {
    let next = (cp + 1) % currentPlayers.length;
    let safety = 0;
    while (currentPlayers[next]?.skip && safety < currentPlayers.length) {
      const name = currentPlayers[next].name;
      currentPlayers = currentPlayers.map((p,i) => i===next ? {...p, skip:false} : p);
      addLog(`⏭ ${name} מדלג על התור.`);
      next = (next + 1) % currentPlayers.length;
      safety++;
    }
    setPlayers(currentPlayers);
    setCurrentPlayer(next);
    addLog(`▶ תור ${currentPlayers[next]?.name||""}`);
    setCanRoll(true);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────────

  if (screen === "creator") return (
    <GameCreatorApp
      onBack={() => setScreen("home")}
      onStartGame={({ themeId, format, topic, customTopic, customTopicDesc, name }) => {
        setActiveFormat(format); setActiveTopic(topic); setActiveCustomTopic(customTopic || null); setActiveCustomTopicDesc(customTopicDesc || null); setActiveName(name);
        if (!format || format === "board" || format === "digital") {
          setSelectedTheme(themeId || THEMES[0].id);
          setScreen("setup");
        } else if (format === "memory" || format === "escape") {
          setScreen("minigame");
        } else {
          setScreen("minigame-setup");
        }
      }}
    />
  );

  if (screen === "minigame-setup") return (
    <div style={{ ...page, justifyContent: "flex-start", paddingTop: 36 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <button onClick={() => setScreen("creator")} style={{ background: "none", border: "none", color: "#c0909e", cursor: "pointer", fontSize: 14, marginBottom: 22 }}>← חזור</button>
        <div style={{ color: "#f08080", fontWeight: 900, fontSize: 26, marginBottom: 4 }}>{activeName}</div>
        <div style={{ color: "#c0909e", fontSize: 13, marginBottom: 28 }}>הגדרת שחקנים לפני המשחק</div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: "#c0909e", fontSize: 13, marginBottom: 10 }}>מספר שחקנים</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4].map(n => (
              <button key={n} onClick={() => { playSound("click"); setPlayerCount(n); }}
                style={{ flex:1, background: playerCount===n?"#f08080":"#fff0f5", color: playerCount===n?"#fff":"#c0909e", border:`1.5px solid ${playerCount===n?"#f08080":"#f0d0e0"}`, borderRadius:12, padding:"12px 0", fontSize:20, fontWeight:900, cursor:"pointer" }}>{n}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#c0909e", fontSize: 13, marginBottom: 10 }}>שמות שחקנים</div>
          {Array.from({ length: playerCount }).map((_,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:14, height:14, borderRadius:"50%", background:PLAYER_COLORS[i], flexShrink:0 }}/>
              <input value={playerNames[i]} onChange={e => { const n=[...playerNames]; n[i]=e.target.value; setPlayerNames(n); }} style={input} placeholder={`שחקן ${i+1}`}/>
            </div>
          ))}
        </div>
        <button onClick={() => { playSound("click"); setScreen("minigame"); }} style={{ ...btnPrimary, display:"block", width:"100%" }}>🚀 התחל משחק!</button>
      </div>
    </div>
  );

  if (screen === "minigame") {
    const miniPlayers = playerNames.slice(0, playerCount).map((name, i) => ({ name: name.trim() || `שחקן ${i+1}`, color: PLAYER_COLORS[i] }));
    const goHome = () => setScreen("home");
    if (activeFormat === "trivia") return <TriviaGame name={activeName} topic={activeTopic} customTopic={activeCustomTopic} customTopicDesc={activeCustomTopicDesc} players={miniPlayers} onBack={goHome} />;
    if (activeFormat === "memory") return <MemoryGame topic={activeTopic} customTopic={activeCustomTopic} customTopicDesc={activeCustomTopicDesc} name={activeName} onBack={goHome} />;
    if (activeFormat === "party")  return <PartyGame  name={activeName} topic={activeTopic} customTopic={activeCustomTopic} customTopicDesc={activeCustomTopicDesc} players={miniPlayers} onBack={goHome} />;
    if (activeFormat === "escape") return <EscapeGame name={activeName} topic={activeTopic} customTopic={activeCustomTopic} customTopicDesc={activeCustomTopicDesc} onBack={goHome} />;
  }

  if (screen === "home") return (
    <div style={page}>
      <style>{GLOBAL_STYLE}</style>
      {showSaved && <SavedGamesPanel onLoad={loadSavedGame} onClose={() => setShowSaved(false)}/>}
      <div style={{ textAlign:"center", width:"100%", maxWidth:420 }}>
        <div style={{ animation:"float 3s ease-in-out infinite", marginBottom:8 }}>
          <svg width="96" height="96" viewBox="0 0 100 100">
            <rect x="8" y="16" width="56" height="56" rx="12" fill="#FFB3C6" stroke="#F090A0" strokeWidth="2"/>
            <path d="M8,16 L22,4 L78,4 L64,16Z" fill="#FFD0DC"/>
            <path d="M64,16 L78,4 L78,60 L64,72Z" fill="#F090A0"/>
            <circle cx="24" cy="30" r="6" fill="white" opacity="0.85"/>
            <circle cx="44" cy="30" r="6" fill="white" opacity="0.85"/>
            <circle cx="34" cy="44" r="6" fill="white" opacity="0.85"/>
            <circle cx="24" cy="58" r="6" fill="white" opacity="0.85"/>
            <circle cx="44" cy="58" r="6" fill="white" opacity="0.85"/>
            <ellipse cx="86" cy="92" rx="10" ry="5" fill="#90D890"/>
            <rect x="80" y="76" width="12" height="16" rx="3" fill="#90D890"/>
            <circle cx="86" cy="72" r="8" fill="#90D890"/>
            <path d="M4 8 L5.2 11.5 L9 11.5 L6 13.8 L7.2 17.3 L4 15 L0.8 17.3 L2 13.8 L-1 11.5 L2.8 11.5Z" fill="#FFF0A0"/>
          </svg>
        </div>
        <div style={{ color:"#f08080", fontWeight:900, fontSize:44, letterSpacing:3, marginBottom:4 }}>SARTORT</div>
        <div style={{ color:"#c0909e", fontSize:14, marginBottom:40 }}>משחק לוח הרפתקות</div>
        <button onClick={() => { playSound("click"); setScreen("setup"); }}
          style={{ ...btnPrimary, display:"block", width:"100%", marginBottom:12 }}>
          🎮 משחק חדש
        </button>
        <button onClick={() => { playSound("click"); setShowSaved(true); }}
          style={{ display:"block", width:"100%", background:"none", color:"#f08080", border:"2px solid #f0808033", borderRadius:14, padding:"13px 0", fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:12 }}>
          📁 טען משחק שמור
        </button>
        <button onClick={() => { playSound("click"); setScreen("creator"); }}
          style={{ display:"block", width:"100%", background:"none", color:"#7cb8f0", border:"2px solid #aed6f133", borderRadius:14, padding:"13px 0", fontSize:16, fontWeight:700, cursor:"pointer" }}>
          🎨 מחולל משחקים
        </button>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <div style={{ ...page, justifyContent:"flex-start", paddingTop:36 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ width:"100%", maxWidth:440 }}>
        <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:"#c0909e", cursor:"pointer", fontSize:14, marginBottom:22 }}>← חזור</button>
        <div style={{ color:"#f08080", fontWeight:900, fontSize:28, marginBottom:26 }}>🎮 הגדרת משחק</div>

        {/* Player count */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"#c0909e", fontSize:13, marginBottom:10 }}>מספר שחקנים</div>
          <div style={{ display:"flex", gap:8 }}>
            {[1,2,3,4].map(n => (
              <button key={n} onClick={() => { playSound("click"); setPlayerCount(n); }}
                style={{ flex:1, background:playerCount===n?"#f08080":"#fff0f5", color:playerCount===n?"#ffffff":"#c0909e", border:`1.5px solid ${playerCount===n?"#f08080":"#f0d0e0"}`, borderRadius:12, padding:"12px 0", fontSize:20, fontWeight:900, cursor:"pointer" }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"#c0909e", fontSize:13, marginBottom:10 }}>שמות שחקנים</div>
          {Array.from({ length:playerCount }).map((_,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:14, height:14, borderRadius:"50%", background:PLAYER_COLORS[i], flexShrink:0 }}/>
              <input value={playerNames[i]} onChange={e => { const n=[...playerNames]; n[i]=e.target.value; setPlayerNames(n); }}
                style={input} placeholder={`שחקן ${i+1}`}/>
            </div>
          ))}
        </div>

        {/* Theme selection */}
        <div style={{ marginBottom:30 }}>
          <div style={{ color:"#c0909e", fontSize:13, marginBottom:12 }}>בחר נושא</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { playSound("click"); setSelectedTheme(t.id); }}
                style={{ background:selectedTheme===t.id?"#fff0f5":"#ffffff", border:`2px solid ${selectedTheme===t.id?"#f08080":"#f0d8e8"}`, borderRadius:14, padding:"14px 10px", cursor:"pointer", textAlign:"center", transition:"all .15s" }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{t.label.split(" ")[0]}</div>
                <div style={{ color:selectedTheme===t.id?"#f08080":"#c0909e", fontSize:12, fontWeight:700 }}>
                  {t.label.split(" ").slice(1).join(" ")}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { playSound("click"); startGame(); }}
          style={{ ...btnPrimary, display:"block", width:"100%" }}>
          🚀 התחל משחק!
        </button>
      </div>
    </div>
  );

  if (screen === "win" && winner !== null) {
    const w = players[winner];
    return (
      <div style={page}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ textAlign:"center", maxWidth:420 }}>
          <div style={{ fontSize:90, animation:"float 1.8s ease-in-out infinite", marginBottom:14 }}>🏆</div>
          <div style={{ color:"#f08080", fontWeight:900, fontSize:38, marginBottom:6 }}>{w?.name} ניצח!</div>
          <div style={{ color:"#c0909e", fontSize:16, marginBottom:36 }}>{game?.title}</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={() => { playSound("click"); setWinner(null); setScreen("setup"); }} style={{ ...btnPrimary, padding:"14px 30px" }}>🎮 שחק שוב</button>
            <button onClick={() => { playSound("click"); setScreen("home"); }} style={{ background:"none", color:"#f0c040", border:"2px solid #f0c04033", borderRadius:14, padding:"14px 30px", fontSize:16, fontWeight:700, cursor:"pointer" }}>🏠 בית</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "board" && game) {
    const cp = players[currentPlayer];
    const blocked = !canRoll || rolling || !!activeEvent;
    return (
      <div style={{ minHeight:"100vh", background:"#fff5f8", fontFamily:"system-ui,-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 10px 30px" }}>
        <style>{GLOBAL_STYLE}</style>
        {activeEvent && <EventModal event={activeEvent} onClose={handleEventClose}/>}

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, width:"100%", maxWidth:468 }}>
          <div style={{ fontSize:26 }}>{game.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#f08080", fontWeight:900, fontSize:17, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{game.title}</div>
            <div style={{ color:"#c0909e", fontSize:11 }}>{game.subtitle}</div>
          </div>
          <button onClick={saveGame} style={btnGhost} title="שמור">💾</button>
          <button onClick={() => { playSound("click"); setScreen("home"); }} style={{ ...btnGhost, fontSize:18, borderColor:"transparent" }}>✕</button>
        </div>

        <BoardDisplay spaces={game.spaces} players={players}/>

        {/* Legend */}
        <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap", justifyContent:"center" }}>
          {[{c:"#4dff9188",l:"מזל"},{c:"#ff4d4d88",l:"מלכודת"},{c:"#4daaff88",l:"בונוס"},{c:"#f0808088",l:"סיום"}].map(({c,l}) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:12, height:12, borderRadius:3, border:`2px solid ${c}`, background:c+"44" }}/>
              <span style={{ color:"#c0909e", fontSize:11 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Players */}
        <div style={{ width:"100%", maxWidth:468, display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:14 }}>
          {players.map((p,i) => <PlayerCard key={i} player={p} index={i} isActive={i===currentPlayer}/>)}
        </div>

        {/* Dice */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, marginTop:18 }}>
          <Die value={diceValue} rolling={rolling}/>
          <button onClick={rollDice} disabled={blocked}
            style={{ ...btnPrimary, padding:"14px 38px", background:!blocked?"#f08080":"#fce8f2", color:!blocked?"#ffffff":"#c0b0b8", cursor:!blocked?"pointer":"not-allowed", animation:!blocked?"glow 2s ease-in-out infinite":"none" }}>
            {rolling ? "מטיל..." : `🎲 הטל קוביה — ${cp?.name}`}
          </button>
        </div>

        {/* Log */}
        <div style={{ width:"100%", maxWidth:468, marginTop:16, background:"#ffffff", border:"1px solid #f0d8e8", borderRadius:14, padding:"10px 14px", maxHeight:130, overflowY:"auto" }}>
          <div style={{ color:"#d0b0c0", fontSize:10, fontWeight:700, letterSpacing:1, marginBottom:6 }}>יומן משחק</div>
          {[...log].reverse().map((entry,i) => (
            <div key={i} style={{ color:i===0?"#a07080":"#cca0b0", fontSize:12, paddingBottom:3, lineHeight:1.4 }}>{entry}</div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
