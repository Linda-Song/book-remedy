import { Star } from "lucide-react";
type Props = {
  rating: number;
  onChange: (rating: number) => void;
};

export function StarRatingInput({ rating, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} onClick={() => onChange(i + 1)} type="button">
          <Star
            size={28}
            fill={i < rating ? "#FFC93C" : "none"}
            stroke="#FFC93C"
          />
        </button>
      ))}
    </div>
  );
}
