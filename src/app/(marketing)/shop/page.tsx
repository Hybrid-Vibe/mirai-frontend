import Link from "next/link";
import { Heart, SlidersHorizontal, Star } from "lucide-react";

const products = [
  { id: "p-1", name: "Phone Case", price: "120.000đ", oldPrice: "150.000đ", badge: "-35%" },
  { id: "p-2", name: "Phone Case", price: "129.000đ" },
  { id: "p-3", name: "Phone Case", price: "125.000đ", badge: "NEW" },
  { id: "p-4", name: "Phone Case", price: "120.000đ" },
  { id: "p-5", name: "Phone Case", price: "99.000đ", oldPrice: "150.000đ" },
  { id: "p-6", name: "Phone Case", price: "120.000đ" },
  { id: "p-7", name: "Phone Case", price: "129.000đ" },
  { id: "p-8", name: "Phone Case", price: "120.000đ" },
];

export default function ShopPage() {
  return (
    <main className="bg-background py-14">
      <section className="page-shell">
        <p className="text-sm text-[#2F2E30]/70">Home / Shop</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h1 className="font-heading text-4xl font-semibold text-[#0F0F0F] md:text-5xl">Shop</h1>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-[color:var(--mirai-color-line)] px-3 text-sm font-medium text-[#0F0F0F] md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        <p className="mt-2 text-sm text-[#2F2E30]/70">Khám phá bộ sưu tập ốp lưng và phụ kiện mới nhất.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white p-5 lg:block">
            <h2 className="text-sm font-semibold text-[#0F0F0F]">Bộ lọc</h2>

            <div className="mt-5 space-y-5 text-sm">
              <div>
                <p className="mb-2 font-semibold text-[#0F0F0F]">Danh mục</p>
                <ul className="space-y-2 text-[#2F2E30]/80">
                  <li>Phone Cases</li>
                  <li>Laptop Cases</li>
                  <li>Airpod Cases</li>
                  <li>Phụ kiện</li>
                </ul>
              </div>

              <div>
                <p className="mb-2 font-semibold text-[#0F0F0F]">Giá</p>
                <ul className="space-y-2 text-[#2F2E30]/80">
                  <li>Dưới 100.000đ</li>
                  <li>100.000đ - 200.000đ</li>
                  <li>Trên 200.000đ</li>
                </ul>
              </div>

              <div>
                <p className="mb-2 font-semibold text-[#0F0F0F]">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {["#48E1ED", "#4349E7", "#111216", "#F87171", "#FACC15"].map((color) => (
                    <span
                      key={color}
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white px-4 py-3 text-sm">
              <p className="text-[#2F2E30]/70">Hiển thị 8 sản phẩm</p>
              <p className="text-[#0F0F0F]">Sắp xếp: Mới nhất</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <article key={product.id}>
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

                    <button type="button" className="w-full rounded-[4px] bg-black py-2 text-xs font-medium text-white">
                      Thêm vào giỏ
                    </button>
                  </div>

                  <h2 className="mt-4 font-body text-base font-semibold text-[#0F0F0F]">{product.name}</h2>
                  <p className="mt-1 text-sm text-[#DB4444]">
                    <span className="font-semibold">{product.price}</span>{" "}
                    {product.oldPrice && <span className="text-[#2F2E30]/60 line-through">{product.oldPrice}</span>}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[#FFAD33]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={`${product.id}-${i}`} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="ml-1 text-xs text-[#2F2E30]/70">(65)</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/cart"
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
              >
                Đi đến giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
