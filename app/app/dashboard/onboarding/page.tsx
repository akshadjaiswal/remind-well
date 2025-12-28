'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Globe, MessageSquare, Bell } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { TelegramStep } from '@/components/onboarding/telegram-step';
import { TimezoneStep } from '@/components/onboarding/timezone-step';
import { ToneStep } from '@/components/onboarding/tone-step';
import { ReminderStep } from '@/components/onboarding/reminder-step';
import { useUser } from '@/hooks/use-user';

const STEPS = [
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'timezone', label: 'Timezone', icon: Globe },
  { id: 'tone', label: 'Tone', icon: MessageSquare },
  { id: 'reminder', label: 'First Reminder', icon: Bell },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useUser();

  // Get initial step from URL or default to 1
  const initialStep = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Update URL when step changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStep = params.get('step');

    // Only update URL if step actually changed
    if (urlStep !== String(currentStep)) {
      params.set('step', String(currentStep));
      router.replace(`/dashboard/onboarding?${params.toString()}`, { scroll: false });
    }
  }, [currentStep]);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (user?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip current step and move to next
    handleNext();
  };

  const handleComplete = () => {
    // Onboarding complete, redirect to dashboard
    router.push('/dashboard');
  };

  // Render loading state
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to RemindWell! 🎉</h1>
          <p className="mt-2 text-sm text-gray-600">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {currentStep === 1 && (
            <TelegramStep
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}

          {currentStep === 2 && (
            <TimezoneStep
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <ToneStep
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <ReminderStep
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
