import Link from "next/link";
import { AtSign, Globe, MessageCircle, Send, Share2 } from "lucide-react";

const supportLinks = [
  "123, Lê Văn Việt, phường Hiệp Phú, Thủ Đức, TPHCM",
  "miraicases@gmail.com",
  "+88015-88888-9999",
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Login", href: "/login" },
  {label: "Register", href: "/register"},
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shop", href: "/shop" },
];

const quickLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms Of Use", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
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
                Đăng ký
              </p>
              <p className="font-[var(--font-display)] text-base">
                Giảm 10% cho đơn hàng đầu tiên của bạn
              </p>
            </div>

            <label className="flex h-12 items-center gap-3 rounded-[4px] border border-(--mirai-sem-background) px-4">
              <span className="sr-only">Email</span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent font-[var(--font-body)] text-base text-(--mirai-sem-background) outline-none placeholder:opacity-40"
              />
              <button type="button" className="transition-transform hover:text-(--mirai-sem-primary) active:scale-[0.95]">
                <Send className="h-5 w-5" />
              </button>
            </label>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              Support
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
              Account
            </h2>
            <ul className="space-y-4 font-[var(--font-body)] text-base">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-(--mirai-sem-primary)">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              Quick Link
            </h2>
            <ul className="space-y-4 font-[var(--font-body)] text-base">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-(--mirai-sem-primary)">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">
              Download App
            </h2>
            <p className="max-w-[220px] font-[var(--font-display)] text-xs opacity-70">
              Tiết kiệm 50.000 đồng chỉ dành cho người dùng mới của Ứng dụng
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex h-20 items-center justify-center rounded-[4px] border border-(--mirai-sem-background) text-sm">
                QR
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="h-9 rounded-[4px] border border-(--mirai-sem-background) px-2 text-left font-[var(--font-body)] text-xs transition-all hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary) active:scale-[0.95]"
                >
                  Google Play
                </button>
                <button
                  type="button"
                  className="h-9 rounded-[4px] border border-(--mirai-sem-background) px-2 text-left font-[var(--font-body)] text-xs transition-all hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary) active:scale-[0.95]"
                >
                  App Store
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link href="#" aria-label="Website" className="transition-all hover:-translate-y-1 hover:text-(--mirai-sem-primary)">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Socials" className="transition-all hover:-translate-y-1 hover:text-(--mirai-sem-primary)">
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Email" className="transition-all hover:-translate-y-1 hover:text-(--mirai-sem-primary)">
                <AtSign className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Share" className="transition-all hover:-translate-y-1 hover:text-(--mirai-sem-primary)">
                <Share2 className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 py-4 text-center">
          <p className="font-[var(--font-body)] text-base text-white/60">
            © MIRAI 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
