type ButtonProps = {
  children: React.ReactNode;
  variant: "primary" | "outline" | "tile";
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
    primary: "bg-green text-white font-bold",
    outline: "bg-white text-text-primary border-border-light border-2",
    tile: `bg-white border-2 ${
      selected
        ? "border-green text-green-dark"
        : "border-border-light text-text-primary"
    }`,
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
