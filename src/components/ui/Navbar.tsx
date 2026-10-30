"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/modal/Modal";
import { AuthPrompt } from "@/components/modal/AuthPrompt";
import { supabase } from "@/server/db/client";
import { useAuthStore } from "@/features/auth/authStore";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <header className="h-14 px-16 flex items-center justify-between bg-bg-tint">
        <Link href="/" className="flex items-center gap-3">
          <span>RR</span>
          <span className="font-bold text-lg text-text-primary">
            ReadRemedy
          </span>
        </Link>

        <nav className="flex items-center gap-9 text-lg">
          <Link href="/how-it-works" className="text-text-secondary">
            How it works
          </Link>

          {user ? (
            <>
              <Link href="/me" className="font-bold text-green-dark">
                My page
              </Link>
              <button onClick={handleSignOut} className="text-text-secondary">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="font-bold text-green-dark"
            >
              Sign in
            </button>
          )}
        </nav>
      </header>

      <Modal open={open}>
        <AuthPrompt type="signin" onDismiss={() => setOpen(false)} />
      </Modal>
    </>
  );
}
