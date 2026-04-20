export default function CheckoutPage() {
  return (
    <main className="bg-background py-14">
      <div className="page-shell">
        <p className="text-sm text-[#2F2E30]/70">
          Home / Cart / <span className="font-semibold text-[#0F0F0F]">Checkout</span>
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_500px]">
          <section>
            <h1 className="font-heading text-3xl font-semibold text-[#0F0F0F] md:text-4xl">Chi tiết thanh toán</h1>
            <form className="mt-8 space-y-5">
              {[
                "Họ*",
                "Tên",
                "Địa Chỉ*",
                "Apartment, floor, etc. (optional)",
                "Tỉnh/ Thành Phố",
                "Số Điện Thoại *",
                "Email *",
              ].map((label) => (
                <label key={label} className="block text-sm text-[#2F2E30]/80">
                  {label}
                  <input className="mt-2 h-11 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] bg-[#F5F5F5] px-4" />
                </label>
              ))}

              <label className="mt-5 flex items-center gap-3 text-sm text-[#0F0F0F]">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#4349E7]" />
                Lưu thông tin này để thanh toán nhanh hơn lần sau
              </label>
            </form>
          </section>

          <section className="rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white p-6 lg:p-8">
            <div className="space-y-4 text-sm text-[#0F0F0F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-8 rounded-md bg-gradient-to-b from-[#2F2E30] to-[#4349E7]" />
                  <span>Ốp Lưng ASA STAR HEART</span>
                </div>
                <span>85.000đ</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-8 rounded-md bg-gradient-to-b from-[#2F2E30] to-[#4349E7]" />
                  <span>Ốp Lưng Customize</span>
                </div>
                <span>150.000đ</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-[color:var(--mirai-color-line)] pb-3">
                <span>Subtotal:</span>
                <span>235.000đ</span>
              </div>
              <div className="flex items-center justify-between border-b border-[color:var(--mirai-color-line)] pb-3">
                <span>Shipping:</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total:</span>
                <span className="font-semibold">235.000đ</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <label className="flex items-center gap-3">
                <input type="radio" name="payment-method" className="h-4 w-4" />
                Thanh Toán Trực Tuyến
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="payment-method" defaultChecked className="h-4 w-4" />
                COD
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <input
                type="text"
                placeholder="Mã giảm giá"
                className="h-11 w-full rounded-[4px] border border-[#2F2E30]/40 bg-white px-4 text-sm"
              />
              <button type="button" className="h-11 min-w-36 rounded-[4px] bg-[#48E1ED] px-4 text-sm font-semibold text-[#0F0F0F]">
                Áp Dụng
              </button>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex h-11 min-w-44 items-center justify-center rounded-[4px] bg-[#48E1ED] px-8 text-sm font-semibold text-[#0F0F0F]"
            >
              Order
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
