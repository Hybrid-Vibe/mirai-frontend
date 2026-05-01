// POST /api/payment/vnpay — Create a VNPay payment URL
import { NextRequest, NextResponse } from "next/server";
import { createVNPayPaymentUrl } from "@/lib/payment-vnpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, orderInfo } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "orderId and amount are required" },
        { status: 400 },
      );
    }

    // Get client IP from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddr = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";

    const result = createVNPayPaymentUrl({
      orderId: `MIRAI_${orderId}`,
      amount,
      orderInfo: orderInfo ?? `Thanh toan don hang MIRAI #${orderId}`,
      ipAddr,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 502 });
    }

    return NextResponse.json({
      payUrl: result.payUrl,
      transactionId: result.transactionId,
    });
  } catch (error) {
    console.error("[API] VNPay payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
