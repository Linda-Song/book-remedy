import { Button } from "./Button";
import { Check } from "lucide-react";

type ButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

export default function MoodButton({
  icon: Icon,
  label,
  description,
  selected,
  onClick,
}: ButtonProps) {
  return (
    <Button
      variant="tile"
      selected={selected}
      onClick={onClick}
      className="relative w-full h-[134px] flex flex-col items-center justify-center gap-1"
    >
      <div className="w-10 h-10 rounded-full text-green-dark bg-bg-tint flex justify-center items-center">
        <Icon size={20} />
      </div>
      <span className="font-bold text-lg">{label}</span>
      <span className="text-sm text-text-secondary">{description}</span>
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-green text-xs flex items-center justify-center">
          <Check size={12} />
        </span>
      )}
    </Button>
  );
}
