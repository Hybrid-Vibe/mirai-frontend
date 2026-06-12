"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/common";
import { AdminNav } from "@/components/features/admin";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AdminGuard } from "@/components/common/guards/admin-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    const logoutPromise = new Promise(async (resolve, reject) => {
      try {
        await supabase.auth.signOut();
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(logoutPromise, {
      loading: "Đang đăng xuất khỏi hệ thống...",
      success: "Đăng xuất thành công! Hẹn gặp lại bạn nhé. 👋",
      error: "Có lỗi xảy ra khi đăng xuất.",
    });

    try {
      await logoutPromise;
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen md:h-screen md:overflow-hidden bg-muted/40 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border bg-background flex flex-col md:h-screen shadow-sm z-40 relative">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link
              href="/admin"
              className="font-brand text-2xl font-black text-(--mirai-color-brand-strong) tracking-wide"
            >
              MIRAI{" "}
              <span className="text-sm font-medium text-muted-foreground uppercase ml-1">
                Admin
              </span>
            </Link>
          </div>

          <AdminNav />

          <div className="p-4 border-t border-border mt-auto">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background sticky top-0 z-30">
            <h2 className="font-heading font-semibold text-lg hidden md:block">
              Dashboard
            </h2>
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                AD
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
