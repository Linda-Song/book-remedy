"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/modal/Modal";
import { AuthPrompt } from "@/components/modal/AuthPrompt";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";
import { supabase } from "@/server/db/client";

type PrescriptionData = {
  mood_key: string;
  genre_key: string | null;
  reason: string;
  dosage: string;
  books: {
    title: string;
    author: string;
    publisher: string;
    cover_color: string;
    about: string;
  };
};

export default function PrescriptionPage() {
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
        console.log("Fail to fetch prescription: ", error);
      } else {
        setData(result as unknown as PrescriptionData);
      }
      setLoading(false);
    }
    fetchPrescription();
  }, [id]);

  if (loading) {
    return (
      <p className="py-10 text-text-muted">Loading your prescription...</p>
    );
  }
  if (!data) {
    return <p className="py-10 text-text-muted"> Prescription not found.</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full rounded-t-3xl rounded-b-xl shadow-xl overflow-hidden bg-white border border-border-light">
        <div className="bg-green px-10 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-bold tracking-wide">
            PRESCRIPTION
          </span>
          <span className="text-white/80 text-xs">No. {id?.slice(0, 8)}</span>
        </div>

        <div className="flex p-10 gap-16">
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="w-[200px] h-[313px] rounded-md bg-[#16332E] mb-6"
              style={{ backgroundColor: data.books.cover_color }}
            />
            <Button variant="outline" className="rounded-sm h-8 w-[180px]">
              Find on Kindle
            </Button>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-bg-tint text-green-dark">
                  {data.mood_key}
                </span>
                {data.genre_key && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-light text-text-primary">
                    {data.genre_key}
                  </span>
                )}
              </div>
            </div>

            <BookDetail
              title={data.books.title}
              author={data.books.author}
              publisher={data.books.publisher}
              about={data.books.about}
            />

            <WhyThisBook reason={data.reason} />

            <p className="text-xs text-text-secondary">
              🕐 <span className="font-bold">Dosage</span> {data.dosage}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-10 w-full border border-border-light rounded-2xl h-20 px-8 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-9 rounded-full bg-green-light" />
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
            className="h-10 px-10 rounded-xl"
            onClick={() => setModalType("yes")}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            className="h-10 px-10 rounded-xl"
            onClick={() => setModalType("no")}
          >
            No
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted py-6">
        Book suggestions only, not medical advice.
      </p>
      <Modal open={modalType !== null}>
        {modalType && (
          <AuthPrompt type={modalType} onDismiss={() => setModalType(null)} />
        )}
      </Modal>
    </div>
  );
}
