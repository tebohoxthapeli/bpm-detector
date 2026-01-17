# /debug

Interactive debugging workflow for tracking down issues.

## Arguments

`/debug [description of the problem]`

## Steps

1. Acknowledge the problem and create a mental model of what should happen vs what is happening.

2. Check for obvious issues first:
   - Run type check: `bun run type-check`
   - Check for lint errors: `bun run biome-check`

3. Identify relevant files based on the problem description:
   - State issues → check `use-bpm-analyzer/index.ts`
   - UI issues → check component files
   - Styling issues → check Tailwind classes

4. Read the relevant code and look for:
   - Missing cleanup in useEffect
   - Stale closure problems (refs vs state)
   - Race conditions in async code
   - Event listener leaks

5. Form a hypothesis about the root cause.

6. Suggest targeted console.log placements or code changes to verify.

7. Never make changes without explaining the hypothesis first.

## Debug Checklist for This Project

- [ ] Is the AudioContext being properly created/reused?
- [ ] Are all refs being cleaned up on unmount?
- [ ] Is the timeout being cleared when BPM is detected?
- [ ] Are MediaStream tracks being stopped?
- [ ] Is the state machine transition valid?

## Output Format

1. Problem Understanding
2. Initial Findings
3. Hypothesis
4. Suggested Investigation Steps
