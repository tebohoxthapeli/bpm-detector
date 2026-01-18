import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-sm transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 px-4',
        icon: 'h-10 w-10',
        iconLg: 'h-14 w-14',
        lg: 'h-11 rounded-lg px-7',
        sm: 'h-9 rounded-md px-3 text-xs',
        xl: 'h-12 rounded-xl px-10 text-base',
      },
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:shadow-md active:bg-primary/88',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/92 hover:shadow-md active:bg-destructive/88',
        ghost:
          'text-foreground hover:bg-accent/60 hover:text-accent-foreground active:bg-accent/75',
        link: 'text-primary underline-offset-4 hover:underline',
        outline:
          'border border-input bg-background/50 shadow-sm backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/65',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:bg-secondary/75',
      },
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({
            className,
            size,
            variant,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
