"use client";

import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => init(), [init]);
  return null;
}
