# NostrQuizAndVote – MICROAGENTS Specification

This document defines recommended **MicroAgents** for OpenHands to organize the work on NostrQuizAndVote.

These roles are intended as logical separation of responsibilities. OpenHands can implement them as separate agents, tasks, or internal modes.

---

## 1. ArchitectureAgent

**Responsibility:** Overall project structure and consistency.

- Create and maintain directory layout.
- Define and update TypeScript interfaces and core models.
- Maintain `SPECIFICATION.md` and keep code aligned with it.
- Coordinate changes that touch multiple layers (UI, Nostr, Formstr, game engine).
- Ensure all new features are reflected in docs and types.

**Key tasks:**
- Initial scaffolding with Vite + React + TypeScript.
- Defining `Quiz`, `Question`, `QuizSettings`, and Nostr event types.
- Ensuring that roadmap items can be integrated later without refactor.

---

## 2. UIAgent

**Responsibility:** User interface and UX.

- Implement React components for host and player flows.
- Apply the shared CSS theme and component styles (`pin-display`, `lobby-card`, `answer-button`, `leaderboard-row`).
- Ensure responsive behavior (desktop host, mobile player).
- Provide clear visual states: lobby, answering, waiting, feedback, leaderboard.

**Key tasks:**
- Host pages: login, quiz selection, lobby, in-game control panel, leaderboard.
- Player pages: join screen, lobby, question view, feedback, final ranking.
- Theme switch support (dark/light) using CSS variables.

---

## 3. NostrAgent

**Responsibility:** Nostr integration, event IO, and NIP-07.

- Implement a Nostr connector using a library like `nostr-tools`.
- Support NIP-07 login for host and optional for players.
- Maintain subscriptions for:
  - Game Session events (kind 35001).
  - Player Join (35002).
  - Answer events (35003).
  - Score Update events (35004).
- Provide a high-level API to the rest of the app, e.g.:
  - `createGameSession(quizId, pin, settings)`
  - `joinSession(sessionId, nickname, playerId)`
  - `submitAnswer(sessionId, questionIndex, answerIndex, timeMs)`
  - `publishScoreUpdate(...)`
- Allow configuration of relay URLs (e.g. via `.env` or config object).

**Key tasks:**
- Robust connection & reconnection handling.
- Clean serialization of JSON content into Nostr events.
- Validation and parsing of incoming events to internal types.

---

## 4. FormstrAgent

**Responsibility:** Local Formstr integration and quiz mapping.

- Embed the Formstr project under a subfolder or as a module.
- Provide a clear way for the host to open Formstr UI within the app.
- Fetch stored Formstr quizzes/events for the host pubkey.
- Map Formstr forms to internal `Quiz` objects as defined in `SPECIFICATION.md`.

**Key tasks:**
- Define a standard Formstr template for quiz forms.
- Implement a mapping layer: `formstrForm -> Quiz`.
- (Optional) Publish Quiz Definition events (kind 35000) referencing the Formstr event ID.

---

## 5. GameLogicAgent

**Responsibility:** Core quiz logic and scoring engine.

- Manage session state on the frontend: current question, time left, scores.
- Provide functions for:
  - Starting/ending questions.
  - Evaluating answers.
  - Calculating scores and leaderboards.
- Coordinate with NostrAgent to publish Score Update events.

**Key tasks:**
- Implement deterministic, testable scoring functions.
- Ensure working behaviour for:
  - single-player test
  - multiple players joining and answering.
- Fix and prevent bugs like “score stays at 0 after correct answer”.

---

## 6. CICDAgent

**Responsibility:** Automation, repo integration, and releases.

- Configure GitHub repository (`https://github.com/Goosie/NostrQuizAndVote`).
- Create GitHub Actions for:
  - install + build
  - test
  - lint (optional)
- After each implemented feature:
  - Commit changes.
  - Push to GitHub.
  - Create a tagged release (e.g. `v0.1-mvp-host-join`).
- Optionally build and publish a static preview (GitHub Pages, etc.).

**Key tasks:**
- Setup basic CI (build + test on each push or PR).
- Document how to run the project locally in `README.md`.
- Keep a simple changelog, either in releases or a `CHANGELOG.md` file.

---

## 7. Collaboration Between Agents

Example flow for a feature (e.g. Implement MVP join flow):

1. **ArchitectureAgent**:
   - Defines types and interfaces for `Session`, `Player`, and `JoinRequest`.
2. **NostrAgent**:
   - Implements `joinSession()` and event handling for kind 35002.
3. **UIAgent**:
   - Builds the `/join` page and lobby UI.
4. **GameLogicAgent**:
   - Connects join events to internal player state in the session.
5. **CICDAgent**:
   - Ensures tests pass, pushes code, and tags a release.

The AI should use these roles to keep work structured and avoid mixing concerns.
