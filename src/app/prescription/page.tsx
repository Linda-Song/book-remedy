"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { AuthPrompt } from "@/components/modal/AuthPrompt";
import { BookDetail } from "@/components/prescription/BookDetail";
import { WhyThisBook } from "@/components/prescription/WhyThisBook";

export default function PrescriptionPage() {
  const [modalType, setModalType] = useState<"yes" | "no" | null>(null);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full rounded-t-3xl rounded-b-xl shadow-xl overflow-hidden bg-white border border-border-light">
        <div className="bg-green px-10 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-bold tracking-wide">
            PRESCRIPTION
          </span>
          <span className="text-white/80 text-xs">No. 0421 · Sep 24 2026</span>
        </div>

        <div className="flex p-10 gap-16">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-[200px] h-[313px] rounded-md bg-[#16332E] mb-6" />
            <Button variant="outline" className="rounded-sm h-8 w-[180px]">
              Find on Kindle
            </Button>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-bg-tint text-green-dark">
                  Need comfort
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-light text-text-primary">
                  Fiction
                </span>
              </div>
              <p className="text-xs text-text-secondary bg-bg-tint px-3 py-1.5 rounded-full">
                Sign in to unlock 2 more
              </p>
            </div>

            <BookDetail
              title="The Midnight Library"
              author="Matt Haig"
              publisher="Canongate · 2020 · 304 pages · English"
              about="Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants."
            />

            <WhyThisBook reason='You said your mind won&apos;t switch off after a long day. This is a gentle, page-turning story about regrets and second chances, and it lets you wonder "what if" from a safe distance. It ends kindly.' />

            <p className="text-xs text-text-secondary">
              🕐 <span className="font-bold">Dosage</span> 20 pages in the
              evening, for one week.
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
