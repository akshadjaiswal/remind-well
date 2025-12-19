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
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verified
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Telegram</Label>
              {hasTelegram ? (
                <p className="text-sm text-gray-500">@{user?.telegram_username || 'Connected'}</p>
              ) : (
                <p className="text-sm text-gray-500">Not connected</p>
              )}
            </div>
            {hasTelegram ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            ) : (
              <Button onClick={() => setShowTelegramModal(true)} size="sm">
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
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

          <div className="space-y-2">
            <Label htmlFor="default-tone">Default Message Tone</Label>
            <Select value={defaultTone} onValueChange={(v) => setDefaultTone(v as any)}>
              <SelectTrigger id="default-tone">
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

          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={updateUserMutation.isPending}
              className="w-full"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      <TelegramSetupModal open={showTelegramModal} onOpenChange={setShowTelegramModal} />
    </div>
  );
}
