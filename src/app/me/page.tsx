"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { useRouter } from "next/navigation";
import { supabase } from "@/server/db/client";
import { getGuestId } from "@/lib/guestId";
import { useAuthStore } from "@/features/auth/authStore";
import { BookCover } from "@/components/books/BookCover";
import { genreLabel } from "../data/genre";

type PrescriptionRecord = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  coverUrl: string | null;
  mood: string;
  genre: string;
  status: string;
};

type RawPrescription = {
  id: string;
  created_at: string;
  status: string;
  mood_key: string;
  genre_key: string | null;
  books: {
    isbn13: string;
    title: string;
    author: string;
    cover_url: string | null;
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

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  useEffect(() => {
    // Wait until the login check finishes
    if (authLoading) return;

    async function fetchMonthData() {
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

      const query = supabase
        .from("prescriptions")
        .select(
          "id, created_at, status, mood_key, genre_key, books(isbn13, title, author, cover_url)",
        )
        .gte("created_at", startOfMonth)
        .lt("created_at", startOfNextMonth)
        .order("created_at", { ascending: false });

      // Members are matched by user_id, guests by guest_id
      const { data, error } = user
        ? await query.eq("user_id", user.id)
        : await query.eq("guest_id", getGuestId());

      if (error) {
        console.error("Failed to fetch calendar data:", error);
        setLoading(false);
        return;
      }

      const rows = data as unknown as RawPrescription[];

      const days: number[] = [];
      const byDay: Record<number, PrescriptionRecord[]> = {};

      // Group the flat list by day of the month
      rows.forEach((row) => {
        const day = new Date(row.created_at).getDate();
        if (!days.includes(day)) days.push(day);

        if (!byDay[day]) byDay[day] = [];
        byDay[day].push({
          id: row.id,
          title: row.books.title,
          author: row.books.author,
          isbn13: row.books.isbn13,
          coverUrl: row.books.cover_url,
          mood: row.mood_key,
          genre: genreLabel(row.genre_key),
          status: row.status,
        });
      });

      setPrescriptionDays(days);
      setHistoryByDay(byDay);
      setTotalCount(rows.length);
      setFinishedCount(rows.filter((r) => r.status === "Finished").length);

      // Select the day of the most recent prescription by default
      if (rows.length > 0) {
        setSelectedDay(new Date(rows[0].created_at).getDate());
      }

      setLoading(false);
    }

    fetchMonthData();
  }, [user, authLoading]);

  const dayRecords = selectedDay ? historyByDay[selectedDay] : null;

  const STATS: { label: string; value: number; href?: string }[] = [
    { label: "Prescriptions", value: totalCount, href: "/history" },
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
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:text-green-light"
        >
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
          {/* stats; a stat with an href is clickable */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((stat) => {
              const box =
                "flex items-center justify-center gap-2 rounded-2xl border border-border-light bg-white py-3";
              const content = (
                <>
                  <span className="text-xl font-bold text-text-primary">
                    {stat.value}
                  </span>
                  <span className="text-xs text-text-muted">{stat.label}</span>
                </>
              );

              const href = stat.href;
              if (!href) {
                return (
                  <div key={stat.label} className={box}>
                    {content}
                  </div>
                );
              }
              return (
                <button
                  key={stat.label}
                  onClick={() => router.push(href)}
                  className={`${box} cursor-pointer transition hover:-translate-y-0.5 hover:border-green hover:shadow-md`}
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* selected day */}
          <div className="rounded-2xl border border-border-light bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-bold text-text-primary">
                {selectedDay
                  ? `${new Date().toLocaleString("en-US", { month: "short" })} ${selectedDay}`
                  : "Select a date"}
              </p>
              <button
                onClick={() => router.push("/history")}
                className="-mr-2.5 rounded-lg px-2.5 py-1 text-xs font-bold text-green-dark transition-colors hover:bg-[#f1f8df]"
              >
                View all
              </button>
            </div>

            {dayRecords ? (
              dayRecords.map((book) => (
                <div
                  key={book.id}
                  onClick={() => router.push(`/me/prescriptions/${book.id}`)}
                  className="flex items-center justify-between py-3 border-t border-border-light first:border-t-0 cursor-pointer"
                >
                  <BookCover
                    isbn13={book.isbn13}
                    googleUrl={book.coverUrl}
                    title={book.title}
                    width={44}
                    height={64}
                    className="flex-shrink-0 mr-4"
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
                      {book.genre && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-light text-text-primary">
                          {book.genre}
                        </span>
                      )}
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
