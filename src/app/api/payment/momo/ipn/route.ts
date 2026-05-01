// POST /api/payment/momo/ipn — MoMo Instant Payment Notification callback
import { NextRequest, NextResponse } from "next/server";
import { verifyMoMoIPN } from "@/lib/payment-momo";
import type { MoMoIPNPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MoMoIPNPayload;

    const isValid = verifyMoMoIPN(payload);

    if (!isValid) {
      console.warn(
        "[MoMo IPN] Invalid signature or failed payment:",
        payload.orderId,
      );
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 },
      );
    }

    // TODO: Update order status in database
    // await db.orders.update({
    //   where: { OrderNumber: payload.orderId },
    //   data: {
    //     PaymentStatus: "paid",
    //     Status: "confirmed",
    //   },
    // });

    // TODO: Send order confirmation email
    // await sendOrderConfirmationEmail(...)

    console.log(
      "[MoMo IPN] Payment confirmed:",
      payload.orderId,
      "Amount:",
      payload.amount,
    );

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[MoMo IPN] Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
