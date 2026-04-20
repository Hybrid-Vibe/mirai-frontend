import { Eye, Trash2 } from "lucide-react";

const wishlistItems = [
  { id: "wl-1", name: "Case + Magsafe", price: "290.000đ", oldPrice: "390.000đ", badge: "-35%" },
  { id: "wl-2", name: "Phonecase", price: "120.000đ" },
  { id: "wl-3", name: "Phonecase", price: "120.000đ" },
  { id: "wl-4", name: "Phonecase", price: "120.000đ" },
];

const suggestedItems = [
  { id: "s-1", name: "Phonecase", price: "99.000đ", oldPrice: "150.000đ", badge: "-35%" },
  { id: "s-2", name: "Phonecase", price: "120.000đ" },
  { id: "s-3", name: "Phonecase", price: "120.000đ", badge: "NEW" },
  { id: "s-4", name: "Phonecase", price: "120.000đ" },
];

export default function WishlistPage() {
  return (
    <main className="bg-background py-14">
      <div className="page-shell">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">Wishlist (4)</h1>
          <button
            type="button"
            className="h-11 min-w-44 rounded-[4px] border border-[#2F2E30]/40 bg-white px-5 text-sm font-semibold"
          >
            Thêm vào Giỏ
          </button>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <article key={item.id}>
              <div className="relative rounded-[4px] bg-[#F5F5F5] p-4">
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-[4px] bg-[#48E1ED] px-2 py-1 text-xs font-semibold text-[#0F0F0F]">
                    {item.badge}
                  </span>
                )}
                <button type="button" className="absolute right-3 top-3">
                  <Trash2 className="h-5 w-5 text-[#2F2E30]" />
                </button>
                <div className="mx-auto h-36 w-24 rounded-xl bg-gradient-to-br from-[#2F2E30] to-[#4349E7]" />
                <button type="button" className="mt-5 w-full rounded-[4px] bg-black py-2 text-xs font-medium text-white">
                  Thêm vào giỏ
                </button>
              </div>
              <h2 className="mt-4 font-body text-base font-semibold text-[#0F0F0F]">{item.name}</h2>
              <p className="mt-1 text-sm text-[#DB4444]">
                {item.price} {item.oldPrice && <span className="text-[#2F2E30]/60 line-through">{item.oldPrice}</span>}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-16 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-8 w-2 rounded-sm bg-[#4349E7]" />
            <h2 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">Dành Cho Bạn</h2>
          </div>
          <button
            type="button"
            className="h-11 min-w-36 rounded-[4px] border border-[#2F2E30]/40 bg-white px-5 text-sm font-semibold"
          >
            Xem Tất Cả
          </button>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {suggestedItems.map((item) => (
            <article key={item.id}>
              <div className="relative rounded-[4px] bg-[#F5F5F5] p-4">
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-[4px] bg-[#48E1ED] px-2 py-1 text-xs font-semibold text-[#0F0F0F]">
                    {item.badge}
                  </span>
                )}
                <button type="button" className="absolute right-3 top-3">
                  <Eye className="h-5 w-5 text-[#2F2E30]" />
                </button>
                <div className="mx-auto h-36 w-24 rounded-xl bg-gradient-to-br from-[#2F2E30] to-[#4349E7]" />
                <button type="button" className="mt-5 w-full rounded-[4px] bg-black py-2 text-xs font-medium text-white">
                  Thêm vào giỏ
                </button>
              </div>
              <h2 className="mt-4 font-body text-base font-semibold text-[#0F0F0F]">{item.name}</h2>
              <p className="mt-1 text-sm text-[#DB4444]">
                {item.price} {item.oldPrice && <span className="text-[#2F2E30]/60 line-through">{item.oldPrice}</span>}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
