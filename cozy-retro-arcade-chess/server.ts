import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Server-side Gemini move generation
  app.post('/api/gemini-move', async (req, res) => {
    try {
      const { fen, history, legalMoves, customPrompt, difficulty } = req.body;

      if (!fen || !legalMoves || !Array.isArray(legalMoves)) {
        res.status(400).json({ error: 'Missing Chess FEN or legalMove set.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(403).json({
          error: 'GEMINI_API_KEY is missing. Configure secrets or use local Minimax CPU.'
        });
        return;
      }

      // Lazy initialization of GoogleGenAI
      const ai = new GoogleGenAI({ apiKey });

      let systemPrompt = customPrompt || `You are GEMA-C64, an expert chess engine playing as BLACK.
Choose exactly ONE legal chess move. Do not make illegal actions.
Response MUST be in JSON format:
{"move": "e7e5", "reasoning": "Nostalgic arcade style commentary (max 12 words)"}`;

      if (difficulty) {
        if (difficulty === 'easy') {
          systemPrompt += `\nPLAY STYLE: EASY LEVEL. Play casually and allow occasional tactical mistakes that a beginner could capitalize on. Make it accessible and fun!`;
        } else if (difficulty === 'intermediate') {
          systemPrompt += `\nPLAY STYLE: INTERMEDIATE LEVEL. Play well, standard tactical positional play, avoids simple single-move blunder traps.`;
        } else if (difficulty === 'hard') {
          systemPrompt += `\nPLAY STYLE: EXPERT HARD LEVEL. Play with elite chess grandmaster moves, hunt down defensive weaknesses, and play hyper-tactically without mercy!`;
        }
      }

      const promptText = `
Chess position in FEN: "${fen}"
Moves played so far: ${history && history.length > 0 ? history.join(', ') : 'None'}
You MUST choose exactly ONE move from this list of currently valid legal moves: ${JSON.stringify(legalMoves)}

Provide your response in JSON format matching this schema:
{
  "reasoning": "A short, retro arcade style commentary about your move (maximum 12 words)",
  "move": "The exact move label string copied from the legal moves list"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        contents: promptText,
      });

      const responseText = response.text ? response.text.trim() : '';
      if (!responseText) {
        throw new Error('Emply response received from Gemini.');
      }

      // Parse response securely
      const resultObj = JSON.parse(responseText);
      
      // Ensure the returned move is indeed in our legal moves array
      const chosenMove = resultObj.move;
      const parsedReasoning = resultObj.reasoning || "Treading center parameters.";

      if (legalMoves.includes(chosenMove)) {
        res.json({ move: chosenMove, reasoning: parsedReasoning });
      } else {
        // Fallback: Pick a random legal move if LLM picked an invalid label
        const fallbackMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        res.json({
          move: fallbackMove,
          reasoning: `AI selected ${chosenMove} (out of register). Activating microcode: ${fallbackMove}!`,
          corrected: true
        });
      }
    } catch (err: any) {
      console.error('Gemini move API error:', err);
      res.status(500).json({ error: err.message || 'Internal AI generator error.' });
    }
  });

  // Vite development vs production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CABINET ONLINE] Retro Arena running on http://localhost:${PORT}`);
  });
}

startServer();
