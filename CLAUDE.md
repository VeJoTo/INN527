# CLAUDE.md

## Git workflow

Two people work in this repo, so `main` is kept stable and changes go through branches.

- Never commit directly to `main`. Before making changes, check the current branch; if it is `main`, suggest a branch name and create it (`git switch -c <name>`) before editing.
- Branch names: short, lowercase, hyphenated, prefixed by type — `feature/…`, `fix/…`, `content/…`, `docs/…` (e.g. `fix/back-button-safari`).
- Run `git pull` on `main` before branching so the branch starts from the latest work.
- When the work is done, push the branch and suggest opening a pull request into `main` for the other person to look at. Don't merge into `main` without the user's go-ahead.
- GitHub Pages deploys from `main`, so anything merged there goes live.
