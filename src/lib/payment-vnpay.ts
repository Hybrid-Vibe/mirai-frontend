// ----------------------------------------------------------------------
// VNPay Payment Integration
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// ----------------------------------------------------------------------

import crypto from "crypto";
import type { VNPayReturnParams, PaymentResult } from "@/types";

const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE || "8BRVS31I",
  hashSecret:
    process.env.VNPAY_HASH_SECRET || "1H7NSLWCCNWOYV06387QKJ68XAA7IJ2V",
  url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl:
    process.env.VNPAY_RETURN_URL ||
    "http://localhost:3000/api/payment/vnpay/callback",
};

/**
 * Sort object keys alphabetically — required by VNPay signature spec.
 */
function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

/**
 * Format date as VNPay expects: yyyyMMddHHmmss
 */
function formatVNPayDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Create a VNPay payment URL.
 * Amount is in VND — VNPay requires multiplying by 100.
 */
export function createVNPayPaymentUrl(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  locale?: string;
}): PaymentResult {
  try {
    const createDate = formatVNPayDate(new Date());

    const vnpParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNPAY_CONFIG.tmnCode,
      vnp_Locale: params.locale ?? "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: (params.amount * 100).toString(),
      vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
    };

    const sortedParams = sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    sortedParams["vnp_SecureHash"] = signed;

    const payUrl = `${VNPAY_CONFIG.url}?${new URLSearchParams(sortedParams).toString()}`;

    return {
      success: true,
      transactionId: params.orderId,
      payUrl,
      message: "VNPay URL created successfully",
    };
  } catch (error) {
    return {
      success: false,
      transactionId: null,
      payUrl: null,
      message: error instanceof Error ? error.message : "Unknown VNPay error",
    };
  }
}

/**
 * Verify VNPay return URL callback.
 * Returns true if the secure hash is valid and response code is "00" (success).
 */
export function verifyVNPayReturn(query: VNPayReturnParams): {
  isValid: boolean;
  isSuccess: boolean;
} {
  const secureHash = query.vnp_SecureHash;
  const queryParams: Record<string, string> = {};

  // VNPay signature spec requires that we ONLY include parameters starting with "vnp_"
  // and exclude "vnp_SecureHash" and "vnp_SecureHashType".
  for (const key in query) {
    if (
      key.startsWith("vnp_") &&
      key !== "vnp_SecureHash" &&
      key !== "vnp_SecureHashType"
    ) {
      const val = query[key as keyof VNPayReturnParams];
      if (val !== undefined && val !== null && val !== "") {
        queryParams[key] = String(val);
      }
    }
  }

  const sortedParams = sortObject(queryParams);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    isValid: secureHash === signed,
    isSuccess: secureHash === signed && query.vnp_ResponseCode === "00",
  };
}
