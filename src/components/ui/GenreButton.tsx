"use client";

type GenreButtonProps = {
  label: string;
  desc?: string;
  hue?: number; // outline/hover/selected color of this genre
  selected?: boolean;
  onClick?: () => void;
  highlight?: boolean; // filled green style for "Pick for you"
  className?: string;
};

export default function GenreButton({
  label,
  desc,
  hue = 150,
  selected = false,
  onClick,
  highlight = false,
  className = "",
}: GenreButtonProps) {
  const base =
    "relative flex min-h-[72px] w-full flex-col justify-center gap-0.5 rounded-2xl border px-3.5 py-3 text-left " +
    "transition duration-200 hover:-translate-y-[3px] active:translate-y-0 " +
    "shadow-[0_1px_2px_rgba(25,70,48,0.06),0_8px_22px_-10px_rgba(25,70,48,0.16)] " +
    "hover:shadow-[0_2px_4px_rgba(25,70,48,0.08),0_16px_30px_-12px_rgba(25,70,48,0.26)]";

  // Normal genres: outline in the genre's hue; hover and selected use the same hue
  const genreStyle = selected
    ? "bg-[hsl(var(--h)_62%_86%)] border-[hsl(var(--h)_48%_48%)]"
    : "bg-white border-[hsl(var(--h)_45%_62%)] hover:bg-[hsl(var(--h)_70%_94%)]";

  // "Pick for you": filled green, white text, 1px dark outline when selected
  const highlightStyle = selected
    ? "bg-gradient-to-br from-[#27b46c] to-[#168a4f] border-[#1c6b4b]"
    : "bg-gradient-to-br from-[#3ccb7f] to-[#22ad66] border-[#22ad66] hover:from-[#34c077] hover:to-[#1c9f5d] hover:border-[#1c9f5d]";

  const nameColor = highlight ? "text-white" : "text-text-primary";
  const descColor = highlight ? "text-white/90" : "text-text-secondary";
  const shadowText = highlight
    ? "[text-shadow:0_1px_2px_rgba(10,80,45,0.4)]"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ "--h": hue } as React.CSSProperties}
      className={`${base} ${highlight ? highlightStyle : genreStyle} ${className}`}
    >
      <span
        className={`font-heading text-[16px] font-bold leading-tight ${nameColor} ${shadowText}`}
      >
        {label}
      </span>
      {desc && (
        <span
          className={`text-[11px] leading-tight ${descColor} ${shadowText}`}
        >
          {desc}
        </span>
      )}
    </button>
  );
}
