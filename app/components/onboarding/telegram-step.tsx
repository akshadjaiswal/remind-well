'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useUpdateUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface TelegramStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function TelegramStep({ onNext, onSkip }: TelegramStepProps) {
  const { data: user, refetch } = useUser({ refetchInterval: false });
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [connectToken, setConnectToken] = useState<string | null>(null);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot';
  const isConnected = !!user?.telegram_chat_id;

  // Generate token on mount
  useEffect(() => {
    async function setupToken() {
      if (user && !user.telegram_chat_id) {
        // Only generate if not already connected
        if (!user.telegram_connect_token) {
          // Generate new token
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

          try {
            await updateUser.mutateAsync({
              telegram_connect_token: token,
              telegram_connect_token_expires_at: expiresAt
            });
            setConnectToken(token);
          } catch (error) {
            console.error('Failed to generate token:', error);
          }
        } else {
          // Use existing token
          setConnectToken(user.telegram_connect_token);
        }
      }
    }

    setupToken();
  }, [user?.id, user?.telegram_chat_id]);

  const botLink = connectToken
    ? `https://t.me/${botUsername}?start=${connectToken}`
    : `https://t.me/${botUsername}`;

  // Stable callback for connection checking
  const handleConnectionCheck = useCallback(async () => {
    const { data } = await refetch();
    if (data?.telegram_chat_id) {
      setIsChecking(false);
      toast({
        title: 'Telegram Connected!',
        description: 'Your Telegram account has been successfully linked.',
        variant: 'default'
      });
    }
  }, [refetch, toast]);

  // Poll for connection status - Only poll WHILE checking and NOT connected
  useEffect(() => {
    if (isConnected || !isChecking) {
      return;  // Exit if already connected OR not checking yet
    }

    const pollInterval = setInterval(handleConnectionCheck, 3000);
    return () => clearInterval(pollInterval);
  }, [isConnected, isChecking, handleConnectionCheck]);

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    try {
      await apiClient.post('/api/telegram/test');
      setTestSent(true);
      toast({
        title: 'Test Message Sent!',
        description: 'Check your Telegram to confirm you received it.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send Test',
        description: error.response?.data?.error || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Connect Telegram (Optional)</h2>
        <p className="mt-2 text-sm text-gray-600">
          Get instant notifications on Telegram for your reminders
        </p>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          {!isConnected ? (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click "Open Telegram Bot" button below
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This will open the bot with your unique connection link
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Send the <code className="px-2 py-0.5 bg-gray-100 rounded text-primary-600 font-mono text-xs">/start</code> command
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tap "Start" or type /start in the chat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Wait for confirmation
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This page will update automatically within 3 seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <Button
                onClick={() => {
                  window.open(botLink, '_blank');
                  setIsChecking(true);
                }}
                className="w-full"
                size="lg"
                disabled={!connectToken}
              >
                <Send className="mr-2 h-4 w-4" />
                {connectToken ? 'Open Telegram Bot' : 'Generating secure link...'}
              </Button>

              {connectToken && (
                <p className="text-xs text-center text-gray-500">
                  Your unique connection link is ready. This link expires in 24 hours.
                </p>
              )}

              {isChecking && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 animate-pulse">
                    Waiting for you to send /start...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success State */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 mb-4">
                  <Check className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Telegram Connected!</h3>
                <p className="mt-1 text-sm text-gray-600 text-center">
                  Username: <span className="font-medium text-gray-900">@{user?.telegram_username}</span>
                </p>
              </div>

              {/* Test Message Button */}
              {!testSent && (
                <Button
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isSendingTest ? 'Sending...' : 'Send Test Message'}
                </Button>
              )}

              {testSent && (
                <div className="rounded-lg bg-success-50 border border-success-200 p-4 text-center">
                  <p className="text-sm text-success-700">
                    ✓ Test message sent! Check your Telegram.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Skip for Now
        </Button>
        {isConnected && (
          <Button
            onClick={onNext}
            className="flex-1"
            size="lg"
          >
            Continue
          </Button>
        )}
      </div>

      {!isConnected && (
        <p className="text-xs text-center text-gray-500">
          You can always connect Telegram later from Settings
        </p>
      )}
    </div>
  );
}
