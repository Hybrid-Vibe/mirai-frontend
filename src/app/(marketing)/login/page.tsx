"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";

export default function LoginPage() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

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

          <form className="mt-8 space-y-6">
            <Input
              type="email"
              placeholder="Email or Phone Number"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
            />
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                className="min-w-44 rounded-[4px]"
                disabled={!identity.trim() || !password.trim()}
              >
                Đăng nhập
              </Button>
              <button
                type="button"
                className="text-sm font-medium text-(--mirai-sem-accent)"
              >
                Quên mật khẩu?
              </button>
            </div>
          </form>

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
