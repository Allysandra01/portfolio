# Module 13 — Automation Flow-Off

Templates, a worked example, and a list of scenarios to pick from.
Use these to draft a workflow spec in 30 minutes and have it survive a
five-minute red team from a partner.

## Files

- `flow-spec.template.md` — the eight-section skeleton every workflow uses. Copy, do not edit in place.
- `flow-spec.example.md` — the worked "Auto-triage student feedback" example from the slides. Read this before you write your own.
- `flow-diagram.example.mmd` — Mermaid source for the same worked example. Render to PNG with `mmdc -i flow-diagram.example.mmd -o flow-diagram.png`.
- `scenarios.md` — six scenarios you can pick from. Pick one. Do not invent a seventh.

## Workflow

1. Read `flow-spec.example.md` end to end.
2. Pick a scenario from `scenarios.md`. Commit your choice in section 1.
3. Copy `flow-spec.template.md` to `flow-spec.md` in your repo.
4. Draw the flow on paper or in a whiteboard. Capture it as `flow-diagram.png` (use the Mermaid file as a starting point if you like).
5. Fill in all eight sections. No empty headers. No "TBD".
6. Hand `flow-spec.md` to a partner for a five-minute red team.
7. Capture the red-team notes inline at the bottom of the file.

## Eight sections, in order

1. Purpose
2. Trigger
3. AI step
4. Decision
5. Action
6. Risk tier per step
7. Governance
8. Rollback

If a section is empty, the workflow is not finished. Empty is a smell, not a state.

## Timebox

5 min pick + diagram, 25 min spec, 15 min red team, 5 min cleanup.

## Stretch (fast finishers)

- Add a ninth section: "Failure modes" — the two most likely ways this workflow misbehaves and the early signal for each.
- Add a tenth section: "Cost" — per-run token cost, per-month ceiling, and who pays.
- Render the Mermaid file to SVG (not just PNG) and link it in the README.
