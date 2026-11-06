import { Lock, MessageCircle } from "lucide-react";

type Props = {
  mood: string;
  genre: string;
  freeText: string;
};

export function WhatYouToldMe({ mood, genre, freeText }: Props) {
  return (
    <div>
      {/* One row: label, the chips you picked, and the privacy note on the right.
          Wraps onto a second line when the column is narrow. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-green-dark">
          What you told me
        </p>

        <div className="flex gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-dark">
            {mood}
          </span>
          {genre && (
            <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-text-primary">
              {genre}
            </span>
          )}
        </div>

        <span className="ml-auto flex items-center gap-1 text-xs text-text-muted">
          <Lock size={11} /> Only you can see this
        </span>
      </div>

      {/* Only shown when the reader wrote something */}
      {freeText && (
        <div className="mt-3 flex gap-2">
          {/* <MessageCircle
            size={14}
            className="mt-1 shrink-0 -scale-x-100  text-text-secondary"
          /> */}
          <p className="text-[13.5px] italic leading-relaxed text-text-secondary">
            {freeText}
          </p>
        </div>
      )}
    </div>
  );
}
