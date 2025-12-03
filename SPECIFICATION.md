# NostrQuizAndVote – Functional & Technical Specification (MVP)

## 1. Project Name & High-Level Concept

**Project name:** `NostrQuizAndVote`  
**Tagline:** “Kahoot-style live quizzes & votes on Nostr, powered by Formstr.”

NostrQuizAndVote is a fun and interactive quiz game that challenges players to test their knowledge on a variety of topics.  
The game can be played with friends or in group settings, allowing players to compete for the highest score.  
Later it can be extended with opinion polls, voting rounds, and sats-based rewards.

The goal of this document is to define **everything the AI (OpenHands) needs** to build the **MVP end-to-end**, with minimal ambiguity.

---

## 2. High-Level Goals

Build a **web application** with:

- A **Host (Quizmaster)** view:
  - Logs in using **Nostr (NIP-07 browser extension)**.
  - Creates or selects quizzes via an **embedded Formstr module**.
  - Starts a **live Nostr-backed quiz session** with a **PIN** and **QR code**.
  - Controls game flow (start game, next question, show leaderboard).
  - Sees joined players + their progress.

- A **Player** view:
  - Joins using a **Game PIN** or scans a **QR code**.
  - Optionally logs in with Nostr, otherwise ephemeral identity.
  - Receives questions and submits answers.
  - Sees feedback and score / ranking.

- **Nostr-based backend** with no custom server:
  - Quiz definitions, sessions, joins, answers and scores are published & read via Nostr events.
  - Relay URLs are configurable.

