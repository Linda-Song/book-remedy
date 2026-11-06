"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import MoodButton from "@/components/ui/MoodButton";
import { MOOD_SETS } from "./data/moods";

const MAX_TEXT = 200;

// All 12 moods shown at once
const ALL_MOODS = MOOD_SETS.flat();

// Icon circle color per mood (hue), spaced around the color wheel
const MOOD_HUE: Record<string, number> = {
  comfort: 345,
  excited: 38,
  thrill: 62,
  calm: 195,
  think: 255,
  laugh: 90,
  escape: 165,
  nostalgia: 285,
  boost: 120,
  romance: 320,
  learn: 220,
  courage: 10,
};

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [freeText, setFreeText] = useState("");

  const hasText = freeText.trim().length > 0;
  // In free-text mode the typed text counts as the choice
  const canContinue = showInput ? hasText : !!selected;

  // Short line under the title that reacts to what the reader does
  const hint = showInput
    ? "Go on, I'm listening."
    : selected
      ? "Good choice! Ready when you are."
      : "Take your time. Pick a mood and I'll prescribe one book.";

  function handleContinue() {
    if (showInput) {
      // Free text has no mood key yet, so the server falls back to a default
      router.push(`/genre?text=${encodeURIComponent(freeText.trim())}`);
    } else {
      router.push(`/genre?mood=${selected}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px] py-6">
      <h1 className="text-center font-bold leading-tight whitespace-nowrap text-[clamp(18px,5.4vw,27px)]">
        How are you feeling today?
      </h1>
      <p className="text-center text-text-muted mt-2 mb-4">{hint}</p>

      {showInput ? (
        <div className="h-[404px] rounded-2xl border border-[#9cc93f] bg-white p-4 flex flex-col shadow-[0_1px_2px_rgba(25,70,48,0.06),0_8px_22px_-10px_rgba(25,70,48,0.16)]">
          <textarea
            autoFocus
            value={freeText}
            onChange={(e) => setFreeText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="Long day, and I can't switch off..."
            className="flex-1 resize-none outline-none text-sm placeholder:text-text-muted placeholder:opacity-50"
          />
          <span className="text-xs text-text-muted text-right">
            {freeText.length} / {MAX_TEXT}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {ALL_MOODS.map((mood) => (
            <MoodButton
              key={mood.key}
              icon={mood.icon}
              label={mood.label}
              description={mood.description}
              hue={MOOD_HUE[mood.key] ?? 150}
              selected={selected === mood.key}
              onClick={() => setSelected(mood.key)}
            />
          ))}
        </div>
      )}

      <Button
        variant="soft"
        onClick={() => setShowInput((prev) => !prev)}
        className="w-full h-[52px] mt-3 flex items-center justify-center gap-2 font-semibold text-green-dark!"
      >
        {showInput ? <LayoutGrid size={18} /> : <Pencil size={18} />}
        {showInput ? "Pick a mood instead" : "Tell me your mood"}
      </Button>

      <Button
        variant="primary"
        disabled={!canContinue}
        onClick={handleContinue}
        className="w-full h-[56px] mt-3"
      >
        Choose a genre
      </Button>

      <div className="text-center mt-2 text-sm text-text-muted">
        <p>Your first prescription is free. Sign in for 3 a day.</p>
        <p>Book suggestions only, not medical advice</p>
      </div>
    </div>
  );
}
