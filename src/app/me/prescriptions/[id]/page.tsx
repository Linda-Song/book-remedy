"use client";

import { useParams, useRouter } from "next/navigation";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { WhatYouToldMe } from "@/components/prescription/WhatYouToldMe";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Pencil } from "lucide-react";
import { ALL_PRESCRIPTIONS } from "@/app/data/all_prescriptions";
import { StarRating } from "@/components/prescription/StarRating";
import { ReviewSummary } from "@/components/prescription/ReviewSummary";

const STATUSES = ["To read", "Reading", "Finished", "Not for me"] as const;

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const book = ALL_PRESCRIPTIONS.find((b) => b.id === id);

  if (!book) {
    return <p className="py-10 text-text-muted">Prescription not found.</p>;
  }

  return (
    <div className="py-10">
      <button
        onClick={() => router.push("/history")}
        className="flex items-center gap-1 text-sm font-bold text-text-secondary mb-6"
      >
        <ChevronLeft size={16} /> My prescriptions
      </button>

      <div className="flex gap-16">
        {/* left: cover + rating + button */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-[200px] h-[313px] rounded-md mb-4"
            style={{ backgroundColor: book.coverColor }}
          />
          {book.review && <StarRating rating={book.review.rating} />}
          <Button variant="outline" className="rounded-sm h-8 w-[180px]">
            Find on Kindle
          </Button>
        </div>

        {/* right: info */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-light text-text-primary">
                Prescription
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green text-white">
                {book.status}
              </span>
            </div>
            <span className="text-xs text-text-muted">{book.date}</span>
          </div>

          <BookDetail
            title={book.title}
            author={book.author}
            publisher={book.publisher}
            about={book.about}
          />

          {book.startedDate && (
            <p className="text-xs text-text-muted mb-4 -mt-2">
              Started {book.startedDate}
              {" - "}
              {book.finishedDate ? `Finished ${book.finishedDate}` : "Ongoing"}
            </p>
          )}

          <WhatYouToldMe
            mood={book.mood}
            genre={book.genre}
            freeText={book.freeText}
          />

          <WhyThisBook reason={book.reason} />

          {book.review && (
            <ReviewSummary
              shareLine={book.review.shareLine}
              quotePage={book.review.quotePage}
              quoteText={book.review.quoteText}
              text={book.review.text}
            />
          )}

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              className="h-10 px-6 rounded-xl flex items-center gap-2"
              onClick={() => router.push(`/review/${book.id}`)}
            >
              <Pencil size={16} /> Write a review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
