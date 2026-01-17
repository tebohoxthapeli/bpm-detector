# Claude Code Configuration

This directory configures Claude Code for optimal productivity on this project.

## What's Here

```
.claude/
├── CLAUDE.md           # Operating manual (read every session)
├── settings.json       # Permissions and rules (project-level)
├── settings.local.json # Your personal overrides (git-ignored)
├── commands/           # Slash commands
│   ├── validate.md     # /validate - Check types + lint
│   ├── fix.md          # /fix - Auto-fix issues
│   ├── prep-commit.md  # /prep-commit - Prepare for commit
│   ├── debug.md        # /debug - Debugging workflow
│   └── component.md    # /component - Create new component
├── skills/             # Auto-triggered context
│   ├── code-review.md  # Triggers on "review", "check this"
│   ├── explain-code.md # Triggers on "explain", "how does"
│   └── react-hooks.md  # Triggers on hook-related questions
└── README.md           # This file
```

## How Each Piece Helps

### CLAUDE.md (Operating Manual)
Read automatically at the start of each session. Contains:
- Quick command reference
- Tech stack summary
- Project structure
- Code conventions
- Gotchas specific to this codebase

**Why it matters**: Claude starts with project context instead of guessing.

### settings.json (Permissions)
Pre-approves safe operations so you're not interrupted constantly:
- Reading/writing source files
- Running bun commands
- Common git operations

Also blocks dangerous operations:
- Deleting env files
- Using npm/yarn/pnpm (this project uses Bun)
- Destructive git commands

**Why it matters**: Faster workflow with guardrails.

### Slash Commands
Type these to trigger predefined workflows:

| Command | What It Does |
|---------|--------------|
| `/validate` | Runs type-check + biome-check |
| `/fix` | Auto-fixes lint/format issues |
| `/prep-commit` | Validates, shows diff, suggests commit message |
| `/debug` | Structured debugging investigation |
| `/component` | Creates new component with boilerplate |

**Why it matters**: Consistent, repeatable workflows.

### Skills (Auto-Triggered)
These activate automatically based on keywords in your request:

| Skill | Triggers On | What It Does |
|-------|-------------|--------------|
| Code Review | "review", "check this" | Structured code review |
| Explain Code | "explain", "how does" | Clear explanations |
| React Hooks | "hook", "useEffect", etc. | Hook best practices |

**Why it matters**: Context-aware responses without asking.

## Customizing Over Time

### Personal Overrides (settings.local.json)
Your local settings override project settings. This file is git-ignored.
Add personal preferences here.

### Adding New Commands
Create a new `.md` file in `commands/`. The filename becomes the command.
Example: `commands/deploy.md` → `/deploy`

### Adding New Skills
Create a new `.md` file in `skills/` with frontmatter triggers:
```yaml
---
triggers:
  - "keyword1"
  - "keyword2"
---
```

### Editing the Operating Manual
Update `CLAUDE.md` as you discover new patterns or gotchas.
This is meant to evolve with the project.

## Quick Start

1. **Just start coding** - The config loads automatically
2. **Use `/validate`** before commits to catch issues
3. **Use `/debug [problem]`** when stuck
4. **Ask "explain [code]"** when confused

## What to Customize First

As you use this setup, consider:

1. **Commands for your workflow**: Do you do PR reviews? Add `/pr-review`. Do TDD? Add `/test`.

2. **More permissions**: If you keep getting prompted for something safe, add it to `settings.json`.

3. **Project gotchas**: When you discover quirks, add them to `CLAUDE.md`.

4. **Skills for patterns**: If you repeatedly ask about the same things, create a skill.

## Troubleshooting

### Claude isn't following conventions
- Check that `CLAUDE.md` was read (it says so at session start)
- Remind Claude of specific conventions when needed

### Permissions keep prompting
- Add the pattern to `settings.json` allow list
- Use `settings.local.json` for personal additions

### Commands not working
- Check the command file exists in `.claude/commands/`
- Run `/help` to see available commands

---

Setup created by Claude Code for the BPM Detector project.
Last updated: January 2026
