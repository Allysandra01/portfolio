# Module 10 — Offline AI Deployment Lab

Smoke-test fixtures for proving that Ollama or LM Studio is actually serving
Gemma 4 on your laptop and that OpenCode can talk to it.

## Files

- `refactor-target.ts` — a 30-line TypeScript file with one obvious code smell
  (deeply nested conditionals). Hand it to your local model through OpenCode
  and ask it to refactor with early returns. The result is the proof that the
  end-to-end pipeline works without the internet.

## Verification checklist

Run these commands in order. If the first one fails, do not move on.

```bash
# 1. Local server is up
curl -s http://127.0.0.1:11434/api/tags | head      # Ollama
curl -s http://127.0.0.1:1234/v1/models | head       # LM Studio

# 2. Model answers a real prompt
ollama run gemma4:2b "Reply with the single word: pong"

# 3. OpenCode points at the local endpoint
opencode config get provider     # should print: ollama  (or openai-compatible)
opencode config get baseUrl      # should print: http://127.0.0.1:11434
                                 # (or http://127.0.0.1:1234/v1 for LM Studio)

# 4. End-to-end refactor uses no cloud
opencode run "Refactor exercises/module-10/refactor-target.ts to use early returns."
```

## Capture

Add one line to your `offline-challenges.md` (see Module 11) with:

- model (`gemma4:2b` or `gemma4:4b`)
- runtime (Ollama / LM Studio)
- port (11434 / 1234)
- time-to-first-token (seconds)
- tokens/s (steady state)

That line is your budget for Module 12. Without it, you cannot size the app
you are about to build.

## If anything fails

- Port already in use — another Ollama is running, that is fine.
- Model stuck pulling — try the smaller `Q4_K_M` quantisation or copy from the facilitator's USB.
- OpenCode still hits the cloud — `opencode config get baseUrl` and fix the URL.
- 4B out of memory — drop to `gemma4:2b`, close Chrome, and retry.
