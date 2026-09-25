"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";

const STEPS = [
  "Reading your mood",
  "Checking the shelves",
  "Writing your prescription...",
];

export default function Prescribing() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 50);
    const timer = setTimeout(() => {
      router.push("/prescription");
    }, 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

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
          // const isActive = !isDone && progress >= (i/STEPS.length) * 100

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
        This prescription counts once it's ready. If something goes wrong. it
        won't count
      </p>
    </div>
  );
}
