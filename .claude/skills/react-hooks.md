---
triggers:
  - "hook"
  - "useEffect"
  - "useState"
  - "useCallback"
  - "useRef"
  - "custom hook"
---

# React Hooks Skill

Best practices for hooks in this project.

## When to Use What

### useState
- UI state that should trigger re-renders
- Values the user sees or interacts with
- Example: `bpmState` in useBPMAnalyzer

### useRef
- Mutable values that don't need re-renders
- DOM element references
- Instance variables (timers, streams, connections)
- Example: `audioContextRef`, `timeoutRef` in useBPMAnalyzer

### useCallback
- Functions passed to child components
- Functions used in dependency arrays
- Event handlers that need stable identity
- Don't overuse - only when needed for deps or memo

### useEffect
- Side effects (subscriptions, timers, API calls)
- Always return cleanup function when creating resources
- Keep effects focused on single responsibility

## Patterns in This Project

### Cleanup Pattern
```typescript
useEffect(() => {
  // Setup
  const timer = setTimeout(...);

  return () => {
    // Cleanup - always clean up what you set up
    clearTimeout(timer);
  };
}, [deps]);
```

### Ref for Latest Value Pattern
```typescript
const stopListeningRef = useRef<() => Promise<void>>();
stopListeningRef.current = stopListening;

// Use in callbacks to always get latest
analyzer.once('event', () => {
  stopListeningRef.current?.();
});
```

### State Machine Pattern
```typescript
type Status = 'idle' | 'listening' | 'detected' | 'error';
const [state, setState] = useState<{status: Status; ...}>(...);

// Transitions are explicit
setState({ status: 'listening', ... });
```

## Common Mistakes to Avoid

1. **Stale closures**: Use refs for values needed in callbacks
2. **Missing cleanup**: Every subscription/timer needs cleanup
3. **Deps array lies**: Include everything or explain with comments
4. **Over-memoization**: Don't useCallback everything
5. **State for non-rendering data**: Use refs instead

## When Writing New Hooks

1. Start with the interface (what it returns)
2. Identify what triggers re-renders (useState)
3. Identify what needs cleanup (useEffect returns)
4. Use refs for internal bookkeeping
5. Wrap functions in useCallback only if needed
