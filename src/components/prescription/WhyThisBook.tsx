// WhyThisBook.tsx: the reason, optionally on a soft tint box
type Props = {
  reason: string;
  // false when a parent already draws the box (detail page)
  boxed?: boolean;
};

export function WhyThisBook({ reason, boxed = true }: Props) {
  const box = boxed
    ? // The box grows 18px past the text on both sides, so the text lines up with "About this book"
      "mt-7 -ml-[18px] w-[calc(100%+36px)] rounded-2xl bg-bg-tint px-[18px] py-3.5"
    : "";

  return (
    <div className={box}>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-green-dark">
        Why this book
      </p>
      <p className="text-[14px] leading-relaxed text-text-primary">{reason}</p>
    </div>
  );
}
