import { Star } from "lucide-react";

type Props = {
  rating: number;
  size?: number;
  className?: string; // override the default bottom margin where needed
};

export function StarRating({ rating, size = 16, className = "mb-3" }: Props) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
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
