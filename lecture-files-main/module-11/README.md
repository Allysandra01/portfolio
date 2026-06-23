# Module 11 — Disconnected Intelligence Challenge

Five fixtures, five tasks. Disable Wi-Fi first, then run every task against
your local Gemma 4 and capture outputs in `offline-challenges.md`.

## Files

| File | Task | What good looks like |
| --- | --- | --- |
| `sample-policy.txt` | 1 — Summarise a local policy into 5 bullets + 3 action items. | Bullets are factual and traceable. Actions name an owner. |
| `sample.ts` | 2 — Write 5 unit tests for the exported functions. | Each test names an edge case. Assertions are specific. |
| `bullets.md` | 3 — Draft a 120-word client email from the bullets. | Friendly, concrete, ends with one clear ask. |
| `db-brief.md` | 4 — Generate `db.config.json` from the brief. | Valid JSON. Every field in the brief appears as a key. |
| `paragraph.md` | 5 — Translate the paragraph to Filipino (or any target language). | Meaning preserved. Idioms adapted, not transliterated. |

## RTCF prompts to start from

Each task has a tight prompt template below. Replace the angle brackets with
the fixture content before sending.

### Task 1 — Summarise

```text
Role: policy analyst.
Task: read the policy below and produce structured notes.
Format (strict JSON):
{
  "bullets": [string x5],
  "actions": [{"owner": string, "task": string, "due": string}],
  "next_review": string | null
}
Rules: no preamble, no trailing prose, return JSON only.
Policy:
<<<
{{contents of sample-policy.txt}}
>>>
```

### Task 2 — Unit tests

```text
Role: test engineer.
Task: write 5 Jest unit tests for the functions exported in the file below.
Focus on edge cases: empty inputs, zero values, currency conversion paths.
Format: a single TypeScript code block, no prose, no markdown fences inside.
File:
<<<
{{contents of sample.ts}}
>>>
```

### Task 3 — Email draft

```text
Role: customer success lead.
Task: turn the bullet points below into a 120-word email to a client.
Tone: warm, specific, ends with one clear ask.
Format: plain text only, no subject line, no signature.
Bullets:
<<<
{{contents of bullets.md}}
>>>
```

### Task 4 — JSON config

```text
Role: platform engineer.
Task: read the brief below and produce a database connection config as JSON.
Format (strict JSON):
{
  "host": string,
  "port": number,
  "database": string,
  "username": string,
  "password_env": string,
  "pool": {"min": number, "max": number},
  "ssl": boolean
}
Rules: no prose, return JSON only.
Brief:
<<<
{{contents of db-brief.md}}
>>>
```

### Task 5 — Translation

```text
Role: bilingual translator (English to Filipino).
Task: translate the paragraph below.
Rules: preserve meaning, adapt idioms, keep names unchanged.
Format: plain text only, no commentary.
Paragraph:
<<<
{{contents of paragraph.md}}
>>>
```

## Capture template

For each task, write to `offline-challenges.md`:

```markdown
## Task N — <name>
- Prompt: <the exact prompt you sent>
- Output: <paste of the model output>
- Latency: <time-to-first-token>, <tokens/s>
- Verdict: sailed through / workable with care / needs the cloud
- One-line reflection: <one sentence>
```

## Timebox

10 minutes per task. If you are stuck after 10, write down what blocked you
and move on. The reflection is more valuable than a perfect answer.

## Reconnect

Re-enable Wi-Fi after task 5. Note the moment you switched back. The next
module needs you online to fetch model files and dependencies.
