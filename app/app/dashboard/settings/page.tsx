'use client';

import { useState } from 'react';
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
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and notification channels
        </p>
      </div>

      {/* Notification Channels Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Notification Channels
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Connect your preferred notification methods
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-medium text-gray-900">Email</Label>
              </div>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Badge className="bg-success-50 text-success-700 border-success-200 hover:bg-success-50">
              Verified
            </Badge>
          </div>

          {/* Telegram */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-medium text-gray-900">Telegram</Label>
              </div>
              {hasTelegram ? (
                <p className="text-sm text-gray-600">
                  @{user?.telegram_username || 'Connected'}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Connect to receive reminders via Telegram
                </p>
              )}
            </div>
            {hasTelegram ? (
              <Badge className="bg-success-50 text-success-700 border-success-200 hover:bg-success-50">
                Connected
              </Badge>
            ) : (
              <Button
                onClick={() => setShowTelegramModal(true)}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Preferences
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Customize your reminder settings
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
              Timezone
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              All reminders will be scheduled according to this timezone
            </p>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="h-11">
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
            <Label htmlFor="default-tone" className="text-sm font-medium text-gray-700">
              Default Message Tone
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Choose the tone for AI-generated reminder messages
            </p>
            <Select value={defaultTone} onValueChange={(v) => setDefaultTone(v as any)}>
              <SelectTrigger id="default-tone" className="h-11">
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
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white h-11 px-8"
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
