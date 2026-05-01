// ----------------------------------------------------------------------
// MoMo Payment Integration
// Docs: https://developers.momo.vn/v3/docs/payment/api/wallet/onetime
// ----------------------------------------------------------------------

import crypto from "crypto";
import type {
  MoMoPaymentRequest,
  MoMoPaymentResponse,
  MoMoIPNPayload,
  PaymentResult,
} from "@/types";

const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE ?? "",
  accessKey: process.env.MOMO_ACCESS_KEY ?? "",
  secretKey: process.env.MOMO_SECRET_KEY ?? "",
  endpoint:
    process.env.MOMO_ENDPOINT ??
    "https://test-payment.momo.vn/v2/gateway/api/create",
};

/**
 * Generate HMAC SHA256 signature for MoMo requests.
 */
function createMoMoSignature(rawData: string): string {
  return crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawData)
    .digest("hex");
}

/**
 * Create a MoMo payment URL.
 * Returns a payUrl that the client should redirect to.
 */
export async function createMoMoPayment(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
}): Promise<PaymentResult> {
  const requestId = `MIRAI_${Date.now()}`;
  const extraData = "";

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${params.amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${params.ipnUrl}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `partnerCode=${MOMO_CONFIG.partnerCode}`,
    `redirectUrl=${params.redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=captureWallet`,
  ].join("&");

  const signature = createMoMoSignature(rawSignature);

  const body: MoMoPaymentRequest = {
    partnerCode: MOMO_CONFIG.partnerCode,
    accessKey: MOMO_CONFIG.accessKey,
    requestId,
    amount: params.amount,
    orderId: params.orderId,
    orderInfo: params.orderInfo,
    redirectUrl: params.redirectUrl,
    ipnUrl: params.ipnUrl,
    requestType: "captureWallet",
    extraData,
    signature,
    lang: "vi",
  };

  try {
    const res = await fetch(MOMO_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as MoMoPaymentResponse;

    if (data.resultCode === 0) {
      return {
        success: true,
        transactionId: data.orderId,
        payUrl: data.payUrl,
        message: data.message,
        rawResponse: data,
      };
    }

    return {
      success: false,
      transactionId: null,
      payUrl: null,
      message: data.message || "MoMo payment creation failed",
      rawResponse: data,
    };
  } catch (error) {
    return {
      success: false,
      transactionId: null,
      payUrl: null,
      message: error instanceof Error ? error.message : "Unknown MoMo error",
    };
  }
}

/**
 * Verify MoMo IPN (Instant Payment Notification) callback signature.
 * Returns true if the signature is valid and payment was successful.
 */
export function verifyMoMoIPN(payload: MoMoIPNPayload): boolean {
  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `message=${payload.message}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `orderType=${payload.orderType}`,
    `partnerCode=${payload.partnerCode}`,
    `payType=${payload.payType}`,
    `requestId=${payload.requestId}`,
    `responseTime=${payload.responseTime}`,
    `resultCode=${payload.resultCode}`,
    `transId=${payload.transId}`,
  ].join("&");

  const expectedSignature = createMoMoSignature(rawSignature);
  return expectedSignature === payload.signature && payload.resultCode === 0;
}
