import Link from "next/link";

const cartRows = [
  { id: "row-1", name: "Ốp Lưng ASA STAR HEART", price: 85000, quantity: 1 },
  { id: "row-2", name: "Ốp Lưng Customize", price: 150000, quantity: 1 },
];

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CartPage() {
  const subtotal = cartRows.reduce((sum, row) => sum + row.price * row.quantity, 0);

  return (
    <main className="bg-background py-14">
      <div className="page-shell">
        <p className="text-sm text-[#2F2E30]/70">Home / Cart</p>

        <section className="mt-8 overflow-x-auto rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[color:var(--mirai-color-line)] bg-white">
                <th className="px-8 py-5 text-left text-sm font-semibold text-[#0F0F0F]">Sản phẩm</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-[#0F0F0F]">Giá</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-[#0F0F0F]">Số lượng</th>
                <th className="px-8 py-5 text-right text-sm font-semibold text-[#0F0F0F]">Tổng phụ</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {cartRows.map((row) => (
                <tr key={row.id} className="border-b border-[color:var(--mirai-color-line)] last:border-b-0">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-8 rounded-md bg-gradient-to-b from-[#2F2E30] to-[#4349E7]" />
                      <span className="text-sm font-medium text-[#0F0F0F]">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#0F0F0F]">{formatCurrency(row.price)}</td>
                  <td className="px-8 py-6">
                    <select className="h-10 w-20 rounded-[4px] border border-[color:var(--mirai-color-line)] px-3 text-sm">
                      <option value={1}>01</option>
                      <option value={2}>02</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right text-sm font-semibold text-[#0F0F0F]">
                    {formatCurrency(row.price * row.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop"
            className="inline-flex h-11 min-w-52 items-center justify-center rounded-[4px] border border-[#2F2E30]/40 px-6 text-sm font-semibold"
          >
            Trở về Cửa Hàng
          </Link>
          <button
            type="button"
            className="inline-flex h-11 min-w-52 items-center justify-center rounded-[4px] border border-[#2F2E30]/40 px-6 text-sm font-semibold"
          >
            Update Giỏ Hàng
          </button>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="flex h-fit flex-wrap gap-3">
            <input
              type="text"
              placeholder="Mã Giảm Giá"
              className="h-11 w-full max-w-[340px] rounded-[4px] border border-[#2F2E30]/40 bg-white px-4 text-sm"
            />
            <button
              type="button"
              className="h-11 min-w-44 rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
            >
              Áp Dụng
            </button>
          </div>

          <section className="justify-self-end rounded-[4px] border border-[#2F2E30] bg-white p-6 lg:w-[470px]">
            <h2 className="font-heading text-2xl font-semibold text-[#0F0F0F]">Tổng cộng giỏ hàng</h2>
            <div className="mt-6 space-y-4 text-sm text-[#0F0F0F]">
              <div className="flex items-center justify-between border-b border-[color:var(--mirai-color-line)] pb-3">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[color:var(--mirai-color-line)] pb-3">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mx-auto mt-8 inline-flex h-11 min-w-64 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
            >
              Tiếp tục thanh toán
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
