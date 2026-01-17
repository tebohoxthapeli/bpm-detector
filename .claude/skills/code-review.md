---
triggers:
  - "review"
  - "code review"
  - "check this"
  - "look at this"
  - "what do you think"
---

# Code Review Skill

When reviewing code, follow this structured approach.

## Review Checklist

### 1. Correctness
- Does the code do what it claims to do?
- Are edge cases handled?
- Are there any off-by-one errors or boundary issues?

### 2. TypeScript
- Are types specific enough (avoid `any`, prefer unions)?
- Is `import type` used for type-only imports?
- Are return types explicit for non-trivial functions?

### 3. React Patterns
- Are hooks called at the top level only?
- Is `useCallback`/`useMemo` used appropriately (not overused)?
- Are cleanup functions provided where needed?
- Are deps arrays complete and correct?

### 4. State Management
- Is state in the right place (local vs lifted)?
- Are refs used appropriately (mutable values that don't need re-render)?
- Is the state machine transition valid?

### 5. Style (This Project)
- File named in kebab-case?
- Using `@/` import alias?
- Using `cn()` for Tailwind class merging?
- Array syntax is shorthand (`string[]`)?

### 6. Performance
- No unnecessary re-renders?
- No memory leaks (event listeners, subscriptions)?
- No blocking operations on main thread?

## Output Format

1. **Summary**: One sentence overall assessment
2. **Issues**: Numbered list of concerns (if any)
3. **Suggestions**: Optional improvements (clearly marked as optional)

Keep feedback actionable and specific. Reference line numbers when possible.
