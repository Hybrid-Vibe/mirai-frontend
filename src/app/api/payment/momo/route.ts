// POST /api/payment/momo — Create a MoMo payment
import { NextRequest, NextResponse } from "next/server";
import { createMoMoPayment } from "@/lib/payment-momo";

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const result = await createMoMoPayment({
      orderId: `MIRAI_${orderId}`,
      amount,
      orderInfo: orderInfo ?? `Thanh toán đơn hàng MIRAI #${orderId}`,
      redirectUrl: `${appUrl}/payment/momo/callback`,
      ipnUrl: `${appUrl}/api/payment/momo/ipn`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 502 });
    }

    return NextResponse.json({
      payUrl: result.payUrl,
      transactionId: result.transactionId,
    });
  } catch (error) {
    console.error("[API] MoMo payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
