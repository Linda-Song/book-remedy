import { Lock } from "lucide-react";

type Props = {
  mood: string;
  genre: string;
  freeText: string;
};

export function WhatYouToldMe({ mood, genre, freeText }: Props) {
  return (
    <div className="rounded-2xl bg-bg-tint p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-extrabold text-text-primary">
          What you told me
        </p>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Lock size={11} /> Only you can see this
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-green-dark">
          {mood}
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-light text-text-primary">
          {genre}
        </span>
      </div>
      <p className="text-text-muted text-sm ">&quot;{freeText}&quot;</p>
    </div>
  );
}
