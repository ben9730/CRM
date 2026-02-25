---
status: diagnosed
trigger: "/api/chat/confirm endpoint returns error when users tap Confirm on write action confirmation card"
created: 2026-02-25T00:00:00Z
updated: 2026-02-25T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED - The /api/chat route does not return updated Gemini history when it returns pendingAction, so the confirm route receives stale history missing the function call context, causing Gemini API to error
test: Traced data flow from chat route -> frontend state -> confirm route
expecting: The Gemini functionResponse requires a preceding functionCall in history
next_action: Document root cause and suggested fix

## Symptoms

expected: User taps Confirm on a ConfirmationCard, the /api/chat/confirm endpoint executes the tool successfully and returns a natural language response
actual: User sees "Something went wrong confirming the action." message
errors: Error comes from catch block OR the else branch (no data.response) in handleConfirm in PortalChat.tsx
reproduction: Trigger any write tool (create_contact, complete_task, create_deal) via chat, then tap Confirm on the card
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-02-25T00:00:10Z
  checked: /api/chat route.ts lines 62-85 (write tool detection + pendingAction response)
  found: When a write tool is detected, the route returns ONLY { pendingAction: { tool, args, preview, sessionId } } with NO history field. The chat.getHistory() call on line 113 is only reached in the non-write-tool flow.
  implication: Frontend never receives updated Gemini history containing the user message and model's functionCall

- timestamp: 2026-02-25T00:00:20Z
  checked: PortalChat.tsx lines 111-126 (pendingAction handling in sendMessage)
  found: When data.pendingAction is truthy, the code sets pendingAction state and returns early on line 125. Lines 143-145 (setGeminiHistory) are NEVER reached.
  implication: geminiHistory state remains stale -- missing the user message and model's functionCall turn

- timestamp: 2026-02-25T00:00:30Z
  checked: PortalChat.tsx lines 159-172 (handleConfirm request body)
  found: handleConfirm sends { tool, args, sessionId, history: geminiHistory } to /api/chat/confirm. The geminiHistory is stale (does not include the conversation turn that produced the functionCall).
  implication: Confirm route receives history without the function call context

- timestamp: 2026-02-25T00:00:40Z
  checked: /api/chat/confirm/route.ts lines 31-37 (Gemini chat setup + functionResponse send)
  found: The confirm route does model.startChat({ history: history ?? [] }) with stale history, then sends a functionResponse for a tool. Gemini API requires functionResponse to follow a matching functionCall in the conversation. Without the functionCall in history, this throws an error.
  implication: Gemini API rejects the functionResponse because there is no preceding functionCall in the history -- this is the server-side error caught at line 53

- timestamp: 2026-02-25T00:00:50Z
  checked: PortalChat.tsx lines 189-208 (handleConfirm response handling)
  found: The server returns { error: "AI error: ..." } with status 500. The frontend parses this JSON successfully. data.rateLimited is falsy, data.response is undefined, so code falls into the else branch at line 200, displaying "Something went wrong confirming the action."
  implication: Confirms the exact user-visible error message matches this code path

- timestamp: 2026-02-25T00:00:55Z
  checked: WRITE_TOOLS set in tools.ts line 110
  found: create_task is NOT in WRITE_TOOLS (only create_contact, create_deal, complete_task). create_task executes immediately without confirmation.
  implication: Secondary issue -- create_task bypasses confirmation. May be intentional or oversight.

## Resolution

root_cause: The /api/chat route does not return the updated Gemini conversation history when it detects a write tool and returns a pendingAction response. As a result, when the user taps Confirm and handleConfirm sends the request to /api/chat/confirm, it includes stale geminiHistory that is missing the user message and the model's functionCall turn. The confirm route then tries to send a functionResponse to Gemini without a matching functionCall in the chat history, which causes the Gemini API to throw an error. This error is caught and returned as { error: "AI error: ..." }, which the frontend displays as "Something went wrong confirming the action."

fix: Two changes needed:
  1. In /api/chat/route.ts: Before returning the pendingAction response, call chat.getHistory() and include it in the response JSON alongside pendingAction.
  2. In PortalChat.tsx: In the pendingAction branch of sendMessage, read data.history (if present) and call setGeminiHistory(data.history) before returning early.

verification:
files_changed: []
