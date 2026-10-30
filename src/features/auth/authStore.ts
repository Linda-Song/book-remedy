import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/server/db/client";

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
      (_event, session) => {
        set({ user: session?.user ?? null, authLoading: false });
      },
    );
    return () => listener.subscription.unsubscribe();
  },
}));
