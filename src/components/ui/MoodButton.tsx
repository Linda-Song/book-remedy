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
      className="relative w-full h-[120px] flex flex-col items-center justify-center gap-0.5 "
    >
      <div className="w-9 h-9 rounded-full text-green-dark bg-bg-tint flex justify-center items-center mb-2">
        <Icon size={18} />
      </div>
      <div className="flex flex-col items-center leading-tight">
        <span className="font-bold text-base">{label}</span>
        <span className="text-[11px] text-text-secondary">{description}</span>
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green text-white text-xs flex items-center justify-center">
          <Check size={12} />
        </span>
      )}
    </Button>
  );
}
