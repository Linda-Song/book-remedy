export default function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-white border-border-light border-2 rounded-3xl px-9 py-7 shadow-lg max-w-[360px] ">
      {children}
      <span className="absolute right-32 -bottom-3 w-6 h-6 bg-white border-r-2 border-b-2  border-border-light rotate-45" />
    </div>
  );
}
