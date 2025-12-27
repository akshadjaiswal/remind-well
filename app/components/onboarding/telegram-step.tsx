'use client';

import { useState, useEffect } from 'react';
import { Send, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface TelegramStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function TelegramStep({ onNext, onSkip }: TelegramStepProps) {
  const { data: user, refetch } = useUser();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot';
  const botLink = `https://t.me/${botUsername}`;
  const isConnected = !!user?.telegram_chat_id;

  // Poll for connection status
  useEffect(() => {
    if (isConnected || isChecking) return;

    const pollInterval = setInterval(async () => {
      const { data } = await refetch();
      if (data?.telegram_chat_id) {
        setIsChecking(false);
        toast({
          title: 'Telegram Connected!',
          description: 'Your Telegram account has been successfully linked.',
          variant: 'default'
        });
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [isConnected, isChecking, refetch, toast]);

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
                      Open Telegram and search for the bot
                    </p>
                    <a
                      href={botLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      @{botUsername}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Send the <code className="px-2 py-0.5 bg-gray-100 rounded text-primary-600 font-mono text-xs">/start</code> command
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Wait for confirmation (this page will update automatically)
                  </p>
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
              >
                <Send className="mr-2 h-4 w-4" />
                Open Telegram Bot
              </Button>

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
