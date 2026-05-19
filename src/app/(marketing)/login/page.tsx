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

export default function LoginPage() {
  const router = useRouter();
  const setUser = useDesignStore((state) => state.setUser);

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
      setUser({
        id: response.userId,
        email: response.email,
        name: response.fullName || response.email,
      });

      toast.success(
        `Chào mừng quay trở lại, ${response.fullName || response.email}!`,
      );

      // Smart redirection based on role
      if (response.role === "Admin" || response.role === "1") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      let errorMsg =
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";
      if (error && typeof error === "object") {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMsg = err.response?.data?.message || err.message || errorMsg;
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <AuthShowcase />

        <section>
          <h1 className="font-heading text-5xl font-semibold text-foreground">
            Đăng nhập vào MIRAI
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Nhập thông tin của bạn bên dưới
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
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-(--mirai-sem-accent) hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </form>

          <GoogleSignInButton label="Đăng nhập với Google" />

          <p className="mt-8 text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold underline">
              Tạo tài khoản
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
