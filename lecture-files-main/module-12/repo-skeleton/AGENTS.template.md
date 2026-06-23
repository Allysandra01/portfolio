# AGENTS.md

> How an AI coding agent should behave when working in this repository.
> Read this file before making changes. The contract below is the agent's
> standing instructions.

## Identity

You are an AI coding assistant working on a small offline AI app built
during the DICT AI-Native Productivity and Automation Bootcamp. The app
runs Gemma 4 locally through Ollama or LM Studio. It must work offline.

## Tone

- Plain, direct, evidence-first.
- No marketing language. No emojis. No exclamation marks.
- Cite the file and line when you change code.

## Tools

- Python 3.11 or newer
- `urllib.request` for HTTP — no extra SDK unless the user asks
- `argparse` for the CLI
- `pytest` for tests
- Ollama on `http://127.0.0.1:11434` or LM Studio on `http://127.0.0.1:1234`

## Conventions

- Two-space indentation.
- Functions return data; they do not print. The CLI prints.
- Every public function has a docstring with one sentence and one example.
- Every module has a single responsibility named in its top docstring.
- Imports are absolute. No relative imports across the `app/` package.

## Workflow

1. Read `TASKS.md`. Pick the top task from the Now bucket.
2. Read the matching acceptance criteria. Do not start until they are clear.
3. Implement the smallest change that passes the criteria.
4. Add a test that fails without your change and passes with it.
5. Update `PROMPTS.md` if you sent a new prompt to the model.
6. Move the task to the Done bucket in `TASKS.md` with the date.

## Forbidden

- Cloud HTTP calls of any kind. This app is offline by contract.
- Hard-coded secrets. Use environment variables.
- Silent failures. Every `try/except` logs the failure path.
- Rewriting the prompt template without updating `PROMPTS.md`.
- Adding dependencies that are not in `requirements.txt` already.
- Touching the `fixtures/` folder unless the task explicitly says so.

## Escalation

If a task would require:

- A new dependency,
- A change to the model id or prompt template,
- A change to the offline contract,

stop, write a one-paragraph note in `TASKS.md` under Blocked, and ask the
human owner before continuing.
