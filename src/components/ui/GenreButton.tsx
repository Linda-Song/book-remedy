import { Button } from "./Button";

type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

export default function GenreButton({
  label,
  selected,
  onClick,
  className,
}: Props) {
  return (
    <Button
      variant="genre"
      selected={selected}
      onClick={onClick}
      className={` bg-bg-day h-[50px] flex items-center justify-center ${className ?? ""}`}
    >
      {label}
    </Button>
  );
}
