"use client";

import { Button } from "../ui/Button";

type Props = {
  type: "yes" | "no";
  onClose: () => void;
  onPrimary: () => void;
};

const COPY = {
  yes: {
    title: "Glad you like it!",
    description: "This prescription is saved on your page.",
    primary: "Go to my page",
    secondary: "Close",
  },
  no: {
    title: "Not a match?",
    description: "Thanks for telling me. I'll pick better next time.",
    primary: "Back to home",
    secondary: "Close",
  },
};

export function FeedbackPrompt({ type, onClose, onPrimary }: Props) {
  const { title, description, primary, secondary } = COPY[type];

  return (
    <div className="text-center flex flex-col items-center">
      <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
      <p className="text-sm text-text-secondary mb-6">{description}</p>
      <Button
        variant="primary"
        className="w-full h-12 mb-3"
        onClick={onPrimary}
      >
        {primary}
      </Button>
      <button onClick={onClose} className="text-sm text-text-secondary">
        {secondary}
      </button>
    </div>
  );
}
