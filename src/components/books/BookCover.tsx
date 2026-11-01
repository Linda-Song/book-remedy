"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  isbn13: string;
  googleUrl: string | null;
  title: string;
};

export function BookCover({ isbn13, googleUrl, title }: Props) {
  // Try the sharpest source first, then fall back
  const sources = [
    `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg?default=false`,
    ...(googleUrl ? [googleUrl] : []),
  ];
  const [index, setIndex] = useState(0);

  if (index >= sources.length) {
    return (
      <div className="w-[150px] h-[235px] rounded-md mb-6 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
        No image
      </div>
    );
  }

  return (
    <Image
      key={sources[index]}
      src={sources[index]}
      alt={`${title} cover`}
      width={150}
      height={235}
      unoptimized
      onError={() => setIndex((i) => i + 1)}
      className="w-[150px] h-[235px] rounded-md mb-6 object-cover shadow bg-gray-200"
    />
  );
}
