"use client";

import GenreButton from "@/components/ui/GenreButton";
import { GENRES } from "../data/genre";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import { ArrowLeft } from "lucide-react";

// Short description and outline hue per genre key (the data file stays as it is)
const GENRE_STYLE: Record<string, { desc: string; hue: number }> = {
  mystery: { desc: "Clues and twists", hue: 235 },
  thriller: { desc: "Heart racing", hue: 8 },
  romance: { desc: "Love stories", hue: 340 },
  fantasy: { desc: "Magic and wonder", hue: 270 },
  fiction: { desc: "Stories to sink into", hue: 28 },
  humor: { desc: "Made to laugh", hue: 40 },
  biography: { desc: "Real lives", hue: 140 },
  "self-growth": { desc: "Grow and change", hue: 100 },
  mind: { desc: "Ideas about us", hue: 205 },
  science: { desc: "How things work", hue: 175 },
  childlike: { desc: "Playful and sweet", hue: 310 },
};

export default function GenrePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [anyGenre, setAnyGenre] = useState(false); // "Pick for you" chosen
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");
  const text = searchParams.get("text");

  const authLoading = useAuthStore((s) => s.authLoading);

  function handleGetPrescription() {
    // Pass the choices along; the prescribing page makes the actual request
    const params = new URLSearchParams();
    if (mood) params.set("mood", mood);
    if (text) params.set("text", text);
    if (selected) params.set("genre", selected);
    router.push(`/prescribing?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 text-center">
      {/* Top row: text-only back link + step dots (step 2 of 2) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-green hover:underline hover:underline-offset-4"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex gap-1.5" aria-label="Step 2 of 2">
          <span className="h-2 w-2 rounded-full bg-border-light" />
          <span className="h-2 w-2 rounded-full bg-green" />
        </div>
      </div>

      <div>
        <h1 className="whitespace-nowrap text-[clamp(20px,5.6vw,27px)] font-bold leading-tight text-text-primary">
          What kind of book?
        </h1>
        <p className="mt-2 text-text-secondary">
          Pick a genre, or let me choose for you.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {GENRES.map((genre) => {
          const style = GENRE_STYLE[genre.key];
          return (
            <GenreButton
              key={genre.key}
              label={genre.label}
              desc={style?.desc}
              hue={style?.hue}
              selected={selected === genre.key}
              onClick={() => {
                setSelected(genre.key);
                setAnyGenre(false);
              }}
            />
          );
        })}

        {/* Not a genre: lets the app choose. Filled green style. */}
        <GenreButton
          label="Pick for you"
          desc="Surprise me"
          highlight
          selected={anyGenre}
          onClick={() => {
            setAnyGenre(true);
            setSelected(null);
          }}
        />
      </div>

      <Button
        variant="primary"
        onClick={handleGetPrescription}
        disabled={authLoading || (!selected && !anyGenre)}
        className="mx-auto mt-2 h-[48px] w-full max-w-[320px]"
      >
        Get my prescription
      </Button>

      <div>
        <p className="text-md leading-tight text-text-primary">
          Your first prescription is free. Sign in for 3 a day.
        </p>
        <span className="text-[12px] text-text-secondary">
          Book suggestions only, not medical advice.
        </span>
      </div>

      <div className="flex items-center justify-center">
        <Image
          src="/images/caterpillar/reading.png"
          alt="Caterpillar reading a book and eating an apple"
          width={240}
          height={228}
        />
      </div>
    </div>
  );
}
