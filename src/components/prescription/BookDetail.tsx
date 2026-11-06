// BookDetail.tsx: title, author, and (optionally) "About this book"
type Props = {
  title: string;
  author: string;
  publisher?: string;
  about?: string; // leave out when About is shown somewhere else (detail page card)
};

export function AboutBlock({ about }: { about: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-green-dark">
        About this book
      </p>
      <p className="text-[14px] leading-relaxed text-text-primary">{about}</p>
    </div>
  );
}

export function BookDetail({ title, author, publisher, about }: Props) {
  return (
    <div>
      <p className="mb-1 text-3xl font-extrabold leading-tight text-text-primary">
        {title}
      </p>
      <p className="text-sm text-text-secondary">
        {author}
        {publisher && (
          <>
            <span className="mx-1 font-extrabold text-bg-day">|</span>
            {publisher}
          </>
        )}
      </p>

      {about && (
        <div className="mt-8">
          <AboutBlock about={about} />
        </div>
      )}
    </div>
  );
}
