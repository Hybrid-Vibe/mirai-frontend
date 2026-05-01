"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) return;

    // Simulate API call to reset password
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <main className="bg-background py-16">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <AuthShowcase />

        <section className="relative">
          {!isSubmitted ? (
            <>
              <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
                Đặt lại mật khẩu
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Vui lòng nhập mật khẩu mới của bạn bên dưới.
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-none border-0 border-b border-border bg-transparent px-0 pr-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="rounded-none border-0 border-b border-border bg-transparent px-0 pr-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>

                {!passwordsMatch && confirmPassword.length > 0 && (
                  <p className="text-sm text-red-500">Mật khẩu không khớp.</p>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-[4px] h-12 text-base font-medium"
                  disabled={!password || !confirmPassword || !passwordsMatch}
                >
                  Xác nhận đặt lại mật khẩu
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center md:text-left">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6 md:mx-0 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
                Thành công!
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể
                đăng nhập bằng mật khẩu mới.
              </p>
              <Button
                asChild
                className="mt-8 rounded-[4px] h-12 w-full md:w-auto px-8"
              >
                <Link href="/login">Quay lại đăng nhập</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
