import { Button } from "./Button";
import { Check } from "lucide-react";

type ButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  hue: number; // icon circle color, 0-360
  selected: boolean;
  onClick: () => void;
};

export default function MoodButton({
  icon: Icon,
  label,
  description,
  hue,
  selected,
  onClick,
}: ButtonProps) {
  return (
    <Button
      variant="soft"
      selected={selected}
      onClick={onClick}
      className="relative w-full min-h-[92px] py-3 flex flex-col items-center justify-center gap-1.5"
    >
      <div
        className="w-8 h-8 rounded-full flex justify-center items-center border transition-colors"
        style={{
          backgroundColor: `hsl(${hue} 78% 92%)`,
          color: `hsl(${hue} 42% 34%)`,
          // Thin ring in the mood's own color, shown only when selected
          borderColor: selected ? `hsl(${hue} 45% 60%)` : "transparent",
        }}
      >
        <Icon size={16} />
      </div>

      <div className="flex flex-col items-center leading-tight">
        <span className="font-extrabold text-sm">{label}</span>
        <span className="text-[11px] text-text-secondary">{description}</span>
      </div>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green text-white flex items-center justify-center">
          <Check size={10} />
        </span>
      )}
    </Button>
  );
}
