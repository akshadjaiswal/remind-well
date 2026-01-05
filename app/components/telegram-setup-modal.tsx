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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Connect Telegram</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Follow these simple steps to receive reminders on Telegram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ol className="list-decimal list-inside space-y-2.5 sm:space-y-3 text-gray-800">
              <li className="text-xs sm:text-sm leading-relaxed">Open Telegram on your phone or desktop</li>
              <li className="text-xs sm:text-sm leading-relaxed">
                Search for <strong className="font-semibold break-all">@{botUsername}</strong> or{' '}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium break-all"
                >
                  click here
                </a>
              </li>
              <li className="text-xs sm:text-sm leading-relaxed">
                Click "Start" or send{' '}
                <code className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
                  /start
                </code>
              </li>
              <li className="text-xs sm:text-sm leading-relaxed">You'll see a confirmation message</li>
              <li className="text-xs sm:text-sm leading-relaxed">Come back here and you're all set!</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white hover:bg-gray-50 min-h-[44px] h-11"
            >
              I'll do this later
            </Button>
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] h-11">
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
