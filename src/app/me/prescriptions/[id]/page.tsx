"use client";

import { useParams, useRouter } from "next/navigation";
import { AboutBlock, BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { WhatYouToldMe } from "@/components/prescription/WhatYouToldMe";
import { StarRating } from "@/components/prescription/StarRating";
import { ReviewSummary } from "@/components/prescription/ReviewSummary";
import { CollapsibleCard } from "@/components/prescription/CollapsibleCard";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Pencil, Pill } from "lucide-react";
import { supabase } from "@/server/db/client";
import { useState, useEffect } from "react";
import { BookCover } from "@/components/books/BookCover";
import { genreLabel } from "@/app/data/genre";
import { formatDate } from "@/components/prescription/formatDate";

type PrescriptionDetail = {
  id: string;
  mood_key: string;
  genre_key: string | null;
  free_text: string | null;
  reason: string;
  dosage: string;
  status: string;
  started_date: string | null;
  finished_date: string | null;
  created_at: string;
  books: {
    isbn13: string;
    title: string;
    author: string;
    publisher: string | null;
    cover_url: string | null;
    about: string;
  };
  reviews:
    | {
        rating: number;
        share_line: string;
        quote_page: number | null;
        quote_text: string | null;
        body: string;
      }[]
    | {
        rating: number;
        share_line: string;
        quote_page: number | null;
        quote_text: string | null;
        body: string;
      }
    | null;
};

function formatDateRange(started: string | null, finished: string | null) {
  if (started && finished)
    return `Started ${formatDate(started)} — Finished ${formatDate(finished)}`;
  if (started) return `Started ${formatDate(started)} — Ongoing`;
  if (finished) return `Finished ${formatDate(finished)}`;
  return null;
}

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchPrescription() {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, books(*), reviews(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch prescription detail:", error);
      } else {
        setBook(data as unknown as PrescriptionDetail);
      }
      setLoading(false);
    }
    fetchPrescription();
  }, [id]);

  if (loading) {
    return <p className="py-10 text-text-muted">Loading...</p>;
  }
  if (!book) {
    return <p className="py-10 text-text-muted">Prescription not found.</p>;
  }

  const review = Array.isArray(book.reviews) ? book.reviews[0] : book.reviews;
  const dateText = formatDateRange(book.started_date, book.finished_date);

  // One quote for now; the review card already accepts a list of quotes
  const quotes = review?.quote_text
    ? [{ page: review.quote_page ?? undefined, text: review.quote_text }]
    : [];

  return (
    <div className="py-10">
      <button
        onClick={() => router.push("/history")}
        className="mb-6 flex items-center gap-1 text-sm font-bold text-text-secondary transition-colors hover:text-green"
      >
        <ChevronLeft size={16} /> My prescriptions
      </button>

      <div className="flex gap-16">
        {/* Left: cover + rating + button */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <BookCover
            isbn13={book.books.isbn13}
            googleUrl={book.books.cover_url}
            title={book.books.title}
            className="mb-3"
          />
          {review && <StarRating rating={review.rating} />}
          <a
            href={`https://www.amazon.com/s?k=${book.books.isbn13}&i=digital-text`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="mt-3 h-8 w-[150px] rounded-sm">
              Find on Kindle
            </Button>
          </a>
        </div>

        {/* Right: info */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Status pill (filled) + date pill (colors swapped) */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <span className="rounded-full border border-green bg-green px-3 py-1 text-xs font-extrabold text-white">
              {book.status}
            </span>
            {dateText && (
              <span className="rounded-full border border-green bg-white px-3 py-1 text-xs font-extrabold text-green-dark">
                {dateText}
              </span>
            )}
          </div>

          <BookDetail
            title={book.books.title}
            author={book.books.author}
            publisher={book.books.publisher ?? undefined}
          />

          {/* PRESCRIPTION card: About, what you told me, why, dosage */}
          <CollapsibleCard
            title="PRESCRIPTION"
            right={`No. ${book.id.slice(0, 8)}`}
            className="mt-6"
          >
            <div className="p-6">
              <AboutBlock about={book.books.about} />

              {/* Only this part sits in a tint box; it sticks out 16px so its text lines up with About */}
              <div className="-mx-4 mt-6 rounded-2xl bg-bg-tint p-4">
                <WhatYouToldMe
                  mood={book.mood_key}
                  genre={genreLabel(book.genre_key)}
                  freeText={book.free_text ?? ""}
                />
              </div>

              <div className="mt-6">
                <WhyThisBook reason={book.reason} boxed={false} />
              </div>

              {book.dosage && (
                <p className="mt-5 flex items-center gap-1.5 text-xs text-text-secondary">
                  <Pill size={14} className="shrink-0 text-text-primary" />
                  <span>
                    <span className="font-bold text-text-primary">Dosage</span>{" "}
                    {book.dosage}
                  </span>
                </p>
              )}
            </div>
          </CollapsibleCard>

          {/* MY REVIEW card */}
          {review && (
            <CollapsibleCard title="MY REVIEW" className="mt-6">
              <ReviewSummary
                shareLine={review.share_line}
                quotes={quotes}
                text={review.body}
              />
            </CollapsibleCard>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              className="flex h-10 items-center gap-2 rounded-xl px-6"
              onClick={() => router.push(`/review/${book.id}`)}
            >
              <Pencil size={16} /> {review ? "View review" : "Write a review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
