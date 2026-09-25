"use client";

import { PrescriptionCard } from "@/components/card/prescriptionCard";
import { TODAY_PRESCRIPTIONS, POPULAR_BOOKS } from "@/app/data/discoverMock";

export default function Discover() {
  return (
    <div>
      <div className="flex p-4 gap-4">
        <div className="w-16 h-16 bg-green-light rounded-full flex-shrink-0" />
        <div className="flex flex-col ml-3">
          <p className="text-2xl font-extrabold text-text-primary">
            That&apos;s your 3 for today!
          </p>
          <p className="text-text-muted mb-3">
            Come back tomorrow for a fresh set. Until then, here are more books
            for you, where you asked for comfort.
          </p>
          <button className="text-sm font-bold text-green-dark w-fit">
            Go to my page →
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-lg font-bold text-text-primary mb-4">
          Today&apos;s prescriptions
        </p>
        <div className="grid grid-cols-3 gap-4">
          {TODAY_PRESCRIPTIONS.map((book, i) => (
            <PrescriptionCard key={i} title={book.title} author={book.author} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <p className="text-lg font-bold text-text-primary mb-4">
          Popular in Fiction
        </p>
        <div className="grid grid-cols-3 gap-4">
          {POPULAR_BOOKS.map((book, i) => (
            <div
              key={i}
              className="h-[200px] rounded-2xl bg-bg-tint flex items-center justify-center text-text-muted"
            >
              {book.title}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-10">
        Your prescriptions reset at 12:00 am. Book suggestions only, not medical
        advice.
      </p>
    </div>
  );
}
