// BookDetail.tsx — reason 빼고 제목+저자+About만
type Props = {
  title: string;
  author: string;
  publisher?: string;
  about: string;
};

export function BookDetail({ title, author, publisher, about }: Props) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="mb-4">
        <p className="text-3xl font-extrabold text-text-primary mb-1">
          {title}
        </p>
        <p className="text-sm text-text-secondary mb-1">
          {author}
          {publisher && (
            <>
              <span className="text-bg-day font-extrabold"> | </span>
              {publisher}
            </>
          )}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-extrabold text-text-primary mb-1">
          About this book
        </p>
        <p className="text-[13px] text-text-primary leading-relaxed">{about}</p>
      </div>
    </div>
  );
}
