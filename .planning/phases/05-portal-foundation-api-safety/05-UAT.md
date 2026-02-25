---
status: complete
phase: 05-portal-foundation-api-safety
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: 2026-02-25T11:30:00Z
updated: 2026-02-25T11:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Existing ChatWidget still works
expected: Open the CRM dashboard. Click the floating chat bubble. Send a message like "show urgent tasks". AI responds normally -- no regressions from the refactor.
result: pass

### 2. Portal page loads with no CRM chrome
expected: Navigate to /portal. You should see a full-page chat interface with NO CRM sidebar and NO floating ChatWidget. Just the chat input at the bottom and an empty message area.
result: pass

### 3. Auth gate on portal
expected: Open /portal in an incognito/private window (not logged in). You should be redirected to /login without seeing the portal flash.
result: pass

### 4. Send a message and see bubble layout
expected: On /portal, type a message and send it. Your message appears as a colored bubble on the RIGHT side. The AI response appears as a lighter bubble on the LEFT side.
result: pass

### 5. Markdown rendering in AI responses
expected: Send a message that triggers a detailed response (e.g. "show my tasks for today" or "summarize my pipeline"). The AI response should render markdown: **bold text** appears bold, bullet lists appear as styled lists, headers appear larger -- not raw symbols like **, -, or ##.
result: pass

### 6. Loading spinner while waiting
expected: Send a message and watch the area below your message. A spinner icon should appear on the left side (assistant position) while waiting for the AI to respond. It should NOT be typing dots.
result: pass

### 7. AI Chat link in CRM sidebar
expected: Go back to the CRM dashboard. In the left sidebar, you should see an "AI Chat" item with a Bot icon (at the bottom of the nav list). Clicking it navigates to /portal.
result: pass

### 8. Back navigation from portal
expected: On /portal, look in the top-left corner. There should be a subtle back arrow (chevron). Clicking it takes you back to /dashboard.
result: pass

### 9. Mobile layout (phone or devtools responsive mode)
expected: Open /portal on a phone or in Chrome devtools responsive mode (e.g. iPhone 14). The chat input should stay at the bottom of the screen. When you tap the input and the virtual keyboard appears, the input should remain visible above the keyboard -- not hidden behind it.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
