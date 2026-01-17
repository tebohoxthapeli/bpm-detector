# /component

Create a new React component following project conventions.

## Arguments

`/component [ComponentName]`

Example: `/component AudioVisualizer`

## Steps

1. Convert ComponentName to kebab-case for filename:
   - `AudioVisualizer` → `audio-visualizer.tsx`

2. Determine location:
   - UI primitives → `src/components/ui/`
   - Feature components → `src/components/`

3. Create the component file with this structure:
   ```tsx
   import { cn } from '@/utils';

   export function ComponentName({ className, ...props }: ComponentNameProps) {
     return (
       <div className={cn('', className)} {...props}>
         {/* Component content */}
       </div>
     );
   }

   type ComponentNameProps = {
     className?: string;
   };
   ```

4. Follow these conventions:
   - Named export (not default)
   - Props type at bottom of file
   - Use `cn()` for className merging
   - Use `@/` import alias

5. After creating, run validation:
   ```bash
   bun run type-check && bun run biome-check
   ```

6. Report the created file path and suggest next steps.

## Notes

- Don't add unnecessary props upfront
- Don't add console.log unless debugging
- Don't create test files automatically (no test setup yet)
