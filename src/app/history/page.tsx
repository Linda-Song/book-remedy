"use client";
import { useState } from "react";
import { ALL_PRESCRIPTIONS } from "../data/all_prescriptions";
import { Grid2x2, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
const FILTERS = [
  "All",
  "To read",
  "Reading",
  "Finished",
  "Not for me",
] as const;
const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);

  const filtered = ALL_PRESCRIPTIONS.filter((book) =>
    activeFilter === "All" ? true : book.status === activeFilter,
  );

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  function handleFilterChange(filter: (typeof FILTERS)[number]) {
    setActiveFilter(filter);
    setPage(0);
  }

  function goPrev() {
    setPage((p) => Math.max(p - 1, 0));
  }

  function goNext() {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }

  return (
    <div className="py-10">
      <div className="mb-2">
        <p className="text-3xl font-extrabold text-text-primary">
          My prescriptions
        </p>
        <p className="text-text-muted text-sm">
          Update a status to keep your diary tidy.
        </p>
      </div>

      {/* filters */}
      <div className="flex mt-6 justify-between">
        <div className="flex gap-2">
          {FILTERS.map((filter) => {
            const count =
              filter === "All"
                ? ALL_PRESCRIPTIONS.length
                : ALL_PRESCRIPTIONS.filter((b) => b.status === filter).length;
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`text-sm font-bold px-4 py-2 rounded-xl border ${
                  activeFilter === filter
                    ? "bg-green text-white border-green"
                    : "bg-white text-text-primary border-border-light"
                }`}
              >
                {filter} {count}
              </button>
            );
          })}
        </div>

        {/* view toggle */}
        <button
          onClick={() =>
            setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
          }
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green text-white"
        >
          {viewMode === "grid" ? <List size={16} /> : <Grid2x2 size={16} />}
        </button>
      </div>

      {/* content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-5 gap-4 mt-4">
          {pageItems.map((book, i) => (
            <div
              key={i}
              onClick={() => router.push(`/me/prescriptions/${book.id}`)}
              className="flex flex-col"
            >
              <div
                className="w-full aspect-[2/3] rounded-lg"
                style={{ backgroundColor: book.coverColor }}
              />
              <p className="text-xs font-bold text-text-primary mt-2 truncate">
                {book.title}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {book.author}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col mt-4 rounded-2xl border border-border-light bg-white">
          {pageItems.map((book, i) => (
            <div
              key={i}
              onClick={() => router.push(`/me/prescriptions/${book.id}`)}
              className="flex items-center gap-3 p-4 border-t border-border-light first:border-t-0"
            >
              <div
                className="w-[44px] h-[64px] rounded-md flex-shrink-0"
                style={{ backgroundColor: book.coverColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text-primary">
                  {book.title}
                </p>
                <p className="text-xs text-text-muted">{book.author}</p>
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">
                {book.date}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-bg-tint text-text-secondary flex-shrink-0">
                {book.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* pagination — 맨 아래로 이동 */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-text-muted">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={goNext}
          disabled={page >= totalPages - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
