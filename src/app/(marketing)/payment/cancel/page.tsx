"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  XCircle,
  ShoppingBag,
  ArrowRight,
  Loader2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const paymentLinkId = searchParams.get("id");

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-(--mirai-color-line) bg-card/25 p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden before:absolute before:-inset-px before:-z-10 before:rounded-2xl before:bg-gradient-to-b before:from-white/10 before:to-transparent">
      {/* Background soft glow */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-3xl opacity-20 -z-10 bg-rose-500" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 -z-10 bg-amber-500" />

      <div className="flex flex-col items-center">
        {/* Animated X Circle Icon */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6 relative">
          <XCircle className="h-12 w-12 animate-in zoom-in-50 duration-500" />
          <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-75" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-3 tracking-tight">
          Thanh Toán Đã Hủy
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
          Giao dịch thanh toán của bạn đã bị hủy bỏ hoặc không thể hoàn tất. Nếu
          đây là sự cố, bạn có thể thực hiện lại thanh toán trong Lịch sử đơn
          hàng.
        </p>

        {/* Transaction Info Grid */}
        <div className="w-full rounded-xl bg-card/40 border border-(--mirai-color-line) p-4 mb-8 text-xs text-left space-y-3">
          {orderCode && (
            <div className="flex justify-between items-center pb-2 border-b border-(--mirai-color-line)/50">
              <span className="text-muted-foreground">Mã đơn hàng:</span>
              <span className="font-mono font-semibold text-foreground">
                {orderCode}
              </span>
            </div>
          )}

          {paymentLinkId && (
            <div className="flex justify-between items-center pb-2 border-b border-(--mirai-color-line)/50">
              <span className="text-muted-foreground">Mã tham chiếu:</span>
              <span
                className="font-mono text-muted-foreground truncate max-w-[180px]"
                title={paymentLinkId}
              >
                {paymentLinkId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px]">
              <AlertTriangle className="w-3 h-3" /> Đã hủy (CANCELLED)
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/account"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-white hover:bg-(--mirai-sem-primary)/90 transition-all active:scale-[0.98] shadow-md shadow-(--mirai-sem-primary)/10"
        >
          <ShoppingBag className="h-4 w-4" />
          Quản lý & Thanh toán lại
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-(--mirai-color-line) bg-transparent px-6 text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.98]"
        >
          Tiếp tục mua sắm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Cần hỗ trợ? Liên hệ Hotline hoặc Chatbox.</span>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <main className="bg-background py-24 min-h-[75vh] flex items-center justify-center relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-20" />

      <div className="page-shell w-full flex items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-(--mirai-sem-primary)" />
              <p className="text-sm text-muted-foreground">
                Đang xử lý thông tin hủy...
              </p>
            </div>
          }
        >
          <PaymentCancelContent />
        </Suspense>
      </div>
    </main>
  );
}
