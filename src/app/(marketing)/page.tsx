import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Headphones,
  Headset,
  Heart,
  Laptop,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  Watch,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
};

const heroCategories = ["Phone Cases", "Laptop Cases", "Airpod Cases", "Phụ kiện", "Bộ sưu tập"];

const flashSales: Product[] = [
  { id: "fs-1", name: "Ốp lưng ASA STAR HEART", price: "85.000đ", oldPrice: "100.000đ", badge: "-15%" },
  { id: "fs-2", name: "Phụ kiện móc khóa", price: "95.000đ", oldPrice: "120.000đ", badge: "-20%" },
  { id: "fs-3", name: "Ốp lưng Airpod Metallic", price: "120.000đ", oldPrice: "150.000đ" },
  { id: "fs-4", name: "Phone Case Icon", price: "90.000đ", oldPrice: "100.000đ" },
  { id: "fs-5", name: "Phone Case Wave", price: "88.000đ", oldPrice: "96.000đ" },
];

const bestSelling: Product[] = [
  { id: "bs-1", name: "Phone Case Chrome", price: "120.000đ", oldPrice: "150.000đ" },
  { id: "bs-2", name: "Phone Case Pixel", price: "129.000đ", oldPrice: "150.000đ" },
  { id: "bs-3", name: "Phone Case Bloom", price: "129.000đ", oldPrice: "150.000đ" },
  { id: "bs-4", name: "Phone Case Mini", price: "122.000đ" },
];

const exploreProducts: Product[] = [
  { id: "ep-1", name: "Phone Case",
    price: "120.000đ", oldPrice: "150.000đ", badge: "-35%" },
  { id: "ep-2", name: "Phone Case", price: "129.000đ" },
  { id: "ep-3", name: "Phone Case", price: "129.000đ" },
  { id: "ep-4", name: "Phone Case", price: "120.000đ" },
  { id: "ep-5", name: "Phone Case", price: "120.000đ", oldPrice: "150.000đ" },
  { id: "ep-6", name: "Phone Case", price: "129.000đ" },
  { id: "ep-7", name: "Phone Case", price: "110.000đ", badge: "NEW" },
  { id: "ep-8", name: "Phone Case", price: "120.000đ" },
];

