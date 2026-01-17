# /fix

Auto-fix linting and formatting issues with Biome.

## Steps

1. Run Biome auto-fix:
   ```bash
   bun run biome-fix
   ```

2. Run type check to catch any remaining issues:
   ```bash
   bun run type-check
   ```

3. Report what was fixed and what still needs manual attention.

## Notes

- Biome can fix: formatting, import sorting, some lint rules
- Biome cannot fix: type errors, logic bugs, missing imports
- If type errors remain after fix, list them clearly with actionable next steps
