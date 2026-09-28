"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import {
  PRESCRIPTION_DAYS,
  PRESCRIPTION_HISTORY,
} from "../data/prescription_history";

const STATS = [
  { label: "Prescriptions", value: 12 },
  { label: "Books finished", value: 4 },
  { label: "Days this month", value: PRESCRIPTION_DAYS.length },
];

export default function Me() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dayRecords = selectedDay ? PRESCRIPTION_HISTORY[selectedDay] : null;

  return (
    <div className="py-10">
      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-3xl font-extrabold text-text-primary">
            Your reading diary
          </p>
          <p className="text-text-muted text-sm">
            Every prescription, in one place.
          </p>
        </div>
        <button className="bg-green text-white text-sm font-bold px-5 py-2.5 rounded-xl">
          + New prescription
        </button>
      </div>

      <div className="flex gap-6 mt-8">
        <Calendar
          prescriptionDays={PRESCRIPTION_DAYS}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* right */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border-light bg-white py-3"
              >
                <span className="text-xl font-bold text-text-primary">
                  {stat.value}
                </span>
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* selected day */}
          <div className="rounded-2xl border border-border-light bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-bold text-text-primary">
                {selectedDay ? `Sep ${selectedDay}` : "Select a date"}
              </p>
              <button className="text-xs font-bold text-green-dark">
                View all
              </button>
            </div>

            {dayRecords ? (
              dayRecords.map((book, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-t border-border-light first:border-t-0"
                >
                  <div>
                    <p className="font-bold text-sm text-text-primary">
                      {book.title}
                    </p>
                    <p className="text-xs text-text-muted mb-1.5">
                      {book.author}
                    </p>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-bg-tint text-green-dark">
                        {book.mood}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-light text-text-primary">
                        {book.genre}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-bg-tint text-text-secondary">
                    {book.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted py-6 text-center">
                Click a highlighted date to see that day&apos;s prescriptions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
