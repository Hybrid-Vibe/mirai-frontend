// ----------------------------------------------------------------------
// GHN (Giao Hàng Nhanh) Shipping Integration
// Docs: https://api.ghn.vn/home/docs/detail
// ----------------------------------------------------------------------

import type {
  ShippingFeeRequest,
  ShippingFeeResult,
  CreateShipmentRequest,
  CreateShipmentResult,
  TrackingResult,
  ShippingStatusType,
} from "@/types";

const GHN_CONFIG = {
  token: process.env.GHN_TOKEN ?? "",
  shopId: process.env.GHN_SHOP_ID ?? "",
  baseUrl:
    process.env.GHN_API_URL ??
    "https://dev-online-gateway.ghn.vn/shiip/public-api",
};

/**
 * Common headers for GHN API requests.
 */
function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Token: GHN_CONFIG.token,
    ShopId: GHN_CONFIG.shopId,
  };
}

/**
 * Map GHN status codes to our ShippingStatusType.
 */
function mapGHNStatus(status: string): ShippingStatusType {
  const statusMap: Record<string, ShippingStatusType> = {
    ready_to_pick: "pending",
    picking: "picked_up",
    picked: "picked_up",
    storing: "in_transit",
    transporting: "in_transit",
    sorting: "in_transit",
    delivering: "delivering",
    delivered: "delivered",
    delivery_fail: "delivering",
    return: "returned",
    returning: "returned",
    returned: "returned",
    cancel: "cancelled",
  };
  return statusMap[status] ?? "pending";
}

/**
 * Calculate shipping fee for a given destination and package weight.
 */
export async function calculateShippingFee(
  params: ShippingFeeRequest,
): Promise<ShippingFeeResult> {
  const body = {
    service_type_id: params.serviceTypeId ?? 2, // 2 = standard delivery
    to_district_id: params.toDistrictId,
    to_ward_code: params.toWardCode,
    weight: params.weight,
    length: params.length ?? 20,
    width: params.width ?? 15,
    height: params.height ?? 5,
    insurance_value: params.insuranceValue ?? 0,
  };

  const res = await fetch(`${GHN_CONFIG.baseUrl}/v2/shipping-order/fee`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (json.code !== 200) {
    throw new Error(json.message || "Failed to calculate shipping fee");
  }

  return {
    total: json.data.total,
    serviceFee: json.data.service_fee,
    insuranceFee: json.data.insurance_fee,
    expectedDeliveryDate: json.data.expected_delivery_time ?? "",
  };
}

/**
 * Create a shipment order on GHN.
 */
export async function createShipment(
  params: CreateShipmentRequest,
): Promise<CreateShipmentResult> {
  const body = {
    to_name: params.toName,
    to_phone: params.toPhone,
    to_address: params.toAddress,
    to_ward_code: params.toWardCode,
    to_district_id: params.toDistrictId,
    weight: params.weight,
    length: params.length ?? 20,
    width: params.width ?? 15,
    height: params.height ?? 5,
    service_type_id: 2,
    payment_type_id: params.codAmount ? 2 : 1, // 1 = seller pays, 2 = buyer pays (COD)
    cod_amount: params.codAmount ?? 0,
    note: params.note ?? "",
    required_note: "CHOTHUHANG", // Allow try-on
    items: params.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
    })),
  };

  const res = await fetch(`${GHN_CONFIG.baseUrl}/v2/shipping-order/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (json.code !== 200) {
    throw new Error(json.message || "Failed to create shipment");
  }

  return {
    orderCode: json.data.order_code,
    expectedDeliveryTime: json.data.expected_delivery_time,
    totalFee: json.data.total_fee,
    sortCode: json.data.sort_code,
  };
}

/**
 * Track a shipment order on GHN.
 */
export async function trackShipment(
  orderCode: string,
): Promise<TrackingResult> {
  const res = await fetch(`${GHN_CONFIG.baseUrl}/v2/shipping-order/detail`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ order_code: orderCode }),
  });

  const json = await res.json();

  if (json.code !== 200) {
    throw new Error(json.message || "Failed to track shipment");
  }

  const data = json.data;

  return {
    orderCode: data.order_code,
    status: mapGHNStatus(data.status),
    statusDescription: data.status,
    updatedAt: data.updated_date ?? "",
    logs: (data.log ?? []).map(
      (log: { status: string; updated_date: string }) => ({
        status: log.status,
        description: log.status,
        timestamp: log.updated_date,
      }),
    ),
  };
}

/**
 * Get list of provinces from GHN.
 */
export async function getProvinces(): Promise<
  Array<{ ProvinceID: number; ProvinceName: string }>
> {
  const res = await fetch(`${GHN_CONFIG.baseUrl}/master-data/province`, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await res.json();
  return json.data ?? [];
}

/**
 * Get list of districts by province from GHN.
 */
export async function getDistricts(
  provinceId: number,
): Promise<Array<{ DistrictID: number; DistrictName: string }>> {
  const res = await fetch(`${GHN_CONFIG.baseUrl}/master-data/district`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ province_id: provinceId }),
  });

  const json = await res.json();
  return json.data ?? [];
}

/**
 * Get list of wards by district from GHN.
 */
export async function getWards(
  districtId: number,
): Promise<Array<{ WardCode: string; WardName: string }>> {
  const res = await fetch(`${GHN_CONFIG.baseUrl}/master-data/ward`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ district_id: districtId }),
  });

  const json = await res.json();
  return json.data ?? [];
}
