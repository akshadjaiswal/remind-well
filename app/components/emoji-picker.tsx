'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const COMMON_EMOJIS = [
  '💧', '🔔', '☕', '🧘', '🤸', '🪑', '👀', '🚶',
  '💊', '🥗', '🍎', '🏃', '😴', '📱', '📚', '🎯',
  '✨', '🌟', '⭐', '🔥', '💪', '🧠', '❤️', '✅',
];

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Emoji</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-start text-3xl h-16 hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
          >
            <span className="mr-3 group-hover:scale-110 transition-transform">{value}</span>
            <span className="text-sm text-gray-500 font-normal">Click to change emoji</span>
            <Sparkles className="ml-auto h-4 w-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary-500" />
              Choose an emoji
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Select an icon that represents your reminder</p>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-1 p-4 max-h-[400px] overflow-y-auto">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="text-3xl p-3 hover:bg-primary-50 rounded-xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
