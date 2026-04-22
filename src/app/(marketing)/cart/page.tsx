"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialCartRows = [
  { id: "row-1", name: "Ốp Lưng ASA STAR HEART", price: 85000, quantity: 1 },
  { id: "row-2", name: "Ốp Lưng Customize", price: 150000, quantity: 1 },
];

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CartPage() {
  const [cartRows, setCartRows] = useState(initialCartRows);
  const [coupon, setCoupon] = useState("");

  const subtotal = useMemo(
    () => cartRows.reduce((sum, row) => sum + row.price * row.quantity, 0),
    [cartRows],
  );
  const total = subtotal;

  const updateQuantity = (id: string, nextQuantity: number) => {
    setCartRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, quantity: Math.max(1, Math.min(nextQuantity, 10)) }
          : row,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCartRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <p className="text-sm text-muted-foreground">Home / Cart</p>

        <section className="mt-8 overflow-x-auto rounded-[4px] border border-(--mirai-color-line) bg-card">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-(--mirai-color-line) bg-card">
                <th className="px-8 py-5 text-left text-sm font-semibold text-foreground">
                  Sản phẩm
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-foreground">
                  Giá
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-foreground">
                  Số lượng
                </th>
                <th className="px-8 py-5 text-right text-sm font-semibold text-foreground">
                  Tổng phụ
                </th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {cartRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-(--mirai-color-line) last:border-b-0"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-8 rounded-md bg-gradient-to-b from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                      <span className="text-sm font-medium text-foreground">
                        {row.name}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-(--mirai-sem-danger)"
                        onClick={() => removeItem(row.id)}
                        aria-label={`Xóa ${row.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-foreground">
                    {formatCurrency(row.price)}
                  </td>
                  <td className="px-8 py-6">
                    <select
                      className="h-10 w-20 rounded-[4px] border border-(--mirai-color-line) bg-card px-2 text-sm"
                      value={row.quantity}
                      onChange={(event) => updateQuantity(row.id, Number(event.target.value))}
                    >
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {(i + 1).toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right text-sm font-semibold text-foreground">
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
            className="inline-flex h-11 min-w-52 items-center justify-center rounded-[4px] border border-(--mirai-sem-text-muted)/40 px-6 text-sm font-semibold"
          >
            Trở về Cửa Hàng
          </Link>
          <Button type="button" variant="outline" className="min-w-52">
            Update Giỏ Hàng
          </Button>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="flex h-fit flex-wrap gap-3">
            <input
              type="text"
              placeholder="Mã Giảm Giá"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              className="h-11 w-full max-w-[340px] rounded-[4px] border border-(--mirai-sem-text-muted)/40 bg-card px-4 text-sm"
            />
            <Button
              type="button"
              className="min-w-44"
            >
              Áp Dụng
            </Button>
          </div>

          <section className="justify-self-end rounded-[4px] border border-(--mirai-sem-text-muted) bg-card p-6 lg:w-[470px]">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Tổng cộng giỏ hàng
            </h2>
            <div className="mt-6 space-y-4 text-sm text-foreground">
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mx-auto mt-8 inline-flex h-11 min-w-64 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground"
            >
              Tiếp tục thanh toán
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
