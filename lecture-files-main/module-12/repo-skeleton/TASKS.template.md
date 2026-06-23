# TASKS.md

> Backlog for the offline AI app. The AI agent reads this file first.
> Acceptance criteria are the contract. Definition of Done lives at the top.

## Definition of Done

Every task is "done" only when all of these are true.

- [ ] Code is merged to the main branch.
- [ ] At least one test is added and passing.
- [ ] `README.md` run instructions still work on a clean clone, offline.
- [ ] `PROMPTS.md` is updated with any new prompt sent to the model.
- [ ] The owner posts the demo link in the cohort channel.

## Now (today)

- [ ] TASK-001 — Scaffold `app/main.py` CLI with `--input`, `--runtime`, `--model` flags.
  - Owner: <name>
  - Acceptance criteria: `python -m app --help` lists all three flags with help text.
  - Depends on: —

- [ ] TASK-002 — Wire `app/model.py` `ask()` function against Ollama on port 11434.
  - Owner: <name>
  - Acceptance criteria: `ask("Reply with the single word: pong")` returns the string `pong` against the bundled fixture.
  - Depends on: TASK-001

- [ ] TASK-003 — Add the same `ask()` against LM Studio on port 1234 behind a `--runtime` flag.
  - Owner: <name>
  - Acceptance criteria: same as TASK-002 but with `--runtime lmstudio` and the request goes to `http://127.0.0.1:1234/v1/chat/completions`.
  - Depends on: TASK-002

## Next (this week)

- [ ] TASK-010 — Write the RTCF prompt in `app/prompt.py` with a strict JSON schema.
  - Owner: <name>
  - Acceptance criteria: schema covers every output field; the model returns parseable JSON in 9 of 10 runs against the fixture.
  - Depends on: TASK-002

- [ ] TASK-011 — Build `app/postprocess.py` to validate the JSON schema.
  - Owner: <name>
  - Acceptance criteria: invalid JSON exits with a non-zero status and a one-line error message naming the missing field.
  - Depends on: TASK-010

- [ ] TASK-012 — Add a smoke test under `tests/test_smoke.py` that runs the full pipeline against the fixture and saves the output under `demos/`.
  - Owner: <name>
  - Acceptance criteria: `pytest tests/test_smoke.py` passes on a clean clone with the local model running.
  - Depends on: TASK-010, TASK-011

## Backlog (someday)

- [ ] TASK-020 — Add a `--compare` flag that runs the same input through both runtimes and prints both outputs side by side.
- [ ] TASK-021 — Wrap the CLI in a `textual` TUI with an input box and a scrolling output pane.
- [ ] TASK-022 — Add a `demos/` script that regenerates every demo file and verifies byte-for-byte equality against the saved version.

## Done

- [ ] TASK-000 — Bootstrapped this backlog from `repo-skeleton/TASKS.template.md`. Date: <YYYY-MM-DD>.
