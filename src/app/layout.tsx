import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const fontBody = Poppins({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const fontUi = Inter({
  variable: "--font-ui",
  weight: ["400", "500", "600", "700", "800"],
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
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#111216" },
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
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontUi.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        {children}
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid rgba(15,15,15,0.14)",
              color: "#0F0F0F",
            },
          }}
        />
      </body>
    </html>
  );
}
