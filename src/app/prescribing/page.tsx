"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getGuestId } from "@/lib/guestId";
import { supabase } from "@/server/db/client";
import { useAuthStore } from "@/features/auth/authStore";

const STEPS = [
  "Reading your mood",
  "Checking the shelves",
  "Writing your prescription...",
];

export default function Prescribing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");
  const text = searchParams.get("text");
  const genre = searchParams.get("genre");

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [crisis, setCrisis] = useState(false);
  // Guards against sending the request twice (React strict mode in dev)
  const startedRef = useRef(false);

  // Fake progress: climbs to 90% and waits for the real response
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : Math.min(prev + 2, 90)));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const requestPrescription = useCallback(
    async (skipCrisis: boolean) => {
      setError(null);
      setCrisis(false);
      if (skipCrisis) setProgress(0);

      try {
        // Signed-in users send their token, guests send the anon key
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
              freeText: text,
              genreKey: genre,
              ownerKey: user ? user.id : getGuestId(),
              isGuest: !user,
              skipCrisis,
            }),
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("Failed to get prescription:", body);
          setError(
            body.error === "limit reached"
              ? "You've used all your prescriptions for today."
              : "Something went wrong. Please try again.",
          );
          return;
        }

        const data = await res.json();

        // The server flagged the text: show support info before any book
        if (data.crisis) {
          setCrisis(true);
          return;
        }

        setProgress(100);
        // Short pause so the finished progress bar is visible
        setTimeout(
          () => router.replace(`/prescription?id=${data.prescription.id}`),
          400,
        );
      } catch (err) {
        console.error("Prescribing failed:", err);
        setError("Something went wrong. Please try again.");
      }
    },
    [mood, text, genre, user, router],
  );

  useEffect(() => {
    if (authLoading || startedRef.current) return;
    startedRef.current = true;
    requestPrescription(false);
  }, [authLoading, requestPrescription]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-text-primary">{error}</p>
        <Button variant="primary" onClick={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  if (crisis) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 max-w-[480px] mx-auto text-center">
        <p className="text-3xl font-bold text-text-primary">
          It sounds like things are really heavy right now.
        </p>
        <p className="text-text-secondary">
          You don&apos;t have to carry this alone. Talking to someone can help,
          and these services are free.
        </p>
        <ul className="text-left text-text-primary flex flex-col gap-2">
          <li>
            <strong>Australia:</strong> Lifeline{" "}
            <a href="tel:131114" className="underline">
              13 11 14
            </a>
          </li>
          <li>
            <strong>United States:</strong> call or text{" "}
            <a href="tel:988" className="underline">
              988
            </a>
          </li>
          <li>
            <strong>United Kingdom:</strong> Samaritans{" "}
            <a href="tel:116123" className="underline">
              116 123
            </a>
          </li>
          <li>
            <strong>Elsewhere:</strong>{" "}
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              findahelpline.com
            </a>
          </li>
        </ul>
        <p className="text-sm text-text-secondary">
          If you are in immediate danger, call your local emergency number (000
          in Australia, 911 in the US, 999 in the UK).
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => router.push("/")}>
            Back to home
          </Button>
          <Button variant="outline" onClick={() => requestPrescription(true)}>
            Show me a book anyway
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div>
        <p className="text-3xl font-bold text-text-primary mb-2">
          Finding the right book...
        </p>
        <span className="text-text-secondary">
          This usually takes a few seconds.
        </span>
      </div>
      <div>
        <Image
          src="/caterpillar_first.png"
          alt="caterpillar"
          width={280}
          height={95}
        />
      </div>

      {/* loading */}
      <div className="text-left flex flex-col gap-2 text-text-primary">
        {STEPS.map((step, i) => {
          const stepThreshold = ((i + 1) / STEPS.length) * 100;
          const isDone = progress >= stepThreshold;

          return (
            <div key={step} className="flex items-center gap-2">
              {isDone ? (
                <span className="w-5 h-5 rounded-full bg-green flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-green-light  flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green" />
                </span>
              )}
              <span className="text-text-primary font-bold">{step}</span>
            </div>
          );
        })}
      </div>

      <div className="w-[300px] h-2 bg-bg-tint rounded-full overflow-hidden">
        <div
          className="h-full bg-green rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-text-secondary max-w-[400px]">
        This prescription counts once it&apos;s ready. If something goes wrong,
        it won&apos;t count.
      </p>
    </div>
  );
}
