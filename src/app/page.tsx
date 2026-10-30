"use client";

import Bubble from "@/components/ui/Bubble";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import MoodButton from "@/components/ui/MoodButton";
import { MOOD_SETS } from "./data/moods";
import { Pencil } from "lucide-react";
import Image from "next/image";

const MAX_TEXT = 200;

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [freeText, setFreeText] = useState("");
  const currentMoods = MOOD_SETS[selectedIndex];

  const hasText = freeText.trim().length > 0;
  // In free-text mode the typed text counts as the choice
  const canContinue = showInput ? hasText : !!selected;

  const bubbleText = showInput
    ? "Go on, I'm listening."
    : selected
      ? "Good choice! Ready when you are."
      : "Hi! How are you feeling today?";

  function handleContinue() {
    if (showInput) {
      // Free text has no mood key yet, so the server falls back to a default
      router.push(`/genre?text=${encodeURIComponent(freeText.trim())}`);
    } else {
      router.push(`/genre?mood=${selected}`);
    }
  }

  return (
    <div className="flex items-center gap-14 justify-center">
      {/* left */}
      <div className="lg:mt-80">
        <div className="relative w-[420px] h-[420px]">
          <div className="absolute rounded-full inset-0 bg-bg-tint -z-10" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <Bubble>
              <p className="text-xl text-center font-bold">{bubbleText}</p>
            </Bubble>
          </div>
          <div className="absolute inset-0 flex items-center pb-10 justify-center">
            <Image
              src="/caterpillar_first.png"
              alt="caterpillar"
              width={380}
              height={129}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-[480px]">
        {showInput ? (
          <div className="h-[304px] rounded-2xl border-2 border-green bg-white p-4 flex flex-col">
            <textarea
              autoFocus
              value={freeText}
              onChange={(e) => setFreeText(e.target.value.slice(0, MAX_TEXT))}
              placeholder="Long day, and I can't switch off..."
              className="flex-1 resize-none outline-none text-sm"
            />
            <span className="text-xs text-text-muted text-right">
              {freeText.length} / {MAX_TEXT}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {currentMoods.map((mood) => (
              <MoodButton
                key={mood.key}
                icon={mood.icon}
                label={mood.label}
                description={mood.description}
                selected={selected === mood.key}
                onClick={() => setSelected(mood.key)}
              />
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {!showInput && (
            <Button
              variant="tile"
              onClick={() => setSelectedIndex((prev) => (prev === 0 ? 1 : 0))}
              className="w-full h-[56px]"
            >
              {selectedIndex === 0 ? "More" : "Back"}
            </Button>
          )}

          <Button
            variant="dashed"
            selected={showInput}
            onClick={() => setShowInput((prev) => !prev)}
            className="w-full h-[56px] flex items-center justify-center"
          >
            <Pencil size={18} className="mr-2" />
            {showInput ? "Pick a mood instead" : "Something else"}
          </Button>
        </div>

        <Button
          variant="primary"
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full h-[56px] mt-4"
        >
          Choose a genre
        </Button>

        <div className="text-center mt-2">
          <p>Your first prescription is free. Sign in for 3 a day.</p>
          <p>Book suggestions only, not medical advice</p>
        </div>
      </div>
    </div>
  );
}
