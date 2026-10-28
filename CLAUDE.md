# CLAUDE.md

## Git workflow

Two people work in this repo, so `main` is kept stable and changes go through branches.

- Never commit directly to `main`. Before making changes, check the current branch; if it is `main`, suggest a branch name and create it (`git switch -c <name>`) before editing.
- Branch names: short, lowercase, hyphenated, prefixed by type — `feature/…`, `fix/…`, `content/…`, `docs/…` (e.g. `fix/back-button-safari`).
- Run `git pull` on `main` before branching so the branch starts from the latest work.
- When the work is done, push the branch and suggest opening a pull request into `main` for the other person to look at. Don't merge into `main` without the user's go-ahead.
- GitHub Pages deploys from `main`, so anything merged there goes live.

## Onboarding a new collaborator

The repo is owned by Vera (GitHub `VeJoTo`). Her collaborator is `ovalork`. If `git config user.name` / `gh api user` shows someone other than Vera and they haven't been onboarded yet, start the first session by briefly walking them through the "Where we are" and "Testing in the browser" sections below, then ask what they want to work on.

## Where we are (last updated 2026-10-28)

Two independent prototypes for a living lab project, both plain HTML/CSS/JS with Tailwind, no backend and no stored user data. Each folder's `README.md` explains files, content editing and the CSS build.

- **Trykk pause** (repo root): guided questions that help young people look closer at content they meet on social media. Live at https://vejoto.github.io/INN527/
- **Manipulasjonsradar** (`manipulasjonsradar/`): the current focus. A fictional feed of 12 posts where VG3 students guess which manipulation techniques a post uses, then the radar reveals the answer, and a "feedreise" at the end shows how the feed shifted. Live at https://vejoto.github.io/INN527/manipulasjonsradar/
  - Design spec and implementation plan: `manipulasjonsradar/docs/specs/` and `manipulasjonsradar/docs/plans/`
  - Tests: `node --test tester/` from `manipulasjonsradar/` (must end with `fail 0`)
  - Content rules: everything is fictional, no real accounts, people, parties, places, hashtags or slogans.
  - Recently done: responsive layout for several phone sizes and landscape, fixes from the first UX test, the post stays visible (mini-card) while guessing, and the browser back button works inside the app.
  - Next up: test on real phones, especially iPhone Safari's back-swipe, which behaves differently from desktop Chrome. QR codes for test sessions (`qr.png`/`qr.svg`) are local only and not ready to commit.

## Testing in the browser (Chrome DevTools)

We test with the Chrome DevTools MCP plugin, which lets Claude drive a real Chrome window: open the page, click and type, emulate phone sizes and landscape, take screenshots, check console errors, run Lighthouse and accessibility checks, and test keyboard navigation.

- Install once in Claude Code: `/plugin install chrome-devtools-mcp@claude-plugins-official` (needs Google Chrome installed), then restart Claude Code.
- Serve the page locally so the service worker and offline mode work: `python3 -m http.server 8000` in the repo root, then open http://localhost:8000/manipulasjonsradar/
- After a visual or interaction change, verify it in the browser at phone width (e.g. 375×667 and landscape) as well as desktop before calling it done.
