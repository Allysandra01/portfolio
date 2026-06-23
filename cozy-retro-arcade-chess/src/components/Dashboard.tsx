import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Trophy, ScrollText, Medal, Sparkles, Coins, Flame, Award, Gamepad2, Compass, Percent, RefreshCw } from 'lucide-react';

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  winningStreak: number;
  highestStreak: number;
}

interface DashboardProps {
  game: Chess;
  theme: 'neon' | 'classic' | 'light' | 'galaxy' | 'dark';
  stats: GameStats;
  onClearStats: () => void;
  quickestCheckmate: number | null;
  coins?: number;
  difficulty?: 'easy' | 'intermediate' | 'hard';
}

export const Dashboard: React.FC<DashboardProps> = ({
  game,
  theme,
  stats,
  onClearStats,
  quickestCheckmate,
  coins = 0,
  difficulty = 'intermediate'
}) => {
  const [activeTab, setActiveTab] = useState<'moves' | 'stats' | 'scores'>('stats');

  const getMovePairs = () => {
    const history = game.history({ verbose: true });
    const pairs: Array<{ white: string; black?: string; num: number }> = [];

    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: history[i].san,
        black: history[i + 1]?.san,
      });
    }
    return pairs;
  };

  const pairs = getMovePairs();

  // Stats Calculations
  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : '0.0';

  // Base rewards configuration
  const baseReward = difficulty === 'easy' ? 30 : difficulty === 'intermediate' ? 60 : 100;
  const activeStreak = stats.winningStreak || 0;
  // +25 per streak level (only computed on next streak increment, but we can preview it clearly!)
  const streakBonusNext = activeStreak * 25; 
  const totalNextReward = baseReward + streakBonusNext;

  return (
    <div id="player-dashboard-root" className={`flex flex-col h-full bg-white rounded-2xl p-5 border-2 border-[#e6ebe6] shadow-cozy min-h-[480px] transition-all duration-300 ${
      theme === 'galaxy' ? 'bg-[#150d30] border-[#523e8c]/60 text-white' : 
      theme === 'dark' ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : ''
    }`}>
      {/* Aesthetic Header */}
      <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
        theme === 'galaxy' ? 'border-[#523e8c]/40' : 
        theme === 'dark' ? 'border-neutral-800' : 'border-[#f1f6f1]'
      }`}>
        <h2 className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
          <Gamepad2 className={`h-4 w-4 ${theme === 'galaxy' ? 'text-[#c582ff]' : theme === 'dark' ? 'text-[#a78bfa]' : 'text-[#ffcad4]'}`} />
          <span>ARCADE DATA CABINET</span>
        </h2>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
          theme === 'galaxy' ? 'bg-[#523e8c] text-[#ecdfff]' : 
          theme === 'dark' ? 'bg-neutral-800 text-neutral-300' : 'bg-[#fff5f5] text-[#ff7b90]'
        }`}>
          ARCADE_SAV.DAT
        </span>
      </div>

      {/* Styled Tabs Selector - 3 Tabs */}
      <div className={`flex p-1 rounded-xl mb-4 border ${
        theme === 'galaxy' ? 'bg-[#1a113a] border-[#523e8c]/50' : 
        theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-[#fdfbf7] border-[#eef3ee]'
      }`}>
        <button
          id="tab-btn-stats"
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tight ${
            activeTab === 'stats'
              ? theme === 'galaxy'
                ? 'bg-[#523e8c] text-white shadow-md'
                : theme === 'dark'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                : 'bg-white text-[#1b4332] shadow-sm ring-1 ring-black/5'
              : 'text-[#8fa89b] hover:text-[#5b6c5d]'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Dashboard
        </button>

        <button
          id="tab-btn-moves"
          type="button"
          onClick={() => setActiveTab('moves')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tight ${
            activeTab === 'moves'
              ? theme === 'galaxy'
                ? 'bg-[#523e8c] text-white shadow-md'
                : theme === 'dark'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                : 'bg-white text-[#1b4332] shadow-sm ring-1 ring-black/5'
              : 'text-[#8fa89b] hover:text-[#5b6c5d]'
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Move Log ({game.history().length})
        </button>

        <button
          id="tab-btn-scores"
          type="button"
          onClick={() => setActiveTab('scores')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tight ${
            activeTab === 'scores'
              ? theme === 'galaxy'
                ? 'bg-[#523e8c] text-white shadow-md'
                : theme === 'dark'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                : 'bg-white text-[#1b4332] shadow-sm ring-1 ring-black/5'
              : 'text-[#8fa89b] hover:text-[#5b6c5d]'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          Trophies
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'stats' && (
          <div className="flex flex-col flex-1 justify-between min-h-0 space-y-3">
             {/* Bento-style Grid of Stats Tiles */}
            <div className="grid grid-cols-2 gap-2">
              {/* Tile 1: Coins Wallet */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm ${
                theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c]/50' : 
                theme === 'dark' ? 'bg-[#1f1f23] border-neutral-800' : 'bg-[#fffdf5] border-[#fde68a]'
              }`}>
                <div className="w-8 h-8 rounded-lg bg-amber-100/10 flex items-center justify-center text-base shadow-inner shrink-0">
                  🪙
                </div>
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    theme === 'galaxy' ? 'text-[#caaffc]' : 
                    theme === 'dark' ? 'text-neutral-400' : 'text-amber-700'
                  }`}>Wallet Coins</span>
                  <span className={`text-sm font-black block mt-0.5 ${
                    theme === 'galaxy' ? 'text-white' : 
                    theme === 'dark' ? 'text-white' : 'text-amber-950'
                  }`}>{coins} 🪙</span>
                </div>
              </div>

              {/* Tile 2: Hot Win Streak */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm ${
                theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c]/50' : 
                theme === 'dark' ? 'bg-[#1f1f23] border-neutral-800' : 'bg-[#fff8f6] border-[#fec5bb]'
              }`}>
                <div className="w-8 h-8 rounded-lg bg-orange-100/10 flex items-center justify-center text-base shadow-inner shrink-0">
                  🔥
                </div>
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    theme === 'galaxy' ? 'text-[#caaffc]' : 
                    theme === 'dark' ? 'text-neutral-400' : 'text-orange-700'
                  }`}>Cur Streak</span>
                  <span className={`text-sm font-black block mt-0.5 ${
                    theme === 'galaxy' ? 'text-white' : 
                    theme === 'dark' ? 'text-white' : 'text-orange-950'
                  }`}>{activeStreak} Wins</span>
                </div>
              </div>

              {/* Tile 3: Best Streak Record */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm ${
                theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c]/50' : 
                theme === 'dark' ? 'bg-[#1f1f23] border-neutral-800' : 'bg-[#fcf8fa] border-[#ffccd5]'
              }`}>
                <div className="w-8 h-8 rounded-lg bg-pink-100/10 flex items-center justify-center text-base shadow-inner shrink-0">
                  🏆
                </div>
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    theme === 'galaxy' ? 'text-[#caaffc]' : 
                    theme === 'dark' ? 'text-neutral-400' : 'text-pink-700'
                  }`}>Best Streak</span>
                  <span className={`text-sm font-black block mt-0.5 ${
                    theme === 'galaxy' ? 'text-white' : 
                    theme === 'dark' ? 'text-white' : 'text-pink-950'
                  }`}>{stats.highestStreak} Wins</span>
                </div>
              </div>

              {/* Tile 4: Dynamic Win Rate */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm ${
                theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c]/50' : 
                theme === 'dark' ? 'bg-[#1f1f23] border-neutral-800' : 'bg-[#f0fdf4] border-[#b7e4c7]'
              }`}>
                <div className="w-8 h-8 rounded-lg bg-green-100/10 flex items-center justify-center text-sm font-bold text-green-700 shadow-inner shrink-0">
                  %
                </div>
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    theme === 'galaxy' ? 'text-[#caaffc]' : 
                    theme === 'dark' ? 'text-neutral-400' : 'text-green-700'
                  }`}>Win Rate</span>
                  <span className={`text-sm font-black block mt-0.5 ${
                    theme === 'galaxy' ? 'text-white' : 
                    theme === 'dark' ? 'text-white' : 'text-green-950'
                  }`}>{winRate}%</span>
                </div>
              </div>
            </div>

            {/* Individual Records Sub-Grid */}
            <div className={`p-3 rounded-lg border grid grid-cols-4 gap-2 text-center ${
              theme === 'galaxy' ? 'bg-[#1a113a]/40 border-[#523e8c]/30' : 
              theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50/70 border-neutral-150'
            }`}>
              <div>
                <span className="text-[8px] text-neutral-400 font-bold uppercase block">Games</span>
                <span className="text-xs font-extrabold mt-0.5 block">{totalGames}</span>
              </div>
              <div>
                <span className="text-[8px] text-green-500 font-bold uppercase block">Wins</span>
                <span className="text-xs font-extrabold mt-0.5 block text-green-600">{stats.wins}</span>
              </div>
              <div>
                <span className="text-[8px] text-red-500 font-bold uppercase block">Losses</span>
                <span className="text-xs font-extrabold mt-0.5 block text-red-550">{stats.losses}</span>
              </div>
              <div>
                <span className="text-[8px] text-blue-400 font-bold uppercase block">Draws</span>
                <span className="text-xs font-extrabold mt-0.5 block text-blue-500">{stats.draws}</span>
              </div>
            </div>

            {/* Tile 5: Reward Value Predictor */}
            <div className={`p-3.5 rounded-xl border-2 border-dashed flex flex-col justify-between ${
              theme === 'galaxy' ? 'bg-[#1a113a] border-[#523e8c]' : 
              theme === 'dark' ? 'bg-[#1a1a1e] border-neutral-800' : 'bg-[#fdfbf7] border-[#cbd5e1]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider block">Reward Preview</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  theme === 'dark' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                }`}>READY</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                Win your next match to claim base Coins + Streak combo bonuses:
              </p>
              <div className="grid grid-cols-3 gap-1 mt-2 text-center font-mono">
                <div className="bg-amber-50/10 p-1 rounded border border-amber-500/20 text-[9px] text-amber-500">
                  <span className="block font-bold">Easy</span>
                  <span className="font-extrabold">30 🪙</span>
                </div>
                <div className="bg-emerald-50/10 p-1 rounded border border-emerald-500/20 text-[9px] text-emerald-500">
                  <span className="block font-bold">Medium</span>
                  <span className="font-extrabold">60 🪙</span>
                </div>
                <div className="bg-rose-50/10 p-1 rounded border border-rose-500/20 text-[9px] text-rose-500">
                  <span className="block font-bold">Hard</span>
                  <span className="font-extrabold">100 🪙</span>
                </div>
              </div>
              {activeStreak > 0 && (
                <div className={`mt-2 text-[9px] font-bold text-center py-1 rounded ${
                  theme === 'dark' ? 'bg-emerald-950/25 text-emerald-400' : 'text-emerald-500 bg-emerald-50/20'
                }`}>
                  🔥 Active Streak Bonus: +{streakBonusNext} bonus coins (25 × {activeStreak})
                </div>
              )}
            </div>

            {/* Reset Stats Panel Trigger */}
            <button
              id="reset-stats-btn"
              type="button"
              onClick={onClearStats}
              className={`cursor-pointer w-full py-2 rounded-xl uppercase font-bold text-[9px] tracking-wider transition-all duration-200 shadow-sm ${
                theme === 'dark'
                  ? 'bg-red-950/30 hover:bg-red-900/40 border border-red-900/60 text-red-400 active:scale-95'
                  : 'bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 text-red-600'
              }`}
            >
              Reset Cabinet Statistics
            </button>
          </div>
        )}

        {activeTab === 'moves' && (
          <div className="flex flex-col flex-1 min-h-0">
            {pairs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-[#fcf6eb] flex items-center justify-center text-xl mb-2">
                  ♟️
                </div>
                <p className="text-[#a3b18a] text-xs font-medium">Awaiting first move input...</p>
                <p className="text-[#c4d1c4] text-[10px] mt-1 max-w-[200px]">Moves will record in real-time once you drag a piece.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar max-h-[350px]">
                <div className="grid grid-cols-1 gap-1">
                  {pairs.map((pair) => (
                    <div
                      key={pair.num}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#fffcf7] border border-transparent hover:border-[#fcf6eb] transition-all text-xs font-mono"
                    >
                      {/* Move number badge */}
                      <span className="text-[#ccd5ae] font-bold w-8">{pair.num}.</span>
                      
                      {/* P1 move (White/Mint) */}
                      <div className="flex-1 flex items-center gap-1.5 justify-start">
                        <span className="w-2 h-2 rounded-full bg-[#b7e4c7]" />
                        <span className={`font-bold ${theme === 'galaxy' ? 'text-white' : 'text-[#3d5a5a]'}`}>{pair.white}</span>
                      </div>

                      {/* AI move (Black/Pink) */}
                      <div className="flex-1 flex items-center gap-1.5 justify-end">
                        {pair.black ? (
                          <>
                            <span className="text-[#a3cbc4] font-semibold">{pair.black}</span>
                            <span className="w-2 h-2 rounded-full bg-[#ffcad4]" />
                          </>
                        ) : (
                          <span className="text-[#c4d1c4] italic text-[10px]">thinking...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="flex flex-col flex-1 min-h-0 justify-between">
            {/* Quickest Checkmate container */}
            <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm relative overflow-hidden border-2 ${
              theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c] text-white' : 
              theme === 'dark' ? 'bg-[#1a1a1e] border-neutral-800 text-neutral-100 shadow-none' : 'bg-[#fffbf4] border-[#fec5bb]'
            }`}>
              <div className="absolute right-[-10px] top-[-10px] rotate-12 opacity-5 text-[#ffcad4]">
                <Trophy size={80} />
              </div>

              <div className="w-10 h-10 bg-rose-100/10 rounded-xl flex items-center justify-center text-lg text-[#ff7b90] shadow-inner shrink-0">
                👑
              </div>

              <div className="flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1 ${
                  theme === 'galaxy' || theme === 'dark' ? 'text-neutral-400' : 'text-[#8e5241]'
                }`}>
                  <Sparkles size={10} className="text-[#fec5bb]" />
                  Quickest Checkmate
                </span>
                <span className={`text-xs font-black block mt-0.5 ${
                  theme === 'galaxy' ? 'text-[#c582ff]' : 
                  theme === 'dark' ? 'text-neutral-200' : 'text-[#1b3024]'
                }`}>
                  {quickestCheckmate !== null 
                    ? `${quickestCheckmate} moves! (${Math.ceil(quickestCheckmate / 2)} full rounds)`
                    : 'No checkmate win archived yet'
                  }
                </span>
              </div>
            </div>

            <div className={`text-center p-6 rounded-xl border mt-3 ${
              theme === 'galaxy' ? 'bg-[#120a28]/60 border-[#523e8c]/30 text-[#caaffc]' : 
              theme === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-[#f8faf8] border-[#cbd5e1] text-[#2d3d3d]'
            }`}>
              <Compass className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-[10px] leading-relaxed">
                Unlock high score entries by defeating the CPU opponent on Medium or Grandmaster Hard tier in minimum turns!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
