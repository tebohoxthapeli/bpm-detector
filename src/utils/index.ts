import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...classNames: ClassValue[]): string {
  return twMerge(clsx(...classNames));
}

export function tw(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return String.raw(
    {
      raw: strings,
    },
    ...values
  );
}
