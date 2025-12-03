# NostrQuizAndVote – BUGS and Test Scenarios

This file documents known issues and suggested test scenarios, mainly to help the AI (OpenHands) validate the implementation.

---

## 1. Known Bug: Score Stays at 0 After Correct Answer

### Description

- A host starts a quiz and a player joins successfully.
- The player answers a question that should be correct.
- The UI accepts the answer, but the player's score remains **0**.

This indicates a problem in one or more of the following areas:
- Score calculation logic.
- Publishing of Score Update events.
- Subscription and handling of Score Update events on the player side.
- Incorrect matching of player IDs when applying scores.

### Reproduction Scenario

1. Host creates or selects a quiz with at least one question.
2. Host starts a game session, a PIN is shown.
3. Player opens the join page, enters the PIN and a nickname.
4. Host sees the player appear in the lobby.
5. Host starts the game (Question 1 becomes active).
6. Player sees Question 1 and selects the correct answer.
7. Player submits the answer.
8. After the question ends (time runs out or host ends question), the player should see:
   - “Correct!” feedback.
   - A non-zero score (equal to the question’s points).
9. If the score remains 0, then the bug is still present.

### Expected Fix

- Make sure that the Game Engine:
  - Receives all relevant Answer events for the current question.
  - Determines which answers are correct.
  - Calculates scores incrementally per player.
- Ensure that:
  - A Score Update event (kind 35004) is published by the host after each question.
  - Player clients are subscribed to these events and update their local state correctly.

---

## 2. General Manual Test Scenarios (MVP)

### 2.1 Single-Host Single-Player Test

- Open two windows: Host (A) and Player (B).
- In A: connect with Nostr, select a quiz, start a game.
- In B: join via PIN, see lobby.
- In A: start game, go through one or more questions.
- In B: answer all questions quickly and correctly.
- Verify:
  - Player score increases with each correct answer.
  - Final leaderboard is consistent with the answers given.

### 2.2 Two-Player Competition Test

- Open three windows: Host (A), Player1 (B), Player2 (C).
- Both players join the same PIN with different nicknames.
- For each question:
  - Player1 answers correctly.
  - Player2 answers incorrectly or slower.
- Verify:
  - Player1 consistently scores higher.
  - Leaderboard order updates correctly after each question.

### 2.3 Lost Connection / Reload Test (Optional for MVP)

- During a game, reload Player window.
- Player re-joins with the same PIN and nickname.
- Verify that the player can continue to play from that point on.
