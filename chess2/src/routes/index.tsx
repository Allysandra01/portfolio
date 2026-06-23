import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Volume2, VolumeX, RotateCcw, Pause, Play, Sparkles, Trophy, Palette, Brain, Coins, Flame, Smartphone } from "lucide-react";
import { sfx, setMuted as setSfxMuted } from "@/lib/sounds";
import { cozyPieces, CapturedPiece } from "@/lib/pieces";
import { askGemma, type Difficulty } from "@/lib/lmstudio";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cozy Chess — vs Gemma" },
      { name: "description", content: "A cozy retro-arcade chess game vs a local Gemma model via LM Studio." },
    ],
  }),
  component: CozyChess,
});

const INITIAL_TIME = 10 * 60; // seconds
const PIECE_NAMES: Record<string, string> = {
  p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King",
};

type LogEntry = { n: number; white?: string; black?: string };
type HighScore = { date: string; result: string; moves: number; coins?: number };
type Stats = {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  coins: number;
  totalMoves: number;
  gamesPlayed: number;
};
const DEFAULT_STATS: Stats = {
  wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, coins: 0, totalMoves: 0, gamesPlayed: 0,
};
function coinsForWin(streak: number, difficulty: Difficulty): number {
  const base = difficulty === "hard" ? 100 : difficulty === "intermediate" ? 60 : 30;
  const bonus = Math.max(0, streak - 1) * 25; // streak bonus
  return base + bonus;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function moveFlavor(piece: string, captured?: string, san?: string): string {
  const name = PIECE_NAMES[piece] ?? "Piece";
  if (san?.includes("O-O-O")) return "Queenside castle! 🏰";
  if (san?.includes("O-O")) return "Kingside castle! 🏰";
  if (san?.endsWith("#")) return `${name} delivers checkmate! 👑`;
  if (san?.endsWith("+")) return `${name} says check! ✨`;
  if (captured) return `${name} takes ${PIECE_NAMES[captured]}! 💥`;
  const verbs: Record<string, string> = {
    p: "steps forward",
    n: "leaps",
    b: "glides",
    r: "rolls",
    q: "sweeps in",
    k: "shuffles",
  };
  return `${name} ${verbs[piece] ?? "moves"}!`;
}

type Theme = {
  id: string;
  name: string;
  light: string;
  dark: string;
  white: string;
  black: string;
  coral: string;
};

const THEMES: Theme[] = [
  { id: "cozy",    name: "Cozy Sage",    light: "oklch(0.93 0.04 85)",  dark: "oklch(0.78 0.07 150)", white: "oklch(0.85 0.10 160)", black: "oklch(0.74 0.13 0)",   coral: "oklch(0.78 0.13 25)" },
  { id: "berry",   name: "Berry Cream",  light: "oklch(0.95 0.03 50)",  dark: "oklch(0.72 0.10 350)", white: "oklch(0.88 0.07 60)",  black: "oklch(0.55 0.15 320)", coral: "oklch(0.72 0.15 350)" },
  { id: "ocean",   name: "Ocean Mist",   light: "oklch(0.93 0.03 220)", dark: "oklch(0.65 0.10 240)", white: "oklch(0.90 0.06 200)", black: "oklch(0.50 0.12 260)", coral: "oklch(0.70 0.13 220)" },
  { id: "sunset",  name: "Peach Sunset", light: "oklch(0.94 0.04 70)",  dark: "oklch(0.72 0.12 40)",  white: "oklch(0.92 0.06 90)",  black: "oklch(0.58 0.16 20)",  coral: "oklch(0.76 0.16 40)" },
  { id: "mono",    name: "Pixel Mono",   light: "oklch(0.94 0.01 280)", dark: "oklch(0.55 0.02 280)", white: "oklch(0.95 0.02 280)", black: "oklch(0.30 0.03 280)", coral: "oklch(0.70 0.13 25)" },
];

function applyTheme(t: { light: string; dark: string; white: string; black: string; coral: string }) {
  const r = document.documentElement;
  r.style.setProperty("--board-light", t.light);
  r.style.setProperty("--board-dark", t.dark);
  r.style.setProperty("--white-piece", t.white);
  r.style.setProperty("--black-piece", t.black);
  r.style.setProperty("--coral", t.coral);
  r.style.setProperty("--primary", t.coral);
  r.style.setProperty("--ring", t.coral);
}

function CozyChess() {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]); // black pieces captured
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]); // white pieces captured
  const [floater, setFloater] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<{ title: string; subtitle: string; victory: boolean } | null>(null);
  const [highscores, setHighscores] = useState<HighScore[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    try { return (localStorage.getItem("cozy-chess-difficulty") as Difficulty) || "intermediate"; } catch { return "intermediate"; }
  });
  const [themeId, setThemeId] = useState<string>(() => {
    try { return localStorage.getItem("cozy-chess-theme") || "cozy"; } catch { return "cozy"; }
  });
  const [customBoard, setCustomBoard] = useState<{ light: string; dark: string } | null>(() => {
    try { const raw = localStorage.getItem("cozy-chess-custom"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  // Apply theme on change
  useEffect(() => {
    const t = THEMES.find((x) => x.id === themeId) ?? THEMES[0];
    const merged = customBoard
      ? { ...t, light: customBoard.light, dark: customBoard.dark }
      : t;
    applyTheme(merged);
    try { localStorage.setItem("cozy-chess-theme", themeId); } catch { /* ignore */ }
  }, [themeId, customBoard]);

  useEffect(() => {
    try { localStorage.setItem("cozy-chess-difficulty", difficulty); } catch { /* ignore */ }
  }, [difficulty]);

  const [stats, setStats] = useState<Stats>(() => {
    try {
      const raw = localStorage.getItem("cozy-chess-stats");
      return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : DEFAULT_STATS;
    } catch { return DEFAULT_STATS; }
  });
  const [coinFloat, setCoinFloat] = useState<number | null>(null);

  useEffect(() => {
    try { localStorage.setItem("cozy-chess-stats", JSON.stringify(stats)); } catch { /* ignore */ }
  }, [stats]);

  const floaterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiAbort = useRef<AbortController | null>(null);

  // Load highscores
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cozy-chess-highscores");
      if (raw) setHighscores(JSON.parse(raw) as HighScore[]);
    } catch { /* ignore */ }
  }, []);

  const saveHighscore = useCallback((entry: HighScore) => {
    setHighscores((prev) => {
      const next = [entry, ...prev].slice(0, 20);
      try { localStorage.setItem("cozy-chess-highscores", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Mute toggle pushes to sfx module
  useEffect(() => { setSfxMuted(muted); }, [muted]);

  const turn = game.turn(); // "w" | "b"

  // Timer
  useEffect(() => {
    if (paused || gameOver) return;
    const id = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((t) => {
          const n = Math.max(0, t - 1);
          if (n === 0) endGame(false, "Time forfeit! Gemma wins.");
          return n;
        });
      } else {
        setBlackTime((t) => {
          const n = Math.max(0, t - 1);
          if (n === 0) endGame(true, "Time forfeit! You win!");
          return n;
        });
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, paused, gameOver]);

  const showFloater = useCallback((text: string) => {
    setFloater(text);
    if (floaterTimer.current) clearTimeout(floaterTimer.current);
    floaterTimer.current = setTimeout(() => setFloater(null), 1500);
    toast(text, { duration: 1500 });
  }, []);

  const endGame = useCallback((victory: boolean, subtitle: string) => {
    const moves = Math.ceil(game.history().length / 2);
    let earnedCoins = 0;
    setStats((s) => {
      const next: Stats = { ...s, gamesPlayed: s.gamesPlayed + 1, totalMoves: s.totalMoves + moves };
      if (victory) {
        next.wins += 1;
        next.currentStreak = s.currentStreak + 1;
        next.bestStreak = Math.max(s.bestStreak, next.currentStreak);
        earnedCoins = coinsForWin(next.currentStreak, difficulty);
        next.coins = s.coins + earnedCoins;
      } else {
        next.losses += 1;
        next.currentStreak = 0;
      }
      return next;
    });
    setGameOver({
      title: victory ? "Victory! 🎉" : "Defeat 💔",
      subtitle: victory ? `${subtitle} +${coinsForWin(stats.currentStreak + 1, difficulty)} coins!` : subtitle,
      victory,
    });
    if (victory) {
      sfx.cheer();
      setTimeout(() => sfx.coin(), 600);
      setCoinFloat(coinsForWin(stats.currentStreak + 1, difficulty));
      setTimeout(() => setCoinFloat(null), 2200);
      const newStreak = stats.currentStreak + 1;
      if (newStreak >= 2) toast(`🔥 ${newStreak}-win streak!`, { duration: 2000 });
    } else {
      sfx.defeat();
    }
    saveHighscore({
      date: new Date().toLocaleString(),
      result: victory ? "Win vs Gemma" : "Loss vs Gemma",
      moves,
      coins: earnedCoins || undefined,
    });
  }, [game, saveHighscore, difficulty, stats.currentStreak]);

  const applyMove = useCallback((move: Move) => {
    setFen(game.fen());
    setLog((prev) => {
      const next = [...prev];
      if (move.color === "w") {
        next.push({ n: next.length + 1, white: move.san });
      } else {
        const last = next[next.length - 1];
        if (last && !last.black) last.black = move.san;
        else next.push({ n: next.length + 1, black: move.san });
      }
      return next;
    });
    if (move.captured) {
      if (move.color === "w") setCapturedByWhite((p) => [...p, `b${move.captured!.toUpperCase()}`]);
      else setCapturedByBlack((p) => [...p, `w${move.captured!.toUpperCase()}`]);
      sfx.capture();
    } else {
      sfx.move();
    }
    showFloater(moveFlavor(move.piece, move.captured, move.san));
    if (game.isCheckmate()) {
      endGame(move.color === "w", move.color === "w" ? "Checkmate! Sweet victory. 👑" : "Checkmate — Gemma wins.");
    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
      const moves = Math.ceil(game.history().length / 2);
      setStats((s) => ({ ...s, draws: s.draws + 1, currentStreak: 0, gamesPlayed: s.gamesPlayed + 1, totalMoves: s.totalMoves + moves }));
      setGameOver({ title: "Draw 🤝", subtitle: "A peaceful ending.", victory: false });
      sfx.defeat();
      saveHighscore({ date: new Date().toLocaleString(), result: "Draw vs Gemma", moves });
    } else if (game.inCheck()) {
      sfx.check();
    }
  }, [game, showFloater, endGame, saveHighscore]);

  const tryMove = useCallback((from: string, to: string, promotion = "q"): boolean => {
    if (gameOver || paused) return false;
    if (game.turn() !== "w") return false;
    try {
      const move = game.move({ from, to, promotion });
      if (!move) return false;
      applyMove(move);
      setSelected(null);
      setLegalTargets([]);
      return true;
    } catch {
      return false;
    }
  }, [game, gameOver, paused, applyMove]);

  // Gemma move loop
  useEffect(() => {
    if (gameOver || paused) return;
    if (game.turn() !== "b") return;
    let cancelled = false;
    setThinking(true);
    aiAbort.current?.abort();
    aiAbort.current = new AbortController();
    const legal = game.moves({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
    askGemma(game.fen(), legal, difficulty, aiAbort.current.signal).then((res) => {
      if (cancelled) return;
      setThinking(false);
      if (!res.ok) {
        // Fallback: random legal move so play continues
        toast.error(`${res.error} — playing a random move instead.`);
        const pick = legal[Math.floor(Math.random() * legal.length)];
        const from = pick.slice(0, 2);
        const to = pick.slice(2, 4);
        const promotion = pick.slice(4) || undefined;
        try {
          const mv = game.move({ from, to, promotion });
          if (mv) applyMove(mv);
        } catch { /* ignore */ }
        return;
      }
      const from = res.move.slice(0, 2);
      const to = res.move.slice(2, 4);
      const promotion = res.move.slice(4) || undefined;
      try {
        const mv = game.move({ from, to, promotion });
        if (mv) applyMove(mv);
      } catch { /* ignore */ }
    });
    return () => { cancelled = true; aiAbort.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, paused, gameOver]);

  const reset = useCallback((fresh: boolean) => {
    sfx.click();
    aiAbort.current?.abort();
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setPaused(false);
    setThinking(false);
    setLog([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setGameOver(null);
    setSelected(null);
    setLegalTargets([]);
    if (fresh) toast("New game! Good luck. ✨", { duration: 1200 });
  }, []);

  const onSquareClick = useCallback(({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
    if (gameOver || paused || game.turn() !== "w") return;
    if (selected && legalTargets.includes(square)) {
      tryMove(selected, square);
      return;
    }
    if (piece && piece.pieceType.startsWith("w")) {
      sfx.select();
      setSelected(square);
      const moves = game.moves({ square: square as Parameters<typeof game.moves>[0]["square"], verbose: true });
      setLegalTargets(moves.map((m) => m.to));
    } else {
      setSelected(null);
      setLegalTargets([]);
    }
  }, [game, gameOver, paused, selected, legalTargets, tryMove]);

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false;
    return tryMove(sourceSquare, targetSquare);
  }, [tryMove]);

  const squareStyles = useMemo(() => {
    const s: Record<string, React.CSSProperties> = {};
    if (selected) {
      s[selected] = { boxShadow: "inset 0 0 0 4px color-mix(in oklab, var(--coral) 70%, transparent)" };
    }
    for (const t of legalTargets) {
      s[t] = {
        background: "radial-gradient(circle, color-mix(in oklab, var(--coral) 55%, transparent) 22%, transparent 26%)",
      };
    }
    return s;
  }, [selected, legalTargets]);

  const boardOptions = useMemo(() => ({
    id: "cozy-board",
    position: fen,
    pieces: cozyPieces,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    lightSquareStyle: { backgroundColor: "var(--board-light)" },
    darkSquareStyle: { backgroundColor: "var(--board-dark)" },
    boardStyle: {
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 18px 40px -16px color-mix(in oklab, var(--coral) 40%, transparent), 0 0 0 6px var(--card)",
    },
    animationDurationInMs: 220,
    allowDragging: !gameOver && !paused && game.turn() === "w",
  }), [fen, onPieceDrop, onSquareClick, squareStyles, gameOver, paused, game]);

  return (
    <div className="min-h-screen">
      <Toaster position="bottom-center" />
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="size-5 text-primary" />
          <span className="font-pixel text-2xl sm:text-3xl tracking-wide text-foreground">COZY CHESS</span>
          <span className="hidden sm:inline text-xs text-muted-foreground ml-2">vs Gemma · LM Studio</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-1 px-2 py-0.5 rounded-full border border-border/60">
            <Smartphone className="size-3" /> cross-platform
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Coin wallet */}
          <div className="relative flex items-center gap-1.5 font-pixel text-lg px-3 py-1.5 rounded-md border border-border bg-card transition-all duration-300">
            <Coins className="size-4 text-primary" />
            <span className="tabular-nums">{stats.coins}</span>
            {coinFloat !== null && (
              <span className="pointer-events-none absolute -top-5 right-1 font-pixel text-base text-primary animate-float-up">
                +{coinFloat}
              </span>
            )}
          </div>
          {/* Streak */}
          <div className={`flex items-center gap-1.5 font-pixel text-lg px-3 py-1.5 rounded-md border transition-all duration-300 ${stats.currentStreak > 0 ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}>
            <Flame className="size-4" />
            <span className="tabular-nums">{stats.currentStreak}</span>
          </div>

          {/* Difficulty */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="font-pixel text-lg gap-2">
                <Brain className="size-4" />
                {difficulty === "easy" ? "EASY" : difficulty === "intermediate" ? "MEDIUM" : "HARD"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Label className="font-pixel text-lg">DIFFICULTY</Label>
                {(["easy", "intermediate", "hard"] as Difficulty[]).map((d) => (
                  <Button
                    key={d}
                    variant={difficulty === d ? "default" : "ghost"}
                    className="w-full justify-start font-pixel text-base capitalize"
                    onClick={() => { setDifficulty(d); sfx.click(); toast(`Difficulty: ${d}`, { duration: 1200 }); }}
                  >
                    {d === "easy" ? "🌱 Easy" : d === "intermediate" ? "🌼 Intermediate" : "🔥 Hard"}
                  </Button>
                ))}
                <p className="text-xs text-muted-foreground pt-1">Changes apply on Gemma's next move.</p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="font-pixel text-lg gap-2">
                <Palette className="size-4" /> THEME
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-3">
                <Label className="font-pixel text-lg">BOARD THEME</Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setThemeId(t.id); setCustomBoard(null); try { localStorage.removeItem("cozy-chess-custom"); } catch {} sfx.click(); }}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-300 hover:bg-muted/60 ${themeId === t.id && !customBoard ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                    >
                      <div className="flex shrink-0">
                        <div className="size-6 rounded-l" style={{ background: t.light }} />
                        <div className="size-6 rounded-r" style={{ background: t.dark }} />
                      </div>
                      <span className="font-pixel text-base flex-1 text-left">{t.name}</span>
                      <div className="size-3 rounded-full border" style={{ background: t.white }} />
                      <div className="size-3 rounded-full border" style={{ background: t.black }} />
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t space-y-2">
                  <Label className="font-pixel text-base">CUSTOM SQUARES</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs">
                      <span>Light</span>
                      <input
                        type="color"
                        defaultValue="#e8dcc4"
                        onChange={(e) => {
                          const dark = customBoard?.dark ?? "#9bbf9b";
                          const next = { light: e.target.value, dark };
                          setCustomBoard(next);
                          try { localStorage.setItem("cozy-chess-custom", JSON.stringify(next)); } catch {}
                        }}
                        className="size-8 rounded cursor-pointer border"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <span>Dark</span>
                      <input
                        type="color"
                        defaultValue="#9bbf9b"
                        onChange={(e) => {
                          const light = customBoard?.light ?? "#e8dcc4";
                          const next = { light, dark: e.target.value };
                          setCustomBoard(next);
                          try { localStorage.setItem("cozy-chess-custom", JSON.stringify(next)); } catch {}
                        }}
                        className="size-8 rounded cursor-pointer border"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            className="font-pixel text-lg gap-2"
            onClick={() => { setMutedState((m) => !m); sfx.click(); }}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            {muted ? "MUTED" : "SOUND"}
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Left panel - board */}
        <section className="flex flex-col items-center gap-4">
          {/* Gemma (Black) profile */}
          <PlayerCard
            name="Gemma"
            sub={thinking ? "" : "Black"}
            time={blackTime}
            active={turn === "b" && !gameOver && !paused}
            thinking={thinking}
            color="pink"
            captured={capturedByBlack}
            capturedLabel="Trophies"
          />

          <div className="relative w-full max-w-[560px] aspect-square">
            <Chessboard options={boardOptions} />
            {floater && (
              <div
                key={floater + Date.now()}
                className="pointer-events-none absolute left-1/2 bottom-2 z-20 animate-float-up font-pixel text-2xl px-4 py-2 rounded-xl bg-card/95 border border-border shadow-lg text-foreground"
              >
                {floater}
              </div>
            )}
            {gameOver && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
                <Card className="p-8 text-center max-w-xs animate-in fade-in zoom-in duration-300">
                  <Trophy className={`size-10 mx-auto mb-3 ${gameOver.victory ? "text-primary" : "text-muted-foreground"}`} />
                  <h2 className="font-pixel text-4xl mb-1">{gameOver.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{gameOver.subtitle}</p>
                  <Button className="font-pixel text-lg" onClick={() => reset(true)}>NEW GAME</Button>
                </Card>
              </div>
            )}
          </div>

          {/* You (White) profile */}
          <PlayerCard
            name="You"
            sub="White"
            time={whiteTime}
            active={turn === "w" && !gameOver && !paused}
            color="mint"
            captured={capturedByWhite}
            capturedLabel="Trophies"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button className="font-pixel text-lg px-6" onClick={() => reset(true)}>
              NEW GAME
            </Button>
            <Button variant="secondary" className="font-pixel text-lg px-6 gap-2" onClick={() => reset(false)}>
              <RotateCcw className="size-4" /> RESET
            </Button>
            <Button
              variant="outline"
              className="font-pixel text-lg px-6 gap-2"
              onClick={() => { sfx.click(); setPaused((p) => !p); }}
              disabled={!!gameOver}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              {paused ? "RESUME" : "PAUSE"}
            </Button>
          </div>
        </section>

        {/* Right panel */}
        <aside>
          <Card className="p-4">
            <Tabs defaultValue="dashboard">
              <TabsList className="w-full grid grid-cols-3 mb-3">
                <TabsTrigger value="dashboard" className="font-pixel text-base">STATS</TabsTrigger>
                <TabsTrigger value="moves" className="font-pixel text-base">MOVES</TabsTrigger>
                <TabsTrigger value="scores" className="font-pixel text-base">LOG</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <div className="h-[520px] overflow-y-auto pr-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <StatTile label="Coins" value={stats.coins} accent />
                    <StatTile label="Streak" value={stats.currentStreak} icon="flame" accent={stats.currentStreak > 0} />
                    <StatTile label="Best Streak" value={stats.bestStreak} />
                    <StatTile label="Games" value={stats.gamesPlayed} />
                    <StatTile label="Wins" value={stats.wins} />
                    <StatTile label="Losses" value={stats.losses} />
                    <StatTile label="Draws" value={stats.draws} />
                    <StatTile label="Win Rate" value={`${stats.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}%`} />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-pixel text-base text-muted-foreground">NEXT WIN REWARD</span>
                      <span className="font-pixel text-xl text-primary flex items-center gap-1">
                        <Coins className="size-4" />+{coinsForWin(stats.currentStreak + 1, difficulty)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Base ({difficulty}) + {Math.max(0, stats.currentStreak) * 25} streak bonus
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full font-pixel text-base text-muted-foreground"
                    onClick={() => {
                      if (confirm("Reset all dashboard stats and coins?")) {
                        setStats(DEFAULT_STATS);
                        sfx.click();
                      }
                    }}
                  >
                    Reset Stats
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="moves">
                <div className="h-[520px] overflow-y-auto pr-1 space-y-1 text-sm">
                  {log.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-8 font-pixel text-xl">No moves yet…</p>
                  ) : (
                    log.map((row) => (
                      <div key={row.n} className="flex items-center gap-3 py-1.5 px-2 rounded-md odd:bg-muted/40 transition-all duration-300">
                        <span className="font-pixel text-lg text-muted-foreground w-7">{row.n}.</span>
                        <span className="font-mono text-foreground w-20">{row.white ?? ""}</span>
                        <span className="font-mono text-foreground/80">{row.black ?? ""}</span>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="scores">
                <div className="h-[520px] overflow-y-auto pr-1 space-y-2">
                  {highscores.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-8 font-pixel text-xl">No games yet.</p>
                  ) : (
                    highscores.map((h, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/60 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-lg">{h.result}</span>
                          <span className="text-xs text-muted-foreground">{h.moves} mv</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{h.date}</span>
                          {h.coins ? (
                            <span className="text-xs font-pixel text-primary flex items-center gap-1">
                              <Coins className="size-3" />+{h.coins}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function PlayerCard({
  name, sub, time, active, thinking = false, color, captured, capturedLabel,
}: {
  name: string;
  sub: string;
  time: number;
  active: boolean;
  thinking?: boolean;
  color: "mint" | "pink";
  captured: string[];
  capturedLabel: string;
}) {
  const dot = color === "mint" ? "var(--white-piece)" : "var(--black-piece)";
  return (
    <Card
      className={`w-full max-w-[560px] p-3 flex items-center gap-4 transition-all duration-300 ${
        active ? "animate-pulse-glow border-primary/60" : "border-border"
      }`}
    >
      <div
        className="size-10 rounded-full border-2 border-border shrink-0"
        style={{ background: dot }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-pixel text-2xl">{name}</span>
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 overflow-x-auto">
          <span className="text-xs text-muted-foreground font-pixel uppercase tracking-wider shrink-0">{capturedLabel}:</span>
          {captured.length === 0 ? (
            <span className="text-xs text-muted-foreground/60">—</span>
          ) : (
            <div className="flex gap-0.5">
              {captured.map((c, i) => (
                <div key={i} className="size-6 grayscale contrast-50 opacity-80 transition-all duration-300">
                  <CapturedPiece code={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        {thinking ? (
          <span className="font-pixel text-2xl text-primary animate-pulse">
            Gemma is<span className="animate-blink">…</span>
          </span>
        ) : (
          <span className={`font-pixel text-4xl tabular-nums ${time < 30 ? "text-destructive" : "text-foreground"}`}>
            {fmt(time)}
          </span>
        )}
      </div>
    </Card>
  );
}

function StatTile({ label, value, accent = false, icon }: { label: string; value: number | string; accent?: boolean; icon?: "flame" }) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-300 ${
        accent ? "border-primary/60 bg-primary/5" : "border-border/60 bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-pixel">
        {icon === "flame" && <Flame className="size-3" />}
        {label}
      </div>
      <div className={`font-pixel text-3xl tabular-nums mt-1 ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
