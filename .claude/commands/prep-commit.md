# /prep-commit

Prepare code for commit by validating and showing staged changes.

## Steps

1. Run validation suite:
   ```bash
   bun run type-check && bun run biome-check
   ```

2. If validation fails:
   - Stop and report issues
   - Ask if user wants to run `/fix` first

3. If validation passes, show git status:
   ```bash
   git status
   git diff --staged
   ```

4. If nothing staged, show unstaged changes:
   ```bash
   git diff
   ```

5. Suggest a commit message based on the changes (following conventional commits):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `style:` for formatting only
   - `chore:` for tooling/config changes

6. Wait for user to confirm before committing. Never auto-commit.

## Output Format

Clear sections: Validation Status, Changes Summary, Suggested Commit Message
