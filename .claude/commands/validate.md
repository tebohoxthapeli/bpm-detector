# /validate

Run the full validation suite to check code quality.

## Steps

1. Run TypeScript type checking:
   ```bash
   bun run type-check
   ```

2. Run Biome lint and format check:
   ```bash
   bun run biome-check
   ```

3. Report results clearly:
   - If both pass: confirm code is ready
   - If type errors: list them with file:line references
   - If Biome errors: suggest running `/fix` or show specific issues

4. Never auto-fix unless explicitly asked. This command is for checking only.

## Output Format

Start with a brief status (pass/fail), then details if needed. Keep it scannable.