const categories = [
  { label: "Phone Cases", icon: <Smartphone className="h-7 w-7" /> },
  { label: "Laptop Cases", icon: <Laptop className="h-7 w-7" /> },
  { label: "Smart Watch", icon: <Watch className="h-7 w-7" /> },
  { label: "Airpod Cases", icon: <Headphones className="h-7 w-7" /> },
  { label: "Others", icon: <Camera className="h-7 w-7" /> },
];

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-3">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block h-8 w-2 rounded-sm bg-[#4349E7]" />
          <span className="text-sm font-semibold text-[#4349E7]">{label}</span>
        </div>
        <h2 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">{title}</h2>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--mirai-color-line)]"
          aria-label="Previous"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--mirai-color-line)]"
          aria-label="Next"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <div className="relative rounded-[4px] bg-[#F5F5F5] p-4">
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#48E1ED] px-2 py-1 text-xs font-semibold text-[#0F0F0F]">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-[#2F2E30]" />
        </button>

        <div className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-white/50 bg-gradient-to-b from-[#111216] via-[#4349E7] to-[#48E1ED]" />

        <button
          type="button"
          className="w-full rounded-[4px] bg-black py-2 text-xs font-medium text-white opacity-0 transition duration-200 group-hover:opacity-100"
        >
          Thêm vào giỏ
        </button>
      </div>

      <h3 className="mt-4 font-body text-base font-semibold text-[#0F0F0F]">{product.name}</h3>
      <div className="mt-1 flex items-center gap-3 text-sm">
        <span className="font-semibold text-[#DB4444]">{product.price}</span>
        {product.oldPrice && <span className="text-[#2F2E30]/60 line-through">{product.oldPrice}</span>}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[#FFAD33]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={`${product.id}-${i}`} className="h-4 w-4 fill-current" />
        ))}
        <span className="ml-1 text-xs text-[#2F2E30]/70">(65)</span>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="bg-background pb-20">
      <section className="page-shell border-b border-[color:var(--mirai-color-line)] py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-[color:var(--mirai-color-line)] pr-6 lg:block">
            <ul className="space-y-3 pt-2">
              {heroCategories.map((item, idx) => (
                <li key={item} className="flex items-center justify-between text-sm text-[#0F0F0F]">
                  <span>{item}</span>
                  {idx < 2 && <ArrowRight className="h-3.5 w-3.5" />}
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-4">
            <div className="grid min-h-[330px] items-center gap-6 rounded-[4px] bg-black px-8 py-8 text-white md:grid-cols-2 md:px-12">
              <div>
                <p className="mb-3 text-sm text-[#48E1ED]">AI Custom Case</p>
                <h1 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
                  Thiết kế ốp lưng mang dấu ấn riêng của bạn
                </h1>
                <Link href="/customize" className="mt-8 inline-flex items-center gap-2 text-sm underline">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mx-auto flex h-56 w-48 items-center justify-center rounded-[28px] border border-white/20 bg-gradient-to-b from-[#2F2E30] via-[#4349E7] to-[#48E1ED] shadow-[0_30px_80px_rgba(72,225,237,0.25)]">
                <span className="font-heading text-4xl font-semibold text-white">MIRAI</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i === 2 ? "bg-[#48E1ED]" : "bg-[#D9D9D9]"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading label="Hôm nay" title="Flash Sales" />
        <div className="mb-8 flex flex-wrap items-end gap-6">
          {["Ngày", "Giờ", "Phút", "Giây"].map((label, i) => (
            <div key={label} className="text-center">
              <p className="text-xs text-[#2F2E30]/60">{label}</p>
              <p className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">{["03", "23", "19", "56"][i]}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {flashSales.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop" className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 py-3 text-sm font-semibold text-[#0F0F0F]">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      <section className="page-shell border-t border-[color:var(--mirai-color-line)] py-16">
        <SectionHeading label="Danh mục" title="Tìm kiếm theo danh mục" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => (
            <button
              key={category.label}
              type="button"
              className={`flex h-36 flex-col items-center justify-center gap-3 rounded-[4px] border border-[color:var(--mirai-color-line)] text-center ${
                index === 0 ? "bg-[#48E1ED] text-[#0F0F0F]" : "bg-white text-[#0F0F0F]"
              }`}
            >
              {category.icon}
              <span className="font-body text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="page-shell border-t border-[color:var(--mirai-color-line)] py-16">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-8 w-2 rounded-sm bg-[#4349E7]" />
              <span className="text-sm font-semibold text-[#4349E7]">Tháng này</span>
            </div>
            <h2 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">Sản phẩm bán chạy nhất</h2>
          </div>
          <Link href="/shop" className="inline-flex h-10 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]">
            Xem tất cả
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSelling.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="grid min-h-[320px] items-center gap-8 rounded-[4px] bg-black px-8 py-10 text-white md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm text-[#48E1ED]">Bộ sưu tập tháng</p>
            <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">Khám phá phong cách của riêng bạn</h2>
            <div className="mt-8 flex gap-3">
              {["23 ngày", "05 giờ", "39 phút", "35 giây"].map((value) => (
                <span key={value} className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#0F0F0F]">
                  {value}
                </span>
              ))}
            </div>
            <Link href="/customize" className="mt-8 inline-flex min-w-36 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 py-3 text-sm font-semibold text-[#0F0F0F]">
              Mua ngay
            </Link>
          </div>
          <div className="mx-auto h-64 w-full max-w-xs rounded-3xl border border-white/20 bg-gradient-to-br from-[#2F2E30] via-[#111216] to-[#48E1ED]/70" />
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading label="Sản phẩm" title="Khám phá sản phẩm" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {exploreProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop" className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 py-3 text-sm font-semibold text-[#0F0F0F]">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      <section className="page-shell border-t border-[color:var(--mirai-color-line)] py-16">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-8 w-2 rounded-sm bg-[#4349E7]" />
            <span className="text-sm font-semibold text-[#4349E7]">Nổi bật</span>
          </div>
          <h2 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">Tính năng mới</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <article className="relative min-h-[420px] rounded-[4px] bg-black p-8 text-white">
            <h3 className="font-heading text-4xl font-semibold">Customize</h3>
            <p className="mt-3 max-w-sm text-sm text-[#CFCFCF]">
              Trải nghiệm tạo ốp lưng cá nhân hóa với AI và chỉnh sửa thủ công trong cùng một flow.
            </p>
            <Link href="/customize" className="mt-5 inline-flex items-center text-sm underline">
              Mua ngay
            </Link>
            <div className="absolute bottom-8 right-8 h-40 w-28 rounded-2xl bg-gradient-to-br from-[#48E1ED] to-[#4349E7]" />
          </article>

          <div className="grid gap-5">
            <article className="relative min-h-[200px] rounded-[4px] bg-black p-6 text-white">
              <h3 className="font-heading text-3xl font-semibold">Women&apos;s Collections</h3>
              <p className="mt-2 text-sm text-[#CFCFCF]">Các bộ sưu tập theo chủ đề nổi bật trong tuần.</p>
            </article>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="relative min-h-[200px] rounded-[4px] bg-black p-6 text-white">
                <h3 className="font-heading text-3xl font-semibold">Hot cases</h3>
              </article>
              <article className="relative min-h-[200px] rounded-[4px] bg-[#FFAD33] p-6 text-[#0F0F0F]">
                <h3 className="font-heading text-3xl font-semibold">Phụ kiện</h3>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-8 py-6 md:grid-cols-3">
          {[
            {
              icon: <Truck className="h-6 w-6" />,
              title: "GIAO HÀNG MIỄN PHÍ & NHANH CHÓNG",
              desc: "Miễn phí giao hàng cho tất cả đơn hàng từ 500.000đ.",
            },
            {
              icon: <Headset className="h-6 w-6" />,
              title: "DỊCH VỤ KHÁCH HÀNG 24/7",
              desc: "Hỗ trợ khách hàng nhanh nhất mọi thời điểm.",
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "ĐẢM BẢO HOÀN TIỀN",
              desc: "Chính sách hoàn tiền trong vòng 30 ngày.",
            },
          ].map((service) => (
            <article key={service.title} className="text-center">
              <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#2F2E30] text-white">
                {service.icon}
              </span>
              <h3 className="mt-5 font-body text-base font-semibold text-[#0F0F0F]">{service.title}</h3>
              <p className="mt-2 text-sm text-[#2F2E30]/70">{service.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
