import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getBackendUrl, defaultHeaders } from "@/lib/api";
import type { Order } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, paymentMethod, shippingFee } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 },
      );
    }

    // Proxy to .NET Backend
    const backendUrl = getBackendUrl("/api/orders");

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        // Trigger email notification if backend succeeded
        const customerEmail = body.customerEmail ?? "test@example.com";
        sendOrderConfirmationEmail(customerEmail, {
          orderNumber: data.order?.OrderNumber || data.OrderNumber,
          customerName: body.customerName ?? "Khách hàng",
          totalAmount: (
            data.order?.TotalAmount ||
            data.TotalAmount ||
            0
          ).toLocaleString("vi-VN"),
          paymentMethod: paymentMethod ?? "COD",
        }).catch((err) =>
          console.error("[API] Failed to send order email:", err),
        );

        return NextResponse.json(data);
      }

      console.warn(
        `[API] Backend returned ${response.status} for /api/orders. Falling back to mock data.`,
      );
    } catch (fetchError) {
      console.error("[API] Failed to fetch from backend:", fetchError);
    }

    // --- FALLBACK MOCK LOGIC ---
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );
    const totalAmount = subtotal + (shippingFee ?? 30000);

    const mockOrder: Order = {
      OrderId: Date.now(),
      UserId: userId ?? 1,
      OrderNumber: `MIRAI${Math.floor(10000 + Math.random() * 90000)}`,
      Subtotal: subtotal,
      DiscountAmount: 0,
      ShippingFee: shippingFee ?? 30000,
      TaxAmount: 0,
      TotalAmount: totalAmount,
      Currency: "VND",
      Status: "pending",
      PaymentStatus: "pending",
      Note: null,
      CreatedAt: new Date().toISOString(),
      PlacedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      CancelledAt: null,
    };

    console.log("[API] Order created (MOCK):", mockOrder.OrderNumber);

    const customerEmail = body.customerEmail ?? "test@example.com";
    sendOrderConfirmationEmail(customerEmail, {
      orderNumber: mockOrder.OrderNumber,
      customerName: body.customerName ?? "Khách hàng",
      totalAmount: mockOrder.TotalAmount.toLocaleString("vi-VN"),
      paymentMethod: paymentMethod ?? "COD",
    }).catch((err) => console.error("[API] Failed to send order email:", err));

    return NextResponse.json({
      success: true,
      order: mockOrder,
      message: "Order created successfully (Mock)",
    });
  } catch (error) {
    console.error("[API] Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
