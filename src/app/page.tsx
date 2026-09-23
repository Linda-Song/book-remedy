"use client";

import Bubble from "@/components/ui/Bubble";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import MoodButton from "@/components/ui/MoodButton";
import { MOOD_SETS } from "./data/moods";
import { Pencil } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentMoods = MOOD_SETS[selectedIndex];
  const bubbleText = selected
    ? "Good choice! Ready when you are."
    : "Hi! How are you feeling today?";

  return (
    <div className="flex items-center gap-16 justify-center">
      {/* left  */}
      <div className="lg:mt-80">
        <div className="relative w-[480px] h-[480px] ">
          <div className="absolute rounded-full inset-0 bg-bg-tint -z-10" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <Bubble>
              <span className="text-2xl font-bold">{bubbleText}</span>
            </Bubble>
          </div>
          <div className="absolute inset-0 flex items-center pb-12 justify-center">
            <Image
              src="/caterpillar_first.png"
              alt="caterpillar"
              width={440}
              height={149}
            ></Image>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-4 w-[560px]">
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
        <div className="flex gap-3 mt-2 ">
          <Button
            variant="tile"
            onClick={() => setSelectedIndex((prev) => (prev === 0 ? 1 : 0))}
            className="w-full h-[60px]"
          >
            {selectedIndex === 0 ? "More" : "Back"}
          </Button>

          <Button
            variant="dashed"
            className="w-full h-[60px] flex items-center justify-center"
          >
            <Pencil size={18} className="mr-2" />
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
