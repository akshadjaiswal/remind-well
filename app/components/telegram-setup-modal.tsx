'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TelegramSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramSetupModal({ open, onOpenChange }: TelegramSetupModalProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot';
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Connect Telegram</DialogTitle>
          <DialogDescription className="text-gray-600">
            Follow these simple steps to receive reminders on Telegram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ol className="list-decimal list-inside space-y-3 text-gray-800">
              <li className="text-sm">Open Telegram on your phone or desktop</li>
              <li className="text-sm">
                Search for <strong className="font-semibold">@{botUsername}</strong> or{' '}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  click here
                </a>
              </li>
              <li className="text-sm">
                Click "Start" or send{' '}
                <code className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
                  /start
                </code>
              </li>
              <li className="text-sm">You'll see a confirmation message</li>
              <li className="text-sm">Come back here and you're all set!</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white hover:bg-gray-50"
            >
              I'll do this later
            </Button>
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                Open Telegram
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
