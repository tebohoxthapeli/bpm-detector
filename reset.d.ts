/**
 * TypeScript Built-in Typings Improvements
 *
 * This file imports `ts-reset`, a collection of TypeScript type definition improvements
 * that enhance the built-in typings across the entire project.
 *
 * @see {@link https://www.totaltypescript.com/ts-reset | TS Reset Documentation}
 *
 * @remarks
 *
 * ts-reset provides the following key improvements:
 *
 * - **JSON.parse & fetch().json()**: Return `unknown` instead of `any`, providing better type safety
 * - **.filter(Boolean)**: Properly filters out falsy values with correct type narrowing
 * - **.includes() & .indexOf()**: More ergonomic handling of `readonly` arrays and `as const` tuples
 * - **Set.has() & Map.has()**: Less strict type checking for better usability
 * - **Array.isArray()**: Removes `any[]` from type guard checks
 * - **Storage APIs**: Makes `localStorage` and `sessionStorage` property access safer by returning `unknown`
 *
 * This import is intentionally placed in a dedicated `reset.d.ts` file to ensure
 * the ambient type definitions are loaded globally for the entire project.
 *
 * @note This is intended for use in applications, not libraries. Do not re-export these
 * type definitions from library code.
 *
 * @example
 * ```typescript
 * // ✅ Properly typed as unknown, not any
 * const data = JSON.parse('{}');
 *
 * // ✅ Filter works correctly with type narrowing
 * const numbers = [1, 2, undefined, 0].filter(Boolean); // number[]
 *
 * // ✅ Readonly arrays work better with includes
 * const colors = ['red', 'blue'] as const;
 * if (colors.includes('red')) { // type-safe }
 * ```
 */
import '@total-typescript/ts-reset';
