type Props = {
  shareLine?: string;
  quotePage?: number;
  quoteText?: string;
  text: string;
};

export function ReviewSummary({
  shareLine,
  quotePage,
  quoteText,
  text,
}: Props) {
  return (
    <div className="rounded-2xl border border-border-light p-4 mb-4 space-y-3">
      <div>
        <p className="text-xs font-bold text-green-dark mb-1">Your line</p>
        <p className="text-[15px] font-bold text-text-primary">
          &quot;{shareLine}&quot;
        </p>
      </div>

      {quoteText && (
        <div className="flex gap-2 pt-3 border-t border-border-light">
          <span className="text-xs text-text-muted flex-shrink-0 mt-0.5 w-[36px]">
            {quotePage ? `p. ${quotePage}` : ""}
          </span>
          <p className="text-[13px] text-text-primary italic flex-1">
            &quot;{quoteText}&quot;
          </p>
        </div>
      )}

      <div className="pt-3 border-t border-border-light">
        <p className="text-xs font-bold text-text-primary mb-1">Your review</p>
        <p className="text-[13px] text-text-primary leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
