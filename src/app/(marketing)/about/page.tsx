import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Laptop,
  Smartphone,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "About Us | MIRAI",
  description: "Câu chuyện về MIRAI - Phản chiếu cá tính, định hình tương lai.",
};

export default function AboutPage() {
  return (
    <main className="bg-background pb-20 pt-10">
      <div className="page-shell">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[24px] bg-(--mirai-sem-text) px-6 py-20 text-center text-(--mirai-sem-background) md:px-12 md:py-32 shadow-2xl">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="font-brand text-5xl font-black tracking-wide text-(--mirai-sem-primary) md:text-7xl">
              MIRAI
            </h1>
            <p className="mt-8 text-lg font-medium leading-relaxed text-(--mirai-sem-background)/90 md:text-xl">
              Phản chiếu cá tính của bạn qua lăng kính công nghệ.
              <br className="hidden md:block" />
              Khởi đầu từ chiếc ốp lưng điện thoại, hướng tới một nền tảng phụ
              kiện cá nhân hoá toàn diện.
            </p>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-(--mirai-sem-primary) opacity-20 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-(--mirai-sem-accent) opacity-20 blur-[120px]" />
        </section>

        {/* The Meaning Section */}
        <section className="mt-20 grid gap-10 md:grid-cols-2">
          <div className="group flex flex-col justify-center gap-6 rounded-[20px] border border-(--mirai-color-line) bg-card p-10 transition-all duration-300 hover:-translate-y-2 hover:border-(--mirai-sem-primary)/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary) transition-transform duration-300 group-hover:scale-110 group-hover:bg-(--mirai-sem-primary)/20">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Mirror + AI</h2>
            <p className="leading-relaxed text-muted-foreground">
              Khi đọc theo tiếng Anh, MIRAI là sự kết hợp của{" "}
              <strong className="font-semibold text-foreground">Mirror</strong>{" "}
              (Tấm gương) và{" "}
              <strong className="font-semibold text-foreground">AI</strong> (Trí
              tuệ nhân tạo). Chúng tôi tạo ra một &quot;tấm gương&quot; công
              nghệ, phản chiếu chính xác cá tính, phong cách và cái tôi độc bản
              của mỗi người dùng.
            </p>
          </div>

          <div className="group flex flex-col justify-center gap-6 rounded-[20px] border border-(--mirai-color-line) bg-card p-10 transition-all duration-300 hover:-translate-y-2 hover:border-(--mirai-sem-accent)/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--mirai-sem-accent)/10 text-(--mirai-sem-accent) transition-transform duration-300 group-hover:scale-110 group-hover:bg-(--mirai-sem-accent)/20">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-3xl font-bold">
              未来 (Tương lai)
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Trong tiếng Nhật, MIRAI (未来) có nghĩa là{" "}
              <strong className="font-semibold text-foreground">
                Tương lai
              </strong>
              . Chúng tôi tin rằng cá nhân hoá không chỉ là xu hướng, mà là
              tương lai của thương mại điện tử, nơi mọi sản phẩm đều mang đậm
              dấu ấn cá nhân và không đụng hàng.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mt-20 overflow-hidden rounded-[24px] border border-(--mirai-color-line) bg-gradient-to-br from-card to-(--mirai-color-surface-muted) p-8 text-center md:p-20">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-sm">
              <Target className="h-10 w-10 text-(--mirai-sem-primary)" />
            </div>
            <h2 className="mb-6 font-heading text-3xl font-bold md:text-5xl">
              Tầm nhìn & Sứ mệnh
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              MIRAI là nền tảng thương mại điện tử tiên phong trong lĩnh vực{" "}
              <strong className="font-semibold text-(--mirai-sem-primary)">
                Phụ kiện cá nhân hoá
              </strong>
              . Khởi nguồn với sản phẩm cốt lõi là ốp lưng điện thoại, MIRAI
              trao quyền cho người dùng tự do sáng tạo và thiết kế những món đồ
              mang đậm bản sắc riêng, phá vỡ rào cản của những sản phẩm đại trà.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-(--mirai-color-line) bg-background px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:border-(--mirai-sem-primary)">
              <Smartphone className="h-5 w-5 text-(--mirai-sem-primary)" />
              Ốp lưng điện thoại
            </div>
            <div className="flex items-center gap-3 rounded-full border border-(--mirai-color-line) bg-background px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:border-(--mirai-sem-primary)">
              <Laptop className="h-5 w-5 text-(--mirai-sem-primary)" />
              Phụ kiện Laptop
            </div>
            <div className="flex items-center gap-3 rounded-full border border-(--mirai-color-line) bg-background px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:border-(--mirai-sem-primary)">
              <Headphones className="h-5 w-5 text-(--mirai-sem-primary)" />
              Phụ kiện Âm thanh
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-32 pb-16 text-center">
          <h2 className="mb-8 font-heading text-3xl font-bold md:text-4xl">
            Bạn đã sẵn sàng định hình phong cách?
          </h2>
          <Link
            href="/customize"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-[4px] bg-(--mirai-sem-primary) px-10 text-base font-bold text-foreground transition-all duration-300 hover:bg-[#48E1ED] hover:text-[#0F0F0F] hover:shadow-[0_10px_30px_rgba(72,225,237,0.4)] active:scale-95"
          >
            Trải nghiệm MIRAI ngay
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </main>
  );
}
