# Claude Code Operating Manual

This file configures Claude Code for this project. Read once per session.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `bun dev` | Start Vite dev server |
| `bun run build` | Type check + production build |
| `bun run type-check` | TypeScript check only |
| `bun run biome-check` | Lint + format check |
| `bun run biome-fix` | Auto-fix lint/format issues |

## Tech Stack

- **Runtime**: Bun (NOT npm/yarn/pnpm)
- **Framework**: React 18 + Vite 6
- **Language**: TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **Linter/Formatter**: Biome (NOT ESLint/Prettier)
- **Type safety**: @total-typescript/ts-reset for improved TS defaults

## Project Structure

```
src/
├── App.tsx              # Root component, state machine orchestrator
├── main.tsx             # Entry point, React DOM render
├── components/
│   ├── mic-button.tsx   # Handles idle/listening/error states
│   ├── result-screen.tsx # Shows detected BPM
│   └── ui/
│       └── button.tsx   # CVA-based button variants
├── hooks/
│   └── use-bpm-analyzer/
│       ├── index.ts     # Main hook (Web Audio API + realtime-bpm-analyzer)
│       ├── types.ts     # BpmStatus, BpmState, options types
│       ├── logger.ts    # Debug logging utility
│       └── utils.ts     # Validation helpers
├── utils/
│   └── index.ts         # cn() and tw() utilities
└── lib/
    └── utils.ts         # Re-exports cn from utils (shadcn compat)
```

## Code Conventions

### File Naming
- **Always kebab-case**: `my-component.tsx`, `use-my-hook.ts`
- Exception: `App.tsx` (Biome override configured)

### TypeScript
- Use `import type` for type-only imports (enforced by Biome)
- Use shorthand array syntax: `string[]` not `Array<string>`
- Types at bottom of file or in separate `.types.ts`

### Styling
- Tailwind classes are auto-sorted by Biome `useSortedClasses`
- Use `cn()` from `@/utils` for conditional classes: `cn('base', condition && 'active')`
- Use `tw` tagged template for long class strings: `tw\`flex items-center ...\``

### Imports
- Use `@/*` alias for `src/*` paths
- Organize: external deps > `@/` imports > relative imports

## Architecture Patterns

### State Machine
The app uses a 4-state machine: `idle` → `listening` → `detected` | `error`

```typescript
type BpmStatus = 'idle' | 'listening' | 'detected' | 'error';
```

### Hook Pattern (useBPMAnalyzer)
- Refs for mutable state that shouldn't trigger re-renders
- `useCallback` for all functions to maintain stable references
- Proper cleanup on unmount (tracks, streams, AudioContext)
- Event-based BPM detection with timeout fallback

### Component Pattern
- Early returns for conditional rendering
- Props type defined inline or at bottom of file
- console.log statements for debugging (remove before shipping)

## Gotchas

1. **Web Audio API requires user gesture**: `startListening` must be called from a click handler
2. **AudioContext reuse**: Context is created once and suspended/resumed, not recreated
3. **Safari webkit prefix**: Uses `webkitAudioContext` fallback
4. **Timeout cleanup**: Always clear timeout refs on success or unmount
5. **MediaStream cleanup**: Must stop all tracks explicitly

## Validation Workflow

Before considering any change complete:

```bash
bun run type-check && bun run biome-check
```

If Biome complains, run:
```bash
bun run biome-fix
```

## What NOT to Do

- Don't use npm/yarn/pnpm commands
- Don't use ESLint or Prettier
- Don't use `Array<T>` syntax
- Don't create files without kebab-case names
- Don't skip type-check before committing
- Don't leave console.log statements in production code
