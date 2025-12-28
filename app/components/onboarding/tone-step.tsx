'use client';

import { useState } from 'react';
import { MessageSquare, Check, Sparkles, Heart, Zap, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUpdateUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import type { MessageTone } from '@/types/database.types';

interface ToneStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TONE_OPTIONS: Array<{
  value: MessageTone;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  example: string;
  color: string;
}> = [
  {
    value: 'motivational',
    label: 'Motivational',
    description: 'Encouraging and energetic',
    icon: Sparkles,
    example: "Time to hydrate! Your body needs water to stay energized and focused. 💧",
    color: 'border-orange-200 bg-orange-50'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm and casual',
    icon: Heart,
    example: "Hey! Don't forget to drink some water. Your body will thank you! 💧",
    color: 'border-blue-200 bg-blue-50'
  },
  {
    value: 'direct',
    label: 'Direct',
    description: 'Brief and to-the-point',
    icon: Zap,
    example: "Drink water now. 💧",
    color: 'border-gray-200 bg-gray-50'
  },
  {
    value: 'funny',
    label: 'Funny',
    description: 'Humorous and playful',
    icon: Smile,
    example: "Your cells are getting thirsty! Time to give them a pool party. 💧",
    color: 'border-purple-200 bg-purple-50'
  }
];

export function ToneStep({ onNext, onBack }: ToneStepProps) {
  const [selectedTone, setSelectedTone] = useState<MessageTone>('friendly');
  const [isSaved, setIsSaved] = useState(false);
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const handleSelectTone = async (tone: MessageTone) => {
    setSelectedTone(tone);
    setIsSaved(false);

    try {
      await updateUser.mutateAsync({ default_tone: tone });
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save tone:', error);
      toast({
        title: 'Failed to Save',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Message Tone</h2>
        <p className="mt-2 text-sm text-gray-600">
          How should your reminders sound? Pick your favorite style
        </p>
      </div>

      <div className="grid gap-4">
        {TONE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTone === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleSelectTone(option.value)}
              className={cn(
                'relative w-full text-left rounded-lg border-2 p-4 transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                    isSelected ? 'bg-primary-100 text-primary-700' : option.color.replace('bg-', 'bg-').replace('50', '100')
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{option.description}</p>

                  {/* Example Message */}
                  <div
                    className={cn(
                      'mt-3 rounded-md border p-3 text-sm',
                      isSelected ? option.color : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                    <p className="text-gray-700 italic">"{option.example}"</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Save Confirmation */}
      {isSaved && (
        <div className="flex items-center gap-2 rounded-lg bg-success-50 border border-success-200 p-3">
          <Check className="h-4 w-4 text-success-600 flex-shrink-0" />
          <p className="text-sm text-success-700">
            Tone preference saved successfully
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isSaved || updateUser.isPending}
          className="flex-1"
          size="lg"
        >
          {updateUser.isPending ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
