"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StarRatingInput } from "@/components/review/StarRatingInput";
import { StarRating } from "@/components/prescription/StarRating";
import { supabase } from "@/server/db/client";
import { BookCover } from "@/components/books/BookCover";

const STATUSES = ["To read", "Reading", "Finished", "Not for me"] as const;

type ReviewRow = {
  rating: number;
  share_line: string;
  quote_page: number | null;
  quote_text: string | null;
  body: string;
  is_public: boolean;
};

type PrescriptionWithReview = {
  id: string;
  status: string;
  started_date: string | null;
  finished_date: string | null;
  books: {
    isbn13: string;
    title: string;
    author: string;
    cover_url: string | null;
  };
  reviews: ReviewRow[] | ReviewRow | null;
};

// Today as YYYY-MM-DD in local time (toISOString is UTC and can be off by a day)
function todayLocal() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

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
  const [quotePage, setQuotePage] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Which date inputs are usable for each status
  const startedEnabled = status === "Reading" || status === "Finished";
  const finishedEnabled = status === "Finished";
  const today = todayLocal();

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          "id, status, started_date, finished_date, books(isbn13, title, author, cover_url), reviews(*)",
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

      // Prefill the form with existing values (empty if no review yet)
      setBook(typed);
      setStatus(typed.status as (typeof STATUSES)[number]);
      setStarted(typed.started_date ?? "");
      setFinished(typed.finished_date ?? "");
      if (review) {
        setRating(review.rating);
        setShareLine(review.share_line ?? "");
        setQuotePage(review.quote_page ? String(review.quote_page) : "");
        setQuoteText(review.quote_text ?? "");
        setReviewText(review.body ?? "");
        setIsPublic(review.is_public);
      }
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Change status and keep the dates consistent with it
  function handleStatusChange(next: (typeof STATUSES)[number]) {
    setStatus(next);
    if (next === "To read" || next === "Not for me") {
      setStarted("");
      setFinished("");
    }
    if (next === "Reading") {
      setFinished(""); // still ongoing
      if (!started) setStarted(today);
    }
    if (next === "Finished" && !finished) {
      setFinished(today);
    }
  }

  // Block a start date that is later than the finish date
  function handleStartedChange(value: string) {
    if (finished && value > finished) return;
    setStarted(value);
  }
  // Block a finish date that is earlier than the start date
  function handleFinishedChange(value: string) {
    if (started && value < started) return;
    setFinished(value);
  }

  async function handleSave() {
    // Final safety check in case a date was typed in manually
    if (started && finished && finished < started) return;

    setSaving(true);

    // 1) Update status and dates on the prescription
    const { data: updated, error: prescriptionError } = await supabase
      .from("prescriptions")
      .update({
        status,
        started_date: started || null,
        finished_date: finished || null,
      })
      .eq("id", id)
      .select();

    if (prescriptionError) {
      console.error("Failed to update prescription:", prescriptionError);
      setSaving(false);
      return;
    }

    // RLS blocks silently: zero rows updated and no error, so catch it here
    if (!updated || updated.length === 0) {
      console.error("Prescription update was blocked (0 rows updated)");
      alert("Couldn't save your changes. Please try again.");
      setSaving(false);
      return;
    }

    // 2) Upsert the review (update if it exists, insert otherwise)
    const { error: reviewError } = await supabase.from("reviews").upsert({
      prescription_id: id,
      rating,
      share_line: shareLine,
      quote_page: quotePage ? Number(quotePage) : null,
      quote_text: quoteText || null,
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
        className="mb-6 flex items-center gap-1 text-sm font-bold text-text-secondary hover:text-green"
      >
        <ChevronLeft size={16} /> Back to prescription
      </button>

      <h1 className="mb-6 text-3xl font-extrabold text-text-primary">
        Write a review
      </h1>

      <div className="flex gap-16">
        {/* Left: form */}
        <div className="min-w-0 max-w-[560px] flex-1">
          <div className="mb-5 flex items-center gap-3">
            <BookCover
              isbn13={book.books.isbn13}
              googleUrl={book.books.cover_url}
              title={book.books.title}
              width={56}
              height={80}
              className="flex-shrink-0"
            />
            <div>
              <p className="font-bold text-text-primary">{book.books.title}</p>
              <p className="text-sm text-text-muted">{book.books.author}</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-bold text-text-primary">Status</p>
          <div className="mb-4 flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`rounded-xl border px-4 py-1.5 text-sm font-bold ${
                  status === s
                    ? "border-green bg-green text-white"
                    : "border-border-light bg-white text-text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-bold text-text-primary">
                Started
              </p>
              <input
                type="date"
                value={started}
                max={finished || today}
                disabled={!startedEnabled}
                onChange={(e) => handleStartedChange(e.target.value)}
                className="h-9 w-full rounded-xl border border-border-light px-3 text-sm disabled:cursor-not-allowed disabled:bg-bg-tint disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-bold text-text-primary">
                {status === "Reading" ? "Finished (ongoing)" : "Finished"}
              </p>
              <input
                type="date"
                value={finished}
                min={started || undefined}
                max={today}
                disabled={!finishedEnabled}
                onChange={(e) => handleFinishedChange(e.target.value)}
                className="h-9 w-full rounded-xl border border-border-light px-3 text-sm disabled:cursor-not-allowed disabled:bg-bg-tint disabled:opacity-50"
              />
            </div>
          </div>

          <p className="mb-1.5 text-sm font-bold text-text-primary">
            Your rating
          </p>
          <div className="mb-5">
            <StarRatingInput rating={rating} onChange={setRating} />
          </div>

          <div className="mb-5 rounded-2xl bg-bg-tint p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1 text-xs font-bold text-green-dark">
                <Share2 size={12} /> One line for your share image
              </p>
              <span className="text-xs text-text-muted">
                {shareLine.length} / 80
              </span>
            </div>
            <input
              value={shareLine}
              onChange={(e) => setShareLine(e.target.value.slice(0, 80))}
              placeholder="One line about this book"
              className="h-9 w-full rounded-xl border border-green bg-white px-3 text-sm"
            />
            <p className="mt-2 text-xs text-text-muted">
              Sum up this book in one sentence. You can upload it to your social
              media.
            </p>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-bold text-text-primary">
              Favorite quote{" "}
              <span className="font-normal text-text-muted">(optional)</span>
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                placeholder="Page"
                value={quotePage}
                onChange={(e) => setQuotePage(e.target.value)}
                className="h-9 w-20 rounded-xl border border-border-light px-3 text-sm"
              />
              <input
                placeholder="A line from the book"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="h-9 flex-1 rounded-xl border border-border-light px-3 text-sm"
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
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
              className="h-[90px] w-full resize-none rounded-xl border border-border-light p-3 text-sm"
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">Public link</p>
              <p className="text-xs text-text-muted">
                Anyone with the link can read this review. Your words and mood
                stay private.
              </p>
            </div>
            <button
              onClick={() => setIsPublic((p) => !p)}
              className={`flex h-6 w-11 items-center rounded-full px-0.5 ${
                isPublic
                  ? "justify-end bg-green"
                  : "justify-start bg-border-light"
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="h-10 rounded-xl px-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save review"}
            </Button>
            <Button
              variant="outline"
              className="flex h-10 items-center gap-2 rounded-xl px-6"
            >
              <Share2 size={16} /> Create share card
            </Button>
          </div>
        </div>
        {/* Right: live share-card preview (4:5, pale background) */}
        <div className="flex-shrink-0">
          <p className="mb-2 text-center text-xs text-text-muted">Preview</p>
          <div className="flex aspect-[4/5] w-[280px] flex-col items-center overflow-hidden rounded-2xl bg-bg-tint px-[18px] py-3.5 font-[family-name:var(--font-noto-sans)]">
            {/* Brand: mascot icon + name */}
            <div className="mb-1.5 flex items-center gap-1.5 self-start text-[11px] font-extrabold text-green-dark">
              <Image
                src="/images/caterpillar/icon_reading.png"
                alt=""
                width={22}
                height={22}
              />
              ReadRemedy
            </div>

            <div className="mb-2.5 w-[90px]">
              <BookCover
                isbn13={book.books.isbn13}
                googleUrl={book.books.cover_url}
                title={book.books.title}
                fluid
              />
            </div>

            <div className="mb-1 flex justify-center leading-none">
              <StarRating rating={rating} size={14} className="mb-0" />
            </div>

            {/* Title in Nunito, author in Noto Sans */}
            <div className="mb-2.5 w-full text-center text-[11px] text-text-muted">
              <p className="truncate font-[family-name:var(--font-nunito)] text-sm font-extrabold">
                {book.books.title}
              </p>
              <p className="truncate">{book.books.author}</p>
            </div>

            {/* The line: side padding only. Faint hint until something is typed */}
            {shareLine ? (
              <p className="w-full break-words px-3.5 text-center text-xs font-bold leading-snug text-text-primary">
                &quot;{shareLine}&quot;
              </p>
            ) : (
              <p className="w-full px-3.5 text-center text-xs font-semibold italic text-text-muted opacity-55">
                Write one line about this book
              </p>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-text-muted">
            This is what your share card will look like.
          </p>
        </div>
      </div>
    </div>
  );
}
