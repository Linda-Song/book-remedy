// ReviewSummary.tsx: the inside of the MY REVIEW card
type Quote = { page?: number; text: string };

type Props = {
  shareLine?: string;
  quotes?: Quote[];
  text?: string;
};

const labelClass =
  "mb-2 text-xs font-extrabold uppercase tracking-wide text-green-dark";

export function ReviewSummary({ shareLine, quotes = [], text }: Props) {
  // Page numbers sit on the left; skip that column when no quote has one
  const anyPage = quotes.some((q) => q.page != null);

  return (
    <div className="space-y-5 px-6 py-5 [&>*+*]:border-t [&>*+*]:border-border-light [&>*+*]:pt-5">
      {shareLine && (
        <div>
          <p className={labelClass}>Your line</p>
          <p className="text-[14px] font-extrabold leading-normal text-text-primary">
            {shareLine}
          </p>
        </div>
      )}

      {quotes.length > 0 && (
        <div>
          <p className={labelClass}>Favorite quotes</p>
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <div key={i} className="flex gap-3">
                {anyPage && (
                  <span className="w-11 shrink-0 pt-px text-xs font-bold leading-relaxed text-text-muted">
                    {q.page != null ? `p. ${q.page}` : ""}
                  </span>
                )}
                <p className="border-l-2 border-green-light pl-3 text-[14px] italic leading-relaxed text-text-secondary">
                  {q.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {text && (
        <div>
          <p className={labelClass}>My thoughts</p>
          <p className="text-[14px] leading-relaxed text-text-primary">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
