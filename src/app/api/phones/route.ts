// GET /api/phones — Get supported phone models
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real app, this would be fetched from the Database
    const phones = [
      {
        id: "IPHONE_15_PRO_MAX",
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        basePrice: 250000,
        mockupUrl: "/models/iphone-15-pro-max.png",
      },
      {
        id: "IPHONE_14_PRO_MAX",
        name: "iPhone 14 Pro Max",
        brand: "Apple",
        basePrice: 250000,
        mockupUrl: "/models/iphone-14-pro-max.png",
      },
      {
        id: "SAMSUNG_S24_ULTRA",
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        basePrice: 250000,
        mockupUrl: "/models/samsung-s24-ultra.png",
      },
      {
        id: "OPPO_FIND_X7",
        name: "Oppo Find X7 Ultra",
        brand: "Oppo",
        basePrice: 230000,
        mockupUrl: "/models/oppo-find-x7.png",
      },
    ];

    return NextResponse.json({ success: true, data: phones });
  } catch (error) {
    console.error("[API] Phones fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
