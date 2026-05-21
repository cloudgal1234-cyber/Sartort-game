import { useState } from "react";

const PLAYER_COLORS = ["#ff4d4d", "#4daaff", "#4dff91", "#ffd700"];

// ── Game data ─────────────────────────────────────────────────────────────────

const TRIVIA_QUESTIONS = [
  { q: "מהי בירת צרפת?",              opts: ["לונדון","פריז","ברלין","מדריד"],               a: 1 },
  { q: "כמה גרם יש בקילוגרם?",        opts: ["100","500","1000","10000"],                   a: 2 },
  { q: "מי צייר את המונה ליזה?",      opts: ["מיכאלאנג'לו","פיקסו","ליאונרדו דה וינצ'י","רפאל"], a: 2 },
  { q: "כמה שחקנים בקבוצת כדורגל?",   opts: ["9","10","11","12"],                           a: 2 },
  { q: "איזה כוכב לכת קרוב לשמש?",   opts: ["ונוס","מאדים","מרקורי","צדק"],                a: 2 },
  { q: "מה חיי המדף של דבש?",        opts: ["שנה","10 שנים","100 שנים","לנצח"],            a: 3 },
  { q: "איזה בעל חיים הגדול ביותר?",  opts: ["פיל","לוויתן כחול","כריש","קרנף"],             a: 1 },
  { q: "כמה שיניים לאדם בוגר?",      opts: ["28","30","32","34"],                           a: 2 },
  { q: "מי כתב רומיאו ויוליה?",      opts: ["דיקנס","שייקספיר","המינגוויי","ג'ויס"],        a: 1 },
  { q: "כמה צלעות למשושה?",          opts: ["4","5","6","7"],                               a: 2 },
  { q: "מהו כוכב הלכת הגדול?",       opts: ["שבתאי","נפטון","צדק","אורנוס"],               a: 2 },
  { q: "כמה ימים בשנת קפיצה?",       opts: ["364","365","366","367"],                      a: 2 },
];

const MEMORY_EMOJIS = {
  default:  ["🌟","🎲","🏆","🎭","🚀","🌈","🎸","🦁"],
  fantasy:  ["🧙","🐉","⚔️","🏰","🦄","🔮","🌟","🗡️"],
  space:    ["🚀","⭐","🌙","🪐","👽","☄️","🛸","🔭"],
  sports:   ["⚽","🏀","🎾","⚾","🏊","🚴","🥊","🎯"],
  animals:  ["🦁","🐘","🦊","🐺","🦅","🦋","🐬","🦒"],
  ocean:    ["🌊","🐠","🦈","🐙","🦀","⚓","🐚","🏖️"],
  food:     ["🍕","🍣","🍔","🍰","🍜","🥗","🍦","🍇"],
  music:    ["🎵","🎸","🎹","🎺","🥁","🎻","🎤","🎼"],
  nature:   ["🌿","🌸","🍄","🌲","🦋","🌻","🐝","🌺"],
  history:  ["🏛️","⚔️","👑","🗿","🏺","📜","🏰","⚜️"],
  science:  ["🔬","⚗️","🧬","💡","🔭","🧲","⚡","🌡️"],
  city:     ["🏙️","🚕","🏗️","🌆","🚇","🏪","🌉","🚦"],
  movies:   ["🎬","🎭","⭐","🎥","🍿","🎞️","🏆","📽️"],
};

const TRUTH_PROMPTS = [
  "מה הדבר הכי מביך שקרה לך?",
  "מי הדמות שאתה הכי מעריץ?",
  "מה הכי פחדת ממנו כילד?",
  "מה היית עושה עם מיליון שקל?",
  "מה הכישלון הכי גדול שלך?",
  "מי הראשון שהיית מתקשר אליו אם היית בצרה?",
  "מה הדבר שלעולם לא תגלה להורים שלך?",
  "מה הרגע הכי מרגש בחייך עד עכשיו?",
  "אם היית יכול לשנות דבר אחד בעבר, מה זה היה?",
  "מה הסרט שגרם לך לבכות?",
];

