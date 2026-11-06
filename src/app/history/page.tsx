"use client";
import { useEffect, useState } from "react";
import { Grid2x2, List, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/server/db/client";
import { getGuestId } from "@/lib/guestId";
import { useAuthStore } from "@/features/auth/authStore";
import { BookCover } from "@/components/books/BookCover";

const FILTERS = [
  "All",
  "To read",
  "Reading",
  "Finished",
  "Not for me",
] as const;
const PAGE_SIZE = 10;

type HistoryItem = {
  id: string;
  status: string;
  created_at: string;
  books: {
    isbn13: string;
    title: string;
    author: string;
    cover_url: string | null;
  };
  reviews: { rating: number }[] | { rating: number } | null;
};

export default function HistoryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);

  const [allPrescriptions, setAllPrescriptions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  useEffect(() => {
    if (authLoading) return;

    async function fetchHistory() {
      const query = supabase
        .from("prescriptions")
        .select(
          "id, status, created_at, books(isbn13, title, author, cover_url), reviews(rating)",
        )
        .order("created_at", { ascending: false });

      const { data, error } = user
        ? await query.eq("user_id", user.id)
        : await query.eq("guest_id", getGuestId());

      if (error) {
        console.error("Failed to fetch history:", error);
      } else {
        setAllPrescriptions(data as unknown as HistoryItem[]);
      }
      setLoading(false);
    }

    fetchHistory();
  }, [user, authLoading]);

  const filtered = allPrescriptions.filter((book) =>
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

  function getReview(book: HistoryItem) {
    return Array.isArray(book.reviews) ? book.reviews[0] : book.reviews;
  }

  if (loading) {
    return <p className="py-10 text-text-muted">Loading...</p>;
  }

  return (
    <div className="py-10">
      <button
        onClick={() => router.push("/me")}
        className="mb-6 flex items-center gap-1 text-sm font-bold text-text-secondary transition-colors hover:text-green"
      >
        <ChevronLeft size={16} /> My page
      </button>

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
                ? allPrescriptions.length
                : allPrescriptions.filter((b) => b.status === filter).length;
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pageItems.map((book) => {
            const review = getReview(book);
            return (
              <div
                key={book.id}
                onClick={() => router.push(`/me/prescriptions/${book.id}`)}
                className="flex cursor-pointer flex-col items-center text-center"
              >
                {/* Cover is capped in width so it does not grow with the screen */}
                <div className="w-full max-w-[150px]">
                  <BookCover
                    isbn13={book.books.isbn13}
                    googleUrl={book.books.cover_url}
                    title={book.books.title}
                    fluid
                  />
                </div>
                <p className="mt-2 w-full truncate text-xs font-bold text-text-primary">
                  {book.books.title}
                </p>
                <p className="w-full truncate text-[11px] text-text-muted">
                  {book.books.author}
                </p>
                {review && (
                  <div className="mt-1 flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i < review.rating ? "#FFC93C" : "none"}
                        stroke="#FFC93C"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // list view
        <div className="flex flex-col mt-8 rounded-2xl border border-border-light bg-white">
          {pageItems.map((book) => {
            const review = getReview(book);
            return (
              <div
                key={book.id}
                onClick={() => router.push(`/me/prescriptions/${book.id}`)}
                className="flex items-center gap-3 p-4 border-t border-border-light first:border-t-0 cursor-pointer"
              >
                <BookCover
                  isbn13={book.books.isbn13}
                  googleUrl={book.books.cover_url}
                  title={book.books.title}
                  width={44}
                  height={64}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary">
                    {book.books.title}
                  </p>
                  <p className="text-xs text-text-muted">{book.books.author}</p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {new Date(book.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {review && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "#FFC93C" : "none"}
                        stroke="#FFC93C"
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-bg-tint text-text-secondary flex-shrink-0">
                  {book.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* pagination */}
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
