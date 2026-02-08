'use client';

import { useState } from 'react';
import { Bell, Settings as SettingsIcon, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TelegramSetupModal } from '@/components/telegram-setup-modal';
import { useUserStore } from '@/lib/stores/user-store';
import { useUpdateUser } from '@/hooks/use-user';
import { TIMEZONES } from '@/lib/constants';

export default function SettingsPage() {
  const { user } = useUserStore();
  const updateUserMutation = useUpdateUser();
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [defaultTone, setDefaultTone] = useState(user?.default_tone || 'friendly');

  const handleSave = async () => {
    await updateUserMutation.mutateAsync({
      timezone,
      default_tone: defaultTone,
    });
  };

  const hasTelegram = !!user?.telegram_chat_id;
  const hasChanges =
    timezone !== user?.timezone || defaultTone !== user?.default_tone;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-fade-in px-4 sm:px-0">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your account preferences and notification channels
        </p>
      </div>

      {/* Notification Channels Section */}
      <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Telegram Connection
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Connect Telegram to receive notifications
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Telegram */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0">
            <div className="flex-1 min-w-0">
              <Label className="text-sm sm:text-base font-medium text-gray-900">Telegram</Label>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">
                {hasTelegram ? `@${user?.telegram_username || 'Connected'}` : 'Connect to receive reminders via Telegram'}
              </p>
            </div>
            {hasTelegram ? (
              <Badge className="self-start xs:self-auto bg-success-50 text-success-700 border border-success-200 hover:bg-success-100 transition-colors">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Button
                onClick={() => setShowTelegramModal(true)}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600 text-white min-h-[44px] h-11 sm:h-9 shadow-sm w-full xs:w-auto"
              >
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-info-100 text-info-700 flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Preferences
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Customize your reminder settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-xs sm:text-sm font-medium text-gray-700">
              Timezone
            </Label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              All reminders will be scheduled according to this timezone
            </p>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz: { value: string; label: string }) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Tone */}
          <div className="space-y-2">
            <Label htmlFor="default-tone" className="text-xs sm:text-sm font-medium text-gray-700">
              Default Message Tone
            </Label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              Choose the tone for AI-generated reminder messages
            </p>
            <Select value={defaultTone} onValueChange={(v) => setDefaultTone(v as any)}>
              <SelectTrigger id="default-tone" className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motivational">Motivational</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="pt-4 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
                loading={updateUserMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white min-h-[44px] h-11 px-6 sm:px-8 shadow-sm"
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TelegramSetupModal open={showTelegramModal} onOpenChange={setShowTelegramModal} />
    </div>
  );
}
