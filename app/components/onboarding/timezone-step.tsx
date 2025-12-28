'use client';

import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIMEZONES } from '@/lib/constants';
import { useUpdateUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

interface TimezoneStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TimezoneStep({ onNext, onBack }: TimezoneStepProps) {
  const [timezone, setTimezone] = useState('UTC');
  const [isSaved, setIsSaved] = useState(false);
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isSupported = TIMEZONES.some(tz => tz.value === detectedTimezone);
      if (isSupported) {
        setTimezone(detectedTimezone);
        handleSave(detectedTimezone);
      }
    } catch (error) {
      console.error('Failed to detect timezone:', error);
    }
  }, []);

  const handleSave = async (tz: string) => {
    try {
      await updateUser.mutateAsync({ timezone: tz });
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save timezone:', error);
      toast({
        title: 'Failed to Save',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    setIsSaved(false);
    handleSave(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Set Your Timezone</h2>
        <p className="mt-2 text-sm text-gray-600">
          We'll send reminders at the right time for your location
        </p>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Timezone Selector */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
                Select Timezone
              </Label>
              <Select value={timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger id="timezone" className="h-12">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Confirmation */}
            {isSaved && (
              <div className="flex items-center gap-2 rounded-lg bg-success-50 border border-success-200 p-3">
                <Check className="h-4 w-4 text-success-600 flex-shrink-0" />
                <p className="text-sm text-success-700">
                  Timezone saved successfully
                </p>
              </div>
            )}

            {/* Current Time Preview */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Current time in {timezone}</p>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleTimeString('en-US', {
                      timeZone: timezone,
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
