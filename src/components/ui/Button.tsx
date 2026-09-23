type ButtonProps = {
  children: React.ReactNode;
  variant: "primary" | "outline" | "tile" | "dashed";
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
  const base =
    " rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-green text-white font-bold hover:bg-green-dark",
    outline:
      "bg-white text-text-primary border-border-light border-2 hover:bg-bg-tint",
    tile: `bg-white border-3  ${
      selected
        ? "bg-yellow text-white "
        : "border-border-light text-text-primary hover:bg-green/20"
    }`,
    dashed:
      "bg-white border-3 border-dashed border-border-light  text-text-primary hover:border-green/20 hover:bg-green/20",
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
