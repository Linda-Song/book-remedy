"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  isbn13: string;
  googleUrl: string | null;
  title: string;
  width?: number;
  height?: number;
  // fluid: fill the parent's width and keep a 2:3 shape
  fluid?: boolean;
  className?: string;
};

export function BookCover({
  isbn13,
  googleUrl,
  title,
  width = 150,
  height = 235,
  fluid = false,
  className = "",
}: Props) {
  // Try the sharpest source first, then fall back
  const sources = [
    `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg?default=false`,
    ...(googleUrl ? [googleUrl] : []),
  ];
  const [index, setIndex] = useState(0);

  const sizeStyle = fluid
    ? { width: "100%", height: "auto" }
    : { width, height };
  const shape = fluid ? "aspect-[2/3]" : "";

  if (index >= sources.length) {
    return (
      <div
        style={sizeStyle}
        className={`rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 ${shape} ${className}`}
      >
        No image
      </div>
    );
  }

  return (
    <Image
      key={sources[index]}
      src={sources[index]}
      alt={`${title} cover`}
      width={width}
      height={height}
      unoptimized
      onError={() => setIndex((i) => i + 1)}
      style={sizeStyle}
      className={`rounded-md object-cover shadow bg-gray-200 ${shape} ${className}`}
    />
  );
}
