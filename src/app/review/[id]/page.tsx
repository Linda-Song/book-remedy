"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StarRatingInput } from "@/components/review/StarRatingInput";
import { StarRating } from "@/components/prescription/StarRating";
import { supabase } from "@/server/db/client";

const STATUSES = ["To read", "Reading", "Finished", "Not for me"] as const;

type PrescriptionWithReview = {
  id: string;
  status: string;
  started_date: string | null;
  finished_date: string | null;
  books: {
    title: string;
    author: string;
    cover_color: string;
  };
  reviews: {
    rating: number;
    share_line: string;
    body: string;
    is_public: boolean;
  } | null;
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<PrescriptionWithReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<(typeof STATUSES)[number]>("To read");
  const [started, setStarted] = useState("");
  const [finished, setFinished] = useState("");
  const [rating, setRating] = useState(0);
  const [shareLine, setShareLine] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          "id, status, started_date, finished_date, books(title, author, cover_color), reviews(*)",
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch prescription for review:", error);
        setLoading(false);
        return;
      }

      const typed = data as unknown as PrescriptionWithReview;
      const review = Array.isArray(typed.reviews)
        ? typed.reviews[0]
        : typed.reviews;

      setBook(typed);
      setStatus(typed.status as (typeof STATUSES)[number]);
      setStarted(typed.started_date ?? "");
      setFinished(typed.finished_date ?? "");
      if (review) {
        setRating(review.rating);
        setShareLine(review.share_line);
        setReviewText(review.body);
        setIsPublic(review.is_public);
      }
      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function handleSave() {
    setSaving(true);

    // 1) prescriptions 테이블의 status, 날짜 업데이트
    const { error: prescriptionError } = await supabase
      .from("prescriptions")
      .update({
        status,
        started_date: started || null,
        finished_date: finished || null,
      })
      .eq("id", id);

    if (prescriptionError) {
      console.error("Failed to update prescription:", prescriptionError);
      setSaving(false);
      return;
    }

    // 2) reviews 테이블에 upsert (있으면 수정, 없으면 새로 생성)
    const { error: reviewError } = await supabase.from("reviews").upsert({
      prescription_id: id,
      rating,
      share_line: shareLine,
      body: reviewText,
      is_public: isPublic,
    });

    if (reviewError) {
      console.error("Failed to save review:", reviewError);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/me/prescriptions/${id}`);
  }

  if (loading) {
    return <p className="py-10 text-text-muted">Loading...</p>;
  }

  if (!book) {
    return <p className="py-10 text-text-muted">Prescription not found.</p>;
  }

  return (
    <div className="py-10">
      <button
        onClick={() => router.push(`/me/prescriptions/${id}`)}
        className="flex items-center gap-1 text-sm font-bold text-text-secondary mb-6"
      >
        <ChevronLeft size={16} /> Back to prescription
      </button>

      <h1 className="text-3xl font-extrabold text-text-primary mb-6">
        Write a review
      </h1>

      <div className="flex gap-16">
        {/* Left: form */}
        <div className="flex-1 min-w-0 max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-[56px] h-[80px] rounded-md flex-shrink-0"
              style={{ backgroundColor: book.books.cover_color }}
            />
            <div>
              <p className="font-bold text-text-primary">{book.books.title}</p>
              <p className="text-sm text-text-muted">{book.books.author}</p>
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
                min={started || undefined}
                onChange={(e) => {
                  if (started && e.target.value < started) {
                    alert("Finished date can't be before the started date.");
                    return;
                  }
                  setFinished(e.target.value);
                }}
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
            <Button
              variant="primary"
              className="h-11 px-6 rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save review"}
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl flex items-center gap-2"
            >
              <Share2 size={16} /> Create share card
            </Button>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-shrink-0">
          <p className="text-xs text-text-muted text-center mb-2">Preview</p>
          <div className="w-[220px] rounded-2xl bg-green-light p-5">
            <p className="text-xs font-bold text-text-primary mb-4">
              [Site name]
            </p>
            <div
              className="w-full aspect-[2/3] rounded-lg mb-4"
              style={{ backgroundColor: book.books.cover_color }}
            />
            <div className="flex justify-center mb-2">
              <StarRating rating={rating} size={14} />
            </div>
            <p className="text-sm font-bold text-text-primary text-center mb-1">
              &quot;{shareLine || "..."}&quot;
            </p>
            <p className="text-xs text-text-muted text-center">
              {book.books.title} · {book.books.author}
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
