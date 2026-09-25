"use client";
type Props = {
  open: boolean;
  children: React.ReactNode;
};

export function Modal({ open, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-[420px] w-full mx-4 ">
        {children}
      </div>
    </div>
  );
}
