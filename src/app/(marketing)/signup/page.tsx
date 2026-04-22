"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShowcase } from "@/components/features/marketing/auth-showcase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="bg-background py-16">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <AuthShowcase />

        <section>
          <h1 className="font-heading text-5xl font-semibold text-foreground">
            Tạo một tài khoản
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Nhập thông tin của bạn bên dưới
          </p>

          <form className="mt-8 space-y-6">
            <Input
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-none border-0 border-b border-border bg-transparent px-0"
            />
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

            <Button
              type="submit"
              className="w-full rounded-[4px]"
              disabled={
                !name.trim() ||
                !identity.trim() ||
                !password.trim()
              }
            >
              Tạo tài khoản
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[4px]"
          >
            <span className="text-lg">G</span>
            Sign up with Google
          </Button>

          <p className="mt-8 text-sm text-muted-foreground">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold underline">
              Đăng nhập
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
