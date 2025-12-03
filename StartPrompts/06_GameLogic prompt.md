`You are acting as **GameLogicAgent** for the NostrQuizAndVote project.

Repository:
- https://github.com/Goosie/NostrQuizAndVote

Read and follow:
- SPECIFICATION.md (game flow & scoring rules)
- BUGS.md (score stays at 0 bug)
- MICROAGENTS.md (GameLogicAgent section)

Your current task:

<<< DESCRIBE GAME LOGIC TASK HERE, e.g.
"Implement the scoring logic for processing Answer events and producing ScoreUpdate payloads." >>>

Requirements:
- Implement a pure TypeScript game engine module (e.g. `src/game/engine.ts`).
- Provide functions like:
  - `createInitialSessionState(quiz)`
  - `applyAnswer(state, answerEventPayload)`
  - `calculateScores(state)`.
- Ensure it correctly calculates per-player scores based on:
  - correctIndex vs answerIndex
  - question points
- Make it easy to publish a kind 35004 Score Update using NostrAgent.

After completing the task:
1. Add unit tests for the scoring functions.
2. Prove via tests that correct answers increase score and wrong answers do not.
3. Commit, push, and create a release (e.g. `v0.1-logic-scoring`).
4. Describe a manual test scenario with one host and one player verifying that scores update and the “score stays at 0” bug is fixed.
`

# Example to use

GameLogicAgent: Implement the full scoring engine and integrate it with the host client so that after each question, the host:
- collects all Answer events for the current question
- computes scores
- publishes a Score Update event (kind 35004)

Make sure that players receive updated scores and that a correct answer no longer results in a score of 0. Add unit tests where possible, then push, release, and provide manual multi-player test instructions.
