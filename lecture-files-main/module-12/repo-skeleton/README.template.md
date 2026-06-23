# <APP NAME>

> Offline AI app built for the DICT AI-Native Productivity and Automation
> Bootcamp, Module 12. Runs end to end on a clean clone with no internet.

## What it does

<One paragraph. Replace the angle brackets.>

<APP NAME> reads <INPUT> from <SOURCE>, sends a tight RTCF prompt to a
local Gemma 4 served by Ollama or LM Studio, and writes <OUTPUT> to
<DESTINATION>.

## Brief

<Meeting Summariser / FAQ Assistant / Feedback Analyzer / Policy Analyzer>

## Prerequisites

- Python 3.11 or newer
- Ollama installed and running on `http://127.0.0.1:11434`
  - with `gemma4:2b` pulled, OR
- LM Studio installed and running on `http://127.0.0.1:1234`
  - with `gemma-4-2b` loaded
- No internet access required after the model is loaded

## Install

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python -m app --input fixtures/<FIXTURE> --runtime ollama
# or
python -m app --input fixtures/<FIXTURE> --runtime lmstudio
```

Flags:

- `--input` path to the input file (required)
- `--runtime` `ollama` or `lmstudio` (default: ollama)
- `--model` model id (default: `gemma4:2b` for Ollama, `gemma-4-2b` for LM Studio)

## Output

Stdout by default. Pipe to a file with `>` if you want to save the result.

```bash
python -m app --input fixtures/<FIXTURE> --runtime ollama > demos/run-001.json
```

## Repo map

- `app/main.py` — CLI entry, argparse, three flags
- `app/prompt.py` — the RTCF prompt template
- `app/model.py` — `ask()` for Ollama or LM Studio
- `app/postprocess.py` — JSON schema validation and rendering
- `fixtures/` — input fixtures (copy from `exercises/module-12/`)
- `demos/` — saved run outputs
- `AGENTS.md` — how an AI agent should behave in this repo
- `TASKS.md` — backlog with acceptance criteria
- `PROMPTS.md` — every prompt that was sent, with the model that ran it

## License

DICT internal use. Replace with your agency's standard license before
publishing externally.
