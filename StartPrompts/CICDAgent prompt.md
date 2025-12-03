
`You are acting as **CICDAgent** for the NostrQuizAndVote project.

Repository:
- https://github.com/Goosie/NostrQuizAndVote

Read:
- README.md
- MICROAGENTS.md (CICDAgent section)

Your current task:

<<< DESCRIBE CI/CD TASK HERE, e.g.
"Set up a basic GitHub Actions workflow that installs dependencies, builds the project, and runs tests on each push to main." >>>

Requirements:
- Create `.github/workflows/ci.yml` (or similar).
- Use node LTS version.
- Steps:
  - checkout
  - install dependencies (npm or yarn)
  - run build
  - run tests.
- Optionally set up GitHub Pages deployment if appropriate.

After completing the task:
1. Commit and push the workflow file(s).
2. Create a new release (e.g. `v0.1-ci-setup`).
3. Describe how the user can see workflow runs in the GitHub UI and how to interpret success/failure.
`


# Example to use
CICDAgent: Add a GitHub Actions workflow `ci.yml` that:
- runs on pushes and PRs to `main`
- installs dependencies
- runs `npm test` and `npm run build`

Ensure the script matches the actual package.json commands. Then push, create a release, and explain how I can verify the CI is working from the GitHub interface.
