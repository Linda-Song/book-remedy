"use client";

import Bubble from "@/components/ui/Bubble";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const MOODS = [
  { key: "comfort", label: "Need comfort" },
  { key: "excited", label: "Feel excited" },
  { key: "thrill", label: "Want a thrill" },
  { key: "calm", label: "Want calm" },
  { key: "think", label: "Deep thoughts" },
  { key: "laugh", label: "Want to laugh" },
];

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex items-center gap-16 justify-center">
      {/* left  */}
      <div className="lg:mt-80">
        <div className="relative w-[480px] h-[480px] ">
          <div className="absolute rounded-full inset-0 bg-bg-tint -z-10" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <Bubble>
              <span className="text-2xl font-bold">
                Hi! How are you feeling today?
              </span>
            </Bubble>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-4 w-[560px]">
          {MOODS.map((mood) => (
            <Button
              key={mood.key}
              variant="tile"
              selected={selected === mood.key}
              onClick={() => setSelected(mood.key)}
              className="w-full h-[134px] flex items-center justify-center text-lg font-bold"
            >
              {mood.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-3 mt-2 ">
          <Button variant="tile" className="w-full h-[60px]">
            More moods
          </Button>
          <Button variant="tile" className="w-full h-[60px]">
            Something else
          </Button>
        </div>
        <div>
          <Button
            variant="primary"
            disabled={!selected}
            onClick={() => router.push("/genre")}
            className=" w-full h-[60px] mt-4"
          >
            Choose a genre
          </Button>
        </div>
        <div className="text-center mt-2">
          <p>Your first prescription is free. Sign in for 3 a day. </p>
          <p>Book suggestions only, not medical advice </p>
        </div>
      </div>
    </div>
  );
}
