import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Gift,
  Headphones,
  Paintbrush2,
  Smartphone,
  Sparkles,
} from "lucide-react";

type CategoryItem = {
  name: string;
  description: string;
  quantity: string;
  icon: LucideIcon;
};

const categories: CategoryItem[] = [
  {
    name: "Customize AI",
    description: "Thiết kế từ prompt và chọn mẫu",
    quantity: "200+ mẫu máy",
    icon: Sparkles,
  },
  {
    name: "Customize Self",
    description: "Upload ảnh của bạn để in ốp",
    quantity: "In trong 24h",
    icon: Paintbrush2,
  },
  {
    name: "Ốp ảnh cá nhân",
    description: "Giữ kỷ niệm theo phong cách riêng",
    quantity: "Best seller",
    icon: Camera,
  },
  {
    name: "Combo quà tặng",
    description: "Ốp + thiệp + hộp quà premium",
    quantity: "Ưu đãi theo bộ",
    icon: Gift,
  },
  {
    name: "Dòng máy phổ biến",
    description: "iPhone, Samsung, Xiaomi, Oppo",
    quantity: "Mở rộng hàng tuần",
    icon: Smartphone,
  },
  {
    name: "Hỗ trợ 24/7",
    description: "Tư vấn thiết kế và theo dõi đơn hàng",
    quantity: "Phản hồi nhanh",
    icon: Headphones,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[color:var(--mirai-color-brand-strong)]">
              Browse by category
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
              Danh mục nổi bật
            </h2>
          </div>
          <p className="hidden max-w-xl text-sm text-muted-foreground md:block">
            Từ custom bằng AI đến các mẫu in sẵn, bạn có thể bắt đầu từ danh mục phù hợp nhất
            với nhu cầu hiện tại.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.name}
              className="rounded-[10px] border border-border bg-card p-5 transition-colors hover:border-[color:var(--mirai-color-brand)]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-[color:var(--mirai-color-brand)]/15 text-[color:var(--mirai-color-brand-strong)]">
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              <p className="mt-4 text-xs font-medium text-[color:var(--mirai-color-brand-strong)]">
                {category.quantity}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
