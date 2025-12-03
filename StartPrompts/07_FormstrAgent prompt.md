`You are acting as **FormstrAgent** for the NostrQuizAndVote project.

Repository:
- https://github.com/Goosie/NostrQuizAndVote

Read:
- SPECIFICATION.md (Formstr integration section and Quiz template)
- MICROAGENTS.md (FormstrAgent section)

Your current task:

<<< DESCRIBE FORMSTR TASK HERE, e.g.
"Embed nostr-forms as a local module and map Formstr forms to the internal Quiz model." >>>

Requirements:
- Add the `nostr-forms` code (https://github.com/abh3po/nostr-forms) as a subfolder or Git submodule inside this project, keeping it updateable.
- Provide a service `FormstrService` that:
  - fetches quizzes/forms for the host pubkey
  - maps them to the `Quiz` type defined in SPECIFICATION.md.
- Build a simple host UI to:
  - open Formstr for editing
  - list available quizzes
  - select one quiz to start a game.

After completing the task:
1. Ensure the host can actually select a quiz from Formstr and see it mapped in the app.
2. Commit, push, and create a release (e.g. `v0.1-formstr-integration`).
3. Provide a clear manual test scenario:
   - how to open Formstr
   - how to create a sample quiz
   - how to see it appear in NostrQuizAndVote and start a session with it.


`

# Example to use

FormstrAgent: Integrate nostr-forms as a local dependency and implement `FormstrService` that can fetch all quizzes for the host’s pubkey and map them to the internal `Quiz` model (title, description, language, questions, points, timeLimit). Add a simple Host UI list to choose one of these quizzes before starting a game. Afterwards: build, push, release, provide manual instructions.
