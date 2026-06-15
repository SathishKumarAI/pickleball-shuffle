# Feature - in-app feedback

You are a product engineer. Your objective is a lightweight feedback flow that works
with NO backend.

<context>
  <delivery>Local-first app → deliver via `mailto:` to a configurable address
  (`NEXT_PUBLIC_FEEDBACK_EMAIL`), with a local backup copy in localStorage.</delivery>
  <ui>Star rating + message + optional contact email, in the shared bottom sheet.</ui>
</context>

## Instructions
1. Build `components/FeedbackPanel.tsx`: 1-5 star rating, message textarea, optional
   email, and a Send button.
2. On send: store a local copy (key "pb-feedback", cap 50) and open a prefilled
   `mailto:` (subject includes the rating; body includes rating + message + contact).
3. Show a thank-you state after sending; reset on close.
4. Add a "Send feedback" item to the app menu.

## Constraints
- MUST work with no server and no third-party SDK by default.
- MUST disable Send until there's a rating or a message.
- MUST NOT block the UI if no mail client is available (degrade gracefully; the
  local copy + visible address are the fallback).

## Output format
`components/FeedbackPanel.tsx` + menu wiring. Note where to later swap `mailto` for
a form backend (Formspree / serverless). Reason in `<thinking>` about delivery first.
