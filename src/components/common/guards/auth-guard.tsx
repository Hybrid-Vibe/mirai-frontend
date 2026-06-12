"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDesignStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthLoading } = useDesignStore();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("Vui lòng đăng nhập để truy cập trang này!");
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-(--mirai-sem-primary) mx-auto" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang xác thực tài khoản của bạn...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevents flashing protected content before redirect
  }

  return <>{children}</>;
}
