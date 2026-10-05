import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary:
        'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm active:translate-y-px',
      secondary:
        'bg-brand-secondary text-white hover:bg-brand-secondary-hover shadow-sm active:translate-y-px',
      accent:
        'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-sm active:translate-y-px',
      outline:
        'border border-brand-border bg-brand-card text-brand-text hover:bg-brand-bg hover:border-brand-primary/40',
      ghost:
        'bg-transparent text-brand-text hover:bg-brand-primary-light hover:text-brand-primary',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5 font-medium',
      icon: 'h-10 w-10 p-0 rounded-xl justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
