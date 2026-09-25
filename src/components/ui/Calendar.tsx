"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  prescriptionDays: number[];
  onSelectDay: (day: number) => void;
  selectedDay: number | null;
};

export function Calendar({
  prescriptionDays,
  onSelectDay,
  selectedDay,
}: Props) {
  const today = new Date();
  const year = 2026;
  const month = 8;

  const firstDayOfMonth = new Date(year, month, 1).getDay(); //2
  const daysInMonth = new Date(year, month + 1, 0).getDate(); //30
  const daysInPrevMonth = new Date(year, month, 0).getDate(); //31

  const leadingDays = Array.from(
    { length: firstDayOfMonth },
    (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1,
  ); //30,31

  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1); //1,2,3,4,5...31

  const totalCells = leadingDays.length + currentDays.length;
  const trailingCount = (7 - (totalCells % 7)) % 7;
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl border border-border-light p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-bold text-text-primary"> September 2026</p>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border-light hover:bg-bg-tint ">
            <ChevronLeft size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border-light hover:bg-bg-tint ">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-col-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-text-muted font-bold"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {leadingDays.map((day) => (
          <div
            key={`prev-${day}`}
            className="h-10 flex items-center justify-center text-sm text-border-light"
          >
            {day}
          </div>
        ))}
        {currentDays.map((day) => {
          const hasPrescription = prescriptionDays.includes(day);
          const isToday = day === today.getDate();
          const isSelected = day === selectedDay;

          return (
            <div key={day} className="h-10 flex items-center justify-center">
              <button
                disabled={!hasPrescription}
                onClick={() => onSelectDay(day)}
                className={`w-8 h-8 rounded-full text-sm font-bold flex text-text-primary items-center justify-center
                  ${hasPrescription ? "bg-green-light cursor-pointer" : "cursor-default"}
                  ${isToday ? "border-2 border-green" : ""}
                  ${isSelected ? "bg-green text-white" : ""}
                  `}
              >
                {day}
              </button>
            </div>
          );
        })}
        {trailingDays.map((day) => (
          <div
            key={`next-${day}`}
            className="h-10 flex items-center justify-center text-sm text-border-light"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-light" /> Prescription
          day
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-green" /> Today
        </div>
      </div>
    </div>
  );
}
