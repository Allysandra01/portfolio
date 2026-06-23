# Scenarios — pick one

Pick exactly one scenario for Module 13. Do not invent a seventh — these
six cover the common shapes you will encounter in real DICT work.

## 1. Auto-triage incoming student feedback

- Trigger: email to `feedback@bootcamp.dict.gov.ph`
- AI step: local Gemma 4 labels sentiment, theme, urgency
- Action: post to `#feedback-triage` Slack channel
- Worked example: see `flow-spec.example.md`

## 2. Auto-flag risky pull requests

- Trigger: webhook from GitHub on every PR opened or synchronised
- AI step: local Gemma 4 reads the diff and scores risk on
  correctness, security, and test coverage
- Action: comment on the PR with the risk score and a short rationale;
  label `risk-high` if score is above threshold
- Inverse: edit or delete the comment; remove the label

## 3. Auto-publish weekly bootcamp digest

- Trigger: cron, every Friday at 16:00
- AI step: local Gemma 4 reads the week's `findings.md`,
  `decision-pack.md`, and `offline-challenges.md` files; produces a
  one-page digest
- Action: open a draft Pull Request in the cohort `digest/` repo with
  the digest as `digest-<YYYY-WW>.md`
- Inverse: close the PR

## 4. Auto-classify citizen feedback forms

- Trigger: file drop into `inbox/forms/*.pdf`
- AI step: local Gemma 4 extracts structured fields (category, sentiment,
  urgency) and writes JSON
- Action: append to `data/forms.jsonl` and notify the duty officer in
  `#forms-duty`
- Inverse: delete the JSON line; recall the notification

## 5. Auto-tutor first-line support

- Trigger: a learner opens a chat in the help widget
- AI step: cloud Gemini (with offline Gemma 4 as fallback) reads the
  `docs/sample-faq.md` and drafts an answer
- Action: send the answer to the learner; if confidence is below
  threshold, escalate to a human tutor with the draft attached
- Inverse: recall the chat reply; reassign the ticket

## 6. Auto-summarise board meeting recordings

- Trigger: file drop into `inbox/recordings/*.mp3` after transcription
- AI step: local Gemma 4 reads the transcript and produces bullets,
  decisions, and action items
- Action: write `summaries/<recording-id>.md` and notify the board
  secretary in `#board-secretary`
- Inverse: delete the summary file; recall the notification

## Pick rule

Pick the scenario whose blast radius is hardest to ignore. Module 13 is
about naming the blast radius, not minimising it. A scenario that "feels
safe" usually has the most underspecified rollback.

## What you owe

For the scenario you pick, deliver:

- `flow-spec.md` (all eight sections filled)
- `flow-diagram.png` (drawn from your spec, exported from your diagram
  tool of choice — Mermaid, Excalidraw, draw.io, pen and paper are all
  fine)
- Red-team notes from a partner (at least three challenges, at least
  one control sharpened because of the red team)
