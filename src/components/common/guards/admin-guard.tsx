"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDesignStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthLoading } = useDesignStore();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        toast.error("Vui lòng đăng nhập để truy cập trang quản trị!");
        router.push("/login");
      } else if (user.role !== "Admin" && user.role !== "1") {
        toast.error("Bạn không có quyền truy cập trang quản trị!");
        router.push("/");
      }
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-(--mirai-sem-primary) mx-auto" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang xác minh quyền quản trị viên...
          </p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "Admin" && user.role !== "1")) {
    return null; // Prevents flashing admin page before redirect
  }

  return <>{children}</>;
}
