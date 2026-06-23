# Workflow: Auto-triage incoming student feedback

> Worked example from the Module 13 slides. Use as the shape, not the
> exact words, when you draft your own `flow-spec.md`.

## 1. Purpose

Every weekday at 09:00, the bootcamp PM receives a one-page brief of the
previous day's learner feedback in `#feedback-triage`, so the weekly
review takes 20 minutes instead of 90.

## 2. Trigger

- Source: `feedback@bootcamp.dict.gov.ph`
- Format: a single email with a subject line starting with `[feedback]`
  and a plain-text or HTML body
- Schedule: cron, weekdays at 08:30

## 3. AI step

- Model: `gemma4:2b`
- Runtime: Ollama on `http://127.0.0.1:11434`
- Prompt file: `prompts/triage.md`
- Output schema:

```json
{
  "sentiment": "positive | neutral | negative",
  "theme": "Materials | Pace | Facilitator | Logistics | Other",
  "urgency": "low | medium | high",
  "summary": "string (max 240 chars)",
  "suggested_reply": "string (max 120 words)"
}
```

## 4. Decision

- Branch A: if `urgency = high`, post to `#feedback-triage` with the
  label `[urgent]` and ping `@bootcamp-pm`.
- Branch B: if `urgency = medium`, post to `#feedback-triage` without
  the label.
- Branch C: if `urgency = low`, append to `data/feedback-queue.jsonl`
  for the weekly digest.

## 5. Action

- Verb: post a Slack message
- Inverse: delete the Slack message (manual) or post a correction
- Surface: `#feedback-triage` channel

- Verb: append a row to `data/feedback-queue.jsonl`
- Inverse: delete the row from the file
- Surface: local file under the workflow repo

## 6. Risk tier per step

| Step | Tier | Reason |
| --- | --- | --- |
| Trigger | (informational) | Read-only mailbox filter. No AI. |
| AI step | Informational | Reads email, returns structured JSON. No side effect. |
| Decision | Advisory | Routes a message but does not send anything outside Slack. |
| Action | Autonomous | Posts a message visible to the whole cohort. Blast radius: cohort-wide misroute. |

## 7. Governance

- Human-in-the-loop owners: Diane Lim (PM), Mark Solidarios (Facilitator)
- Approver surface: `#feedback-triage` Slack channel
- Approval SLA: 15 minutes during business hours (08:00 to 18:00 PHT),
  4 hours after
- Audit log path: `audit/feedback.jsonl` (append-only)
- Audit log writer: `scripts/triage.py`
- Audit log retention: 90 days
- Kill switch: `flow.yaml` flag `enabled: false`. Flip with
  `sed -i 's/enabled: true/enabled: false/' flow.yaml` and restart the
  cron job.

## 8. Rollback

| Action | Inverse | Who runs it | Time to complete |
| --- | --- | --- | --- |
| Post Slack message | Delete message or post correction | Diane Lim | <1 minute |
| Append row to `data/feedback-queue.jsonl` | Delete row from file | Diane Lim | <5 minutes |
| Ping `@bootcamp-pm` | Send "false alarm" reply | Diane Lim | <1 minute |

## Red team notes

> Capture the partner's challenges inline.

- Partner A: "What if the AI mislabels an urgent email as low?" — added
  the Branch A escalation rule so any `urgency = high` triggers an `@`
  ping, not just a Slack post.
- Partner B: "What if Ollama is down at 08:30?" — added a fallback that
  re-runs at 08:45 and 09:00 before paging the on-call.
- Partner C: "What if a single sender floods the inbox?" — added a
  rate-limit rule in section 2: only the first 50 emails per sender per
  day enter the pipeline.
