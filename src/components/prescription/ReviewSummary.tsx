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
    <div className="mb-4">
      <div className="rounded-2xl bg-bg-tint p-4 mb-3">
        <p className="text-xs font-bold text-green-dark mb-1">Your line</p>
        <p className="text-[15px] font-bold text-text-primary">
          &quot;{shareLine}&quot;
        </p>
      </div>

      {(quotePage || quoteText) && (
        <div className="rounded-2xl border border-border-light p-4 mb-3">
          {quotePage && (
            <p className="text-xs text-text-muted mb-1">p. {quotePage}</p>
          )}
          {quoteText && (
            <p className="text-[13px] text-text-primary italic">
              &quot;{quoteText}&quot;
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border-light p-4">
        <p className="text-xs font-bold text-text-primary mb-1">Your review</p>
        <p className="text-[13px] text-text-primary leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
