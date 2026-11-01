"use client";

import { useState } from "react";
import Image from "next/image";
import { AUTH_PROMPTS } from "./authPrompts";
import { Button } from "../ui/Button";
import { supabase } from "@/server/db/client";

type Props = {
  type: "yes" | "no" | "signin";
  onDismiss: () => void;
};

type Mode = "signin" | "signup";

export function AuthPrompt({ type, onDismiss }: Props) {
  const { title, description } = AUTH_PROMPTS[type];

  // After a prescription most people are new, so default to sign up there
  const [mode, setMode] = useState<Mode>(
    type === "signin" ? "signin" : "signup",
  );
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOAuth(provider: "google" | "github") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    });
    if (error) setError(error.message);
  }

  // Turn raw Supabase errors into friendly messages
  function friendlyError(message: string) {
    if (message.includes("Invalid login credentials")) {
      return "Wrong email or password. New here? Switch to Sign up.";
    }
    if (message.includes("already registered")) {
      return "This email already has an account. Switch to Sign in.";
    }
    return message;
  }

  async function handleEmailSubmit() {
    setLoading(true);
    setError(null);

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    onDismiss();
  }

  return (
    <div className="text-center items-center flex flex-col">
      <Image
        src="/caterpillar_first.png"
        alt="caterpillar"
        width={220}
        height={70}
      />
      <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
      <p className="text-sm text-text-secondary mb-6">{description}</p>

      <Button
        variant="outline"
        className="w-full h-12 mb-3"
        onClick={() => handleOAuth("google")}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full h-12 mb-3"
        onClick={() => handleOAuth("github")}
      >
        Continue with GitHub
      </Button>

      {!showEmail ? (
        <button
          onClick={() => setShowEmail(true)}
          className="text-sm font-bold text-green-dark mb-3"
        >
          Use email instead
        </button>
      ) : (
        <div className="w-full flex flex-col gap-2 mb-3">
          {/* Sign in / Sign up tabs */}
          <div className="flex rounded-xl bg-bg-tint p-1 mb-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 h-9 rounded-lg text-sm font-bold ${
                  mode === m
                    ? "bg-white text-green-dark shadow-sm"
                    : "text-text-muted"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl border border-border-light px-3 text-sm"
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-border-light px-3 text-sm"
          />
          <Button
            variant="primary"
            className="w-full h-11"
            onClick={handleEmailSubmit}
            disabled={loading || !email || password.length < 6}
          >
            {loading ? "..." : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-danger mb-2">{error}</p>}

      <button
        onClick={onDismiss}
        className="text-sm text-text-secondary w-full text-center hover:text-green-400"
      >
        Maybe later
      </button>
    </div>
  );
}
