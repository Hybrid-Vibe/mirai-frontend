"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  label?: string;
}

export function GoogleSignInButton({
  label = "Đăng nhập với Google",
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    // Constraint: Prevent multiple clicks
    if (isPending) return;

    setIsPending(true);
    // Feedback: Loading state started
    toast.loading("Đang kết nối với Google...");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      // We don't dismiss the toast here because the page will redirect
      // The success toast will be shown by useSupabaseAuth hook after redirect
    } catch (error) {
      toast.dismiss();
      const message =
        error instanceof Error
          ? error.message
          : "Không thể đăng nhập bằng Google. Vui lòng thử lại.";
      toast.error(message);
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      // Signifier & Affordance: Google's signature styling, clear border and hover effect
      className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-[8px] border border-gray-300 bg-white text-[15px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isPending}
      onClick={handleClick}
      aria-label="Đăng nhập bằng tài khoản Google"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      ) : (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
            fill="#EA4335"
          />
        </svg>
      )}
      {isPending ? "Đang xử lý..." : label}
    </Button>
  );
}
