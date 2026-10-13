import { Star } from "lucide-react";

type Props = {
  rating: number;
  size?: number;
};
export function StarRating({ rating, size = 16 }: Props) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? "#FFC93C" : "none"}
          stroke="#FFC93C"
        />
      ))}
    </div>
  );
}
