"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";
import { GoogleSignInButton } from "@/components/common";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn, getFriendlyErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { userApi } from "@/lib/api-client";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useTranslation } from "@/providers/language-context";

export default function SignupPage() {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  // Password validation state
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const validateEmail = (val: string) => {
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError("");
    } else if (!emailRegex.test(val)) {
      setEmailError(t("auth.invalid_email"));
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    setPasswordChecks({
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val),
    });
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isFormValid =
    name.trim() && email.trim() && !emailError && isPasswordValid && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (!captchaToken) {
      toast.error(t("auth.captcha_req"));
      return;
    }

    setIsLoading(true);
    try {
      await userApi.register(
        {
          fullName: name,
          email: email,
          passwordHash: password,
        },
        captchaToken,
      );
      toast.success(t("auth.signup_success"));
      router.push("/login");
    } catch (error: unknown) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      const friendlyMsg = getFriendlyErrorMessage(error, t("auth.signup_fail"));
      toast.error(friendlyMsg);
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
            {t("auth.signup_title")}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("auth.enter_details")}
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
              disabled={isLoading}
            />

            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => validateEmail(event.target.value)}
                className={cn(
                  "rounded-none border-0 border-b bg-transparent px-0",
                  emailError ? "border-red-500" : "border-border",
                )}
                disabled={isLoading}
              />
              {emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
            </div>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => validatePassword(event.target.value)}
                className="rounded-none border-0 border-b border-border bg-transparent px-0"
                disabled={isLoading}
              />

              {/* Password strength indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordChecks.length ? "text-green-600" : "",
                  )}
                >
                  {passwordChecks.length ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{t("auth.pwd_min_len")}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordChecks.uppercase ? "text-green-600" : "",
                  )}
                >
                  {passwordChecks.uppercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{t("auth.pwd_uppercase")}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordChecks.lowercase ? "text-green-600" : "",
                  )}
                >
                  {passwordChecks.lowercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{t("auth.pwd_lowercase")}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordChecks.number ? "text-green-600" : "",
                  )}
                >
                  {passwordChecks.number ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{t("auth.pwd_number")}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordChecks.special ? "text-green-600" : "",
                  )}
                >
                  {passwordChecks.special ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{t("auth.pwd_special")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Turnstile
                key={locale}
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token: string) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
                options={{
                  language: locale,
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-[4px]"
              disabled={!isFormValid}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("auth.signing_up")}
                </span>
              ) : (
                t("auth.signup_btn")
              )}
            </Button>
          </form>

          <GoogleSignInButton label={t("auth.signup_google")} />

          <p className="mt-8 text-sm text-muted-foreground">
            {t("auth.have_account")}{" "}
            <Link href="/login" className="font-semibold underline">
              {t("header.login")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
