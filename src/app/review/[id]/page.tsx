"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StarRatingInput } from "@/components/review/StarRatingInput";
import { StarRating } from "@/components/prescription/StarRating";
import { ALL_PRESCRIPTIONS } from "@/app/data/all_prescriptions";

const STATUSES = ["To read", "Reading", "Finished", "Not for me"] as const;

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const book = ALL_PRESCRIPTIONS.find((b) => b.id === id);

  // 기존 리뷰가 있으면 그 값으로, 없으면 빈 값으로 시작
  const [status, setStatus] = useState<(typeof STATUSES)[number]>(
    book?.status ?? "To read",
  );
  const [started, setStarted] = useState(book?.startedDate ?? "");
  const [finished, setFinished] = useState(book?.finishedDate ?? "");
  const [rating, setRating] = useState(book?.review?.rating ?? 0);
  const [shareLine, setShareLine] = useState(book?.review?.shareLine ?? "");
  const [reviewText, setReviewText] = useState(book?.review?.text ?? "");
  const [isPublic, setIsPublic] = useState(book?.review?.isPublic ?? false);

  if (!book) {
    return <p className="py-10 text-text-muted">Prescription not found.</p>;
  }

  return (
    <div className="py-10">
      <button
        onClick={() => router.push(`/me/prescriptions/${book.id}`)}
        className="flex items-center gap-1 text-sm font-bold text-text-secondary mb-6"
      >
        <ChevronLeft size={16} /> Back to prescription
      </button>

      <h1 className="text-3xl font-extrabold text-text-primary mb-6">
        Write a review
      </h1>

      <div className="flex gap-16">
        {/* 왼쪽: 폼 */}
        <div className="flex-1 min-w-0 max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-[56px] h-[80px] rounded-md flex-shrink-0"
              style={{ backgroundColor: book.coverColor }}
            />
            <div>
              <p className="font-bold text-text-primary">{book.title}</p>
              <p className="text-sm text-text-muted">{book.author}</p>
            </div>
          </div>

          <p className="text-sm font-bold text-text-primary mb-2">Status</p>
          <div className="flex gap-2 mb-6">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-sm font-bold px-4 py-2 rounded-xl border ${
                  status === s
                    ? "bg-green text-white border-green"
                    : "bg-white text-text-primary border-border-light"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary mb-2">
                Started
              </p>
              <input
                type="date"
                value={started}
                onChange={(e) => setStarted(e.target.value)}
                className="w-full h-10 rounded-xl border border-border-light px-3 text-sm"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary mb-2">
                Finished
              </p>
              <input
                type="date"
                value={finished}
                onChange={(e) => setFinished(e.target.value)}
                className="w-full h-10 rounded-xl border border-border-light px-3 text-sm"
              />
            </div>
          </div>

          <p className="text-sm font-bold text-text-primary mb-2">
            Your rating
          </p>
          <div className="mb-6">
            <StarRatingInput rating={rating} onChange={setRating} />
          </div>

          <div className="rounded-2xl bg-bg-tint p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-green-dark flex items-center gap-1">
                <Share2 size={12} /> One line for your share image
              </p>
              <span className="text-xs text-text-muted">
                {shareLine.length} / 80
              </span>
            </div>
            <input
              value={shareLine}
              onChange={(e) => setShareLine(e.target.value.slice(0, 80))}
              className="w-full h-10 rounded-xl border border-green px-3 text-sm bg-white"
            />
            <p className="text-xs text-text-muted mt-2">
              This short line goes on your Instagram image. Keep it sweet.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-text-primary">
                Your review{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </p>
              <span className="text-xs text-text-muted">
                {reviewText.length} / 500
              </span>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
              className="w-full h-[90px] rounded-xl border border-border-light p-3 text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold text-text-primary">Public link</p>
              <p className="text-xs text-text-muted">
                Anyone with the link can read this review. Your words and mood
                stay private.
              </p>
            </div>
            <button
              onClick={() => setIsPublic((p) => !p)}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 ${
                isPublic
                  ? "bg-green justify-end"
                  : "bg-border-light justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" className="h-11 px-6 rounded-xl">
              Save review
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl flex items-center gap-2"
            >
              <Share2 size={16} /> Create share card
            </Button>
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="flex-shrink-0">
          <p className="text-xs text-text-muted text-center mb-2">Preview</p>
          <div className="w-[220px] rounded-2xl bg-green-light p-5">
            <p className="text-xs font-bold text-text-primary mb-4">
              [Site name]
            </p>
            <div
              className="w-full aspect-[2/3] rounded-lg mb-4"
              style={{ backgroundColor: book.coverColor }}
            />
            <div className="flex justify-center mb-2">
              <StarRating rating={rating} size={14} />
            </div>
            <p className="text-sm font-bold text-text-primary text-center mb-1">
              &quot;{shareLine || "..."}&quot;
            </p>
            <p className="text-xs text-text-muted text-center">
              {book.title} · {book.author}
            </p>
          </div>
          <p className="text-xs text-text-muted text-center mt-2">
            This is what your share card will look like.
          </p>
        </div>
      </div>
    </div>
  );
}
