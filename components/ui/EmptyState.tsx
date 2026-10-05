import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  titleTelugu?: string;
  description: string;
  descriptionTelugu?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  titleTelugu,
  description,
  descriptionTelugu,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-brand-bg-paper border border-brand-border-light border-dashed',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4 shadow-xs">
          <Icon className="w-7 h-7 stroke-[1.75]" />
        </div>
      )}

      {titleTelugu && (
        <p className="text-sm font-semibold text-brand-secondary mb-1">
          {titleTelugu}
        </p>
      )}

      <h4 className="text-lg font-bold text-brand-text mb-2">
        {title}
      </h4>

      <p className="text-sm text-brand-text-muted max-w-md leading-relaxed mb-1">
        {description}
      </p>

      {descriptionTelugu && (
        <p className="text-xs text-brand-text-subtle max-w-md leading-relaxed mb-6 font-medium">
          {descriptionTelugu}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
