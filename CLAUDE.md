# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BPM Detector is a React web application that detects beats-per-minute (BPM) in real-time from audio captured through the device microphone using the Web Audio API and the `realtime-bpm-analyzer` library.

## Commands

All commands use Bun (not npm/yarn/pnpm):

- `bun dev` - Start development server with Vite
- `bun run build` - Type check with tsc and build for production
- `bun run type-check` - Run TypeScript type checking without emitting
- `bun run biome-check` - Lint and format check with Biome
- `bun run biome-fix` - Auto-fix linting and formatting issues
- `bun run preview` - Preview production build
- `bun run refresh` - Clean reinstall (removes dist, node_modules, bun.lock)

## Architecture

### State Machine Flow

The app uses a simple state machine with four states: `idle` → `listening` → `detected` | `error`

- **idle**: Initial state, shows microphone button
- **listening**: Actively capturing audio and analyzing BPM
- **detected**: BPM found, shows result screen
- **error**: Microphone access denied or detection timeout

### Core Hook: `useBPMAnalyzer`

Located at `src/hooks/use-bpm-analyzer.ts`, this hook manages:
- Web Audio API setup (AudioContext, MediaStreamSource, AnalyserNode)
- Integration with `realtime-bpm-analyzer` library
- Timeout handling for failed detections (default 15 seconds)
- Cleanup of audio resources on unmount

### Component Structure

- `App.tsx` - Root component, orchestrates MicButton and ResultScreen based on status
- `components/mic-button.tsx` - Handles idle, listening, and error states
- `components/result-screen.tsx` - Displays detected BPM
- `components/ui/button.tsx` - Reusable button with CVA variants

### Import Alias

Use `@/*` to import from `src/*` (configured in tsconfig.json and vite.config.ts).

## Code Style

- **Linter/Formatter**: Biome (not ESLint/Prettier)
- **File naming**: kebab-case for all files
- **Array types**: Use shorthand syntax (`string[]` not `Array<string>`)
- **Imports**: Use `import type` for type-only imports
- **Tailwind classes**: Auto-sorted by Biome's `useSortedClasses` rule
- **Class merging**: Use `cn()` utility (combines clsx + tailwind-merge)
