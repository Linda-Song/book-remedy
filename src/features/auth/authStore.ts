import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/server/db/client";
import { getGuestId } from "@/lib/guestId";

type AuthState = {
  user: User | null;
  authLoading: boolean;
  init: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authLoading: true,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, authLoading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        set({ user: session?.user ?? null, authLoading: false });

        // Right after sign in, move this browser's guest prescriptions to the account
        if (event === "SIGNED_IN" && session?.user) {
          // Defer so we don't run Supabase calls inside the auth callback
          setTimeout(async () => {
            const guestId = localStorage.getItem("guest_id");
            if (!guestId) return;

            const { data, error } = await supabase.rpc(
              "claim_guest_prescriptions",
              { p_guest_id: guestId },
            );

            if (error) {
              console.error("Failed to claim guest prescriptions:", error);
              return;
            }

            // Clear the old guest id once its prescriptions have moved
            if (data && data > 0) {
              localStorage.removeItem("guest_id");
            }
          }, 0);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  },
}));
