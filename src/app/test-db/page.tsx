// src/app/test-db/page.tsx
import { supabase } from "@/server/db/client";

export default async function TestDbPage() {
  const { data, error } = await supabase.from("books").select("*");

  if (error) {
    return <div className="py-10">에러: {error.message}</div>;
  }

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-4">DB 연결 테스트</h1>
      <ul className="space-y-2">
        {data.map((book) => (
          <li key={book.isbn13}>
            {book.title} — {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
