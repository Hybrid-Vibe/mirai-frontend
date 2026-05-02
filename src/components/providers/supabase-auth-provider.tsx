"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Supabase auth sync hook
  useSupabaseAuth();

  return <>{children}</>;
}
