import { NextResponse } from "next/server";
import { getBackendUrl, defaultHeaders } from "@/lib/api";

export async function GET() {
  try {
    // Proxy request to .NET Backend
    const backendUrl = getBackendUrl("/api/phones");

    try {
      const response = await fetch(backendUrl, {
        headers: defaultHeaders,
        // Cache for 1 hour in production, but revalidate frequently
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      console.warn(
        `[API] Backend returned ${response.status} for /api/phones. Falling back to mock data.`,
      );
    } catch (fetchError) {
      console.error("[API] Failed to fetch from backend:", fetchError);
      // Continue to mock data fallback
    }

    // --- FALLBACK MOCK DATA ---
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
      { status: 500 },
    );
  }
}
