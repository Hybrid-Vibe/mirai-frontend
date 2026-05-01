// GET /api/shipping/address — Get provinces, districts, wards from GHN
import { NextRequest, NextResponse } from "next/server";
import { getProvinces, getDistricts, getWards } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");
    const id = req.nextUrl.searchParams.get("id");

    switch (type) {
      case "provinces": {
        const provinces = await getProvinces();
        return NextResponse.json(provinces);
      }

      case "districts": {
        if (!id) {
          return NextResponse.json(
            { error: "id (provinceId) is required" },
            { status: 400 }
          );
        }
        const districts = await getDistricts(parseInt(id, 10));
        return NextResponse.json(districts);
      }

      case "wards": {
        if (!id) {
          return NextResponse.json(
            { error: "id (districtId) is required" },
            { status: 400 }
          );
        }
        const wards = await getWards(parseInt(id, 10));
        return NextResponse.json(wards);
      }

      default:
        return NextResponse.json(
          { error: "Invalid type. Use: provinces, districts, or wards" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Address lookup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
