// WhyThisBook.tsx — reason만 따로
type Props = {
  reason: string;
};

export function WhyThisBook({ reason }: Props) {
  return (
    <div>
      <p className="text-sm font-extrabold text-green-dark mb-1">
        ♡ Why this book
      </p>
      <p className="text-[13px] text-text-primary leading-relaxed">{reason}</p>
    </div>
  );
}
