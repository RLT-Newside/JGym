# Claude Tooling — Plugins, Skills & Config

Reference for anyone continuing this project with Claude Code. Lists every plugin, marketplace, skill, and hook that was in use, plus the extra skills we want to add.

> Skills/plugins live in `~/.claude/` (user scope) and `.claude/` (project scope). They are **not** committed by default — install them locally to reproduce this setup.

---

## 1. Installed Plugins (marketplaces)

| Plugin | Marketplace source | Scope | Purpose |
|--------|--------------------|-------|---------|
| `caveman@caveman` | github: `JuliusBrussee/caveman` | user | Ultra-compressed "caveman" communication mode. Cuts token usage ~75%. Ships skills: `caveman`, `caveman-commit`, `caveman-help`, `caveman-review`, `compress`. |

**Known marketplace (registered, available to install from):**
- `claude-plugins-official` → github: `anthropics/claude-plugins-official`

Install a marketplace + plugin:
```bash
/plugin marketplace add JuliusBrussee/caveman
/plugin install caveman@caveman
```

---

## 2. User Skills (`~/.claude/skills/`)

Design/UX skill set that was active:

| Skill | What it does |
|-------|--------------|
| `banner-design` | Banners for social/ads/web/print. Multiple art-direction options, AI visuals. |
| `brand` | Brand voice, visual identity, messaging frameworks, brand consistency. |
| `design` | Umbrella design skill: logos, CIP, mockups, slides, banners, icons, social photos. |
| `design-system` | Token architecture (primitive→semantic→component), component specs, slides. |
| `graphify` | Any input → knowledge graph, clustered communities, HTML + JSON + audit report. Used by this project (see `graphify-out/`). |
| `slides` | Strategic HTML presentations with Chart.js, design tokens, responsive layouts. |
| `ui-styling` | shadcn/ui + Radix + Tailwind components, dark mode, canvas visuals. |
| `ui-ux-pro-max` | UI/UX intelligence: 50+ styles, 161 palettes, 57 font pairings, 25 chart types across 10 stacks. |

---

## 3. Skills To Add

Skills we want installed for further development. Each is a git repo — clone into `~/.claude/skills/<name>/` (or install as plugin if it ships a marketplace).

| Skill | Repo | What it does |
|-------|------|--------------|
| `ponytail` | `DietrichGebert/ponytail` | "Lazy senior dev" philosophy — checks stdlib/deps/platform for existing solutions before writing new code. Cuts needless code gen. |
| `pro-workflow` | `rohitg00/pro-workflow` | Persistent learning system: self-correcting SQLite memory, research wikis, multi-phase workflows. 34 skills, 8 agents, 22 commands. |
| `zed` | `zed-industries/zed` | High-performance multiplayer Rust code editor (Atom/Tree-sitter creators). Editor, not a skill — reference/integration target. |
| `react-doctor` | `millionco/react-doctor` | Deterministic scanner for React issues: state/effects, perf, architecture, security, a11y. CI + agent integration. |
| `emil-design-eng` | `emilkowalski/skills` | Design-engineer skills: animation/design guidance (Vercel/Linear experience) + strict `review-animations` skill. |
| `magic-mcp` | `21st-dev/magic-mcp` | MCP server — generate modern UI components from natural-language descriptions. IDE integration. |
| `skillui` | `amaancoderx/skillui` | Reverse-engineer any design system (colors/fonts/spacing/components) → `.skill` file. Pure static analysis, no API keys. |
| `awesome-design` | `gztchan/awesome-design` | Curated list of UI/UX design resources (stock photos, icons, palettes, typography, tools). Reference collection. |
| `taste-skill` | `Leonxlnx/taste-skill` | Portable agent skills that improve AI-generated frontends — better layout, typography, motion, spacing. |
| `impeccable` | `pbakaus/impeccable` | Design skill for AI agents: 23 commands, live browser iteration, 44 detector rules. `/impeccable audit|polish|critique`. |

Install pattern (plain skill repo):
```bash
git clone https://github.com/<owner>/<repo> ~/.claude/skills/<name>
```
Install pattern (MCP server, e.g. magic-mcp): follow the repo README to register the MCP server in your Claude config.

---

## 4. Built-in Claude Code Skills (no install)

Available out of the box in this environment: `deep-research`, `verify`, `code-review`, `simplify`, `run`, `init`, `review`, `security-review`, `loop`, `claude-api`, `update-config`, `fewer-permission-prompts`, `keybindings-help`.

---

## 5. Project Config (`.claude/settings.json`)

- **Hook** — `PreToolUse` on `Glob|Grep`: if `graphify-out/graph.json` exists, reminds Claude to read `graphify-out/GRAPH_REPORT.md` before searching raw files.
- See `CLAUDE.md` for git workflow, pre-push checks (biome + tsc), and graphify rules.

## 6. Global Config Highlights (`~/.claude/settings.json`)

- Model: `opus` (`claude-opus-4-8[1m]`). Available: sonnet-4-6, haiku-4-5, opus-4-6/4-7/4-8.
- Enabled plugins: `caveman@caveman`.
- Deny list: WebSearch, secret dirs (`~/.ssh`, `~/.aws`, `~/.env`, etc.), destructive bash (`rm -rf /`, force-push, `curl|sh`).
