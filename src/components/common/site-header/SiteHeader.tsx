"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { TopAnnouncementBar } from "./TopAnnouncementBar";

const ACCOUNT_MENU_ITEMS = [
  { href: "/account", label: "My Account" },
  { href: "/wishlist", label: "My Wishlist" },
  { href: "/cart", label: "My Cart" },
  { href: "/checkout", label: "Checkout" },
];

const AUTH_MENU_ITEMS = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
];

const isPathActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const closePanels = () => {
    setIsMobileOpen(false);
    setIsAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--mirai-color-line)] bg-[color:var(--mirai-color-surface)]">
      <TopAnnouncementBar />

      <div className="border-t border-[color:var(--mirai-color-line)]">
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-8 xl:gap-12">
            <Link
              href="/"
              className="font-heading text-2xl font-semibold tracking-[0.03em] text-[color:var(--mirai-color-ink)]"
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
                    className="relative pb-0.5 font-body text-sm font-medium text-[color:var(--mirai-color-ink)]"
                  >
                    {item.label}
                    <span
                      className={
                        isActive
                          ? "absolute bottom-0 left-0 h-px w-full bg-[color:var(--mirai-color-ink)]"
                          : "absolute bottom-0 left-1/2 h-px w-0 bg-[color:var(--mirai-color-ink)] transition-all duration-200 hover:left-0 hover:w-full"
                      }
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex h-10 items-center gap-2 rounded-[4px] bg-[color:var(--mirai-color-surface-muted)] px-4">
              <Search className="h-4 w-4 text-[color:var(--mirai-color-ink)]" />
              <input
                type="search"
                placeholder="What are you looking for?"
                className="w-44 bg-transparent font-body text-xs text-[color:var(--mirai-color-ink)] outline-none placeholder:text-[color:var(--mirai-color-ink-2)]"
              />
            </div>

            <Link
              href="/wishlist"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-[color:var(--mirai-color-ink)] transition hover:bg-[color:var(--mirai-color-surface-muted)]"
              aria-label="Wishlist"
            >
              <span className="relative">
                <Heart className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/cart"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-[color:var(--mirai-color-ink)] transition hover:bg-[color:var(--mirai-color-surface-muted)]"
              aria-label="Cart"
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--mirai-color-brand-strong)] px-1 text-[10px] font-semibold text-white">
                  2
                </span>
              </span>
            </Link>

            <ThemeToggle />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((value) => !value)}
                className="inline-flex h-9 items-center gap-1 rounded-[4px] border border-[color:var(--mirai-color-line)] px-2.5 text-xs text-[color:var(--mirai-color-ink)]"
                aria-expanded={isAccountOpen}
                aria-label="Open account menu"
              >
                <User className="h-4 w-4" />
                Account
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-12 z-20 w-60 rounded-md border border-[color:var(--mirai-color-line)] bg-[color:var(--mirai-color-surface)] p-2 shadow-[var(--mirai-shadow-md)]">
                  <div className="space-y-1 border-b border-[color:var(--mirai-color-line)] pb-2">
                    {ACCOUNT_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsAccountOpen(false)}
                        className="block rounded-[4px] px-3 py-2 text-sm text-[color:var(--mirai-color-ink)] transition hover:bg-[color:var(--mirai-color-surface-muted)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {AUTH_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsAccountOpen(false)}
                        className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] text-xs font-medium text-[color:var(--mirai-color-ink)] transition hover:bg-[color:var(--mirai-color-surface-muted)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/wishlist"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] text-[color:var(--mirai-color-ink)]"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              href="/cart"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] text-[color:var(--mirai-color-ink)]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileOpen((value) => !value)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] text-[color:var(--mirai-color-ink)]"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav"
              aria-label="Open navigation menu"
            >
              {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-[color:var(--mirai-color-line)] bg-[color:var(--mirai-color-surface)] px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-3">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePanels}
                className={`font-body text-sm ${
                  isPathActive(pathname, item.href)
                    ? "font-semibold text-[color:var(--mirai-color-brand-strong)]"
                    : "text-[color:var(--mirai-color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex h-10 items-center gap-3 rounded-[4px] bg-[color:var(--mirai-color-surface-muted)] px-4">
            <Search className="h-4 w-4 text-[color:var(--mirai-color-ink)]" />
            <input
              type="search"
              placeholder="What are you looking for?"
              className="w-full bg-transparent font-body text-xs text-[color:var(--mirai-color-ink)] outline-none placeholder:text-[color:var(--mirai-color-ink-2)]"
            />
          </div>

          <div className="mt-4 rounded-[4px] border border-[color:var(--mirai-color-line)] px-3 py-3">
            <p className="text-xs font-semibold text-[color:var(--mirai-color-ink-2)]">Account</p>
            <div className="mt-2 space-y-1">
              {ACCOUNT_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closePanels}
                  className="block rounded-[4px] px-2 py-2 text-sm text-[color:var(--mirai-color-ink)] transition hover:bg-[color:var(--mirai-color-surface-muted)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              onClick={closePanels}
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] text-sm font-medium text-[color:var(--mirai-color-ink)]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={closePanels}
              className="inline-flex h-10 items-center justify-center rounded-[4px] bg-[color:var(--mirai-color-brand)] text-sm font-semibold text-[color:var(--mirai-color-ink)]"
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[4px] border border-[color:var(--mirai-color-line)] px-3 py-2">
            <span className="font-body text-sm text-[color:var(--mirai-color-ink-2)]">Language</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[4px] border border-[color:var(--mirai-color-line)] px-2 py-1 text-xs text-[color:var(--mirai-color-ink)]"
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
