"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/modal/Modal";
import { AuthPrompt } from "@/components/modal/AuthPrompt";
import { FeedbackPrompt } from "@/components/modal/FeedbackPrompt";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { supabase } from "@/server/db/client";
import { useAuthStore } from "@/features/auth/authStore";
import { BookCover } from "@/components/books/BookCover";
import { genreLabel } from "../data/genre";
import Image from "next/image";
import { Pill } from "lucide-react";

type PrescriptionData = {
  mood_key: string;
  genre_key: string | null;
  reason: string;
  dosage: string;
  books: {
    isbn13: string;
    title: string;
    author: string;
    publisher: string | null;
    about: string;
    cover_url: string | null;
  };
};

export default function PrescriptionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPrescription() {
      const { data: result, error } = await supabase
        .from("prescriptions")
        .select("mood_key, genre_key, reason, dosage, books(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch prescription:", error);
      } else {
        setData(result as unknown as PrescriptionData);
      }
      setLoading(false);
    }
    fetchPrescription();
  }, [id]);

  // Save the answer to the database for signed-in members
  async function saveFeedback(value: "yes" | "no") {
    const { error } = await supabase
      .from("prescriptions")
      .update({ feedback: value })
      .eq("id", id);
    if (error) console.error("Failed to save feedback:", error);
  }

  function handleAnswer(value: "yes" | "no") {
    setModalType(value);
    if (user) saveFeedback(value);
  }

  if (loading) {
    return (
      <p className="py-10 text-text-muted">Loading your prescription...</p>
    );
  }
  if (!data) {
    return <p className="py-10 text-text-muted">Prescription not found.</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-t-3xl rounded-b-xl border border-border-light bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green px-10 py-3">
          <span className="text-sm font-bold tracking-wide text-white">
            PRESCRIPTION
          </span>
          <span className="text-xs text-white/80">No. {id?.slice(0, 8)}</span>
        </div>

        <div className="flex gap-[58px] p-10">
          {/* book cover, Link */}
          <div className="flex flex-shrink-0 flex-col items-center">
            <BookCover
              isbn13={data.books.isbn13}
              googleUrl={data.books.cover_url}
              title={data.books.title}
              className="mb-6"
            />
            <a
              href={`https://www.amazon.com/s?k=${data.books.isbn13}&i=digital-text`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="h-8 w-[150px] rounded-sm">
                Find on Kindle
              </Button>
            </a>
          </div>

          {/* Right column: 18px right inset = the tint box overhang,
              so the box ends exactly on the card's padding line */}
          <div className="flex min-w-0 flex-1 flex-col pr-[18px]">
            <div className="mb-4 flex gap-2">
              <span className="rounded-full bg-bg-tint px-3 py-1 text-xs font-bold text-green-dark">
                {data.mood_key}
              </span>
              {data.genre_key && (
                <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-text-primary">
                  {genreLabel(data.genre_key)}
                </span>
              )}
            </div>

            <BookDetail
              title={data.books.title}
              author={data.books.author}
              publisher={data.books.publisher ?? undefined}
              about={data.books.about}
            />

            <WhyThisBook reason={data.reason} />

            {/* Dosage: more room above, thin divider, pill icon */}
            <p className="mt-7 flex items-center gap-1.5 border-t border-border-light pt-3.5 text-xs text-text-secondary">
              <Pill size={14} className="shrink-0 text-text-primary" />
              <span>
                <span className="font-bold text-text-primary">Dosage</span>{" "}
                {data.dosage}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex h-20 w-full items-center justify-between rounded-2xl border border-border-light bg-white px-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/caterpillar/icon_reading.png"
            alt=""
            width={56}
            height={56}
          />
          <div>
            <p className="text-sm font-bold text-text-primary">
              Do you like this prescription?
            </p>
            <p className="text-xs text-text-muted">
              Your answer helps me pick better books next time.
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="primary"
            className="h-10 rounded-xl px-10"
            onClick={() => handleAnswer("yes")}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl px-10"
            onClick={() => handleAnswer("no")}
          >
            No
          </Button>
        </div>
      </div>

      <p className="py-6 text-center text-xs text-text-muted">
        Book suggestions only, not medical advice.
      </p>

      <Modal open={modalType !== null} onClose={() => setModalType(null)}>
        {modalType && !user && (
          <AuthPrompt type={modalType} onDismiss={() => setModalType(null)} />
        )}
        {modalType && user && (
          <FeedbackPrompt
            type={modalType}
            onClose={() => setModalType(null)}
            onPrimary={() => router.push(modalType === "yes" ? "/me" : "/")}
          />
        )}
      </Modal>
    </div>
  );
}
