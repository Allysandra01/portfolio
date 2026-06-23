import React, { useState } from 'react';
import { Sparkles, Check, HelpCircle, Terminal, RotateCcw, AlertTriangle, Cpu, Globe, Sliders } from 'lucide-react';

export type AIEngine = 'lmstudio' | 'built-in' | 'gemini';

export interface AIConfigState {
  engine: AIEngine;
  lmStudioUrl: string;
  lmStudioModel: string;
  minimaxDepth: number;
  geminiModel: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  customPrompt: string;
}

interface AIConfigProps {
  config: AIConfigState;
  onChange: (newConfig: AIConfigState) => void;
  apiLogs: Array<{ timestamp: string; type: 'info' | 'sent' | 'received' | 'error'; text: string }>;
  onClearLogs: () => void;
  theme?: 'neon' | 'classic' | 'light' | 'galaxy' | 'dark';
}

export const AIConfig: React.FC<AIConfigProps> = ({
  config,
  onChange,
  apiLogs,
  onClearLogs,
  theme = 'classic'
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');

  const updateConfig = (key: keyof AIConfigState, value: any) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleDifficultyChange = (level: 'easy' | 'intermediate' | 'hard') => {
    let depth = 2;
    if (level === 'easy') depth = 1;
    if (level === 'hard') depth = 3;

    onChange({
      ...config,
      difficulty: level,
      minimaxDepth: depth
    });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(`${config.lmStudioUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      if (response.ok) {
        setTestStatus('online');
      } else {
        setTestStatus('offline');
      }
    } catch {
      setTestStatus('offline');
    }
  };

  const handleResetPrompt = () => {
    const defaultPrompt = `You are Gemma-4, a retro arcade chess cabinet AI playing as BLACK.
Choose exactly ONE legal chess move. Do not make illegal actions.
Response MUST be a JSON object:
{"move": "e7e5", "reasoning": "Slightly robotic arcade game commentary (max 12 words)"}`;
    updateConfig('customPrompt', defaultPrompt);
  };

  return (
    <div className="flex flex-col gap-5 text-xs font-mono h-full justify-between">
      
      {/* 1. System core choice & Levels */}
      <div className={`p-4.5 rounded-xl border-2 shadow-sm ${
        theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c] text-white' :
        theme === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-100' :
        'bg-white border-[#1b4332] text-neutral-800'
      }`}>
        <div className={`flex items-center gap-2 border-b pb-2.5 mb-3.5 ${
          theme === 'galaxy' ? 'border-[#523e8c]/30' :
          theme === 'dark' ? 'border-neutral-800' : 'border-[#eef3ee]'
        }`}>
          <Cpu className={`h-4 w-4 ${
            theme === 'galaxy' ? 'text-[#c582ff]' :
            theme === 'dark' ? 'text-neutral-400' : 'text-[#1b4332]'
          }`} />
          <h3 className={`font-extrabold uppercase tracking-wide text-xs ${
            theme === 'galaxy' ? 'text-[#c582ff]' :
            theme === 'dark' ? 'text-neutral-200' : 'text-[#1b4332]'
          }`}>
            GAME DECISION CORES
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Retro Minimax Local Engine */}
          <button
            type="button"
            id="selector-btn-builtin"
            onClick={() => updateConfig('engine', 'built-in')}
            className={`cursor-pointer p-2.5 border-2 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition-all select-none ${
              config.engine === 'built-in'
                ? 'border-[#1b4332] bg-[#eafaf1] text-[#1b4332] font-black'
                : 'border-[#eef3ee] bg-[#fdfbf7] text-[#8fa89b] hover:border-[#1b4332] hover:text-[#5b6c5d]'
            }`}
          >
            <span className="text-[10px] font-black tracking-tight">LOCAL CPU</span>
            <span className="text-[8px] opacity-80 uppercase font-bold px-1.5 py-0.2 bg-[#fffbf4] border border-[#fec5bb]/40 rounded">Local MS</span>
          </button>

          {/* LM Studio */}
          <button
            type="button"
            id="selector-btn-lmstudio"
            onClick={() => updateConfig('engine', 'lmstudio')}
            className={`cursor-pointer p-2.5 border-2 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition-all select-none ${
              config.engine === 'lmstudio'
                ? 'border-[#ff7b90] bg-[#fff0f3] text-[#590d22] font-black'
                : 'border-[#eef3ee] bg-[#fdfbf7] text-[#8fa89b] hover:border-[#ff7b90] hover:text-[#590d22]'
            }`}
          >
            <span className="text-[10px] font-black tracking-tight">LM STUDIO</span>
            <span className="text-[8px] opacity-80 uppercase font-bold px-1.5 py-0.2 bg-[#ffe5ec] border border-[#ffcad4]/60 rounded">Gemma 4b</span>
          </button>

          {/* Cloud AI Gemini Router */}
          <button
            type="button"
            id="selector-btn-gemini"
            onClick={() => updateConfig('engine', 'gemini')}
            className={`cursor-pointer p-2.5 border-2 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition-all select-none ${
              config.engine === 'gemini'
                ? 'border-[#b19ffb] bg-[#f3f0ff] text-[#3b11ab] font-black'
                : 'border-[#eef3ee] bg-[#fdfbf7] text-[#8fa89b] hover:border-[#b19ffb] hover:text-[#3b11ab]'
            }`}
          >
            <span className="text-[10px] font-black tracking-tight">CLOUDBOT</span>
            <span className="text-[8px] opacity-80 uppercase font-bold px-1.5 py-0.2 bg-[#f3f0ff] border border-[#e5dbff] rounded">Gemini</span>
          </button>
        </div>
      </div>

      {/* 2. LEVEL SELECTOR SECTION */}
      <div className={`p-4.5 rounded-xl border-2 shadow-sm ${
        theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c] text-white' :
        theme === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-100' :
        'bg-white border-[#1b4332] text-neutral-800'
      }`}>
        <div className={`flex items-center gap-2 border-b pb-2.5 mb-3.5 ${
          theme === 'galaxy' ? 'border-[#523e8c]/30' :
          theme === 'dark' ? 'border-neutral-800' : 'border-[#eef3ee]'
        }`}>
          <Sliders className={`h-4 w-4 ${
            theme === 'galaxy' ? 'text-[#c582ff]' :
            theme === 'dark' ? 'text-neutral-400' : 'text-[#1b4332]'
          }`} />
          <h3 className={`font-extrabold uppercase tracking-wide text-xs ${
            theme === 'galaxy' ? 'text-[#c582ff]' :
            theme === 'dark' ? 'text-neutral-200' : 'text-[#1b4332]'
          }`}>
            CPU DIFFICULTY LEVEL
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Easy Button */}
          <button
            type="button"
            id="difficulty-btn-easy"
            onClick={() => handleDifficultyChange('easy')}
            className={`cursor-pointer py-2.5 font-bold border rounded-lg text-[10px] uppercase transition-all ${
              config.difficulty === 'easy'
                ? theme === 'galaxy'
                  ? 'bg-[#523e8c] text-white border-white'
                  : theme === 'dark'
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-[#eafaf1] text-[#2e7d32] border-[#2e7d32] font-black'
                : 'bg-[#fdfbf7] dark:bg-neutral-950 border-[#eef3ee] dark:border-neutral-800 text-[#8fa89b] hover:border-[#2e7d32]'
            }`}
          >
            🟢 Easy
          </button>

          {/* Intermediate Button */}
          <button
            type="button"
            id="difficulty-btn-intermediate"
            onClick={() => handleDifficultyChange('intermediate')}
            className={`cursor-pointer py-2.5 font-bold border rounded-lg text-[10px] uppercase transition-all ${
              config.difficulty === 'intermediate'
                ? theme === 'galaxy'
                  ? 'bg-[#523e8c] text-white border-white'
                  : theme === 'dark'
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-[#fff9ea] text-[#b7791f] border-[#b7791f] font-black'
                : 'bg-[#fdfbf7] dark:bg-neutral-950 border-[#eef3ee] dark:border-neutral-800 text-[#8fa89b] hover:border-[#b7791f]'
            }`}
          >
            🟡 Intermediate
          </button>

          {/* Hard Button */}
          <button
            type="button"
            id="difficulty-btn-hard"
            onClick={() => handleDifficultyChange('hard')}
            className={`cursor-pointer py-2.5 font-bold border rounded-lg text-[10px] uppercase transition-all ${
              config.difficulty === 'hard'
                ? theme === 'galaxy'
                  ? 'bg-[#523e8c] text-white border-white'
                  : theme === 'dark'
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-[#fff0f3] text-[#c92040] border-[#c92040] font-black'
                : 'bg-[#fdfbf7] dark:bg-neutral-950 border-[#eef3ee] dark:border-neutral-800 text-[#8fa89b] hover:border-[#c92040]'
            }`}
          >
            🔴 Hard
          </button>
        </div>

        <div className={`mt-2.5 text-[9.5px] leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-[#8fa89b]'}`}>
          {config.difficulty === 'easy' && 'Easy Mode: Search depth restricted to 1 ply or AI behaves casually.'}
          {config.difficulty === 'intermediate' && 'Intermediate Mode: Solid positional tactics at minimax depth 2.'}
          {config.difficulty === 'hard' && 'Hard Mode: Multi-turn evaluation depth 3. Strict grandmaster patterns enabled.'}
        </div>
      </div>

      {/* 3. INTERACTIVE SYSTEM PROMPT EDITOR */}
      <div className={`p-4.5 rounded-xl border-2 shadow-sm ${
        theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c] text-white' :
        theme === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-100' :
        'bg-white border-[#1b4332] text-neutral-800'
      }`}>
        <div className={`flex items-center justify-between border-b pb-2.5 mb-3.5 ${
          theme === 'galaxy' ? 'border-[#523e8c]/30' :
          theme === 'dark' ? 'border-neutral-800' : 'border-[#eef3ee]'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ff7b90]" />
            <h3 className={`font-extrabold uppercase tracking-wide text-xs ${
              theme === 'galaxy' ? 'text-[#c582ff]' :
              theme === 'dark' ? 'text-neutral-200' : 'text-[#1b4332]'
            }`}>
              AI INSTRUCTION PROMPT
            </h3>
          </div>
          <button
            type="button"
            id="reset-prompt-btn"
            onClick={handleResetPrompt}
            className="cursor-pointer text-[9px] text-[#ff7b90] hover:text-[#d90429] font-black flex items-center gap-1 uppercase"
            title="Reset Prompt to Default"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            RESET
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="custom-prompt-editor" className={`text-[9px] font-bold block p-1.5 rounded border ${
            theme === 'galaxy' ? 'bg-[#150d30] border-[#523e8c]/30 text-neutral-300' :
            theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-neutral-300' :
            'bg-[#fffcf7] border-[#eef3ee] text-[#5b6c5d]'
          }`}>
            Configure the direct system instruction sent to Gemma-4 or Cloud Gemini Router below:
          </label>
          <textarea
            id="custom-prompt-editor"
            value={config.customPrompt}
            onChange={(e) => updateConfig('customPrompt', e.target.value)}
            className={`w-full p-2.5 h-[90px] text-[10px] leading-relaxed outline-none font-mono rounded-lg resize-none shadow-inner custom-scrollbar select-text ${
              theme === 'galaxy' ? 'bg-[#150d30] border-[#ccd5ae]/20 text-white focus:border-[#c582ff]' :
              theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-neutral-600' :
              'bg-[#fdfbf7] border-[#ccd5ae]/60 text-[#2d3a33] focus:border-[#1b4332]'
            }`}
            placeholder="System Prompt Instructions..."
          />
          <span className="text-[8px] text-[#a3b18a] leading-tight block">
            🔒 System automatically locks candidate output in JSON format with <span className="font-bold font-mono">{"{ \"move\": \"e7e5\" }"}</span>.
          </span>
        </div>
      </div>

      {/* 4. ENGINE CONNECTIVITY & LOGS */}
      <div className={`p-4.5 rounded-xl border-2 shadow-sm ${
        theme === 'galaxy' ? 'bg-[#1b123d] border-[#523e8c] text-white' :
        theme === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-100' :
        'bg-white border-[#1b4332] text-neutral-800'
      }`}>
        {config.engine === 'lmstudio' && (
          <div className="flex flex-col gap-3">
            <div className={`flex items-center justify-between border-b pb-2 mb-1 ${
              theme === 'galaxy' ? 'border-[#523e8c]/30' :
              theme === 'dark' ? 'border-neutral-800' : 'border-[#eef3ee]'
            }`}>
              <span className={`font-bold text-[11px] uppercase ${
                theme === 'galaxy' ? 'text-[#caaffc]' :
                theme === 'dark' ? 'text-neutral-300' : 'text-[#5b6c5d]'
              }`}>Gemma Port Connection</span>
              <span className={`h-2 w-2 rounded-full ${
                testStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                testStatus === 'offline' ? 'bg-rose-500' :
                testStatus === 'testing' ? 'bg-amber-400 animate-ping' : 'bg-[#ccd5ae]'
              }`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-neutral-400' : 'text-[#8fa89b]'}`}>LM Studio Target Address:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-lmstudio-url"
                  value={config.lmStudioUrl}
                  onChange={(e) => updateConfig('lmStudioUrl', e.target.value)}
                  className={`flex-1 p-2 outline-none text-[10px] rounded-lg select-text font-mono focus:border-[#ff7b90] ${
                    theme === 'galaxy' ? 'bg-[#150d30] border-[#ccd5ae]/20 text-white' :
                    theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-neutral-200' :
                    'bg-[#fdfbf7] border-[#ccd5ae] text-[#3d5a5a]'
                  }`}
                  placeholder="e.g. http://localhost:1234"
                />
                <button
                  type="button"
                  id="btn-ping-lmstudio"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="cursor-pointer bg-[#ffe5ec] hover:bg-[#ffcad4] text-[#590d22] font-black text-[9px] px-3.5 py-1.5 rounded-lg border border-[#ffcad4] transition-all"
                >
                  {testStatus === 'testing' ? 'PINGING' : 'PING'}
                </button>
              </div>
            </div>
          </div>
        )}

        {config.engine === 'built-in' && (
          <div className={`text-[10px] leading-relaxed ${
            theme === 'galaxy' ? 'text-neutral-300' :
            theme === 'dark' ? 'text-neutral-300' : 'text-[#5b6c5d]'
          }`}>
            🌿 <span className={`font-bold ${theme === 'galaxy' ? 'text-[#c582ff]' : 'text-[#1b4332]'}`}>Local Micro Engine active.</span> Depth search evaluates millions of branches on this page itself. Perfect offline capabilities without setup overhead.
          </div>
        )}

        {config.engine === 'gemini' && (
          <div className={`text-[10px] leading-relaxed ${
            theme === 'galaxy' ? 'text-neutral-300' :
            theme === 'dark' ? 'text-neutral-300' : 'text-[#5b6c5d]'
          }`}>
            ☁️ <span className={`font-bold ${theme === 'galaxy' ? 'text-[#caaffc]' : 'text-[#3b11ab]'}`}>Cloud Gemini Route active.</span> High precision server-side models calculate advanced defensive tactics. Fast and zero-delay, using optimized JSON structures.
          </div>
        )}
      </div>

      {/* 5. LIVE TRANSCEIVER LOGS */}
      <div className="bg-[#121212] border-2 border-[#121212] p-4.5 rounded-xl flex flex-col min-h-[140px] max-h-[180px] overflow-hidden shadow-inner">
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2 mb-2">
          <span className="text-[10px] text-[#10b981] font-extrabold uppercase flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            DIAGNOSTIC TRANSMISSIONS
          </span>
          <button
            type="button"
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="cursor-pointer text-[9px] text-[#4bbf96] hover:text-[#10b981] uppercase font-bold"
          >
            Clear Out
          </button>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 pr-1.5 custom-scrollbar select-text text-emerald-400">
          {apiLogs.length === 0 ? (
            <div className="text-zinc-600 italic py-2 text-center font-mono">No cycles transmitted yet... Waiting for moves.</div>
          ) : (
            apiLogs.map((log, idx) => {
              let colorClass = 'text-zinc-400';
              if (log.type === 'sent') colorClass = 'text-sky-400 font-bold';
              else if (log.type === 'received') colorClass = 'text-emerald-400';
              else if (log.type === 'error') colorClass = 'text-rose-400 font-black';

              return (
                <div key={idx} className="leading-normal border-b border-zinc-900 pb-1">
                  <span className="text-zinc-500 font-bold mr-1.5">[{log.timestamp}]</span>
                  <span className={colorClass}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
