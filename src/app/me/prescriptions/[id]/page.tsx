"use client";

import { useParams, useRouter } from "next/navigation";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { WhatYouToldMe } from "@/components/prescription/WhatYouToldMe";
import { StarRating } from "@/components/prescription/StarRating";
import { ReviewSummary } from "@/components/prescription/ReviewSummary";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Pencil } from "lucide-react";
import { ALL_PRESCRIPTIONS } from "@/app/data/all_prescriptions";

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
        {/* 왼쪽: 표지 + 별점 + 버튼 */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-[200px] h-[313px] rounded-md mb-3"
            style={{ backgroundColor: book.coverColor }}
          />
          {book.review && <StarRating rating={book.review.rating} />}
          <Button variant="outline" className="rounded-sm h-8 w-[180px] mt-3">
            Find on Kindle
          </Button>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* 상태 배지 + 날짜 (이전의 Prescription 배지 자리) */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green text-white w-fit">
              {book.status}
            </span>
            <span className="text-xs text-text-muted">{book.date}</span>
          </div>

          <BookDetail
            title={book.title}
            author={book.author}
            publisher={book.publisher}
            about={book.about}
          />

          {/* 이전 date 자리 → Started/Finished */}
          {book.startedDate && (
            <p className="text-xs text-text-muted mb-4 -mt-2">
              Started {book.startedDate}
              {" — "}
              {book.finishedDate ? `Finished ${book.finishedDate}` : "Ongoing"}
            </p>
          )}

          {/* What you told me + Why this book 한 블록 */}
          <div className="rounded-2xl bg-bg-tint p-4 mb-4 space-y-4">
            <WhatYouToldMe
              mood={book.mood}
              genre={book.genre}
              freeText={book.freeText}
            />
            <div className="border-t border-white pt-4">
              <WhyThisBook reason={book.reason} />
            </div>
          </div>

          {/* 한 줄 + 구절 + 리뷰 한 블록 */}
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
              <Pencil size={16} />{" "}
              {book.review ? "View review" : "Write a review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
