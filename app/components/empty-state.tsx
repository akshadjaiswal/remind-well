'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SUGGESTED_HABITS = [
  { emoji: '💧', title: 'Drink Water', interval: 60 },
  { emoji: '🧘', title: 'Take a Break', interval: 120 },
  { emoji: '🤸', title: 'Stretch', interval: 90 },
  { emoji: '🪑', title: 'Check Posture', interval: 45 },
];

export function EmptyState() {
  const router = useRouter();

  const handleCreateReminder = () => {
    router.push('/dashboard/reminders/new');
  };

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <span className="text-6xl">💧</span>
        <h3 className="text-2xl font-bold mt-4 mb-2">No reminders yet</h3>
        <p className="text-gray-500">
          Create your first reminder to start building better habits
        </p>
      </div>

      <Button onClick={handleCreateReminder} size="lg" className="mb-8">
        <Plus className="mr-2 h-5 w-5" />
        Add Your First Reminder
      </Button>

      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-gray-500 mb-4">Popular habits to track:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUGGESTED_HABITS.map((habit) => (
            <Card
              key={habit.title}
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={handleCreateReminder}
            >
              <CardContent className="pt-6 pb-4 text-center">
                <span className="text-3xl block mb-2">{habit.emoji}</span>
                <p className="text-sm font-medium">{habit.title}</p>
                <p className="text-xs text-gray-500">Every {habit.interval}m</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
