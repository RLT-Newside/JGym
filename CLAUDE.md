## Git Workflow

Before every change:
- `git fetch origin` then check the branch is up to date with `origin/main`: `git log HEAD..origin/main --oneline`
- If behind, rebase first: `git rebase origin/main` and resolve any conflicts before touching code

After every change:
1. Check for an existing unmerged branch (`git branch -r --no-merged main`). If one exists, switch to it and commit there.
2. If no unmerged branch exists, create a new branch using the conventional prefix that matches the change type:
   - `feat/short-description` — new feature
   - `fix/short-description` — bug fix
   - `refactor/short-description` — code restructure without behavior change
   - `chore/short-description` — tooling, config, deps
   - Short description: kebab-case, 2–4 words, describes the what (e.g. `fix/camera-on-close`, `feat/barcode-scanner`, `refactor/auth-middleware`)
3. Always: `git add` relevant files → `git commit` → `git push`

Never commit directly to main.

## Pull Request Rebases

Every open PR must stay rebased on `origin/main`. Before merging — and whenever `main` advances — rebase each PR branch:
- `git fetch origin`
- For each PR branch: `git checkout <branch>` → `git rebase origin/main` → resolve conflicts → `git push --force-with-lease`
- Never merge a PR that is behind `origin/main`.

## Pre-push Checks

Before every `git push`, run these and fix any failures:
1. `npx biome check src/` — must pass with 0 errors
2. `node node_modules/typescript/lib/tsc.js -b` — must compile clean

Never push code that fails biome or tsc.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
