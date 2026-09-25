"use client";

import GenreButton from "@/components/ui/GenreButton";
import { GENRES } from "../data/genre";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function GenrePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className=" flex flex-col justify-center text-center ">
      <div className="mb-20">
        <div className="mb-10">
          <p className="text-4xl text-text-primary font-bold mb-2">
            What Kind of book are you in the mood for?
          </p>
          <span className="text-text-secondary">
            Pick a genre, or let me surprise you.
          </span>
        </div>
        <div className="flex flex-col items-center justify-center ">
          <div className="grid grid-cols-4 gap-3 mb-3 w-[600px] mx-auto">
            {GENRES.map((genre) => (
              <GenreButton
                key={genre.key}
                label={genre.label}
                selected={selected === genre.key}
                onClick={() => setSelected(genre.key)}
              />
            ))}
          </div>

          <Button variant="genre" className="h-[40px] mb-4 w-[600px] mb-10">
            Surprise me
          </Button>

          <div className="flex items-center justify-center">
            <Button
              variant="primary"
              onClick={() => router.push("/prescribing")}
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
        ></Image>
      </div>
    </div>
  );
}
