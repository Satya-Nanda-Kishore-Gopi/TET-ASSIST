import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'locked' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-brand-primary-light text-brand-primary font-medium border border-brand-primary/20',
    secondary: 'bg-brand-secondary-light text-brand-secondary font-medium border border-brand-secondary/20',
    accent: 'bg-brand-accent-light text-brand-accent font-medium border border-brand-accent-border',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200',
    locked: 'bg-stone-100 text-stone-600 border border-stone-200/80',
    outline: 'border border-brand-border text-brand-text-muted bg-transparent',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300 font-medium',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-full font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
