import { Button } from "../ui/Button";

type Props = {
  title: string;
  author: string;
};

export function PrescriptionCard({ title, author }: Props) {
  return (
    <div className="w-[290px] flex gap-4 p-4 rounded-2xl border border-border-light bg-white">
      <div className="w-[64px] h-[96px] bg-bg-tint rounded-lg " />
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <p className="text-md font-bold text-text-primary mb-1 ">{title}</p>
          <p className="text-xs text-text-secondary mb-3">{author}</p>
        </div>
        <Button variant="outline" className="text-xs rounded-sm h-6  w-[90px] ">
          Find on Kindle
        </Button>
      </div>
    </div>
  );
}
