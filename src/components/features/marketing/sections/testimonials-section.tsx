import Link from "next/link";
import { ArrowRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Nguyễn Linh",
    handle: "@linhangel.vn",
    avatar: "NL",
    color: "#FF6B9D",
    rating: 5,
    text: "Mình chỉ gõ 'anime sunset beach girl' rồi AI ra ngay 3 cái đẹp kinh dị 😭 Mua luôn không cần suy nghĩ. Ship nhanh, ốp cứng, in sắc nét. 10/10!",
    badge: "iPhone 15 Pro",
  },
  {
    name: "Trần Minh Khôi",
    handle: "@khoi.codes",
    avatar: "KH",
    color: "#0066FF",
    rating: 5,
    text: "Dev thiết kế? Không cần! Nhập prompt tiếng Anh là ra ngay thiết kế pro. Mình đặt 4 cái cho cả nhóm, ai cũng thích. Giao tiếp support rất nhanh.",
    badge: "Samsung S24",
  },
  {
    name: "Phạm Thùy Dương",
    handle: "@duong.aesthetic",
    avatar: "TD",
    color: "#7B2FFF",
    rating: 5,
    text: "AR preview xịn xò quá!! Thử trước khi mua cực kỳ hữu ích. Thiết kế y chang như mình tưởng tượng. MIRAI là tương lai của việc mua ốp 💙",
    badge: "iPhone 14",
  },
  {
    name: "Lê Hoàng Anh",
    handle: "@hoanganh.genz",
    avatar: "HA",
    color: "#00D4FF",
    rating: 5,
    text: "Editor dễ xài hơn mình nghĩ nhiều. Thêm tên mình lên ốp, chỉnh màu xíu là xong. Cảm giác ốp lưng này thật sự là của mình, không phải mass product.",
    badge: "Xiaomi 14",
  },
];

const servicePillars = [
  {
    title: "Hỗ trợ trước khi in",
    description: "Đội ngũ kiểm tra chất lượng hình và bố cục trước khi duyệt đơn.",
  },
  {
    title: "Đổi mới trong 7 ngày",
    description: "Hỗ trợ xử lý nếu sản phẩm gặp lỗi in hoặc vận chuyển.",
  },
  {
    title: "Theo dõi đơn realtime",
    description: "Cập nhật trạng thái ngay trên website và qua email.",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-border py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[color:var(--mirai-color-brand-strong)]">
              Review thật từ khách hàng
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
              Gen Z nói gì về MIRAI?
            </h2>
          </div>
          <Badge
            variant="outline"
            className="hidden border-[color:var(--mirai-color-brand)] bg-[color:var(--mirai-color-brand)]/10 text-[color:var(--mirai-color-brand-strong)] md:inline-flex"
          >
            4.9/5 từ hơn 2.000 đánh giá
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <article
                key={t.handle}
                className="relative rounded-[10px] border border-border bg-card p-5"
              >
                <Quote className="absolute right-4 top-4 h-5 w-5 text-[color:var(--mirai-color-brand-strong)]/20" />
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.handle}</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--mirai-color-brand)]/15 px-2 py-1 text-[10px] font-medium text-[color:var(--mirai-color-brand-strong)]">
                    {t.badge}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[10px] border border-border bg-card p-5">
            <h3 className="font-heading text-2xl font-semibold">MIRAI Service Promise</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Trải nghiệm mua sắm rõ ràng, minh bạch và phù hợp cho flow ecommerce.
            </p>

            <div className="mt-5 grid gap-3">
              {servicePillars.map((pillar) => (
                <div key={pillar.title} className="rounded-[8px] border border-border bg-background p-3">
                  <p className="text-sm font-medium">{pillar.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>

            <Button
              asChild
              className="mt-6 h-11 w-full rounded-[6px] bg-[color:var(--mirai-color-brand-strong)] text-white hover:opacity-90"
            >
              <Link href="/customize">
                Thiết kế ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
