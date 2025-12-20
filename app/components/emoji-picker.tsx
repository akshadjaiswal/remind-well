'use client';

import { useState } from 'react';
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
          <Button variant="outline" className="w-full justify-start text-2xl h-12">
            {value}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an emoji</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-2 p-4">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
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
