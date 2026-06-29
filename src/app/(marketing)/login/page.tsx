"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";
import { GoogleSignInButton } from "@/components/common";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { userApi } from "@/lib/api-client";
import { useDesignStore } from "@/lib/store";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/providers/language-context";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useDesignStore((state) => state.setUser);
  const { t } = useTranslation();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await userApi.login({
        email: identity,
        password: password,
      });

      // Update global user state in Zustand
      let nameToUse = response.fullName || response.email.split("@")[0];
      let finalAvatarUrl: string | undefined = undefined;

      if (typeof window !== "undefined") {
        const savedLocal = localStorage.getItem(
          `mirai_profile_${response.userId}`,
        );
        if (savedLocal) {
          try {
            const localData = JSON.parse(savedLocal);
            if (localData.fullName) {
              nameToUse = localData.fullName;
            }
            if (localData.avatarUrl) {
              finalAvatarUrl = localData.avatarUrl; // Retrieve avatarUrl from cached localStorage!
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }

      // Query Supabase public.users table to get correct avatar_url (if available on server, overwrite)
      try {
        const { data: sbUser } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("user_id", response.userId)
          .maybeSingle();
        if (sbUser?.avatar_url) {
          finalAvatarUrl = sbUser.avatar_url;
        }
      } catch (e) {
        console.warn(
          "Failed to fetch supabase user avatar during backend login:",
          e,
        );
      }

      setUser({
        id: response.userId,
        name: nameToUse,
        email: response.email,
        avatar_url: finalAvatarUrl,
      });

      toast.success(
        `${t("auth.login_success")}, ${response.fullName || response.email}!`,
      );

      // Smart redirection based on role
      if (response.role === "Admin" || response.role === "1") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      toast.error(getFriendlyErrorMessage(error, t("auth.login_fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="hidden lg:block">
          <AuthShowcase />
        </div>

        <section>
          <h1 className="font-heading text-5xl font-semibold text-foreground">
            {t("auth.login_title")}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("auth.enter_details")}
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
              disabled={isLoading}
            />
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                className="min-w-44 rounded-[4px]"
                disabled={!identity.trim() || !password.trim() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("auth.logging_in")}
                  </span>
                ) : (
                  t("auth.login_btn")
                )}
              </Button>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-(--mirai-sem-accent) hover:underline"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
          </form>

          <GoogleSignInButton label={t("auth.login_google")} />

          <p className="mt-8 text-sm text-muted-foreground">
            {t("auth.no_account")}{" "}
            <Link href="/signup" className="font-semibold underline">
              {t("header.signup")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
