import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperProps {
  steps: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  currentStep: number;
  completedSteps: number[];
}

export function Stepper({ steps, currentStep, completedSteps }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);
          const isPast = stepNumber < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                    {
                      'border-primary-600 bg-primary-600 text-white shadow-md': isActive,
                      'border-primary-600 bg-primary-600 text-white': isCompleted,
                      'border-gray-300 bg-white text-gray-400': !isActive && !isCompleted
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center hidden sm:block',
                    {
                      'text-primary-600': isActive || isCompleted,
                      'text-gray-500': !isActive && !isCompleted
                    }
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-200',
                    {
                      'bg-primary-600': isPast || isCompleted,
                      'bg-gray-300': !isPast && !isCompleted
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
