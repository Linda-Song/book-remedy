"use client";

import { useParams, useRouter } from "next/navigation";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { WhatYouToldMe } from "@/components/prescription/WhatYouToldMe";
import { StarRating } from "@/components/prescription/StarRating";
import { ReviewSummary } from "@/components/prescription/ReviewSummary";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Pencil } from "lucide-react";
import { supabase } from "@/server/db/client";
import { useState, useEffect } from "react";

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
    title: string;
    author: string;
    publisher: string;
    cover_color: string;
    about: string;
  };
  reviews: {
    rating: number;
    share_line: string;
    quote_page: number | null;
    quote_text: string | null;
    body: string;
  } | null;
};

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

      console.log("Prescription query result:", { data, error });

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

  return (
    <div className="py-10">
      <button
        onClick={() => router.push("/history")}
        className="flex items-center gap-1 text-sm font-bold text-text-secondary mb-6"
      >
        <ChevronLeft size={16} /> My prescriptions
      </button>

      <div className="flex gap-16">
        {/* Left: cover + rating + button */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-[200px] h-[313px] rounded-md mb-3"
            style={{ backgroundColor: book.books.cover_color }}
          />
          {review && <StarRating rating={review.rating} />}
          <Button variant="outline" className="rounded-sm h-8 w-[180px] mt-3">
            Find on Kindle
          </Button>
        </div>

        {/* Right: info */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Status badge + started/finished date (replaces old "Prescription" badge) */}
          <div className="flex items-center mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green text-white w-fit">
              {book.status}
            </span>

            {book.started_date && (
              <p className="text-xs ml-2 px-3 py-1 rounded-full bg-green text-white  w-fit">
                Started {book.started_date}
                {" — "}
                {book.finished_date
                  ? `Finished ${book.finished_date}`
                  : "Ongoing"}
              </p>
            )}
          </div>

          <BookDetail
            title={book.books.title}
            author={book.books.author}
            publisher={book.books.publisher}
            about={book.books.about}
          />

          {/* What you told me + Why this book, in one block */}
          <div className="rounded-2xl bg-bg-tint p-4 mb-4 space-y-4">
            <WhatYouToldMe
              mood={book.mood_key}
              genre={book.genre_key ?? ""}
              freeText={book.free_text ?? ""}
            />
            <div className="border-t border-white pt-4">
              <WhyThisBook reason={book.reason} />
            </div>
          </div>

          {/* Share line + quote + review, in one block */}
          {review && (
            <ReviewSummary
              shareLine={review.share_line}
              quotePage={review.quote_page ?? undefined}
              quoteText={review.quote_text ?? undefined}
              text={review.body}
            />
          )}

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              className="h-10 px-6 rounded-xl flex items-center gap-2"
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