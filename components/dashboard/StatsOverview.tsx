import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Target, CheckCircle, Award } from 'lucide-react';

export function StatsOverview() {
  const stats = [
    {
      label: 'Preparation',
      labelTelugu: 'సిద్ధత శాతం',
      value: '0%',
      icon: Target,
      description: 'Based on completed topics & tests',
      status: 'Initial state',
    },
    {
      label: 'Tests completed',
      labelTelugu: 'పూర్తయిన పరీక్షలు',
      value: '0',
      icon: CheckCircle,
      description: 'Practice & official papers attempted',
      status: 'No attempts yet',
    },
    {
      label: 'Average score',
      labelTelugu: 'సగటు మార్కులు',
      value: '--',
      icon: Award,
      description: 'Out of 150 marks',
      status: 'Requires test data',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted">
          Your Performance Overview
        </h3>
        <span className="text-xs text-brand-text-subtle font-medium">
          Real-time metrics (No mock data)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-brand-card border-brand-border/80 relative overflow-hidden transition-all duration-200 hover:border-brand-primary/30"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/60">
                    {stat.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-brand-text tracking-tight font-sans">
                      {stat.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-brand-text">
                      {stat.label}
                    </h4>
                    <span className="text-xs text-brand-text-subtle">
                      ({stat.labelTelugu})
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted pt-0.5">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
