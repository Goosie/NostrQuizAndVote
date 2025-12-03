# NostrQuizAndVote – OpenHands Starter Package

This repository is a **ready-to-use spec bundle** for building **NostrQuizAndVote** with the AI development platform **OpenHands**.

NostrQuizAndVote is a Kahoot-style multiplayer quiz & voting platform on top of **Nostr**, using **Formstr** as the quiz editor.

---

## How to use this package in OpenHands

1. **Upload this ZIP** into OpenHands (or import the files into a new repo at:
   - `https://github.com/Goosie/NostrQuizAndVote`

2. In OpenHands, give the agent an instruction like:

   > You are an AI development agent. This repository contains the full functional specification for the NostrQuizAndVote project.  
   > Read SPECIFICATION.md, MICROAGENTS.md and ROADMAP.md carefully and then start implementing the MVP as described.  
   > Use small, well-defined steps. After each step:
   > - push the code to the linked GitHub repo
   > - create a release
   > - and write down a manual test scenario I can follow in two browser windows (host + player).

3. The primary documents are:
   - `SPECIFICATION.md` – full functional and technical spec for the MVP.
   - `MICROAGENTS.md` – recommended OpenHands agent roles and responsibilities.
   - `ROADMAP.md` – later-phase extensions, **do not** implement in the first iteration.
   - `BUGS.md` – known issues and scenarios to validate (especially the scoring bug).

---

## Minimal MVP Scope

The MVP should deliver:

- Host can:
  - log in with Nostr (NIP-07)
  - select a quiz from embedded Formstr
  - start a game session → PIN + QR
  - see lobby with joined players
  - start questions & show leaderboard

- Player can:
  - join via PIN or QR
  - enter nickname (optional Nostr login)
  - receive questions
  - submit answers
  - see if they are right/wrong
  - see their score and ranking

- All game state (session, joins, answers, scores) uses **Nostr events** with well-defined kinds.

The detailed behaviour, event kinds, data structures and styling guidelines are all defined in `SPECIFICATION.md`.
