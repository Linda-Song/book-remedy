import { AUTH_PROMPTS } from "./authPrompts";
import { Button } from "../ui/Button";
import Image from "next/image";

type Props = {
  type: "yes" | "no";
  onDismiss: () => void;
};

export function AuthPrompt({ type, onDismiss }: Props) {
  const { title, description } = AUTH_PROMPTS[type];
  return (
    <div className="text-center items-center flex flex-col">
      <Image
        src="/caterpillar_first.png"
        alt="caterpillar"
        width={220}
        height={70}
      ></Image>
      <h2 className="text-2xl font-extrabold mb-2 ">{title}</h2>
      <p className="text-sm text-text-secondary mb-6">{description}</p>

      <Button variant="outline" className="w-full h-12 mb-3">
        Continue with Google
      </Button>
      <Button variant="outline" className="w-full h-12 mb-3">
        Continue with Apple
      </Button>
      <button
        onClick={onDismiss}
        className="text-sm text-text-secondary w-full text-center hover:text-green-400"
      >
        Maybe later
      </button>
    </div>
  );
}
