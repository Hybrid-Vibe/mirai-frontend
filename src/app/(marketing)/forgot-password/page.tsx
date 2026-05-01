"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Simulate API call to send reset email
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <AuthShowcase />

        <section className="relative">
          <Link
            href="/login"
            className="absolute -top-12 left-0 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>

          {!isSubmitted ? (
            <>
              <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
                Quên mật khẩu?
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký. Chúng tôi
                sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <Input
                  type="email"
                  placeholder="Địa chỉ Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                />

                <Button
                  type="submit"
                  className="w-full rounded-[4px] h-12 text-base font-medium"
                  disabled={!email.trim()}
                >
                  Gửi liên kết đặt lại mật khẩu
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center md:text-left">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6 md:mx-0 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
                Kiểm tra email của bạn
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến địa chỉ
                email{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Vui lòng kiểm tra hộp thư đến và thư mục spam của bạn.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mt-8 rounded-[4px] h-12"
              >
                Thử lại với email khác
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
