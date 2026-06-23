# Workflow: <name>

## 1. Purpose

One sentence: who benefits, what changes, when it runs.

> Example: "Every Monday at 09:00, the bootcamp PM receives a one-page brief summarising the previous week's learner feedback so the weekly review takes 20 minutes instead of 90."

## 2. Trigger

What wakes the workflow. Format, source, schedule.

- Source: <email inbox / webhook / file drop / cron schedule>
- Format: <list the fields the trigger must contain>
- Schedule: <cron expression or "on every event">

## 3. AI step

Model, prompt file, expected output schema.

- Model: <gemma4:2b / gemma4:4b / gemini-2.0-flash / other>
- Runtime: <Ollama / LM Studio / Google AI Studio>
- Prompt file: <path under /prompts or inlined below>
- Output schema:

```json
{
  "field_1": "string",
  "field_2": ["string"],
  "field_3": [{"key": "string", "value": "string"}]
}
```

## 4. Decision

Branches and the rule for each branch.

- Branch A: if <condition>, then <action>
- Branch B: if <condition>, then <action>
- Default: <action>

## 5. Action

The verbs the workflow can perform. Each verb lists its inverse.

- Verb: <send email / write row / post message / charge card / notify>
- Inverse: <recall email / delete row / delete message / refund / cancel notification>
- Surface: <Slack channel / email list / database table / payment provider>

## 6. Risk tier per step

| Step | Tier | Reason |
| --- | --- | --- |
| Trigger | (informational) | No AI. Read-only. |
| AI step | (informational / advisory / autonomous) | One sentence. |
| Decision | (advisory / autonomous) | One sentence. |
| Action | (autonomous) | One sentence naming the blast radius. |

## 7. Governance

- Human-in-the-loop owners: <name, role, contact>
- Approver surface: <Slack channel / email / dashboard>
- Approval SLA: <minutes during business hours, hours after>
- Audit log path: <file path or table name>
- Audit log writer: <script or service>
- Audit log retention: <days>
- Kill switch: <config flag name and where to flip it>

## 8. Rollback

For each action in section 5, the inverse action is named.

| Action | Inverse | Who runs it | Time to complete |
| --- | --- | --- | --- |
| Send email | Recall or send correction | <owner> | <minutes> |
| Write row | Mark row as reversed | <owner> | <minutes> |
| Charge card | Refund | <owner> | <business days> |

## Red team notes

> Capture the partner's challenges inline. If a control was added or sharpened because of the red team, write it as a sub-bullet under the section it changed.

- <partner name>:
- <partner name>:
