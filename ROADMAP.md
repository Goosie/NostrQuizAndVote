# NostrQuizAndVote – ROADMAP (Beyond MVP)

This document describes future enhancements for NostrQuizAndVote.  
The MVP must first be completed as described in `SPECIFICATION.md` before these items are implemented.

---

## Phase 2 – Question & Game Mode Extensions

1. **More Question Types**
   - Polls (no correct answer, just opinions).
   - Open text answers.
   - Numeric answers (with tolerance).
   - Multi-select (more than one correct option).

2. **Team Mode**
   - Allow players to join as part of a team.
   - Teams share a cumulative score.
   - Leaderboards show both teams and individuals (optional).

3. **Advanced Scoring Modes**
   - Speed-based scoring: earlier answers → more points.
   - Streak bonuses for consecutive correct answers.
   - Weighted questions (harder questions grant more points).

---

## Phase 3 – Analytics & Reporting

1. **Quiz Analytics Dashboard**
   - Visualize per-question correctness percentages.
   - Track average response time per player and per question.

2. **Export Features**
   - CSV export of:
     - Game sessions.
     - Player performance.
     - Per-question statistics.

3. **Play History**
   - Host can see list of past sessions with summary (date, quiz, players, scores).

---

## Phase 4 – Lightning / Sats Integration

1. **Deposit Quizzes (Full Implementation)**
   - NostrQuizAndVote integrates with a Lightning wallet (e.g. via WebLN, LNURL, LNDHub, LNbits).
   - When joining a deposit quiz:
     - Player pays the configured deposit amount.
     - Payment status is checked before confirming the join.
   - Deposits are held in a quiz "pot".

2. **Payout Logic**
   - After each question or at the end of the game, sats are distributed to players based on:
     - Number of correct answers.
     - Final ranking.
   - Host receives the configured fee percentage.

3. **Rewards & Badges**
   - Award non-monetary badges for:
     - First correct answer.
     - Highest streak.
     - Perfect quiz (all answers correct).
   - Optionally publish reward/badge events on Nostr.

---

## Phase 5 – Voting & Opinion Polls

1. **Poll Mode**
   - Host can launch a simple poll instead of a scored quiz.
   - Players vote in real time.
   - Results are visualized (bar charts, percentages).

2. **Multi-Round Voting**
   - Support for multiple rounds (e.g. using the same PIN for sequential polls).
   - Could be used for decision-making in groups, events, meetups.

3. **Nostr-Based Audit Trail**
   - All poll questions and results are stored as Nostr events.
   - Anyone can verify the public tally by replaying events from relays.

---

## Phase 6 – UX & Customization

1. **Theme Customization**
   - Allow hosts to switch between different color themes (dark, light, high-contrast).
   - Let hosts upload a logo for branding.

2. **Localization**
   - Full i18n support for multiple languages.
   - Quiz language already exists, extend to all UI strings.

3. **Accessibility**
   - Keyboard navigation & screen reader support.
   - Color contrast improvements for accessibility compliance.

---

## Phase 7 – Ecosystem & Integration

1. **Integration with Other Nostr Apps**
   - Create embeddable widgets or links to start a quiz from other Nostr clients.
   - Publish session announcements as regular Nostr notes.

2. **Public Quiz Library**
   - Hosts can choose to publish quizzes as open content.
   - Other hosts can reuse and remix existing quizzes.

3. **Plugin System**
   - Allow third-party modules to add question types, scoring modes or integration providers.

---

## Implementation Notes for Future Work

- All roadmap items should reuse and extend the existing event kinds where possible.
- New event kinds (e.g. for poll results) should follow a similar naming and structure pattern to keep the protocol clean.
- Lightning integration should be implemented in a modular way so different wallets/providers can be plugged in without changing core logic.
