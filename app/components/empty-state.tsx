'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="max-w-3xl mx-auto text-center px-4">
        {/* Illustration */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-50 mb-4 sm:mb-6">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Start Building Better Habits
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-md mx-auto px-4 sm:px-0">
            Create your first reminder and let RemindWell help you stay consistent with your goals
          </p>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={handleCreateReminder}
          size="lg"
          className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm mb-8 sm:mb-12 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Create Your First Reminder
        </Button>

        {/* Suggested Habits */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              Or start with a popular habit
            </p>
            <div className="h-px w-12 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {SUGGESTED_HABITS.map((habit) => (
              <Card
                key={habit.title}
                className="cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
                onClick={handleCreateReminder}
              >
                <div className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    {habit.emoji}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      {habit.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Every {habit.interval} min
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
