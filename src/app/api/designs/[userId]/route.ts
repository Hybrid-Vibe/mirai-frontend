import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, defaultHeaders } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const userId = (await params).userId;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Proxy request to .NET Backend
    const backendUrl = getBackendUrl(`/api/designs/${userId}`);

    try {
      const response = await fetch(backendUrl, {
        headers: defaultHeaders,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      console.warn(
        `[API] Backend returned ${response.status} for /api/designs/${userId}. Falling back to mock data.`,
      );
    } catch (fetchError) {
      console.error("[API] Failed to fetch from backend:", fetchError);
    }

    // --- FALLBACK MOCK DATA ---
    const mockDesigns = [
      {
        id: "design-1",
        userId: userId,
        imageUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        prompt: "Y2K aesthetic phone case, pastel colors",
        phoneModel: "IPHONE_15_PRO_MAX",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "design-2",
        userId: userId,
        imageUrl:
          "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop",
        prompt: "Cyberpunk neon cat riding a skateboard",
        phoneModel: "SAMSUNG_S24_ULTRA",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return NextResponse.json({ success: true, data: mockDesigns });
  } catch (error) {
    console.error("[API] Fetch user designs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
