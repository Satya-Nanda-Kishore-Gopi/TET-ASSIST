import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'paper' | 'accent' | 'muted';
  hoverable?: boolean;
}

export function Card({
  className,
  variant = 'default',
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-brand-card border-brand-border text-brand-text shadow-sm',
    paper: 'bg-brand-bg-paper border-brand-border-light text-brand-text',
    accent: 'bg-brand-accent-light/40 border-brand-accent-border/60 text-brand-text',
    muted: 'bg-brand-bg border-brand-border-light text-brand-text-muted',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        variantStyles[variant],
        hoverable && 'hover:shadow-md hover:border-brand-primary/40 hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-semibold text-lg text-brand-text tracking-tight flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-brand-text-muted mt-1 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 pt-0 border-t border-brand-border-light flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  );
}
