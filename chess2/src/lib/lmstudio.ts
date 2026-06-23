// Talks to a local LM Studio server running Gemma at
// http://localhost:1234/v1/chat/completions

const ENDPOINT = "http://localhost:1234/v1/chat/completions";

const SYSTEM_PROMPT = `You are a chess engine playing the Black pieces.
You will receive the current position in FEN notation and the list of legal moves in UCI notation (e.g. "e7e5", "g8f6").
You MUST respond with a single JSON object on one line and NOTHING else:
{"move": "<uci>"}
Rules:
- Pick exactly one move from the provided legal moves list.
- Do not include any commentary, code fences, or explanations.
- If you must reason, you may use <think>...</think> tags BEFORE the JSON, but the final line must be the JSON only.`;

function stripThink(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function extractMove(raw: string, legal: string[]): string | null {
  const cleaned = stripThink(raw);
  // Try JSON parse on whole, then on the last JSON-looking blob.
  const tryParse = (s: string): string | null => {
    try {
      const obj = JSON.parse(s) as { move?: unknown };
      if (typeof obj.move === "string") return obj.move.trim().toLowerCase();
    } catch {
      /* ignore */
    }
    return null;
  };
  let move = tryParse(cleaned);
  if (!move) {
    const match = cleaned.match(/\{[^{}]*"move"\s*:\s*"([^"]+)"[^{}]*\}/i);
    if (match) move = match[1].trim().toLowerCase();
  }
  if (!move) {
    // last resort: bare uci
    const uci = cleaned.match(/\b([a-h][1-8][a-h][1-8][qrbn]?)\b/i);
    if (uci) move = uci[1].toLowerCase();
  }
  if (!move) return null;
  return legal.includes(move) ? move : null;
}

export type GemmaResult =
  | { ok: true; move: string }
  | { ok: false; error: string };

export type Difficulty = "easy" | "intermediate" | "hard";

const DIFFICULTY_CONFIG: Record<Difficulty, { temperature: number; max_tokens: number; hint: string }> = {
  easy: { temperature: 1.1, max_tokens: 128, hint: "Play casually. Any reasonable legal move is fine — feel free to be playful." },
  intermediate: { temperature: 0.5, max_tokens: 256, hint: "Play solidly. Prefer developing pieces, controlling the center, and avoiding obvious blunders." },
  hard: { temperature: 0.15, max_tokens: 512, hint: "Play your strongest move. Look for tactics, threats, and king safety. Calculate carefully before responding." },
};

export async function askGemma(fen: string, legal: string[], difficulty: Difficulty = "intermediate", signal?: AbortSignal): Promise<GemmaResult> {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        model: "gemma-3-4b-it",
        temperature: cfg.temperature,
        max_tokens: cfg.max_tokens,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n" + cfg.hint },
          {
            role: "user",
            content: `Difficulty: ${difficulty}\nFEN: ${fen}\nLegal moves (UCI): ${legal.join(", ")}\nRespond with one JSON object: {"move":"<uci>"}`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: `LM Studio returned ${res.status}` };
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const move = extractMove(content, legal);
    if (!move) return { ok: false, error: "Could not parse a legal move from Gemma." };
    return { ok: true, move };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: `Cannot reach LM Studio at ${ENDPOINT}: ${msg}` };
  }
}
