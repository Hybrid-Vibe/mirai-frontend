"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  ShoppingBag,
  XCircle,
  Star,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { TopAnnouncementBar } from "./TopAnnouncementBar";
import { useCartStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const ACCOUNT_MENU_ITEMS = [
  { href: "/account", label: "Quản lý tài khoản", icon: User },
  { href: "/orders", label: "Đơn hàng của tôi", icon: ShoppingBag },
  { href: "/cancellations", label: "Đơn hàng đã huỷ", icon: XCircle },
  { href: "/reviews", label: "Đánh giá của tôi", icon: Star },
];

const isPathActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useDesignStore((state) => state.user);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
    }
  }, [user?.id, fetchCart]);

  const closePanels = () => {
    setIsMobileOpen(false);
    setIsAccountOpen(false);
  };

  const handleSignOut = async () => {
    closePanels();

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
    <header className="sticky top-0 z-50 border-b border-(--mirai-color-line) bg-(--mirai-color-surface)">
      <TopAnnouncementBar />

      <div className="border-t border-(--mirai-color-line)">
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-8 xl:gap-12">
            <Link
              href="/"
              className="font-brand text-[24px] font-black leading-normal text-[#48E1ED] flex items-center justify-center w-[90px] h-[38px] tracking-[0.015em] transition-all hover:opacity-80 active:scale-[0.98]"
            >
              MIRAI
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = isPathActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative pb-1 font-body text-xs font-medium transition-colors hover:text-(--mirai-sem-primary) ${isActive ? "text-(--mirai-color-ink)" : "text-(--mirai-color-ink)"}`}
                  >
                    {item.label}
                    <span
                      className={
                        isActive
                          ? "absolute bottom-0 left-0 h-[1.5px] w-full bg-(--mirai-color-ink)"
                          : "absolute bottom-0 left-0 h-[1.5px] w-0 bg-(--mirai-sem-primary) transition-all duration-300 group-hover:w-full"
                      }
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex h-10 items-center gap-2 rounded-[4px] bg-(--mirai-color-surface-muted) px-4">
              <Search className="h-4 w-4 text-(--mirai-color-ink)" />
              <input
                type="search"
                placeholder="What are you looking for?"
                className="w-44 bg-transparent font-body text-xs text-(--mirai-color-ink) outline-none placeholder:text-(--mirai-color-ink-2)"
              />
            </div>

            <Link
              href="/wishlist"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-(--mirai-color-ink) transition-all hover:bg-(--mirai-color-surface-muted) hover:text-(--mirai-sem-primary) active:scale-[0.95]"
              aria-label="Wishlist"
            >
              <span className="relative">
                <Heart className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/cart"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-(--mirai-color-ink) transition-all hover:bg-(--mirai-color-surface-muted) hover:text-(--mirai-sem-primary) active:scale-[0.95]"
              aria-label="Cart"
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--mirai-color-brand-strong) px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>

            <ThemeToggle />

            {/* === Desktop: Auth-aware Account area === */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((value) => !value)}
                  className="inline-flex h-9 items-center gap-1 rounded-[4px] border border-(--mirai-color-line) px-2.5 text-xs text-(--mirai-color-ink) transition-all hover:bg-(--mirai-color-surface-muted) hover:text-(--mirai-sem-primary) active:scale-[0.98]"
                  aria-expanded={isAccountOpen}
                  aria-label="Open account menu"
                >
                  <Avatar className="h-5 w-5 border border-primary">
                    <AvatarImage
                      src={user?.avatar_url}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {user?.name?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[100px] truncate">
                    {user?.name ?? "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 top-12 z-20 w-[224px] rounded-[8px] border border-(--mirai-color-line) bg-(--mirai-sem-surface) px-[20px] py-[18px] shadow-xl backdrop-blur-md">
                    <div className="flex flex-col gap-[13px]">
                      {ACCOUNT_MENU_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-[16px] text-(--mirai-sem-text) transition hover:text-(--mirai-sem-primary)"
                        >
                          <item.icon className="h-6 w-6" />
                          <span className="font-body text-[14px] font-normal leading-[21px]">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-[16px] text-(--mirai-sem-text) transition hover:text-red-500"
                      >
                        <LogOut className="h-6 w-6" />
                        <span className="font-body text-[14px] font-normal leading-[21px]">
                          Đăng xuất
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center gap-1 rounded-[4px] bg-(--mirai-color-brand) px-4 text-xs font-semibold text-(--mirai-color-ink) transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center gap-1 rounded-[4px] border border-(--mirai-color-line) px-4 text-xs font-semibold text-(--mirai-color-ink) transition-all hover:bg-(--mirai-color-surface-muted) active:scale-[0.98]"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/wishlist"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-(--mirai-color-line) text-(--mirai-color-ink) transition-all hover:text-(--mirai-sem-primary) hover:bg-(--mirai-color-surface-muted) active:scale-[0.95]"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              href="/cart"
              className="inline-flex relative h-8 w-8 items-center justify-center rounded-[4px] border border-(--mirai-color-line) text-(--mirai-color-ink) transition-all hover:text-(--mirai-sem-primary) hover:bg-(--mirai-color-surface-muted) active:scale-[0.95]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-(--mirai-color-brand-strong) px-1 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileOpen((value) => !value)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-(--mirai-color-line) text-(--mirai-color-ink) transition-all hover:bg-(--mirai-color-surface-muted) active:scale-[0.95]"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav"
              aria-label="Open navigation menu"
            >
              {isMobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-(--mirai-color-line) bg-(--mirai-color-surface) px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-3">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePanels}
                className={`font-body text-sm ${
                  isPathActive(pathname, item.href)
                    ? "font-semibold text-(--mirai-color-brand-strong)"
                    : "text-(--mirai-color-ink)"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex h-10 items-center gap-3 rounded-[4px] bg-(--mirai-color-surface-muted) px-4">
            <Search className="h-4 w-4 text-(--mirai-color-ink)" />
            <input
              type="search"
              placeholder="What are you looking for?"
              className="w-full bg-transparent font-body text-xs text-(--mirai-color-ink) outline-none placeholder:text-(--mirai-color-ink-2)"
            />
          </div>

          {/* === Mobile: Auth-aware Account / Login section === */}
          {isAuthenticated ? (
            <>
              <div className="mt-4 rounded-[4px] border border-(--mirai-color-line) px-3 py-3">
                {user && (
                  <div className="mb-2 flex items-center gap-2 border-b border-(--mirai-color-line) pb-2">
                    <Avatar className="h-7 w-7 border border-primary">
                      <AvatarImage
                        src={user.avatar_url}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.name?.substring(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium text-(--mirai-color-ink)">
                      {user.name ?? user.email}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {ACCOUNT_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closePanels}
                      className="block rounded-[4px] px-2 py-2 text-sm text-(--mirai-color-ink) transition hover:bg-(--mirai-color-surface-muted)"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-[4px] px-2 py-2 text-left text-sm text-red-500 transition hover:bg-(--mirai-color-surface-muted)"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={closePanels}
                className="inline-flex h-10 items-center justify-center rounded-[4px] border border-(--mirai-color-line) text-sm font-medium text-(--mirai-color-ink)"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                onClick={closePanels}
                className="inline-flex h-10 items-center justify-center rounded-[4px] bg-(--mirai-color-brand) text-sm font-semibold text-(--mirai-color-ink)"
              >
                Đăng ký
              </Link>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-[4px] border border-(--mirai-color-line) px-3 py-2">
            <span className="font-body text-sm text-(--mirai-color-ink-2)">
              Language
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[4px] border border-(--mirai-color-line) px-2 py-1 text-xs text-(--mirai-color-ink)"
              aria-label="Switch language"
            >
              Vietnamese
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
