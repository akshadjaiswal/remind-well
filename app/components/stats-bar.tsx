'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatsBarProps {
  activeCount: number;
  pausedCount: number;
  todaySent: number;
}

export function StatsBar({ activeCount, pausedCount, todaySent }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-sm text-gray-500 mt-1">Active Reminders</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">{pausedCount}</p>
            <p className="text-sm text-gray-500 mt-1">Paused</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{todaySent}</p>
            <p className="text-sm text-gray-500 mt-1">Sent Today</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
