// POST /api/shipping/fee — Calculate shipping fee via GHN
// POST /api/shipping (body: { action: "create" | "track", ... }) — Create or track shipment
import { NextRequest, NextResponse } from "next/server";
import {
  calculateShippingFee,
  createShipment,
  trackShipment,
} from "@/lib/shipping";
import type { ShippingFeeRequest, CreateShipmentRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "calculate_fee": {
        const params = body as ShippingFeeRequest & { action: string };
        const result = await calculateShippingFee(params);
        return NextResponse.json(result);
      }

      case "create": {
        const params = body as CreateShipmentRequest & { action: string };
        const result = await createShipment(params);
        return NextResponse.json(result);
      }

      case "track": {
        const { orderCode } = body;
        if (!orderCode) {
          return NextResponse.json(
            { error: "orderCode is required" },
            { status: 400 }
          );
        }
        const result = await trackShipment(orderCode);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: calculate_fee, create, or track" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Shipping error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
