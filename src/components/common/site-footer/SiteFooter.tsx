"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useTranslation } from "@/providers/language-context";

export function SiteFooter() {
  const { locale, t } = useTranslation();

  const supportLinks = [
    t("footer.online_support"),
    "miraicases@gmail.com",
    "+84-585-646-004",
  ];

  const accountLinks = [
    { label: t("header.profile"), href: "/account" },
    { label: t("header.login"), href: "/login" },
    { label: t("header.signup"), href: "/register" },
    { label: t("header.cart"), href: "/cart" },
    { label: t("header.wishlist"), href: "/wishlist" },
    { label: t("header.shop"), href: "/shop" },
  ];

  const quickLinks = [
    {
      label: locale === "vi" ? "Chính sách bảo mật" : "Privacy Policy",
      href: "/privacy",
    },
    {
      label: locale === "vi" ? "Điều khoản dịch vụ" : "Terms Of Use",
      href: "/terms",
    },
    { label: "FAQ", href: "/faq" },
    { label: t("header.contact"), href: "/contact" },
  ];

  return (
    <footer className="mt-20 bg-(--mirai-sem-text) text-(--mirai-sem-background)">
      <div className="page-shell pb-0 pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="font-[var(--font-display)] text-3xl font-semibold tracking-[0.03em] text-(--mirai-sem-primary)">
                MIRAI
              </p>
              <p className="font-[var(--font-display)] text-xl font-medium">
                {t("footer.subscribe")}
              </p>
              <p className="font-[var(--font-display)] text-base">
                {t("footer.get_discount")}
              </p>
            </div>

            <label className="flex h-12 items-center gap-3 rounded-[4px] border border-(--mirai-sem-background) px-4">
              <span className="sr-only">Email</span>
              <input
                type="email"
                placeholder={t("footer.enter_email")}
                className="w-full bg-transparent font-[var(--font-body)] text-base text-(--mirai-sem-background) outline-none placeholder:opacity-40"
              />
              <button
                type="button"
                className="transition-transform hover:text-(--mirai-sem-primary) active:scale-[0.95]"
              >
                <Send className="h-5 w-5" />
              </button>
            </label>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              {t("footer.support")}
            </h2>
            <div className="space-y-4 font-[var(--font-display)] text-base">
              {supportLinks.map((item) => (
                <p key={item} className="max-w-[210px] leading-6">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              {t("footer.account")}
            </h2>
            <ul className="space-y-4 font-[var(--font-body)] text-base">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-(--mirai-sem-primary)"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              {locale === "vi" ? "Liên kết nhanh" : "Quick Links"}
            </h2>
            <ul className="space-y-4 font-[var(--font-body)] text-base">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-(--mirai-sem-primary)"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              {t("footer.follow_us")}
            </h2>
            <p className="max-w-[220px] font-[var(--font-display)] text-xs opacity-70">
              {t("footer.follow_desc")}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="https://www.instagram.com/mirai.case?igsh=MXN1azZ5b21wenNzaQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all hover:-translate-y-1 hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary)"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link
                href="https://www.threads.com/@mirai.case?igshid=NTc4MTIwNjQ2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all hover:-translate-y-1 hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary)"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 192 192"
                  aria-hidden="true"
                >
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
              </Link>
              <Link
                href="https://www.tiktok.com/@mirai.case?_r=1&_t=ZS-96mehGqJqir"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tiktok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all hover:-translate-y-1 hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary)"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-.77-.6-1.39-1.39-1.81-2.3v7.88a6.51 6.51 0 0 1-2.9 5.39c-2.48 1.65-5.9 1.47-8.19-.45a6.58 6.58 0 0 1-1.9-6.47c.56-2.85 3.03-5.06 5.91-5.12.04 0 .08 0 .12 0v4.02c-1.31-.02-2.67.62-3.32 1.76a3.52 3.52 0 0 0 .52 4.23c1.23 1.12 3.25 1.01 4.33-.25.53-.61.79-1.4.77-2.2V.02z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 py-4 text-center">
          <p className="font-[var(--font-body)] text-base text-white/60">
            {t("footer.rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
