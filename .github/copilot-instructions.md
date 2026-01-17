# GitHub Copilot Instructions

## Project Overview
Real-time BPM detector using React, Web Audio API, and the `realtime-bpm-analyzer` library. Single-page app with state machine flow: `idle → listening → detected|error`.

## Development Environment
**Always use Bun, never npm/yarn/pnpm**:
- `bun dev` - Start development server
- `bun run build` - Type check + production build
- `bun run biome-check` - Lint/format check
- `bun run biome-fix` - Auto-fix issues
- Use `bunx` instead of `npx`

## Architecture & State Flow

### State Machine
Four states managed in [src/hooks/use-bpm-analyzer/index.ts](../src/hooks/use-bpm-analyzer/index.ts):
- **idle**: Initial, shows mic button
- **listening**: Active audio capture (15s timeout)
- **detected**: BPM found, shows result
- **error**: Permission denied or timeout

State transitions trigger cleanup of Web Audio resources (AudioContext, AnalyserNode, MediaStream).

### Hook Pattern: useBPMAnalyzer
Core business logic lives in custom hook, not components. See [src/hooks/use-bpm-analyzer/index.ts](../src/hooks/use-bpm-analyzer/index.ts):
- Manages Web Audio API lifecycle with refs (`audioContextRef`, `analyzerRef`, `streamRef`)
- Uses `isRunningRef` to prevent duplicate starts
- Timeout handling with cleanup callbacks
- Returns `{ bpm, status, error, startListening, reset }`

Components are thin presentational layers - [App.tsx](../src/App.tsx) orchestrates, [mic-button.tsx](../src/components/mic-button.tsx) and [result-screen.tsx](../src/components/result-screen.tsx) render based on status.

### File Structure
- `src/hooks/use-bpm-analyzer/` - Split hook into index.ts, types.ts, utils.ts, logger.ts
- `src/components/ui/` - shadcn/ui components (CVA-based variants)
- `@/*` alias resolves to `src/*`

## Code Style (Biome, not ESLint/Prettier)

### Naming & Syntax
- **Files**: kebab-case (`mic-button.tsx`, `use-bpm-analyzer`)
- **Arrays**: Use `string[]` not `Array<string>`
- **Imports**: `import type` for types only
- **Class merging**: Use `cn()` utility from `@/lib/utils` (clsx + tailwind-merge)

### Biome-Specific Rules
Auto-sorted by Biome:
- Imports organized automatically
- Tailwind classes sorted via `useSortedClasses`
- Object keys/properties sorted
- JSX attributes multiline when 2+ attributes

Example button with sorted classes:
```tsx
<button className={cn(
  "inline-flex items-center justify-center",
  "rounded-md px-4 py-2",
  "hover:bg-primary/90",
  className
)} />
```

## Styling Patterns

### TailwindCSS v4
Uses CSS variable theming in [src/index.css](../src/index.css):
- OKLCH color space (`--primary: oklch(0.71 0.15 239.15)`)
- Custom fonts: Source Code Pro (sans/mono), Source Serif 4
- No dark mode (light theme only)
- Design tokens: `--radius`, shadow utilities

### Component Variants (CVA)
See [src/components/ui/button.tsx](../src/components/ui/button.tsx):
```tsx
const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: { default, destructive, ghost, link, outline, secondary },
      size: { default, sm, lg, xl, icon, iconLg }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);
```

## Web Audio Cleanup Pattern
Critical: Always cleanup in correct order to prevent memory leaks:
1. Clear timeouts
2. Stop/disconnect analyzer
3. Disconnect audio nodes (AnalyserNode → MediaStreamSourceNode)
4. Stop media tracks
5. Suspend AudioContext

Example from hook:
```tsx
const stopListening = useCallback(async () => {
  clearDetectionTimeout();
  cleanupAnalyzer();
  cleanupAudioNodes();
  cleanupStream();
  await suspendAudioContext();
}, [/* deps */]);
```

## Testing & Debugging
- Console logs throughout for debugging ([logger.ts](../src/hooks/use-bpm-analyzer/logger.ts))
- Type checking: `bun run type-check`
- Strict TypeScript: `noUncheckedIndexedAccess: true`, all strict flags enabled

## Common Patterns
- **Console debugging**: Already extensive in components/hooks - maintain this
- **Ref management**: Use refs for Web API instances, state for React rendering
- **Callbacks**: Wrap cleanup functions in `useCallback` with proper deps
- **Type imports**: Always use `import type` for type-only imports