const DARE_PROMPTS = [
  "ספר בדיחה בסגנון של ילד בן 5",
  "עשה 10 שכיבות שמיכה",
  "שיר 30 שניות מהשיר האהוב עליך",
  "צייר דיוקן של השחקן הבא בעיניים עצומות",
  "חקה שחקן אחר עד שמישהו מנחש מי זה",
  "ספר 5 עובדות מגניבות על עצמך",
  "עשה 30 שניות של ריקוד ספונטני",
  "גרגר עם מים ושיר 'יום הולדת שמח'",
  "אמור 10 מדינות תוך 30 שניות",
  "עשה פרצוף של כל שחקן בחדר",
];

const ESCAPE_RIDDLES = [
  { r: "אני גבוה בצעירותי ונמוך בזקנותי. מה אני?",                         a: "נר",    h: "משתמשים בי בחנוכה" },
  { r: "יש לי ערים ללא בתים, יערות ללא עצים, מים ללא דגים. מה אני?",      a: "מפה",   h: "תוצאות גיאוגרפיות" },
  { r: "מה נשבר כשאומרים אותו?",                                            a: "שתיקה", h: "כשאין קול" },
  { r: "רצה ללא רגליים, חוצה הרים ועמקים. מה זה?",                        a: "נהר",   h: "מים זורמים" },
  { r: "כמה חודשים ב-4 שנים?",                                              a: "48",    h: "12 × 4" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const pg   = { minHeight: "100vh", background: "#fff5f8", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px" };
const card = { background: "#ffffff", border: "1px solid #f0d8e8", borderRadius: 20, padding: 24, width: "100%", maxWidth: 520 };
const btn  = { background: "#f08080", color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontSize: 16, fontWeight: 900, cursor: "pointer", width: "100%" };
const ghost= { background: "none", border: "1px solid #f0d0e0", color: "#c0909e", borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer" };

function BackBtn({ onBack }) {
  return <button onClick={onBack} style={{ ...ghost, marginBottom: 16, alignSelf: "flex-start" }}>← חזור לבית</button>;
}

// ── Trivia Game ───────────────────────────────────────────────────────────────
export function TriviaGame({ name, players, onBack }) {
  const [qi, setQi]         = useState(0);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState(players.map(() => 0));
  const [cp, setCp]         = useState(0);
  const [done, setDone]     = useState(false);

  const total = Math.min(10, TRIVIA_QUESTIONS.length);
  const q = TRIVIA_QUESTIONS[qi % TRIVIA_QUESTIONS.length];

  function choose(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.a) setScores(s => { const n = [...s]; n[cp]++; return n; });
  }

  function next() {
    const nq = qi + 1;
    if (nq >= total) { setDone(true); return; }
    setQi(nq); setSelected(null);
    setCp(p => (p + 1) % players.length);
  }

  if (done) {
    const max = Math.max(...scores);
    const winner = players[scores.indexOf(max)];
    return (
      <div style={pg}>
        <BackBtn onBack={onBack} />
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f08080", marginBottom: 8 }}>{winner.name} ניצח!</div>
          <div style={{ fontSize: 14, color: "#a07888", marginBottom: 20 }}>{max} נקודות מתוך {total}</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0d8e8", fontSize: 14 }}>
              <span style={{ color: PLAYER_COLORS[i], fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: "#2d1520" }}>{scores[i]} נקודות</span>
            </div>
          ))}
          <button onClick={onBack} style={{ ...btn, marginTop: 20 }}>חזור</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: "#c0909e" }}>שאלה {qi + 1}/{total}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: PLAYER_COLORS[cp % 4] }}>{players[cp]?.name} משיב</div>
        </div>
        <div style={{ height: 4, background: "#f0d8e8", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(qi / total) * 100}%`, background: "#f08080", borderRadius: 2 }} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 19, color: "#2d1520", marginBottom: 22, lineHeight: 1.55 }}>{q.q}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {q.opts.map((opt, idx) => {
            let bg = "#fff0f5", border = "1px solid #f0d8e8", color = "#2d1520";
            if (selected !== null) {
              if (idx === q.a)        { bg = "#b8edb8"; border = "1px solid #4a9a4a44"; color = "#2a6a2a"; }
              else if (idx === selected) { bg = "#ffd0d0"; border = "1px solid #f0808044"; color = "#c04040"; }
            }
            return (
              <button key={idx} onClick={() => choose(idx)}
                style={{ background: bg, border, color, borderRadius: 12, padding: "14px 10px", fontSize: 14, fontWeight: 600, cursor: selected !== null ? "default" : "pointer", textAlign: "right" }}>
                {["א","ב","ג","ד"][idx]}. {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <button onClick={next} style={{ ...btn, marginTop: 18 }}>
            {selected === q.a ? "✓ נכון! המשך ←" : "✗ לא נכון. המשך ←"}
          </button>
        )}
        <div style={{ display: "flex", gap: 14, marginTop: 18, justifyContent: "center" }}>
          {players.map((p, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 12 }}>
              <div style={{ color: PLAYER_COLORS[i], fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "#2d1520", fontSize: 16, fontWeight: 900 }}>{scores[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Memory Game ───────────────────────────────────────────────────────────────
function shuffled(emojis) {
  const pairs = [...emojis, ...emojis].map((e, id) => ({ id, emoji: e, flipped: false, matched: false }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

export function MemoryGame({ topic, name, onBack }) {
  const emojis = MEMORY_EMOJIS[topic] || MEMORY_EMOJIS.default;
  const [cards, setCards] = useState(() => shuffled(emojis));
  const [open, setOpen]   = useState([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone]   = useState(false);

  function flip(idx) {
    if (cards[idx].flipped || cards[idx].matched || open.length === 2) return;
    const next = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const nowOpen = [...open, idx];
    setCards(next); setOpen(nowOpen);

    if (nowOpen.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = nowOpen;
      if (next[a].emoji === next[b].emoji) {
        const matched = next.filter(c => c.matched).length + 2;
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
          setOpen([]);
          if (matched === next.length) setDone(true);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
          setOpen([]);
        }, 900);
      }
    }
  }

  function restart() { setCards(shuffled(emojis)); setOpen([]); setMoves(0); setDone(false); }

  if (done) return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#f08080", marginBottom: 8 }}>כל הזוגות נמצאו!</div>
        <div style={{ fontSize: 15, color: "#a07888", marginBottom: 24 }}>{moves} מהלכים</div>
        <button onClick={restart} style={{ ...btn, marginBottom: 12 }}>שחק שוב</button>
        <button onClick={onBack} style={ghost}>חזור</button>
      </div>
    </div>
  );

  return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={{ width: "100%", maxWidth: 360, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#f08080" }}>{name || "זיכרון"}</div>
        <div style={{ fontSize: 13, color: "#a07888" }}>מהלכים: {moves} | {cards.filter(c=>c.matched).length/2}/{emojis.length} זוגות</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, width: "100%", maxWidth: 360 }}>
        {cards.map((c, i) => (
          <div key={i} onClick={() => flip(i)} style={{
            aspectRatio: "1", borderRadius: 14, fontSize: 32,
            background: c.flipped || c.matched ? "#fff0f5" : "#f08080",
            border: `2px solid ${c.matched ? "#4a9a4a88" : c.flipped ? "#f0c0d0" : "#e86868"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: c.matched ? "default" : "pointer", transition: "background .2s",
            userSelect: "none",
          }}>
            {(c.flipped || c.matched) ? c.emoji : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Party Game (Truth or Dare) ────────────────────────────────────────────────
export function PartyGame({ name, players, onBack }) {
  const [cp, setCp]       = useState(0);
  const [choice, setChoice] = useState(null);
  const [round, setRound] = useState(0);

  const ti = (round * players.length + cp) % TRUTH_PROMPTS.length;
  const di = (round * players.length + cp) % DARE_PROMPTS.length;

  function next() {
    setChoice(null);
    const ncp = (cp + 1) % players.length;
    setCp(ncp);
    if (ncp === 0) setRound(r => r + 1);
  }

  return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={{ ...card }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#c0909e", marginBottom: 4 }}>תור של</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: PLAYER_COLORS[cp % 4] }}>{players[cp]?.name}</div>
        </div>

        {!choice && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <button onClick={() => setChoice("truth")}
              style={{ background: "#e8f4ff", border: "2px solid #4daaff44", borderRadius: 16, padding: "28px 12px", fontSize: 17, fontWeight: 700, color: "#2060a0", cursor: "pointer" }}>
              💬<br/>אמת
            </button>
            <button onClick={() => setChoice("dare")}
              style={{ background: "#fff0e8", border: "2px solid #f0804444", borderRadius: 16, padding: "28px 12px", fontSize: 17, fontWeight: 700, color: "#c04820", cursor: "pointer" }}>
              🔥<br/>חובה
            </button>
          </div>
        )}

        {choice && (
          <div>
            <div style={{ background: choice === "truth" ? "#e8f4ff" : "#fff0e8", border: `2px solid ${choice === "truth" ? "#4daaff33" : "#f0804433"}`, borderRadius: 16, padding: "22px 18px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#c0909e", marginBottom: 10 }}>{choice === "truth" ? "💬 אמת" : "🔥 חובה"}</div>
              <div style={{ fontSize: 18, color: "#2d1520", fontWeight: 600, lineHeight: 1.65 }}>
                {choice === "truth" ? TRUTH_PROMPTS[ti] : DARE_PROMPTS[di]}
              </div>
            </div>
            <button onClick={next} style={btn}>✓ בוצע — עבור לשחקן הבא</button>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center" }}>
          {players.map((p, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: i === cp ? PLAYER_COLORS[i % 4] : "#f0d8e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i === cp ? "#fff" : "#c0909e" }}>
              {p.name[0]?.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Escape Room ───────────────────────────────────────────────────────────────
export function EscapeGame({ name, onBack }) {
  const [step, setStep]     = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError]   = useState(false);
  const [hint, setHint]     = useState(false);
  const [done, setDone]     = useState(false);

  const riddle = ESCAPE_RIDDLES[step];

  function submit(e) {
    e.preventDefault();
    if (answer.trim() === riddle.a) {
      setError(false); setHint(false); setAnswer("");
      if (step + 1 >= ESCAPE_RIDDLES.length) setDone(true);
      else setStep(s => s + 1);
    } else {
      setError(true);
    }
  }

  if (done) return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🔓</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#f08080", marginBottom: 8 }}>ברחתם מהחדר!</div>
        <div style={{ fontSize: 14, color: "#a07888", marginBottom: 24 }}>פתרתם את כל {ESCAPE_RIDDLES.length} החידות</div>
        <button onClick={onBack} style={btn}>חזור</button>
      </div>
    </div>
  );

  return (
    <div style={pg}>
      <BackBtn onBack={onBack} />
      <div style={card}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {ESCAPE_RIDDLES.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < step ? "#4a9a4a" : i === step ? "#f08080" : "#f0d8e8" }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#c0909e", marginBottom: 10 }}>חידה {step + 1} מתוך {ESCAPE_RIDDLES.length}</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: "#2d1520", marginBottom: 24, lineHeight: 1.6 }}>{riddle.r}</div>

        {hint && (
          <div style={{ background: "#fff8e8", border: "1px solid #f0c86844", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#806020", marginBottom: 14 }}>
            💡 רמז: {riddle.h}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
          <input value={answer} onChange={e => { setAnswer(e.target.value); setError(false); }}
            placeholder="הקלד את התשובה..."
            style={{ flex: 1, background: error ? "#fff0f0" : "#fff0f5", border: `1px solid ${error ? "#f08080" : "#f0d0e0"}`, borderRadius: 10, padding: "10px 13px", color: "#2d1520", fontSize: 14, outline: "none" }}
          />
          <button type="submit" style={{ background: "#f08080", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✓</button>
        </form>
        {error && <div style={{ color: "#f08080", fontSize: 12, marginTop: 8 }}>לא נכון, נסה שוב!</div>}
        {!hint && <button onClick={() => setHint(true)} style={{ ...ghost, marginTop: 14, fontSize: 12 }}>💡 רמז</button>}
      </div>
    </div>
  );
}
