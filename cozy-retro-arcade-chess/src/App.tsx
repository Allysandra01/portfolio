import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { Dashboard, GameStats } from './components/Dashboard';
import { AIConfig, AIConfigState } from './components/AIConfig';
import { audio } from './utils/audio';
import { getBestMove } from './utils/chessEngine';
import { Piece } from './components/Piece';
import { 
  Play, 
  RotateCcw, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Cpu, 
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';

interface ApiLog {
  timestamp: string;
  type: 'info' | 'sent' | 'received' | 'error';
  text: string;
}

interface ActivePopup {
  id: string;
  text: string;
}

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export default function App() {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [theme, setTheme] = useState<'neon' | 'classic' | 'light' | 'galaxy' | 'dark'>(() => {
    const saved = safeStorage.getItem('arcade_theme');
    return (saved === 'classic' || saved === 'neon' || saved === 'light' || saved === 'galaxy' || saved === 'dark') ? saved : 'classic';
  });
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = safeStorage.getItem('arcade_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          wins: parsed.wins ?? 0,
          losses: parsed.losses ?? 0,
          draws: parsed.draws ?? 0,
          winningStreak: parsed.winningStreak ?? 0,
          highestStreak: parsed.highestStreak ?? 0
        };
      } catch {}
    }
    return { wins: 0, losses: 0, draws: 0, winningStreak: 0, highestStreak: 0 };
  });

  const [aiConfig, setAiConfig] = useState<AIConfigState>(() => {
    const saved = safeStorage.getItem('arcade_ai_config');
    let parsed: any = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch {}
    }
    return {
      engine: parsed.engine || 'built-in',
      lmStudioUrl: parsed.lmStudioUrl || 'http://localhost:1234',
      lmStudioModel: parsed.lmStudioModel || 'gemma-4',
      minimaxDepth: parsed.minimaxDepth || 2,
      geminiModel: parsed.geminiModel || 'gemini-2.5-flash',
      difficulty: parsed.difficulty || 'intermediate',
      customPrompt: parsed.customPrompt || `You are Gemma-4, a retro arcade chess cabinet AI playing as BLACK.
Choose exactly ONE legal chess move. Do not make illegal actions.
Response MUST be a JSON object:
{"move": "e7e5", "reasoning": "Slightly robotic arcade game commentary (max 12 words)"}`
    };
  });

  const [quickestCheckmate, setQuickestCheckmate] = useState<number | null>(() => {
    const saved = safeStorage.getItem('arcade_quickest_checkmate');
    return saved ? parseInt(saved, 10) : null;
  });

  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | 'both'>(() => {
    const saved = safeStorage.getItem('arcade_player_color');
    return (saved === 'w' || saved === 'b' || saved === 'both') ? saved : 'w';
  });

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'cpu_rules'>('scores');
  const [credits, setCredits] = useState<number>(() => {
    const saved = safeStorage.getItem('arcade_credits');
    return saved ? parseInt(saved, 10) : 5; // Start with 5 credits free
  });

  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiSpeechLine, setAiSpeechLine] = useState<string>('COZY CHESS CABINET BOOTED. AWAITING YOUR MOVE, PILOT!');

  // Individual Chess Timers State (10 minutes in seconds)
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [forfeitPlayer, setForfeitPlayer] = useState<'w' | 'b' | null>(null);

  // Animated Floating Move Pop-ups
  const [popups, setPopups] = useState<ActivePopup[]>([]);

  // Selection Lobby States before match proceeds
  const [lobbyMode, setLobbyMode] = useState<'computer' | 'local'>('computer');
  const [lobbyColor, setLobbyColor] = useState<'w' | 'b'>('w');
  const [lobbyDifficulty, setLobbyDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');
  const [lobbyEngine, setLobbyEngine] = useState<'built-in' | 'gemini' | 'lmstudio'>('built-in');

  // Floating Coins Added Animations State
  const [floatingCoins, setFloatingCoins] = useState<{ id: string; text: string }[]>([]);
  const triggerFloatingCoins = (amount: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingCoins(prev => [...prev, { id, text: `+${amount}` }]);
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(item => item.id !== id));
    }, 1800);
  };

  // Toast celebrate notifications state
  const [toast, setToast] = useState<{ id: string; title: string; message: string } | null>(null);
  const triggerToast = (title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Persists stats and config
  useEffect(() => {
    safeStorage.setItem('arcade_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    safeStorage.setItem('arcade_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    safeStorage.setItem('arcade_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    safeStorage.setItem('arcade_theme', theme);
  }, [theme]);

  useEffect(() => {
    safeStorage.setItem('arcade_player_color', playerColor);
  }, [playerColor]);

  // Handle Mute Status
  useEffect(() => {
    audio.toggle(!isMuted);
  }, [isMuted]);

  // Clock countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (gameActive && !isPaused && !game.isGameOver() && !forfeitPlayer && credits > 0) {
      interval = setInterval(() => {
        const turn = game.turn();
        if (turn === 'w') {
          setWhiteTime(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              handleTimeForfeit('w');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              handleTimeForfeit('b');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameActive, isPaused, game, forfeitPlayer, credits]);

  // Log updater
  const addLog = (type: ApiLog['type'], text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [{ timestamp, type, text }, ...prev]);
  };

  const handleClearLogs = () => {
    setApiLogs([]);
  };

  const playSoundSafe = (action: () => void) => {
    try {
      action();
    } catch {}
  };

  // Insert Coin
  const handleInsertCoin = () => {
    playSoundSafe(() => audio.powerUp());
    setCredits(prev => prev + 3);
    addLog('info', 'Loaded 3 credits into the cozy cabinet acceptor.');
  };

  // Setup/Trigger animated move phrases
  const triggerMovePopup = (move: any) => {
    const pieceType = move.piece === 'p' ? 'Pawn' :
                    move.piece === 'n' ? 'Knight' :
                    move.piece === 'b' ? 'Bishop' :
                    move.piece === 'r' ? 'Rook' :
                    move.piece === 'q' ? 'Queen' : 'King';

    if (move.flags.includes('k')) {
      addPopup('King castles kingside! Charming!');
      return;
    }
    if (move.flags.includes('q')) {
      addPopup('King castles queenside! Solid defense!');
      return;
    }

    if (move.captured) {
      const captType = move.captured === 'p' ? 'Pawn' :
                       move.captured === 'n' ? 'Knight' :
                       move.captured === 'b' ? 'Bishop' :
                       move.captured === 'r' ? 'Rook' :
                       move.captured === 'q' ? 'Queen' : 'King';
      const captPhrases = [
        `${pieceType} bonks ${captType}!`,
        `${pieceType} captures ${captType}!`,
        `${pieceType} sweeps away ${captType}!`,
        `${pieceType} snatches ${captType}!`,
      ];
      addPopup(captPhrases[Math.floor(Math.random() * captPhrases.length)]);
    } else {
      const pNormal: Record<string, string[]> = {
        p: ["Pawn steps forward!", "Pawn marches on!", "Pawn leaps ahead!"],
        n: ["Knight leaps gracefully!", "Knight hops to action!", "Knight jumps ahead!"],
        b: ["Bishop glides diagonally!", "Bishop slides with elegance!", "Bishop sweeps the row!"],
        r: ["Rook charges ahead!", "Rook slides in!", "Rook commands the file!"],
        q: ["Queen glides across!", "Queen commands the space!", "Queen reigns supreme!"],
        k: ["King steps carefully!", "King repositions with grace!", "King moves with caution!"],
      };
      const choices = pNormal[move.piece] || ["Piece slides beautifully!"];
      addPopup(choices[Math.floor(Math.random() * choices.length)]);
    }
  };

  const addPopup = (text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setPopups(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1500);
  };

  // Time Forfeit Event handler
  const handleTimeForfeit = (forfeiter: 'w' | 'b') => {
    setForfeitPlayer(forfeiter);
    setGameActive(false);
    playSoundSafe(() => audio.gameOver(false));

    // Calculate outcomes based on player color
    if (forfeiter === 'w') {
      if (playerColor === 'w') {
        setStats(prev => ({ ...prev, losses: prev.losses + 1, winningStreak: 0 }));
        setAiSpeechLine("TIME FORFEIT! PLAYER 1 (WHITE) RAN OUT OF TIME.");
        addLog('error', 'Time Forfeit: Player 1 (White) reached 0:00.');
      } else {
        setStats(prev => {
          const nextStreak = (prev.winningStreak || 0) + 1;
          const nextHighest = Math.max(prev.highestStreak || 0, nextStreak);
          return {
            ...prev,
            wins: prev.wins + 1,
            winningStreak: nextStreak,
            highestStreak: nextHighest
          };
        });
        setAiSpeechLine("TIME FORFEIT! THE MACHINE (WHITE) RAN OUT OF TIME!");
        addLog('received', 'Time Forfeit: Machine (White) reached 0:00.');
      }
    } else {
      if (playerColor === 'w') {
        setStats(prev => {
          const nextStreak = (prev.winningStreak || 0) + 1;
          const nextHighest = Math.max(prev.highestStreak || 0, nextStreak);
          return {
            ...prev,
            wins: prev.wins + 1,
            winningStreak: nextStreak,
            highestStreak: nextHighest
          };
        });
        setAiSpeechLine("TIME FORFEIT! GEMMA CPU (BLACK) RAN OUT OF TIME!");
        addLog('received', 'Time Forfeit: Gemma CPU (Black) timed out.');
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1, winningStreak: 0 }));
        setAiSpeechLine("TIME FORFEIT! PLAYER 1 (BLACK) TIMED OUT.");
        addLog('error', 'Time Forfeit: Player 1 (Black) reached 0:00.');
      }
    }
  };

  // Redirects to Selection Lobby screen where player picks mode/difficulty BEFORE proceeding
  const handleNewMatch = () => {
    playSoundSafe(() => audio.select());
    setGameActive(false);
    setAiSpeechLine("SELECT GAME STYLE IN THE CENTRAL CABINET TERMINAL DIRECTORY!");
    addLog('info', 'Opened the setup lobby selection matrix.');
  };

  // Launch Game from selection menu (Cost: 1 coin)
  const handleLaunchMatch = () => {
    if (credits === 0) {
      playSoundSafe(() => audio.error());
      return;
    }
    playSoundSafe(() => audio.powerUp());

    // Sync actual gameplay parameters
    const chosenColor = lobbyMode === 'local' ? 'both' : lobbyColor;
    setPlayerColor(chosenColor);
    safeStorage.setItem('arcade_player_color', chosenColor);

    // If computer mode, sync difficulty and engine
    let updatedConfig = { ...aiConfig };
    if (lobbyMode === 'computer') {
      updatedConfig.difficulty = lobbyDifficulty;
      updatedConfig.engine = lobbyEngine;
      // Sync minimax depth based on difficulty
      let depth = 2;
      if (lobbyDifficulty === 'easy') depth = 1;
      if (lobbyDifficulty === 'hard') depth = 3;
      updatedConfig.minimaxDepth = depth;
      setAiConfig(updatedConfig);
      safeStorage.setItem('arcade_ai_config', JSON.stringify(updatedConfig));
    }

    setGame(new Chess());
    setIsAiThinking(false);
    setForfeitPlayer(null);
    setWhiteTime(600);
    setBlackTime(600);
    setCredits(prev => Math.max(0, prev - 1));
    setGameActive(true);
    setIsPaused(false);

    if (lobbyMode === 'local') {
      triggerToast("👥 CO-OP DUEL LOADED", "Local 1vs1 match initiated. Pass & Play turns on the board!");
      setAiSpeechLine("CO-OP LOCAL 1VS1 MATCH LAUNCHED! TEAM WHITE FIRST.");
      addLog('info', 'Pass & Play Local 1VS1 Mode launched. 1 Coin deducted.');
    } else {
      triggerToast(`🤖 VS COMPUTER (${lobbyDifficulty.toUpperCase()})`, "Single player vs local CPU engine is active!");
      setAiSpeechLine(`ARCADE VS CPU (${lobbyDifficulty.toUpperCase()}) INITIATED! GO GET EM COZY PILOT!`);
      addLog('info', `CPU Mode (${lobbyDifficulty.toUpperCase()} / ${lobbyEngine}) launched. 1 Coin deducted.`);
      if (chosenColor === 'b') {
        setTimeout(() => {
          triggerAiMove(new Chess());
        }, 700);
      }
    }
  };

  // Reset Game Layout (Restores starting point without coin loss)
  const handleResetMatch = () => {
    playSoundSafe(() => audio.powerUp());
    setGame(new Chess());
    setIsAiThinking(false);
    setForfeitPlayer(null);
    setWhiteTime(600);
    setBlackTime(600);
    setGameActive(true);
    setIsPaused(true); // default to paused in reset
    setAiSpeechLine("COZY CHESS REGISTER RESTORED. CLICK RESUME OR PAUSE.");
    addLog('info', 'Chess registry reset back to default start state.');
  };

  // Pause Mode Control
  const handleTogglePause = () => {
    playSoundSafe(() => audio.select());
    setIsPaused(prev => !prev);
    setAiSpeechLine(isPaused ? "MATCH RESUMED! WATCH THE TICKING CLOCK!" : "MATCH PAUSED. TAKE A CUTE COFFEE BREAK! ☕");
    addLog('info', isPaused ? 'Clock counts resumed.' : 'Clock counts paused.');
  };

  // Undo Move
  const handleUndo = () => {
    if (credits === 0 || disabledBoard()) {
      playSoundSafe(() => audio.error());
      return;
    }
    playSoundSafe(() => audio.select());

    if (playerColor === 'both') {
      game.undo();
    } else {
      if (isAiThinking) return;
      game.undo(); // AI move
      game.undo(); // Human move
    }

    const nextGame = new Chess(game.fen());
    setGame(nextGame);
    addLog('info', 'Rewound match register 1 cycle.');
  };

  // Reset all record cabinets
  const handleClearStats = () => {
    playSoundSafe(() => audio.select());
    setStats({ wins: 0, losses: 0, draws: 0, winningStreak: 0, highestStreak: 0 });
    setQuickestCheckmate(null);
    safeStorage.removeItem('arcade_quickest_checkmate');
    addLog('info', 'Statistics record cabinet eradicated.');
  };

  // Human player input
  const handlePlayerMove = (from: string, to: string, promotion?: string) => {
    try {
      const move = game.move({ from, to, promotion });
      triggerMovePopup(move);

      // Play soft sounds
      playSoundSafe(() => {
        if (move.captured) {
          audio.capture();
        } else {
          audio.move();
        }
      });

      const nextGame = new Chess(game.fen());
      setGame(nextGame);

      // If checkmate win, write score
      if (checkGameOverState(nextGame, 'player')) return;

      // Unpause timer on first move
      if (isPaused) {
        setIsPaused(false);
      }

      // Query AI Opponent if it is VS mode
      if (playerColor !== 'both') {
        triggerAiMove(nextGame);
      }
    } catch {
      playSoundSafe(() => audio.error());
    }
  };

  const checkGameOverState = (currGame: Chess, actor: 'player' | 'ai'): boolean => {
    if (currGame.isGameOver()) {
      setGameActive(false);
      if (currGame.isCheckmate()) {
        const turn = currGame.turn(); // The checkmated color
        let won = false;

        const totalMoves = currGame.history().length;

        if (playerColor === 'both') {
          playSoundSafe(() => audio.gameOver(true));
          setAiSpeechLine(`CHECKMATE IN ${totalMoves} MOVES! GLORY TO PLAYER 1!`);
          addLog('error', 'Checkmate matched on local manual lobby.');
          return true;
        }

        if (playerColor === 'w') {
          won = (turn === 'b');
        } else if (playerColor === 'b') {
          won = (turn === 'w');
        }

        if (won) {
          const currentStreak = stats.winningStreak || 0;
          const nextStreak = currentStreak + 1;
          const nextHighest = Math.max(stats.highestStreak || 0, nextStreak);

          setStats(prev => ({
            ...prev,
            wins: prev.wins + 1,
            winningStreak: nextStreak,
            highestStreak: nextHighest
          }));

          // Coins rewards calculation: 30 / 60 / 100 base + +25 per streak level bonus
          const diff = aiConfig.difficulty || 'intermediate';
          const baseCoins = diff === 'easy' ? 30 : diff === 'intermediate' ? 60 : 100;
          const streakBonus = Math.max(0, nextStreak - 1) * 25;
          const totalEarned = baseCoins + streakBonus;

          setCredits(prev => prev + totalEarned);
          triggerFloatingCoins(totalEarned);

          // Toast celebration notifications
          if (nextStreak >= 2) {
            triggerToast(
              `🔥 HOT WINNING STREAK x${nextStreak}!`,
              `Double congratulations! You reached a consecutive streak of ${nextStreak} Wins and collected a +${streakBonus} Bonus Coins multiplier! Saved +${totalEarned} Coins overall!`
            );
          } else {
            triggerToast(
              `👑 CHARMING CHECKMATE!`,
              `Fabulous game! You defeated the ${diff.toUpperCase()} CPU and secured +${baseCoins} base Coins! Total earned: +${totalEarned} 🪙`
            );
          }

          setQuickestCheckmate(prev => {
            const next = (prev === null || totalMoves < prev) ? totalMoves : prev;
            safeStorage.setItem('arcade_quickest_checkmate', next.toString());
            return next;
          });

          // Play double retro victory chimes!
          playSoundSafe(() => {
            audio.cheer();
            setTimeout(() => {
              audio.coin();
            }, 600);
          });

          setAiSpeechLine(`CHECKMATE WIN! YOU DEFEATED THE GEMMA CPU IN ${totalMoves} MOVES! EARNED +${totalEarned} COINS! 🪙`);
          addLog('received', `USER defeats CPU! High score matching: ${totalMoves} moves. Secured +${totalEarned} Coins.`);
        } else {
          setStats(prev => ({ ...prev, losses: prev.losses + 1, winningStreak: 0 }));
          triggerToast("💔 MATCH DEFEAT", "The CPU opponent has defeated you in checkmate. Winning streak reset.");
          playSoundSafe(() => audio.gameOver(false));
          setAiSpeechLine("YOU TASTE DEFEAT! INSERT MORE COINS TO COMMENCE REVENGE.");
          addLog('error', 'CPU defeats USER! Calibration error.');
        }
      } else {
        setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
        triggerToast("⚖️ STALEMATE DRAW", "A direct stalemate or draw has occurred! The win streak has ended.");
        playSoundSafe(() => audio.gameOver(false));
        setAiSpeechLine("STALEMATE DRAW DECLARED! AN EQUAL MATCH.");
        addLog('info', 'Archiving Board state as peaceful Draw.');
      }
      return true;
    }

    if (currGame.inCheck()) {
      playSoundSafe(() => audio.check());
      setAiSpeechLine("WARNING! KING REGISTRY LOCATED IN FIRE SCOPE!");
    }
    return false;
  };

  // Minimax backup trigger
  const triggerFallbackLocalMove = (currGame: Chess, messagePrefix: string) => {
    addLog('error', `${messagePrefix} Deploying local Minimax backup solver...`);
    setTimeout(() => {
      try {
        const fallbackMove = getBestMove(currGame, 1);
        if (fallbackMove) {
          executeAiMove(currGame, fallbackMove.from, fallbackMove.to, fallbackMove.promotion, `Strategic baseline fallback.`);
        } else {
          setIsAiThinking(false);
        }
      } catch (err: any) {
        addLog('error', `Critical fallback failure: ${err.message}`);
        setIsAiThinking(false);
      }
    }, 800);
  };

  // Execute actual AI move
  const executeAiMove = (
    currGame: Chess,
    from: string,
    to: string,
    promotion: string | undefined,
    reasoning: string
  ) => {
    try {
      const move = currGame.move({ from, to, promotion });
      triggerMovePopup(move);

      playSoundSafe(() => {
        if (move.captured) {
          audio.capture();
        } else {
          audio.aiMove();
        }
      });

      setAiSpeechLine(reasoning);
      const nextGame = new Chess(currGame.fen());
      setGame(nextGame);
      setIsAiThinking(false);

      checkGameOverState(nextGame, 'ai');
    } catch {
      triggerFallbackLocalMove(currGame, `Coord system desync.`);
    }
  };

  // Primary AI Engine query routine
  const triggerAiMove = async (currGame: Chess) => {
    setIsAiThinking(true);
    
    const legalMoves = currGame.moves({ verbose: true }).map(m => {
      const prom = m.promotion ? m.promotion : '';
      return `${m.from}${m.to}${prom}`;
    });

    if (legalMoves.length === 0) {
      setIsAiThinking(false);
      return;
    }

    const currentFen = currGame.fen();

    if (aiConfig.engine === 'built-in') {
      addLog('info', `Deploying Local Minimax (AI Level ${aiConfig.minimaxDepth})...`);
      setTimeout(() => {
        const move = getBestMove(currGame, aiConfig.minimaxDepth);
        if (move) {
          executeAiMove(currGame, move.from, move.to, move.promotion, `CPU tactical calculations complete.`);
        } else {
          setIsAiThinking(false);
        }
      }, 700);
    } 
    else if (aiConfig.engine === 'lmstudio') {
      addLog('sent', `Connecting to LM Studio Gemma 4 at http://localhost:1234/v1/chat/completions ...`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        let sysInstruction = aiConfig.customPrompt;
        if (aiConfig.difficulty) {
          if (aiConfig.difficulty === 'easy') {
            sysInstruction += `\nPLAY STYLE: EASY LEVEL. Play casually, allowing beginner mistakes occasionally.`;
          } else if (aiConfig.difficulty === 'intermediate') {
            sysInstruction += `\nPLAY STYLE: INTERMEDIATE LEVEL. Play with solid chess tactics and standard positional principles.`;
          } else if (aiConfig.difficulty === 'hard') {
            sysInstruction += `\nPLAY STYLE: GRANDMASTER HARD LEVEL. Play with unforgiving master-tier tactics and maximize positional pressure.`;
          }
        }
        sysInstruction += `\n\nLegal list of moves of this position: ${JSON.stringify(legalMoves)}
Do not include any extra thoughts, markdown formatting, HTML, or explanations outside any markdown-free JSON block. Choose only the single best legal move.`;

        const response = await fetch(`${aiConfig.lmStudioUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          signal: controller.signal,
          body: JSON.stringify({
            model: aiConfig.lmStudioModel || 'gemma-4',
            temperature: 0.2,
            messages: [
              { role: 'system', content: sysInstruction },
              { role: 'user', content: `Board FEN position: ${currentFen}` }
            ]
          })
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content?.trim() || '';
        addLog('received', `Gemma Raw: "${rawContent}"`);

        // 1. Gracefully parse out any reasoning tags (<think>...</think>)
        const cleanedContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // 2. Extract JSON
        let moveChoice = '';
        let reasoning = 'Maneuvering cute bishop.';
        try {
          const jsonMatch = cleanedContent.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            moveChoice = parsed.move;
          } else {
            // direct lookup fallback
            const plainText = cleanedContent.replace(/[^a-zA-Z0-9]/g, '');
            for (const leg of legalMoves) {
              if (plainText.toLowerCase().includes(leg.toLowerCase())) {
                moveChoice = leg;
                break;
              }
            }
          }
        } catch {
          // direct match regex
          const fallbackMatches = cleanedContent.match(/[a-h][1-8][a-h][1-8][qrbn]?/gi);
          if (fallbackMatches) {
            moveChoice = fallbackMatches[0].toLowerCase();
          }
        }

        if (moveChoice && legalMoves.includes(moveChoice)) {
          const from = moveChoice.substring(0, 2);
          const to = moveChoice.substring(2, 4);
          const promotion = moveChoice.length > 4 ? moveChoice.substring(4, 5) : undefined;
          executeAiMove(currGame, from, to, promotion, `Gemma chose coordinates: ${moveChoice.toUpperCase()}`);
        } else {
          addLog('error', `Gemma returned move "${moveChoice || 'none'}", which is not indexed legal: ${JSON.stringify(legalMoves)}`);
          triggerFallbackLocalMove(currGame, `Coordinate sync mismatch.`);
        }
      } catch (err: any) {
        addLog('error', `LM Studio Server offline at ${aiConfig.lmStudioUrl}. Initiating local CPU fallback solver.`);
        triggerFallbackLocalMove(currGame, `Endpoint offline.`);
      }
    } 
    else if (aiConfig.engine === 'gemini') {
      addLog('sent', `Querying cloud router proxy with FEN: ${currentFen}...`);
      try {
        const response = await fetch('/api/gemini-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fen: currentFen,
            legalMoves,
            customPrompt: aiConfig.customPrompt,
            difficulty: aiConfig.difficulty
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        addLog('received', `Cloud AI: ${data.move} - "${data.reasoning}"`);

        const move = data.move;
        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        const promotion = move.length > 4 ? move.substring(4, 5) : undefined;
        executeAiMove(currGame, from, to, promotion, data.reasoning);
      } catch (err: any) {
        addLog('error', `Cloud resolver offline: ${err.message}`);
        triggerFallbackLocalMove(currGame, `Proxy override.`);
      }
    }
  };

  const disabledBoard = () => {
    if (credits === 0) return true;
    if (game.isGameOver()) return true;
    if (forfeitPlayer !== null) return true;
    if (isAiThinking) return true;
    if (isPaused) return true;
    return false;
  };

  const playModeDisplay = () => {
    if (playerColor === 'both') return 'Co-Op Manual';
    return playerColor === 'w' ? 'Solo Match (White P1)' : 'Solo Match (Black p1)';
  };

  const formatTimerText = (timeInSecs: number) => {
    const min = Math.floor(timeInSecs / 60);
    const sec = timeInSecs % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Helper to retrieve captured pieces
  const getCapturedState = () => {
    const startCount = {
      w: { q: 1, r: 2, b: 2, n: 2, p: 8 },
      b: { q: 1, r: 2, b: 2, n: 2, p: 8 }
    };
    const remain = {
      w: { q: 0, r: 0, b: 0, n: 0, p: 0 },
      b: { q: 0, r: 0, b: 0, n: 0, p: 0 }
    };

    game.board().forEach(row => {
      row.forEach(cell => {
        if (cell && cell.type !== 'k') {
          const color = cell.color;
          const type = cell.type as 'p' | 'n' | 'b' | 'r' | 'q';
          remain[color][type]++;
        }
      });
    });

    const capturedW: Array<{ type: 'p' | 'n' | 'b' | 'r' | 'q' }> = [];
    const capturedB: Array<{ type: 'p' | 'n' | 'b' | 'r' | 'q' }> = [];

    (['q', 'r', 'b', 'n', 'p'] as const).forEach(type => {
      const diff = startCount.w[type] - remain.w[type];
      for (let i = 0; i < diff; i++) capturedW.push({ type });
    });

    (['q', 'r', 'b', 'n', 'p'] as const).forEach(type => {
      const diff = startCount.b[type] - remain.b[type];
      for (let i = 0; i < diff; i++) capturedB.push({ type });
    });

    return { w: capturedW, b: capturedB }; // w is captured white (black's losses), b is captured black (white's losses)
  };  const captured = getCapturedState();

  const isWhiteActive = game.turn() === 'w' && gameActive && !isPaused && !game.isGameOver() && !forfeitPlayer;
  const isBlackActive = game.turn() === 'b' && gameActive && !isPaused && !game.isGameOver() && !forfeitPlayer;

  // Configure dynamic styling based on active theme for perfect contrast
  const getThemeStyle = () => {
    switch(theme) {
      case 'galaxy':
        return {
          wrapper: "min-h-screen bg-[#070314] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0e38] via-[#090514] to-[#010003] text-[#e3dcff] select-none p-4 md:p-6 flex flex-col justify-between transition-all duration-300",
          card: "bg-[#0e0723]/95 border-2 border-[#523e8c] shadow-[0_0_20px_rgba(138,112,255,0.15)] text-[#e5dbff]",
          boardCard: "bg-[#0c051f]/95 border-2 border-[#523e8c] p-5 rounded-2xl shadow-[0_0_20px_rgba(138,112,255,0.18)] flex flex-col relative overflow-hidden",
          header: "max-w-6xl w-full mx-auto bg-[#0c051f]/95 border-2 border-[#4b3394] p-4 mb-4 shadow-[0_0_20px_rgba(138,112,255,0.15)] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4",
          headerBtn: "cursor-pointer h-9 w-9 bg-[#130a32] hover:bg-[#251556] rounded-xl flex items-center justify-center text-[#d8cdff] border border-[#523e8c] transition-all",
          creditsBadge: "flex items-center gap-2 bg-[#12082b] border border-[#7a4bf4]/50 px-3 py-1.5 rounded-xl text-xs font-bold",
          creditsLabel: "text-[#caaffc] uppercase tracking-wider text-[10px]",
          creditsNum: "text-[#ecdfff] font-mono font-black",
          gemmaProfile: "flex items-center justify-between mb-4 bg-[#140b33]/90 border border-[#523e8c] p-3 rounded-xl",
          userProfile: "flex items-center justify-between mt-4 bg-[#0a1f1b]/90 border border-[#2d6c5d]/50 p-3 rounded-xl",
          clockActiveBlack: "shadow-[0_0_15px_rgba(255,181,167,0.35)] bg-[#280c16] border-[#ea5a8c]",
          clockInactiveBlack: "bg-[#10061b] border-[#36165e]",
          clockTextBlack: "text-[#ffa6c9]",
          clockActiveWhite: "shadow-[0_0_15px_rgba(183,228,199,0.35)] bg-[#0f2e22] border-[#2dcc87]",
          clockInactiveWhite: "bg-[#10061b] border-[#36165e]",
          clockTextWhite: "text-[#bfffc6]",
          controlNewMatch: "cursor-pointer font-bold text-center py-2.5 bg-[#4c1d95] text-[#ecdfff] hover:bg-[#5b21b6] rounded-xl text-xs border border-[#7c3aed] transition-all flex items-center justify-center gap-1.5 shadow-md btn-clicker",
          controlPause: "cursor-pointer font-bold text-center py-2.5 bg-[#9d174d] text-[#ffe4e6] hover:bg-[#be185d] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs border border-[#db2777] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlReset: "cursor-pointer font-bold text-center py-2.5 bg-[#170e30] text-[#c0b3f2] hover:bg-[#221644] rounded-xl text-xs border border-[#523e8c] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          announcer: "w-full bg-[#0c051f]/95 border-2 border-[#523e8c] rounded-2xl p-4 text-center min-h-[66px] flex items-center justify-center text-xs font-mono text-[#caaffc] shadow-[0_0_15px_rgba(138,112,255,0.08)]",
          tabContainer: "flex bg-[#0c051f]/95 p-1.5 rounded-xl border-2 border-[#4b3394] select-none shadow-md font-mono text-[11px] uppercase",
          tabScoresActive: "bg-[#5c3aba] text-[#ffffff] font-bold",
          tabCpuActive: "bg-[#911f4d] text-[#ffffff] font-bold",
          tabInactive: "bg-transparent text-[#978aaf] hover:text-[#cbbefc]",
          footerItem: "bg-[#0c051f]/95 border border-[#5a42a8]/60 p-2 rounded-xl text-center flex flex-col justify-between items-center gap-1 shadow-sm",
          footerLabel: "text-[9px] font-bold text-[#978aaf] uppercase tracking-wider block",
          footerSelect: "w-full bg-[#0a0518] text-center border-0 text-xs font-mono font-bold py-1 text-[#d8cdff] cursor-pointer outline-none rounded-lg",
          footerBtn: "cursor-pointer font-bold text-center py-3 bg-[#0c051f]/95 text-[#cbbefc] hover:bg-[#180e3c] border border-[#5a42a8]/60 rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker",
          footerBtnLabel: "text-[9px] text-[#978aaf] font-bold uppercase tracking-wider block",
          footerBtnVal: "font-bold text-xs mt-0.5 text-[#ecdfff]"
        };
      case 'neon':
        return {
          wrapper: "min-h-screen bg-[#fff0f3] text-[#590d22] select-none p-4 md:p-6 flex flex-col justify-between transition-all duration-300",
          card: "bg-white border-2 border-[#ffcad4] shadow-cozy text-[#590d22]",
          boardCard: "bg-white border-2 border-[#ffcad4] p-5 rounded-2xl shadow-cozy flex flex-col relative overflow-hidden",
          header: "max-w-6xl w-full mx-auto bg-white border-2 border-[#ffcad4] p-4 mb-4 shadow-cozy rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4",
          headerBtn: "cursor-pointer h-9 w-9 bg-[#fdfbf7] hover:bg-[#fff0f3] rounded-xl flex items-center justify-center text-[#5b6c5d] border border-[#eef3ee] transition-all",
          creditsBadge: "flex items-center gap-2 bg-[#fffbf4] border border-[#fec5bb] px-3 py-1.5 rounded-xl text-xs font-bold",
          creditsLabel: "text-[#8e5241] uppercase tracking-wider text-[10px]",
          creditsNum: "text-[#590d22] font-mono font-black",
          gemmaProfile: "flex items-center justify-between mb-4 bg-[#fff9fa] border border-[#ffcad4]/50 p-3 rounded-xl",
          userProfile: "flex items-center justify-between mt-4 bg-[#fff9fa] border border-[#ffcad4]/50 p-3 rounded-xl",
          clockActiveBlack: "shadow-active-black bg-[#fff0f3] border-[#ff7b90]",
          clockInactiveBlack: "bg-neutral-50 border-neutral-200",
          clockTextBlack: "text-[#590d22]",
          clockActiveWhite: "shadow-active-white bg-[#fff0f3] border-[#ff7b90]",
          clockInactiveWhite: "bg-neutral-50 border-neutral-200",
          clockTextWhite: "text-[#590d22]",
          controlNewMatch: "cursor-pointer font-bold text-center py-2.5 bg-[#ffcad4] text-[#590d22] hover:bg-[#ffb3c1] rounded-xl text-xs border border-[#ffcad4] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlPause: "cursor-pointer font-bold text-center py-2.5 bg-[#fec5bb] text-[#590d22] hover:bg-[#ffcad4] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs border border-[#ffcad4] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlReset: "cursor-pointer font-bold text-center py-2.5 bg-[#fdfbf7] text-[#5b6c5d] hover:bg-[#eef3ee] rounded-xl text-xs border border-[#ccd5ae]/40 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          announcer: "w-full bg-white border-2 border-[#ffcad4] rounded-2xl p-4 text-center min-h-[66px] flex items-center justify-center text-xs font-mono text-[#5b6c5d] shadow-cozy",
          tabContainer: "flex bg-white p-1.5 rounded-xl border-2 border-[#ffcad4] select-none shadow-cozy font-mono text-[11px] uppercase",
          tabScoresActive: "bg-[#ffcad4] text-[#590d22] font-bold",
          tabCpuActive: "bg-[#ffcad4] text-[#590d22] font-bold",
          tabInactive: "bg-transparent text-[#8fa89b] hover:text-[#5b6c5d]",
          footerItem: "bg-white border border-[#eef3ee] p-2 rounded-xl text-center flex flex-col justify-between items-center gap-1 shadow-sm",
          footerLabel: "text-[9px] font-bold text-[#8fa89b] uppercase tracking-wider block",
          footerSelect: "w-full bg-[#fdfbf7] text-center border-0 text-xs font-mono font-bold py-1 text-[#3d5a5a] cursor-pointer outline-none rounded-lg",
          footerBtn: "cursor-pointer font-bold text-center py-3 bg-white text-[#5b6c5d] hover:bg-[#fffbf4] border border-[#eef3ee] rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker",
          footerBtnLabel: "text-[9px] text-[#8fa89b] font-bold uppercase tracking-wider block",
          footerBtnVal: "font-extrabold text-xs mt-0.5 text-[#590d22]"
        };
      case 'light':
        return {
          wrapper: "min-h-screen bg-neutral-100 text-neutral-900 select-none p-4 md:p-6 flex flex-col justify-between transition-all duration-300",
          card: "bg-white border border-neutral-300 shadow-md text-neutral-900",
          boardCard: "bg-white border border-neutral-300 p-5 rounded-2xl shadow-md flex flex-col relative overflow-hidden",
          header: "max-w-6xl w-full mx-auto bg-white border border-neutral-300 p-4 mb-4 shadow-md rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4",
          headerBtn: "cursor-pointer h-9 w-9 bg-neutral-150 hover:bg-neutral-250 rounded-xl flex items-center justify-center text-neutral-800 border border-neutral-300 transition-all",
          creditsBadge: "flex items-center gap-2 bg-neutral-50 border border-neutral-350 px-3 py-1.5 rounded-xl text-xs font-bold",
          creditsLabel: "text-neutral-750 font-bold uppercase tracking-wider text-[10px]",
          creditsNum: "text-neutral-950 font-mono font-black",
          gemmaProfile: "flex items-center justify-between mb-4 bg-neutral-50 border border-neutral-300 p-3 rounded-xl",
          userProfile: "flex items-center justify-between mt-4 bg-neutral-50 border border-neutral-300 p-3 rounded-xl",
          clockActiveBlack: "shadow-md bg-neutral-150 border-neutral-400",
          clockInactiveBlack: "bg-neutral-50 border-neutral-300",
          clockTextBlack: "text-neutral-950",
          clockActiveWhite: "shadow-md bg-neutral-150 border-neutral-400",
          clockInactiveWhite: "bg-neutral-50 border-neutral-200",
          clockTextWhite: "text-neutral-950",
          controlNewMatch: "cursor-pointer font-bold text-center py-2.5 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs border border-neutral-900 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlPause: "cursor-pointer font-bold text-center py-2.5 bg-neutral-250 text-neutral-900 hover:bg-neutral-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs border border-neutral-350 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlReset: "cursor-pointer font-bold text-center py-2.5 bg-white text-neutral-800 hover:bg-neutral-100 rounded-xl text-xs border border-neutral-350 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          announcer: "w-full bg-white border border-neutral-300 rounded-2xl p-4 text-center min-h-[66px] flex items-center justify-center text-xs font-mono text-neutral-850 shadow-md",
          tabContainer: "flex bg-neutral-150 p-1.5 rounded-xl border border-neutral-350 select-none shadow-inner font-mono text-[11px] uppercase",
          tabScoresActive: "bg-white text-neutral-955 border border-neutral-350 font-black",
          tabCpuActive: "bg-white text-neutral-955 border border-neutral-350 font-black",
          tabInactive: "bg-transparent text-neutral-750 font-bold hover:text-neutral-950",
          footerItem: "bg-white border border-neutral-300 p-2 rounded-xl text-center flex flex-col justify-between items-center gap-1 shadow-sm",
          footerLabel: "text-[9px] font-extrabold text-neutral-800 uppercase tracking-wider block",
          footerSelect: "w-full bg-neutral-50 text-center border-0 text-xs font-mono font-bold py-1 text-neutral-950 cursor-pointer outline-none rounded-lg",
          footerBtn: "cursor-pointer font-bold text-center py-3 bg-white text-neutral-850 hover:bg-neutral-50 border border-neutral-300 rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker",
          footerBtnLabel: "text-[9px] text-neutral-700 font-bold uppercase tracking-wider block",
          footerBtnVal: "font-extrabold text-xs mt-0.5 text-neutral-950"
        };
      case 'dark':
        return {
          wrapper: "min-h-screen bg-[#09090b] text-[#f4f4f5] select-none p-4 md:p-6 flex flex-col justify-between transition-all duration-300",
          card: "bg-[#18181b] border border-neutral-800 shadow-md text-[#f4f4f5]",
          boardCard: "bg-[#18181b] border border-neutral-800 p-5 rounded-2xl shadow-md flex flex-col relative overflow-hidden",
          header: "max-w-6xl w-full mx-auto bg-[#18181b] border border-neutral-800 p-4 mb-4 shadow-md rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4",
          headerBtn: "cursor-pointer h-9 w-9 bg-neutral-900 hover:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-300 border border-neutral-800 transition-all",
          creditsBadge: "flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-bold",
          creditsLabel: "text-neutral-300 uppercase tracking-wider text-[10px] font-bold",
          creditsNum: "text-[#f4f4f5] font-mono font-black",
          gemmaProfile: "flex items-center justify-between mb-4 bg-neutral-900/40 border border-neutral-800 p-3 rounded-xl",
          userProfile: "flex items-center justify-between mt-4 bg-neutral-900/40 border border-neutral-800 p-3 rounded-xl",
          clockActiveBlack: "shadow-md bg-neutral-800 border-neutral-600",
          clockInactiveBlack: "bg-neutral-900 border-neutral-800",
          clockTextBlack: "text-[#f4f4f5]",
          clockActiveWhite: "shadow-md bg-neutral-800 border-neutral-600",
          clockInactiveWhite: "bg-neutral-900 border-neutral-800",
          clockTextWhite: "text-[#f4f4f5]",
          controlNewMatch: "cursor-pointer font-bold text-center py-2.5 bg-neutral-200 text-black hover:bg-white rounded-xl text-xs border border-neutral-200 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlPause: "cursor-pointer font-bold text-center py-2.5 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs border border-neutral-700 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlReset: "cursor-pointer font-bold text-center py-2.5 bg-[#18181b] text-neutral-300 hover:bg-neutral-900 rounded-xl text-xs border border-neutral-800 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          announcer: "w-full bg-[#18181b] border border-neutral-800 rounded-2xl p-4 text-center min-h-[66px] flex items-center justify-center text-xs font-mono text-[#f4f4f5] shadow-md",
          tabContainer: "flex bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 select-none shadow-inner font-mono text-[11px] uppercase",
          tabScoresActive: "bg-[#18181b] text-white border border-neutral-800 font-bold",
          tabCpuActive: "bg-[#18181b] text-white border border-neutral-800 font-bold",
          tabInactive: "bg-transparent text-neutral-400 hover:text-white font-medium",
          footerItem: "bg-[#18181b] border border-neutral-800 p-2 rounded-xl text-center flex flex-col justify-between items-center gap-1 shadow-sm",
          footerLabel: "text-[9px] font-bold text-neutral-400 uppercase tracking-wider block",
          footerSelect: "w-full bg-neutral-900 text-center border-0 text-xs font-mono font-bold py-1 text-white cursor-pointer outline-none rounded-lg",
          footerBtn: "cursor-pointer font-bold text-center py-3 bg-[#18181b] text-neutral-200 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker",
          footerBtnLabel: "text-[9px] text-neutral-400 font-bold uppercase tracking-wider block",
          footerBtnVal: "font-extrabold text-xs mt-0.5 text-white"
        };
      case 'classic':
      default:
        return {
          wrapper: "min-h-screen bg-[#fdfbf7] text-[#1b3030] select-none p-4 md:p-6 flex flex-col justify-between transition-all duration-300",
          card: "bg-white border-2 border-[#ccd5ae]/80 shadow-cozy text-[#1b3030]",
          boardCard: "bg-white border-2 border-[#ccd5ae]/50 p-5 rounded-2xl shadow-cozy flex flex-col relative overflow-hidden",
          header: "max-w-6xl w-full mx-auto bg-white border-2 border-[#ccd5ae]/80 p-4 mb-4 shadow-cozy rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4",
          headerBtn: "cursor-pointer h-9 w-9 bg-[#fdfbf7] hover:bg-[#fff0f3] rounded-xl flex items-center justify-center text-[#1b4332] border border-[#eef3ee] transition-all",
          creditsBadge: "flex items-center gap-2 bg-[#fffbf4] border border-[#fec5bb] px-3 py-1.5 rounded-xl text-xs font-bold",
          creditsLabel: "text-[#6e3728] uppercase tracking-wider text-[10px] font-bold",
          creditsNum: "text-[#590d22] font-mono font-black",
          gemmaProfile: "flex items-center justify-between mb-4 bg-[#fff9fa] border border-[#ffcad4]/50 p-3 rounded-xl",
          userProfile: "flex items-center justify-between mt-4 bg-[#fafdfa] border border-[#b7e4c7]/55 p-3 rounded-xl",
          clockActiveBlack: "shadow-active-black bg-[#fff0f3] border-[#ff7b90]",
          clockInactiveBlack: "bg-neutral-150 border-neutral-350",
          clockTextBlack: "text-[#590d22]",
          clockActiveWhite: "shadow-active-white bg-[#eafaf1] border-[#b7e4c7]",
          clockInactiveWhite: "bg-neutral-150 border-neutral-350",
          clockTextWhite: "text-[#1b4332]",
          controlNewMatch: "cursor-pointer font-bold text-center py-2.5 bg-[#b7e4c7] text-[#1b4332] hover:bg-[#95d5b2] rounded-xl text-xs border border-[#95d5b2] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlPause: "cursor-pointer font-bold text-center py-2.5 bg-[#fec5bb] text-[#590d22] hover:bg-[#ffcad4] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs border border-[#ffcad4] transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          controlReset: "cursor-pointer font-bold text-center py-2.5 bg-[#fdfbf7] text-[#1b3024] hover:bg-[#eef3ee] rounded-xl text-xs border border-[#ccd5ae]/40 transition-all flex items-center justify-center gap-1.5 shadow-sm btn-clicker",
          announcer: "w-full bg-white border-2 border-[#ccd5ae]/80 rounded-2xl p-4 text-center min-h-[66px] flex items-center justify-center text-xs font-mono text-[#1b3024] shadow-cozy",
          tabContainer: "flex bg-white p-1.5 rounded-xl border-2 border-[#ccd5ae]/80 select-none shadow-cozy font-mono text-[11px] uppercase",
          tabScoresActive: "bg-[#b7e4c7] text-[#1b4332] font-bold",
          tabCpuActive: "bg-[#ffcad4] text-[#590d22] font-bold",
          tabInactive: "bg-transparent text-[#425a4d] font-bold hover:text-[#1b3024]",
          footerItem: "bg-white border border-[#eef3ee] p-2 rounded-xl text-center flex flex-col justify-between items-center gap-1 shadow-sm",
          footerLabel: "text-[9px] font-bold text-[#385244] uppercase tracking-wider block",
          footerSelect: "w-full bg-[#fdfbf7] text-center border-0 text-xs font-mono font-bold py-1 text-[#1b3020] cursor-pointer outline-none rounded-lg",
          footerBtn: "cursor-pointer font-bold text-center py-3 bg-white text-[#1b3024] hover:bg-[#fffbf4] border border-[#eef3ee] rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker",
          footerBtnLabel: "text-[9px] text-[#385244] font-bold uppercase tracking-wider block",
          footerBtnVal: "font-extrabold text-xs mt-0.5 text-[#1b4332]"
        };
    }
  };

  const style = getThemeStyle();

  return (
    <div className={style.wrapper}>
      {/* Toast Celebrate Notifications Popup */}
      {toast && (
        <div 
          key={toast.id}
          className={`fixed top-4 right-4 z-55 max-w-sm p-4 rounded-2xl border-2 shadow-2xl flex items-start gap-3 animate-slideInFromRight select-none ${
            theme === 'galaxy'
              ? 'bg-[#150d30]/95 border-[#c582ff] text-white shadow-[#523e8c]/50'
              : 'bg-white border-[#fec5bb] text-neutral-800 shadow-md'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-base">
            ✨
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 font-mono">
              {toast.title}
            </h4>
            <p className="text-[10px] leading-relaxed text-[#3d5a5a] mt-1">
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Floating Move Pop-ups Overlay */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2 z-50">
        {popups.map(pop => (
          <div
            key={pop.id}
            className="bg-[#ffe5ec] border-2 border-[#fec5bb] text-[#590d22] font-mono text-xs font-bold px-4 py-2.5 rounded-full shadow-md animate-bounce flex items-center gap-1.5 transition-all duration-300 transform scale-105"
            style={{ animationDuration: '1.2s' }}
          >
            <Sparkles size={11} className="text-[#f1a7b4] animate-spin" />
            {pop.text}
          </div>
        ))}
      </div>

      {/* Cozy Minimalist Header */}
      <header className={style.header}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b7e4c7] flex items-center justify-center rounded-xl shadow-inner animate-pulse">
            <span className="text-[#1b4332] text-lg font-black font-mono">♟️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-bold tracking-tight font-mono ${theme === 'galaxy' ? 'text-[#ecdfff] drop-shadow-[0_0_8px_rgba(197,130,255,0.4)]' : 'text-[#2d3a33]'}`}>
                COZY ARCADE CHESS
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#b7e4c7] text-[#1b4332] text-[8px] font-black uppercase font-mono tracking-widest shadow-sm">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                CROSS-PLATFORM
              </div>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#8fa89b]'}`}>
              SYSTEM: {aiConfig.engine === 'lmstudio' ? 'LOCAL GEMMA-4 ONLINE' : aiConfig.engine === 'built-in' ? 'LOCAL MINIMAX V2' : 'GEMINI ROUTER ONLINE'}
            </p>
          </div>
        </div>

        {/* Muted audio and coin info display */}
        <div className="flex items-center gap-4 select-none">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={style.headerBtn}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={14} className="text-[#ff7b90]" /> : <Volume2 size={14} />}
          </button>

          <div className={`h-8 w-[1.5px] ${theme === 'galaxy' ? 'bg-[#523e8c]' : 'bg-[#eef3ee]'}`} />

          <div className={`${style.creditsBadge} relative overflow-visible`}>
            {/* Floating rising numbers for coin wallet */}
            {floatingCoins.map(coinAnim => (
              <div
                key={coinAnim.id}
                className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-black text-sm text-emerald-500 animate-floatUp pointer-events-none drop-shadow-md z-40"
              >
                {coinAnim.text}
              </div>
            ))}
            <Coins size={14} className={theme === 'galaxy' ? 'text-[#c582ff]' : 'text-[#ffb5a7]'} />
            <span className={style.creditsLabel}>COINS:</span>
            <span className={style.creditsNum}>{credits}</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Panel Layout */}
      <div className="max-w-6xl w-full mx-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Flanked Chessboard Workspace (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          <div className={style.boardCard}>
            
            {/* Top Side: GEMMA AI Profile (Black Pieces) */}
            <div className={style.gemmaProfile}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#ffcad4] rounded-lg border-2 border-[#590d22] flex items-center justify-center font-bold text-center shadow-sm shrink-0">
                  <Cpu size={18} className="text-[#590d22]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${theme === 'galaxy' ? 'text-[#ecdfff]' : 'text-[#590d22]'}`}>Gemma 4 Opponent (Black)</span>
                    <span className="text-[10px] bg-[#ffe5ec] text-[#d90429] font-mono px-1.5 py-0.2 rounded-full font-bold">ARCADE</span>
                  </div>
                  
                  {/* Grayscale Colorless Defeated Trophies representing Black's captured pieces (White pieces) */}
                  <div className="flex items-center gap-1 mt-1 shrink-0">
                    <span className={`text-[9px] font-bold uppercase mr-1 ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#ffb3c1]'}`}>Trophies:</span>
                    {captured.w.length === 0 ? (
                      <span className="text-[9px] text-[#ccd5ae] italic">none</span>
                    ) : (
                      <div className="flex flex-wrap gap-0.5 max-w-[200px]">
                        {captured.w.map((p, idx) => (
                          <div key={idx} className="scale-65 shrink-0 w-5 h-5 flex items-center justify-center">
                            <Piece type={p.type} color="w" isCaptured={true} size={16} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Black Timer Block */}
              <div 
                className={`py-1.5 px-3 rounded-lg border-2 font-mono text-center shrink-0 min-w-[100px] transition-cozy ${
                  isBlackActive ? style.clockActiveBlack : style.clockInactiveBlack
                }`}
              >
                <div className={`text-[9px] font-black uppercase text-center block ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#ff7b90]'}`}>CLOCK</div>
                {isAiThinking && game.turn() === 'b' ? (
                  <span className="text-[#ff7b90] font-mono text-[11px] font-black animate-blink block">Thinking...</span>
                ) : (
                  <span className={`${style.clockTextBlack} text-[16px] font-black font-mono block`}>
                    {formatTimerText(blackTime)}
                  </span>
                )}
              </div>
            </div>

            {/* The Central Cozy Chessboard */}
            <div className="relative w-full flex justify-center py-2 h-[410px] sm:h-[480px]">
              {gameActive ? (
                <div className={`w-full flex justify-center ${credits === 0 ? 'blur-sm opacity-30 select-none pointer-events-none' : ''} transition-all duration-300`}>
                  <ChessBoard
                    game={game}
                    theme={theme}
                    isFlipped={isFlipped}
                    playerColor={playerColor}
                    onMove={handlePlayerMove}
                    disabled={disabledBoard()}
                  />
                </div>
              ) : (
                /* GORGEOUS RETRO CABINET MODE SELECTION SCREEN */
                <div className={`w-full max-w-[440px] flex flex-col justify-between p-5 border-4 rounded-3xl shadow-2xl transition-all duration-300 overflow-y-auto custom-scrollbar select-none ${
                  theme === 'galaxy' 
                    ? 'bg-[#150d30] border-[#814df2] text-white shadow-[#523e8c]/40' 
                    : theme === 'neon' 
                    ? 'bg-[#fdf0f5] border-[#f4b5cc] text-[#590d22] shadow-[#ffcad4]/50'
                    : theme === 'light'
                    ? 'bg-neutral-50/95 border-[#cbd5e1] text-neutral-800 shadow-neutral-200'
                    : 'bg-[#fafcf7] border-[#95d5b2] text-[#1b4332] shadow-[#b7e4c7]/40'
                }`}>
                  {/* Title Bar */}
                  <div className="text-center pb-2 border-b-2 border-dashed border-current/20 flex flex-col items-center">
                    <span className="text-2xl animate-bounce">🕹️</span>
                    <h3 className="font-mono font-black text-sm uppercase tracking-widest mt-1">
                      CHESS CABINET DIRECTORY
                    </h3>
                    <p className="text-[9px] font-bold opacity-60 uppercase tracking-wider mt-0.5">
                      Secure custom settings to proceed
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-3 my-4">
                    {/* Game Mode */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">1. Play Mode:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSoundSafe(() => audio.select());
                            setLobbyMode('computer');
                          }}
                          className={`py-2 px-3 rounded-xl border-2 font-mono text-[10px] font-bold flex flex-col items-center gap-1 transition-all duration-250 ${
                            lobbyMode === 'computer'
                              ? theme === 'galaxy'
                                ? 'bg-[#523e8c] border-[#caaffc] text-white shadow-md'
                                : 'bg-[#eafaf1] border-[#1b4332] text-[#1b4332] font-black shadow-md'
                              : 'bg-white/45 border-transparent opacity-65 hover:opacity-90'
                          }`}
                        >
                          <span className="text-base">🤖</span>
                          <span>VS COMPUTER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSoundSafe(() => audio.select());
                            setLobbyMode('local');
                          }}
                          className={`py-2 px-3 rounded-xl border-2 font-mono text-[10px] font-bold flex flex-col items-center gap-1 transition-all duration-250 ${
                            lobbyMode === 'local'
                              ? theme === 'galaxy'
                                ? 'bg-[#523e8c] border-[#caaffc] text-white shadow-md'
                                : 'bg-[#eafaf1] border-[#1b4332] text-[#1b4332] font-black shadow-md'
                              : 'bg-white/45 border-transparent opacity-65 hover:opacity-90'
                          }`}
                        >
                          <span className="text-base">👥</span>
                          <span>1vs1 LOCAL</span>
                        </button>
                      </div>
                    </div>

                    {/* Difficulty and Color (Only shown if computer) */}
                    {lobbyMode === 'computer' && (
                      <>
                        {/* Difficulty */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">2. Difficulty Tier:</span>
                          <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                            <button
                              type="button"
                              onClick={() => {
                                playSoundSafe(() => audio.select());
                                setLobbyDifficulty('easy');
                              }}
                              className={`py-1.5 rounded-lg border text-center transition-all ${
                                lobbyDifficulty === 'easy'
                                  ? 'bg-[#fef3c7] border-amber-400 text-amber-950 font-black'
                                  : 'bg-white/45 border-transparent opacity-65'
                              }`}
                            >
                              🍦 EASY (30🪙)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSoundSafe(() => audio.select());
                                setLobbyDifficulty('intermediate');
                              }}
                              className={`py-1.5 rounded-lg border text-center transition-all ${
                                lobbyDifficulty === 'intermediate'
                                  ? 'bg-[#d1fae5] border-emerald-400 text-emerald-950 font-black'
                                  : 'bg-white/45 border-transparent opacity-65'
                              }`}
                            >
                              ⚡ MEDIUM (60🪙)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSoundSafe(() => audio.select());
                                setLobbyDifficulty('hard');
                              }}
                              className={`py-1.5 rounded-lg border text-center transition-all ${
                                lobbyDifficulty === 'hard'
                                  ? 'bg-[#fee2e2] border-rose-400 text-rose-950 font-black'
                                  : 'bg-white/45 border-transparent opacity-65'
                              }`}
                            >
                              🔥 HARD (100🪙)
                            </button>
                          </div>
                        </div>

                        {/* Player Color Team Side */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">3. Your Side Team:</span>
                          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                playSoundSafe(() => audio.select());
                                setLobbyColor('w');
                              }}
                              className={`py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                                lobbyColor === 'w'
                                  ? 'bg-neutral-100 border-neutral-700 text-neutral-900 font-extrabold'
                                  : 'bg-white/45 border-transparent opacity-65'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" />
                              WHITE (GO FIRST)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSoundSafe(() => audio.select());
                                setLobbyColor('b');
                              }}
                              className={`py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                                lobbyColor === 'b'
                                  ? 'bg-neutral-950 border-neutral-800 text-white font-extrabold'
                                  : 'bg-white/45 border-transparent opacity-65'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-750" />
                              BLACK (GO SECOND)
                            </button>
                          </div>
                        </div>

                        {/* Artificial Engine */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">4. AI Intelligence Router:</span>
                          <select
                            id="lobby-engine"
                            value={lobbyEngine}
                            onChange={(e) => {
                              playSoundSafe(() => audio.select());
                              setLobbyEngine(e.target.value as any);
                            }}
                            className={`w-full py-1 px-2.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all shadow-sm ${
                              theme === 'galaxy'
                                ? 'bg-[#1c123d] text-[#caaffc] border-[#523e8c]'
                                : 'bg-white border-neutral-200 text-[#3d5a5a]'
                            }`}
                          >
                            <option value="built-in">🟢 Built-in MiniMax CPU (Offline)</option>
                            <option value="gemini">🌌 Gemini Cloud Model Proxy (Online)</option>
                            <option value="lmstudio">🤖 Local Gemma 4 Model (LM Studio)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Launch Token Action */}
                  <div className="mt-4 pt-3 border-t border-dashed border-current/20 flex flex-col items-center">
                    {credits === 0 ? (
                      <p className="text-[10px] font-mono font-black text-rose-500 uppercase animate-pulse mb-2 text-center">
                        ⚠️ DEPOSIT ONE TOKEN BELOW TO COMMENCE MATCH
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLaunchMatch}
                        className={`cursor-pointer w-full text-center py-3 rounded-2xl font-mono text-[11px] font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-2 border-2 ${
                          theme === 'galaxy'
                            ? 'bg-[#c582ff] hover:bg-[#b061ff] text-[#150d30] border-white shadow-[0_0_15px_rgba(197,130,255,0.6)]'
                            : 'bg-[#ffcad4] hover:bg-[#ffb3c1] text-[#590d22] border-white shadow-md'
                        }`}
                      >
                        🕹️ START ARCADE BATTLE (-1 COIN)
                      </button>
                    )}
                    <div className="mt-2 text-[9px] font-mono opacity-50 flex items-center gap-1.5 justify-center">
                      <span>Token Balance: {credits} 🪙</span>
                      <span>•</span>
                      <span>Active Streak: {stats.winningStreak || 0} 🔥</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Locks / Add Credit Overlay (Only shown when credits is 0 and gameActive is true) */}
              {credits === 0 && gameActive && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme === 'galaxy' ? 'bg-[#0a051d]/95 border-[#523e8c]' : 'bg-white/90 border-[#fec5bb]'} rounded-2xl p-6 z-40 border-2 border-dashed max-w-[440px] mx-auto transition-all`}>
                  <div className="w-14 h-14 bg-[#fff0f3] text-[#ff7b90] rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm">
                    🪙
                  </div>
                  <p className={`font-mono text-xs font-black mb-2 uppercase tracking-wider ${theme === 'galaxy' ? 'text-[#d8cdff]' : 'text-[#590d22]'}`}>
                    DEPOSIT FREE COIN TO COMMENCE
                  </p>
                  <p className="font-mono text-[11px] text-[#caaffc] mb-4 text-center leading-relaxed">
                    Local cabinet requires free token injection. Click below to add credits instantly.
                  </p>
                  <button
                    type="button"
                    onClick={handleInsertCoin}
                    className="cursor-pointer font-mono text-xs font-black bg-[#fec5bb] hover:bg-[#ffcad4] text-[#590d22] border-2 border-white px-5 py-2.5 rounded-xl uppercase transition-all shadow-md btn-clicker"
                  >
                    🪙 Insert Free Token
                  </button>
                </div>
              )}

              {/* Game Forfeit Trigger screen */}
              {forfeitPlayer && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme === 'galaxy' ? 'bg-[#0a051d]/95 box-shadow-[0_0_20px_rgba(197,130,255,0.4)] border-[#c582ff]' : 'bg-white/90 border-[#ff7b90]'} rounded-2xl p-6 z-45 max-w-[440px] mx-auto border-2 animate-scaleIn`}>
                  <div className="text-3xl mb-3">🕒</div>
                  <h3 className={`font-mono font-black text-sm uppercase tracking-wider mb-1 ${theme === 'galaxy' ? 'text-white' : 'text-[#590d22]'}`}>
                    TIME FORFEIT OVERRIDE!
                  </h3>
                  <p className="text-xs text-[#8fa89b] mb-4 text-center">
                    {forfeitPlayer === 'w' ? 'White player' : 'Black player'} ran out of clock capacity (0:00). Game over!
                  </p>
                  <button
                    type="button"
                    onClick={handleResetMatch}
                    className="cursor-pointer bg-[#b7e4c7] text-[#1b4332] font-semibold text-xs py-2 px-4 rounded-xl border border-white shadow-sm hover:bg-[#95d5b2] btn-clicker"
                  >
                    Load New Matrix
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Side: HUMAN PLAYER 1 Profile (White Pieces) */}
            <div className={style.userProfile}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#b7e4c7] rounded-lg border-2 border-[#1b4332] flex items-center justify-center font-bold text-center shadow-sm shrink-0">
                  <User size={18} className="text-[#1b4332]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${theme === 'galaxy' ? 'text-[#ecdfff]' : 'text-[#1b4332]'}`}>Player 1 Human (White)</span>
                    <span className="text-[9px] bg-[#e8f5e9] text-[#2e7d32] font-mono px-1.5 py-0.2 rounded-full font-bold">P1_USER</span>
                  </div>

                  {/* Grayscale Colorless Defeated Trophies representing White's captured pieces (Black pieces) */}
                  <div className="flex items-center gap-1 mt-1 shrink-0">
                    <span className={`text-[9px] font-bold uppercase mr-1 ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#95d5b2]'}`}>Trophies:</span>
                    {captured.b.length === 0 ? (
                      <span className="text-[9px] text-[#ccd5ae] italic">none</span>
                    ) : (
                      <div className="flex flex-wrap gap-0.5 max-w-[200px]">
                        {captured.b.map((p, idx) => (
                          <div key={idx} className="scale-65 shrink-0 w-5 h-5 flex items-center justify-center">
                            <Piece type={p.type} color="b" isCaptured={true} size={16} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* White Timer Block */}
              <div 
                className={`py-1.5 px-3 rounded-lg border-2 font-mono text-center shrink-0 min-w-[100px] transition-cozy ${
                  isWhiteActive ? style.clockActiveWhite : style.clockInactiveWhite
                }`}
              >
                <div className={`text-[9px] font-black uppercase text-center block ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#8fa89b]'}`}>CLOCK</div>
                <span className={`${style.clockTextWhite} text-[16px] font-black font-mono block`}>
                  {formatTimerText(whiteTime)}
                </span>
              </div>
            </div>

            {/* Centered Minimalist Controls directly below the board */}
            <div className={`mt-4 pt-4 border-t ${theme === 'galaxy' ? 'border-[#3c2a68]' : 'border-[#f1f6f1]'} grid grid-cols-3 gap-3`}>
              {/* NEW MATCH button */}
              <button
                type="button"
                onClick={handleNewMatch}
                className={style.controlNewMatch}
              >
                <Play size={14} />
                NEW MATCH
              </button>

              {/* PAUSE button */}
              <button
                type="button"
                onClick={handleTogglePause}
                disabled={!gameActive || forfeitPlayer !== null}
                className={style.controlPause}
              >
                <Pause size={14} />
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>

              {/* RESET button */}
              <button
                type="button"
                onClick={handleResetMatch}
                className={style.controlReset}
              >
                <RotateCcw size={14} />
                RESET BOARD
              </button>
            </div>
          </div>

          {/* Aesthetic Speech Bubble Bar */}
          <div className={style.announcer}>
            {isAiThinking ? (
              <span className="flex items-center gap-2 text-[#ff7b90] animate-pulse font-black uppercase tracking-widest text-[11px]">
                 ✨ Gemma 4 is thinking...
              </span>
            ) : (
              <p className="leading-snug">
                💬 <span className={`font-bold ${theme === 'galaxy' ? 'text-[#ecdfff]' : 'text-[#2d3a33]'}`}>ANNOUNCER:</span> <span className="italic">"{aiSpeechLine}"</span>
              </p>
            )}
          </div>

        </section>

        {/* Right Panel: Stats Ledger / Config Panel (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-4 self-stretch">
          
          {/* Custom Tabs Navigation (DASHBOARD vs AI OPPONENT) */}
          <div className={style.tabContainer}>
            <button
              type="button"
              onClick={() => {
                playSoundSafe(() => audio.select());
                setActiveTab('scores');
              }}
              className={`flex-1 text-center py-2.5 rounded-lg transition-all duration-300 font-bold cursor-pointer ${
                activeTab === 'scores' ? style.tabScoresActive : style.tabInactive
              }`}
            >
              📊 Stats Ledger
            </button>
            <button
              type="button"
              onClick={() => {
                playSoundSafe(() => audio.select());
                setActiveTab('cpu_rules');
              }}
              className={`flex-1 text-center py-2.5 rounded-lg transition-all duration-300 font-bold cursor-pointer ${
                activeTab === 'cpu_rules' ? style.tabCpuActive : style.tabInactive
              }`}
            >
              ⚙️ AI Opponent
            </button>
          </div>

          {/* Pane Section */}
          <div className="flex-1 flex flex-col justify-start">
            {activeTab === 'scores' ? (
              <Dashboard
                game={game}
                theme={theme}
                stats={stats}
                onClearStats={handleClearStats}
                quickestCheckmate={quickestCheckmate}
                coins={credits}
                difficulty={aiConfig.difficulty}
              />
            ) : (
              <div className={`${style.card} rounded-2xl p-5 min-h-[460px]`}>
                <AIConfig
                  config={aiConfig}
                  onChange={setAiConfig}
                  apiLogs={apiLogs}
                  onClearLogs={handleClearLogs}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Retro bottom accessory floor row */}
      <footer className={`mt-6 max-w-6xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t-2 ${theme === 'galaxy' ? 'border-[#3c2a68]' : 'border-[#eef3ee]'} items-center`}>
        
        {/* Play Side setup */}
        <div className={style.footerItem}>
          <label htmlFor="play-side-chooser" className={style.footerLabel}>HUMAN SIDE:</label>
          <select
            id="play-side-chooser"
            value={playerColor}
            onChange={(e) => {
              playSoundSafe(() => audio.select());
              setPlayerColor(e.target.value as any);
            }}
            className={style.footerSelect}
          >
            <option value="w">WHITE PIECES (P1)</option>
            <option value="b">BLACK PIECES (P1)</option>
            <option value="both">CO-OP MANUAL (LOBBY)</option>
          </select>
        </div>

        {/* Board decal chooser */}
        <button
          type="button"
          onClick={() => {
            playSoundSafe(() => audio.select());
            setTheme(prev => {
              if (prev === 'light') return 'classic';
              if (prev === 'classic') return 'neon';
              if (prev === 'neon') return 'galaxy';
              if (prev === 'galaxy') return 'dark';
              return 'light';
            });
          }}
          className={style.footerBtn}
        >
          <span className={style.footerBtnLabel}>BOARD DECAL:</span>
          <span className={style.footerBtnVal}>
            {theme === 'light' ? '⚪ PROFESSIONAL LIGHT' : theme === 'classic' ? '💚 COZY SAGE GREEN' : theme === 'neon' ? '💜 PASTEL LAVENDER' : theme === 'galaxy' ? '🌌 BLACK GALAXY' : '⚫ INDUSTRIAL DARK'}
          </span>
        </button>

        {/* Camera perspective flip */}
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className={style.footerBtn}
        >
          <span className={style.footerBtnLabel}>PERSPECTIVE:</span>
          <span className={style.footerBtnVal}>
            {isFlipped ? 'REVERSED GRID' : 'DEFAULT GRID'}
          </span>
        </button>

        {/* Credit Booster button */}
        <button
          type="button"
          onClick={handleInsertCoin}
          className={theme === 'galaxy'
            ? "cursor-pointer font-bold text-center py-3 bg-[#1c0e35] hover:bg-[#28154c] text-[#ecdfff] border-2 border-[#814df2]/60 rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-lg btn-clicker"
            : "cursor-pointer font-bold text-center py-3 bg-[#fffbf4] hover:bg-[#fcf6eb] text-[#8e5241] border-2 border-[#fec5bb]/40 rounded-xl text-xs transition-all flex flex-col items-center justify-center shadow-sm btn-clicker"
          }
        >
          <span className={theme === 'galaxy' ? "text-[#caaffc] font-extrabold uppercase tracking-widest block" : "text-[9px] text-[#ffb5a7] font-extrabold uppercase tracking-widest block"}>🪙 INSERT COIN</span>
          <span className={theme === 'galaxy' ? "font-black text-xs mt-0.5 text-white" : "font-black text-xs mt-0.5 text-[#590d22]"}>ADD FREE CREDIT (+3)</span>
        </button>

      </footer>

      {/* Tiny clean footer */}
      <footer className="mt-6 text-center text-[#ccd5ae] font-mono text-[9px] space-y-1">
        <p>⚡ CAB-MODEL: GEMMA-4-COZY-ARCADE // PORT 3000 CONSOLE MATRIX SECURED ⚡</p>
        <p>© 1988 GEMA SOFTWORKS INC. ALL MOVE REGISTERS AND HIGH SCORES SECURED IN CABINET READINGS.</p>
      </footer>
    </div>
  );
}