- **Formstr integration**:
  - Formstr (https://github.com/abh3po/nostr-forms) is **embedded** as a module in this project (no external SAAS dependency).
  - Quizzes are authored with Formstr and mapped into an internal Quiz model.

- **Future support for sats / zaps**:
  - MVP only needs basic structures for deposit quizzes; lightning flows can be implemented later.
  - The design must not block Lightning extensions.

---

## 3. Architecture Overview

### 3.1 Application Layers

1. **Frontend SPA**
   - Framework: **React + TypeScript** (Vite recommended).
   - Two main routes:
     - `/host` – host / quizmaster interface.
     - `/join` – player interface.
   - Component groups:
     - Host: lobby, control panel, quiz selection, leaderboard.
     - Player: join screen, question screen, score screen.

2. **Formstr Module**
   - Embedded from https://github.com/abh3po/nostr-forms as a **subfolder or git submodule**.
   - It must be possible to update the Formstr source from its upstream repo without breaking NostrQuizAndVote.
   - The host uses Formstr locally to create and save forms/quizzes.
   - A service maps Formstr forms → internal `Quiz` objects.

3. **Nostr Service**
   - Uses a well-maintained Nostr client library (e.g. `nostr-tools`).
   - Responsibilities:
     - NIP-07 login (get active pubkey).
     - Connecting to one or more relays.
     - Publishing events for quiz definitions, sessions, joins, answers, scores.
     - Subscribing to relevant event filters and dispatching them to the app.

4. **Game Engine**
   - Pure TypeScript logic.
   - Responsibilities:
     - Representing quiz and session state (current question, timers, scores).
     - Evaluating answers and computing scoring.
     - Generating leaderboard snapshots.

5. **Lightning / Zap Integration (Design Only for MVP)**
   - For MVP:
     - Add config fields and data structures for deposit quizzes and payouts.
     - Actual Lightning payment flows can be added in later releases.

---

## 4. Roles & User Stories

### 4.1 Host / Quizmaster User Stories

- As a host, I want to **log in with Nostr (NIP-07)** so that my quizzes and game sessions are linked to my public key.
- As a host, I want to **create or select quizzes using embedded Formstr**, so that I can design game content without depending on external services like formstr.app.
- As a host, I want to **see a list of my available quizzes** and select one to start a game with.
- As a host, I want to **start a game session that generates a Game PIN and QR-code**, so that players can quickly join using their phone.
- As a host, I want to **configure whether questions appear manually (click “next”) or automatically after a time period**, so that I can tailor the pacing of the game.
- As a host, I want to **choose between quiz types**:
  - free quiz (no deposit, only points)
  - deposit quiz (players pay a number of sats/zaps to join, can earn them back for correct answers)
- As a host, I want to **configure the deposit amount, payout per correct answer, and my fee percentage**, so that I can host paid games sustainably.
- As a host, I want to **see a lobby of joined players (nickname + pubkey if available)**, so I can verify who is playing.
- As a host, I want to **start the game when ready**, so that players cannot answer questions before I start.
- As a host, I want to **see incoming answers and a leaderboard after each question**, so that I can track performance.
- As a host, I want to **show a final leaderboard & podium**, so that players see who won.

### 4.2 Player User Stories

- As a player, I want to **join a game by entering a Game PIN**, so that I can participate from my mobile device.
- As a player, I want to **scan a QR code shown on the host’s screen** to join quickly without typing.
- As a player, I want to **choose a nickname** and optionally log in with Nostr, so I can play casually or with my identity.
- As a player, I want to **see clearly when the quiz is waiting in the lobby**, so I know the game hasn’t started yet.
- As a player, I want to **see the current question and answer options**, with a countdown timer, so that I know how long I have to answer.
- As a player, I want to **submit my answer easily on mobile**, so that I can respond quickly.
- As a player, I want to **see feedback after each question** (correct / wrong and current score), so that I stay motivated.
- As a player, I want to **see my ranking compared to others**, so that I understand how I am performing in the quiz.
- (Later) As a player, I want to **earn rewards or badges** or **receive sats** for good performance.

---

## 5. Functional Requirements – MVP

### 5.1 Host Flow

1. Host navigates to `/host`.
2. Host clicks “Connect with Nostr” (NIP-07).
3. After login, host sees a page with:
   - Button: “Create / Edit quizzes in Formstr” (opens embedded Formstr UI).
   - List of existing Formstr quizzes belonging to their pubkey.
4. Host selects one quiz and clicks “Start Game”.
5. App generates a **Game PIN** (e.g. 6 digits) and creates a **Game Session**.
6. App publishes a **Game Session Nostr event**.
7. Host sees a **Lobby screen** with:
   - Big PIN display
   - QR code with link like: `/join?pin=XXXXXX`
   - List of joined players (nicknames)
   - Button: **Start Game**
8. When host presses “Start Game”:
   - Game moves into **Question 1**.
   - Host screen shows the current question, options, countdown, and “Next question” / “Show leaderboard” controls.

### 5.2 Player Flow

1. Player navigates to `/join` or uses QR link.
2. Player enters **Game PIN** and a **nickname**.
   - Optionally connects a Nostr pubkey (NIP-07), especially for deposit quizzes.
3. The app looks up the **Game Session** via Nostr (kind 35001 filtered by PIN).
4. If session exists:
   - It publishes a **Player Join** event.
   - Player goes to **Waiting/Lobby screen**: “Waiting for host to start the game…”
5. When host starts the game:
   - Player receives the current question and answer options.
6. Player selects an answer and submits.
   - Client publishes an **Answer** Nostr event.
7. After the question is closed:
   - Player receives a **Score Update** event.
   - Player sees whether they were correct and their updated score.

---

## 6. Data Model

### 6.1 Internal Quiz Model

```ts
export type QuestionType = "multiple_choice" | "true_false";

export interface Quiz {
  id: string;              // deterministic ID, may map from Nostr/Formstr IDs
  title: string;
  description: string;
  language: string;        // ISO code, e.g. "en", "nl"
  questions: Question[];
  settings?: QuizSettings;
}

export interface Question {
  index: number;           // 0-based index in quiz
  text: string;
  type: QuestionType;
  options: string[];       // for true_false: ["True", "False"]
  correctIndex: number;    // 0-based index into options
  timeLimitSeconds: number;
  points: number;
}

export interface QuizSettings {
  revealMode: "manual" | "timed"; // host-controlled vs automatic timing
  defaultTimePerQuestion?: number;
  quizType: "free" | "deposit";
  depositSats?: number;          // if quizType=deposit
  payoutPerCorrect?: number;     // sats per correct answer
  hostFeePercent?: number;       // percentage of deposits that goes to host
}
```

### 6.2 Formstr Mapping

- Formstr forms are stored as Nostr events.
- We define a **standard template** for Formstr that yields our quiz structure.
- A **Formstr service** is responsible for:
  - Fetching all forms (quizzes) for a given host pubkey.
  - Mapping the Formstr JSON to our internal `Quiz` structure.
  - Optionally publishing a quiz definition event (kind 35000).

---

## 7. Nostr Event Model

All Nostr kinds mentioned are suggestions; they must be used consistently throughout the app.

### 7.1 Quiz Definition – kind `35000`

- Created optionally when a quiz is published or selected for play.
- Content (JSON):
  ```json
  {
    "quiz_id": "string",
    "title": "string",
    "description": "string",
    "language": "en",
    "question_count": 10
  }
  ```
- Suggested tags:
  - `["d", "<quiz_id>"]`
  - `["formstr", "<formstr_event_id>"]`

### 7.2 Game Session – kind `35001`

- Created when host starts a game.
- Content (JSON):
  ```json
  {
    "quiz_id": "string",
    "pin": "123456",
    "settings": {
      "time_per_question": 20,
      "quiz_type": "free"
    }
  }
  ```
- Suggested tags:
  - `["h", "<host_pubkey>"]`   // host
  - `["d", "<session_id>"]`    // deterministic session ID

The `session_id` can be derived from `quiz_id + pin` or a UUID.

### 7.3 Player Join – kind `35002`

- Content (JSON):
  ```json
  {
    "session_id": "string",
    "nickname": "Player 1"
  }
  ```
- Tags:
  - `["p", "<player_pubkey_or_ephemeral>"]`
  - `["e", "<session_event_id>"]`

### 7.4 Answer – kind `35003`

- Content (JSON):
  ```json
  {
    "session_id": "string",
    "question_index": 0,
    "answer_index": 2,
    "time_ms": 3312
  }
  ```
- Tags:
  - `["p", "<player_pubkey_or_ephemeral>"]`
  - `["e", "<session_event_id>"]`

### 7.5 Score Update / Leaderboard – kind `35004`

- Emitted by the host client after each question.
- Content (JSON):
  ```json
  {
    "session_id": "string",
    "question_index": 0,
    "scores": [
      { "player_id": "<pubkey_or_ephemeral>", "nickname": "Player 1", "total_score": 2000 },
      { "player_id": "<another>", "nickname": "Player 2", "total_score": 1500 }
    ]
  }
  ```
- Tags:
  - `["e", "<session_event_id>"]`

---

## 8. Game Flow Logic

### 8.1 Host Flow Step-by-Step

1. Host logs in (NIP-07).
2. Host opens embedded Formstr screen, creates or edits a quiz.
3. Host returns to host dashboard and sees a list of quizzes:
   - `title`, `question_count`, `last_updated`.
4. Host selects a quiz and clicks “Start Game”.
5. App generates a PIN and `session_id`.
6. App publishes Game Session event (kind 35001).
7. Host sees Lobby screen with:
   - Big PIN
   - QR code (URL with `?pin=`)
   - Player list (updated via Nostr Player Join events).
8. Host clicks “Start Game”:
   - Game sets `currentQuestionIndex = 0`.
   - Host view and Player view both show Question 0.
9. For each question:
   - Host may see a countdown and “Next” or “End question”.
   - Players send Answer events.
   - After time limit or host action:
     - Game Engine evaluates correctness and updates scores.
     - Host client publishes Score Update event (kind 35004).
     - Host & players show updated leaderboard.
10. After the last question:
    - Host shows **final leaderboard** + podium.

### 8.2 Player Flow Step-by-Step

1. Player opens `/join` or QR deep-link.
2. Player submits PIN + nickname.
3. App finds corresponding Game Session via Nostr subscription.
4. If session exists:
   - App publishes Player Join event (kind 35002).
   - Player view → Lobby wait screen.
5. When game starts:
   - Player view shows question & options.
6. Player selects an answer and submits → Answer event (kind 35003).
7. After question closure:
   - Player gets Score Update event.
   - Player sees “Correct / Wrong” and updated score.
8. After game end:
   - Player sees final ranking and totals.

---

## 9. Non-Functional Requirements

- **Frontend tech:** React + TypeScript (Vite).
- **Styling:** CSS or Tailwind; use the provided color palette.
- **Responsiveness:**
  - Host view optimized for desktop / laptop.
  - Player view optimized for mobile (touch-friendly buttons).
- **Code organization:**
  - `src/services/nostr`
  - `src/services/formstr`
  - `src/game`
  - `src/components/host`
  - `src/components/player`
- **Testing:**
  - At least basic unit tests for:
    - quiz mapping from Formstr → internal model
    - score calculation logic

---

## 10. CSS Theme & Components

The project should use the following base color system and some recommended component styles.

### 10.1 Color Variables

```css
:root {
  --color-primary:       #5B2DEE;
  --color-primary-light: #8B62FF;
  --color-primary-dark:  #2B0F8E;

  --color-accent-blue:   #2EA3FF;
  --color-accent-cyan:   #24E1FF;
  --color-accent-pink:   #F72585;

  --color-bg:            #0E0F19;
  --color-surface:       #1A1B28;
  --color-surface-light: #292A3A;

  --color-text:          #FFFFFF;
  --color-text-secondary:#B3B7C5;

  --color-correct:       #2EFF7B;
  --color-wrong:         #FF3B3B;
  --color-warning:       #FFB500;

  --shadow-card:         0 4px 20px rgba(0,0,0,0.3);
  --rounded:             12px;
}

/* Dark theme (default) */
:root {
  --color-bg: #0E0F19;
  --color-surface: #1A1B28;
  --color-surface-light: #292A3A;
  --color-text: #FFFFFF;
}

/* Light theme */
[data-theme="light"] {
  --color-bg: #F8F8FF;
  --color-surface: #FFFFFF;
  --color-surface-light: #E9E9F6;

  --color-text: #1A1B28;
  --color-text-secondary: #4B4F63;

  --shadow-card: 0 4px 12px rgba(0,0,0,0.1);
}
```

Theme switching example:

```js
document.documentElement.setAttribute('data-theme', 'light');
```

### 10.2 Big PIN Display

```css
.pin-display {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--color-accent-cyan);
  text-shadow: 0 0 10px rgba(36,225,255,0.6);
}
```

### 10.3 Host Lobby Card

```css
.lobby-card {
  background: var(--color-surface);
  border-radius: var(--rounded);
  padding: 24px;
  box-shadow: var(--shadow-card);
  color: var(--color-text);
}
```

### 10.4 Answer Buttons (Player View)

```css
.answer-button {
  background: var(--color-surface-light);
  border-radius: var(--rounded);
  padding: 16px;
  margin: 12px 0;
  color: var(--color-text);
  font-size: 1.2rem;
  border: 2px solid transparent;
  transition: 0.2s;
}

.answer-button:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-dark);
  cursor: pointer;
}

.answer-button.correct {
  background: var(--color-correct);
  color: #000;
}

.answer-button.wrong {
  background: var(--color-wrong);
}
```

### 10.5 Leaderboard Rows

```css
.leaderboard-row {
  background: var(--color-surface-light);
  padding: 12px 20px;
  border-radius: var(--rounded);
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
}
```

---

## 11. Known Bug to Reproduce & Fix (Score Stays at 0)

There is a known issue described by the user in a previous test run:

- Host starts quiz.
- Player joins, answers a question successfully.
- Answer appears to be submitted, but the **score for the player remains 0**.

### 11.1 Scenarios to Consider

- **Score Engine does not run:**
  - Host client never evaluates answers and never creates a Score Update event.
- **Score Update event is missing or malformed:**
  - Event kind or content does not match what the player client expects.
- **Subscription issue on player side:**
  - Player is not subscribed to Score Update events for the given `session_id`.
- **Wrong mapping between player identity and scores:**
  - Scores computed are not matched to the correct player in the UI.

### 11.2 Expected Fix in MVP

- Implement a **deterministic, testable score calculation function** in the Game Engine.
- Ensure host publishes **kind 35004 Score Update** after each question.
- Ensure player subscribes to `kind=35004` with `session_id` and updates UI from the event.

---

## 12. Deliverables for the AI (OpenHands)

For the **MVP**, the AI should:

1. Scaffold a React + TypeScript SPA with routes `/host` and `/join`.
2. Integrate NIP-07 login on host side.
3. Embed the Formstr module under a subpath (e.g. `/formstr` or dedicated component).
4. Implement the internal `Quiz` model and mapping from Formstr form data.
5. Implement Nostr service with support for kinds 35000–35004 as defined.
6. Implement the full host & player flows as described above.
7. Implement basic styling using the provided CSS variables and class patterns.
8. Provide test scenarios for:
   - Host + player run on localhost with two browser windows.
   - At least one free quiz (no deposits).
9. Push all code to `https://github.com/Goosie/NostrQuizAndVote`.
10. Create a release once the MVP is working end-to-end.

The **roadmap for future extensions** is defined separately in `ROADMAP.md`.  
The MVP should **not** implement roadmap items yet, but must be designed so they can be added later without major refactors.
