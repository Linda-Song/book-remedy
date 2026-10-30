"use client";

import GenreButton from "@/components/ui/GenreButton";
import { GENRES } from "../data/genre";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getGuestId } from "@/lib/guestId";
import { supabase } from "@/server/db/client";
import { useAuthStore } from "@/features/auth/authStore";

export default function GenrePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  async function handleGetPrescription() {
    // 로그인했으면 로그인 토큰, 아니면 기본 키 사용
    const { data: sessionData } = await supabase.auth.getSession();
    const token =
      sessionData.session?.access_token ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/prescribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodKey: mood,
          genreKey: selected,
          ownerKey: user ? user.id : getGuestId(),
          isGuest: !user,
        }),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to get prescription:", error);
      return;
    }
    const data = await res.json();
    router.push(`/prescribing?id=${data.prescription.id}`);
  }

  return (
    <div className="flex flex-col justify-center text-center">
      <div className="mb-20">
        <div className="mb-10">
          <p className="text-4xl text-text-primary font-bold mb-2">
            What Kind of book are you in the mood for?
          </p>
          <span className="text-text-secondary">
            Pick a genre, or let me surprise you.
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
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

          <Button variant="genre" className="h-[40px] w-[600px] mb-10">
            Surprise me
          </Button>

          <div className="flex items-center justify-center">
            <Button
              variant="primary"
              onClick={handleGetPrescription}
              disabled={authLoading}
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
