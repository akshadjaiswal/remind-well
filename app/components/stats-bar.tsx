'use client';

import { Activity, Pause, Send } from 'lucide-react';

interface StatsBarProps {
  activeCount: number;
  pausedCount: number;
  todaySent: number;
}

export function StatsBar({ activeCount, pausedCount, todaySent }: StatsBarProps) {
  const stats = [
    {
      label: 'Active',
      value: activeCount,
      icon: Activity,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      label: 'Paused',
      value: pausedCount,
      icon: Pause,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-400',
    },
    {
      label: 'Sent Today',
      value: todaySent,
      icon: Send,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      iconColor: 'text-success-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
