# Module 12 — Offline AI App Development

Pick one of the four app briefs below, scaffold a small repo against the
templates in `repo-skeleton/`, and ship a CLI that calls your local Gemma 4
on a fresh clone with no internet.

## Pick your brief

| Brief | Input | Output | Fixture |
| --- | --- | --- | --- |
| Meeting Summariser | a transcript file | 5 bullets + 3 action items + next meeting | `sample-transcript.txt` |
| Policy Analyzer | a long policy `.txt` | a 1-page brief against a rubric | `sample-policy.txt` |
| FAQ Assistant | a user question | an answer grounded in `docs/` | `docs/sample-faq.md` |
| Feedback Analyzer | a CSV of survey rows | themes, sentiment, top quotes | `sample-feedback.csv` |

## Recommended path

1. Pick the brief that scares you least. Shipping matters more than novelty.
2. Scaffold your repo with the four files in `repo-skeleton/` (copy, do not edit in place).
3. Wire `app/model.py` against Ollama (`http://127.0.0.1:11434`) or LM Studio (`http://127.0.0.1:1234`).
4. Write the RTCF prompt with a strict JSON schema (see `repo-skeleton/PROMPTS.md`).
5. Build the CLI with three flags: `--input`, `--runtime`, `--model`.
6. Run end-to-end on the matching fixture.
7. Commit `README.md` with exact run instructions for a clean clone, offline.

## Folder layout

```
your-app/
├── README.md          # copy from repo-skeleton/README.template.md
├── AGENTS.md          # copy from repo-skeleton/AGENTS.template.md
├── TASKS.md           # copy from repo-skeleton/TASKS.template.md
├── PROMPTS.md         # copy from repo-skeleton/PROMPTS.template.md
├── app/
│   ├── main.py        # CLI entry, argparse, three flags
│   ├── prompt.py      # the RTCF prompt template, one constant
│   ├── model.py       # ask() for Ollama or LM Studio
│   └── postprocess.py # parse JSON, validate schema, render
├── fixtures/          # copy one fixture from this folder
└── demos/             # save at least one run output as proof
```

## Stretch (fast finishers)

- Add a `--compare` flag that runs the same input through Ollama and LM Studio and prints both outputs side by side.
- Add an `offline-challenges.md` log of every run with latency and a one-line verdict.
- Wrap the CLI in a tiny TUI with `textual` or `rich`.

## Done looks like

A colleague clones your repo, runs `ollama serve` (or starts LM Studio),
runs the CLI with the documented command, and gets the documented output —
with Wi-Fi off.
