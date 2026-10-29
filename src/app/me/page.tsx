"use client";

import { useEffect, useState, useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { useRouter } from "next/router";
import { supabase } from "@/server/db/client";
import { getGuestId } from "@/lib/guestId";

type PrescriptionRecord = {
  title: string;
  author: string;
  coverColor: string;
  mood: string;
  genre: string;
  status: string;
};

type RawPrescription = {
  created_at: string;
  status: string;
  mood_key: string;
  genre_key: string | null;
  books: {
    title: string;
    author: string;
    cover_color: string;
  };
};

export default function Me() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [prescriptionDays, setPrescriptionDays] = useState<number[]>([]);
  const [historyByDay, setHistoryByDay] = useState<
    Record<number, PrescriptionRecord[]>
  >({});
  const [totalCount, setTotalCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthData() {
      const guestId = getGuestId();

      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      ).toISOString();

      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          "created_at, status, mood_key, genre_key, books(title, author, cover_color)",
        )
        .eq("guest_id", guestId)
        .gte("created_at", startOfMonth)
        .lt("created_at", startOfNextMonth)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch calendar data", error);
        setLoading(false);
        return;
      }
      const rows = data as unknown as RawPrescription[];
      const days: number[] = [];
      const byDay: Record<number, PrescriptionRecord[]> = {};

      rows.forEach((row) => {
        const day = new Date(row.created_at).getDate();
        if (!days.includes(day)) days.push(day);

        if (!byDay[day]) byDay[day] = [];
        byDay[day].push({
          title: row.books.title,
          author: row.books.author,
          coverColor: row.books.cover_color,
          mood: row.mood_key,
          genre: row.genre_key ?? "",
          status: row.status,
        });
      });

      setPrescriptionDays(days);
      setHistoryByDay(byDay);
      setTotalCount(rows.length);
      setFinishedCount(rows.filter((r) => r.status === "Finished").length);
      setLoading(false);
    }

    fetchMonthData();
  }, []);

  const dayRecords = selectedDay ? historyByDay[selectedDay] : null;

  const STATS = [
    { label: "Prescriptions", value: totalCount },
    { label: "Books finished", value: finishedCount },
    { label: "Days this month", value: prescriptionDays.length },
  ];

  if (loading) {
    return <p className="py-10 text-text-muted">Loading...</p>;
  }

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
        <div className="w-[380px] flex-shrink-0">
          <Calendar
            prescriptionDays={prescriptionDays}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>
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
              <button
                onClick={() => router.push("/history")}
                className="text-xs font-bold text-green-dark"
              >
                View all
              </button>
            </div>

            {dayRecords ? (
              dayRecords.map((book, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-t border-border-light first:border-t-0"
                >
                  <div
                    className="w-[44px] h-[64px] rounded-md flex-shrink-0 mr-4 "
                    style={{ backgroundColor: book.coverColor }}
                  />

                  <div className="flex-1 min-w-0">
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
