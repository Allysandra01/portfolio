# PROMPTS.md

> Every prompt the local model ever sees in this project. One row per prompt.
> Future maintainers (human or agent) should be able to understand why the
> app behaves the way it does by reading this file top to bottom.

## Index

- P-001 — Initial smoke test (Module 10 carry-over)
- P-010 — RTCF prompt for <APP NAME> (TASK-010)
- P-020 — JSON schema fragment used by `app/postprocess.py` (TASK-011)

## P-001 — Smoke test

- Status: stable
- Model: `gemma4:2b` (Ollama) or `gemma-4-2b` (LM Studio)
- Used by: `app/model.py` smoke test

```text
Reply with the single word: pong
```

Output expected: the string `pong` with no surrounding prose.

## P-010 — RTCF prompt for <APP NAME>

- Status: draft (v1)
- Model: `gemma4:2b` (Ollama) or `gemma-4-2b` (LM Studio)
- Used by: `app/prompt.py`
- Success rate on fixture: <x>/10

```text
Role: <role>.
Task: <task>.
Format (strict JSON):
{
  "field_1": string,
  "field_2": [string],
  "field_3": [{"owner": string, "task": string, "due": string}]
}
Rules: no preamble, no trailing prose, return JSON only.
Constraints: paraphrase, never invent names, mark missing values as null.
Input:
<<<
{{INPUT}}
>>>
```

## P-020 — JSON schema fragment

- Status: stable
- Used by: `app/postprocess.py`

```json
{
  "type": "object",
  "required": ["field_1"],
  "properties": {
    "field_1": {"type": "string"},
    "field_2": {"type": "array", "items": {"type": "string"}},
    "field_3": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["owner", "task"],
        "properties": {
          "owner": {"type": "string"},
          "task": {"type": "string"},
          "due": {"type": ["string", "null"]}
        }
      }
    }
  }
}
```

## How to add a new prompt

1. Copy the most recent prompt of the same family.
2. Give it the next free `P-NNN` id.
3. Write the full prompt in a fenced code block.
4. Record the model id, the success rate, and a one-line summary of what changed.
5. Update `app/prompt.py` to point at the new id.
