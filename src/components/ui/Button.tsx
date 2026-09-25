type ButtonProps = {
  children: React.ReactNode;
  variant: "primary" | "outline" | "tile" | "genre" | "dashed";
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  variant = "outline",
  onClick,
  selected,
  disabled,
  className,
}: ButtonProps) {
  const base = " transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "rounded-2xl bg-green text-white font-bold hover:bg-green-dark",
    outline:
      "rounded-2xl bg-white text-text-primary border-border-light border-2 hover:bg-bg-tint",
    tile: ` rounded-2xl border-2 ${
      selected
        ? "bg-green-light border-green-light "
        : "bg-white border-border-light text-text-primary hover:bg-bg-day/80"
    }`,
    genre: `rounded-lg border-2 font-semibold ${
      selected
        ? "bg-green border-green text-white"
        : "bg-white border-border-light text-text-primary hover:bg-green-light/60"
    }`,
    dashed:
      "bg-white border-3 border-dashed border-border-light  text-text-primary hover:hover:bg-bg-day/80 hover:hover:bg-bg-day/80",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
