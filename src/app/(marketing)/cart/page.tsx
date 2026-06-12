"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useCartStore } from "@/stores";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CartPage() {
  const {
    items: cartRows,
    updateQuantity,
    removeItem: removeStoreItem,
    getSubtotal,
  } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch since we use localStorage persist
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const subtotal = getSubtotal();
  const total = subtotal;

  const removeItem = (id: string) => {
    removeStoreItem(id);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    toast.success(`Áp dụng mã ${coupon} thành công!`);
    // Mock logic: clear coupon after success or show discount
  };

  if (!mounted) return null;

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
                    {row.productId ? (
                      <Link
                        href={`/shop/${row.productId}`}
                        className="flex items-center gap-4 hover:text-(--mirai-sem-primary) transition-colors"
                      >
                        {row.imageUrl ? (
                          <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted hover:scale-105 transition-transform">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={row.imageUrl}
                              alt={row.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-8 shrink-0 rounded-md bg-gradient-to-b from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                        )}
                        <span className="text-sm font-medium">{row.name}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4">
                        {row.imageUrl ? (
                          <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={row.imageUrl}
                              alt={row.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-8 shrink-0 rounded-md bg-gradient-to-b from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {row.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-sm text-foreground">
                    {formatCurrency(row.price)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-(--mirai-color-line) bg-card overflow-hidden h-9">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(row.id, row.quantity - 1)
                          }
                          disabled={row.quantity <= 1}
                          className="inline-flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-foreground select-none">
                          {row.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(row.id, row.quantity + 1)
                          }
                          disabled={row.quantity >= 10}
                          className="inline-flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-(--mirai-sem-danger) border border-(--mirai-color-line)/60"
                          onClick={() => removeItem(row.id)}
                          aria-label={`Xóa ${row.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xóa khỏi giỏ hàng</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
            className="inline-flex h-11 min-w-52 items-center justify-center rounded-[4px] border border-(--mirai-sem-text-muted)/40 px-6 text-sm font-semibold hover:bg-muted transition-colors"
          >
            Trở về Cửa Hàng
          </Link>
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
              onClick={handleApplyCoupon}
              disabled={!coupon.trim()}
              className="min-w-44 disabled:opacity-50"
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
            {cartRows.length > 0 ? (
              <Link
                href="/checkout"
                className="mx-auto mt-8 inline-flex h-11 w-full max-w-64 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground hover:bg-(--mirai-sem-primary)/90 transition-colors"
              >
                Tiếp tục thanh toán
              </Link>
            ) : (
              <button
                disabled
                className="mx-auto mt-8 inline-flex h-11 w-full max-w-64 items-center justify-center rounded-[4px] bg-muted px-6 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-50"
              >
                Giỏ hàng trống
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
