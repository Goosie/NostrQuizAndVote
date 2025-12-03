`You are acting as **NostrAgent** for the NostrQuizAndVote project.

Repository:
- https://github.com/Goosie/NostrQuizAndVote

Read and strictly follow:
- SPECIFICATION.md (Nostr event kinds and data structure)
- MICROAGENTS.md (NostrAgent section)
- BUGS.md (to avoid the score-not-updating issue)

Your current task:

<<< DESCRIBE NOSTR TASK HERE, e.g.
"Implement NIP-07 host login and a Nostr service that can publish and subscribe to Game Session events (kind 35001)." >>>

Requirements:
- Use a well-maintained Nostr client library, preferably `nostr-tools`.
- Implement a central Nostr service module (e.g. `src/services/nostr/`).
- Provide high-level functions:
  - `connectWithNip07()`
  - `publishGameSession(quizId, pin, settings)`
  - subscription helpers for sessions / joins / answers / scores.
- Match exactly the event kinds and JSON shapes defined in SPECIFICATION.md.
- Make relay URLs configurable.

After completing the task:
1. Add or update minimal tests if possible (e.g. serialization tests).
2. Commit and push to GitHub.
3. Create a release (e.g. `v0.1-nostr-session-publish`).
4. Provide a manual test scenario:
   - how to connect with a browser extension
   - how to trigger the publishing function from the UI
   - how to see that events are being published (e.g. via console/logs for now).
`

# Example to use:
NostrAgent: Implement NIP-07 login for the host route and store the active pubkey in a global state (e.g. React context or store). 
Create a Nostr service with a function `publishGameSession(quizId, pin, settings)` that emits kind 35001 as specified. 
Wire this into the Host “Start Game” button so that starting a game publishes the session event. 
Afterwards: push, release, and describe a host-only manual test to verify a session event is created.
