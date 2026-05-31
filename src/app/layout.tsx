import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/common";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastConfigurator } from "@/components/providers/toast-configurator";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const fontBody = Bricolage_Grotesque({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const fontUi = Bricolage_Grotesque({
  variable: "--font-ui",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MIRAI | AI Custom Phone Case",
  description:
    "MIRAI - custom phone case experience for Gen Z Vietnam. Light mode first, pixel-focused UI from Figma.",
  keywords: ["MIRAI", "custom phone case", "AI design", "Vietnam"],
  authors: [{ name: "MIRAI Team" }],
  openGraph: {
    title: "MIRAI | AI Custom Phone Case",
    description: "MIRAI custom case platform.",
    type: "website",
    locale: "vi_VN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFAEE" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

const themeBootScript = `
(() => {
  try {
    const savedTheme = localStorage.getItem("mirai-theme");
    const theme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Inter:wght@100..900&family=Lobster&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Pacifico&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100..900;1,100..900&family=Sacramento&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontUi.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ToastConfigurator />
        <SessionProvider>
          <SupabaseAuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SupabaseAuthProvider>
        </SessionProvider>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--mirai-sem-surface)",
              border: "1px solid var(--mirai-sem-border)",
              color: "var(--mirai-sem-text)",
            },
          }}
          icons={{
            info: null,
            warning: null,
          }}
        />
      </body>
    </html>
  );
}
