// GET /api/payment/vnpay/callback — VNPay return URL handler
import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayReturn } from "@/lib/payment-vnpay";
import type { VNPayReturnParams } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries()) as unknown as VNPayReturnParams;

    const { isValid, isSuccess } = verifyVNPayReturn(query);

    if (!isValid) {
      console.warn("[VNPay Callback] Invalid signature");
      return NextResponse.redirect(
        new URL("/payment/result?status=invalid", req.url)
      );
    }

    if (isSuccess) {
      // TODO: Update order status in database
      // await db.orders.update({
      //   where: { OrderNumber: query.vnp_TxnRef },
      //   data: { PaymentStatus: "paid", Status: "confirmed" },
      // });

      console.log("[VNPay Callback] Payment success:", query.vnp_TxnRef);
      return NextResponse.redirect(
        new URL(`/payment/result?status=success&orderId=${query.vnp_TxnRef}`, req.url)
      );
    }

    console.warn("[VNPay Callback] Payment failed:", query.vnp_ResponseCode);
    return NextResponse.redirect(
      new URL(`/payment/result?status=failed&code=${query.vnp_ResponseCode}`, req.url)
    );
  } catch (error) {
    console.error("[VNPay Callback] Error:", error);
    return NextResponse.redirect(
      new URL("/payment/result?status=error", req.url)
    );
  }
}
