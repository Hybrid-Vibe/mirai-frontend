"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const code = searchParams.get("code");

  const clearCart = useCartStore((state) => state.clearCart);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (status === "success" && !cleared) {
      clearCart();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCleared(true);
    }
  }, [status, clearCart, cleared]);

  const isSuccess = status === "success";
  const isFailed = status === "failed" || status === "cancel";

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-(--mirai-color-line) bg-card/25 p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden before:absolute before:-inset-px before:-z-10 before:rounded-2xl before:bg-gradient-to-b before:from-white/10 before:to-transparent">
      {/* Background soft glow */}
      <div
        className={`absolute -top-24 -left-24 h-48 w-48 rounded-full blur-3xl opacity-20 -z-10 ${
          isSuccess
            ? "bg-emerald-500"
            : isFailed
              ? "bg-rose-500"
              : "bg-amber-500"
        }`}
      />

      {isSuccess && (
        <div className="flex flex-col items-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Cảm ơn bạn đã lựa chọn **MIRAI**. Đơn đặt hàng của bạn đã được thanh
            toán và ghi nhận thành công trên hệ thống.
          </p>
          {orderId && (
            <div className="w-full rounded-lg bg-card/40 border border-(--mirai-color-line) p-3.5 mb-8 text-xs flex justify-between items-center text-foreground font-mono">
              <span className="text-muted-foreground font-sans">
                Mã đơn hàng:
              </span>
              <span className="font-semibold">{orderId}</span>
            </div>
          )}
        </div>
      )}

      {isFailed && (
        <div className="flex flex-col items-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6">
            <XCircle className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
            Thanh Toán Thất Bại
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Giao dịch thanh toán trực tuyến chưa hoàn tất hoặc đã bị từ chối.
            Vui lòng kiểm tra tài khoản ngân hàng hoặc thử lại.
          </p>
          {code && (
            <div className="w-full rounded-lg bg-card/40 border border-(--mirai-color-line) p-3.5 mb-8 text-xs flex justify-between items-center text-foreground font-mono">
              <span className="text-muted-foreground font-sans">
                Mã phản hồi (VNPay):
              </span>
              <span className="font-semibold text-rose-500">{code}</span>
            </div>
          )}
        </div>
      )}

      {!isSuccess && !isFailed && (
        <div className="flex flex-col items-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-6">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
            Trạng Thái Không Hợp Lệ
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            Hệ thống không thể xác minh thông tin thanh toán này hoặc có lỗi bất
            ngờ phát sinh.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/account"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-white hover:bg-(--mirai-sem-primary)/90 transition-all active:scale-[0.98] shadow-md shadow-(--mirai-sem-primary)/10"
        >
          <ShoppingBag className="h-4 w-4" />
          Quản lý đơn hàng
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-(--mirai-color-line) bg-transparent px-6 text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.98]"
        >
          Tiếp tục mua sắm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <main className="bg-background py-24 min-h-[70vh] flex items-center justify-center">
      <div className="page-shell w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-(--mirai-sem-primary)" />
              <p className="text-sm text-muted-foreground">
                Đang tải kết quả giao dịch...
              </p>
            </div>
          }
        >
          <PaymentResultContent />
        </Suspense>
      </div>
    </main>
  );
}
