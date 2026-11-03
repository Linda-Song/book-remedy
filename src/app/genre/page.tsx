"use client";

import GenreButton from "@/components/ui/GenreButton";
import { GENRES } from "../data/genre";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";

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
    <div className="flex flex-col justify-center text-center">
      <div className="mb-20">
        <div className="mb-10">
          <p className="text-4xl text-text-primary font-bold mb-2">
            What Kind of book are you in the mood for?
          </p>
          <span className="text-text-secondary">
            Pick a genre, or let me choose for you.
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-4 gap-3 mb-10 w-[600px] mx-auto">
            {GENRES.map((genre) => (
              <GenreButton
                key={genre.key}
                label={genre.label}
                selected={selected === genre.key}
                onClick={() => {
                  setSelected(genre.key);
                  setAnyGenre(false);
                }}
              />
            ))}

            {/* Not a genre: lets the app choose. Only the text color differs. */}
            <GenreButton
              label="Pick for you"
              selected={anyGenre}
              onClick={() => {
                setAnyGenre(true);
                setSelected(null);
              }}
              className={anyGenre ? "" : "text-green!"}
            />
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="primary"
              onClick={handleGetPrescription}
              disabled={authLoading || (!selected && !anyGenre)}
              className="h-[40px] w-[320px] mb-3"
            >
              Get my prescription
            </Button>
          </div>
        </div>
        <div>
          <p className="text-text-primary text-md leading-tight">
            Your first prescription is free. Sign in for 3 a day.
          </p>
          <span className="text-text-secondary text-[12px]">
            Book suggestions only, not medical advice.
          </span>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Image
          src="/caterpillar_first.png"
          alt="caterpillar"
          width={400}
          height={120}
        />
      </div>
    </div>
  );
}
