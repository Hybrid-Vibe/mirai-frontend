// ----------------------------------------------------------------------
// Payment, Shipping & Email Types
// Types for third-party integrations: MoMo, VNPay, GHN, Resend
// ----------------------------------------------------------------------

// ========================
// Payment — Common
// ========================

export type PaymentMethod = "momo" | "vnpay" | "cod";

export type PaymentStatusType =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export interface PaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  returnUrl: string;
  notifyUrl: string;
  orderInfo?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  payUrl: string | null;
  message: string;
  rawResponse?: unknown;
}

// ========================
// Payment — MoMo
// ========================

export interface MoMoPaymentRequest {
  partnerCode: string;
  accessKey: string;
  requestId: string;
  amount: number;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  requestType: "payWithATM" | "captureWallet";
  extraData: string;
  signature: string;
  lang?: "vi" | "en";
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
}

export interface MoMoIPNPayload {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

// ========================
// Payment — VNPay
// ========================

export interface VNPayParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_Locale: string;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
  vnp_CreateDate: string;
  vnp_SecureHash?: string;
}

export interface VNPayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

// ========================
// Shipping — GHN
// ========================

export type ShippingStatusType =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "delivering"
  | "delivered"
  | "returned"
  | "cancelled";

export interface ShippingFeeRequest {
  toDistrictId: number;
  toWardCode: string;
  weight: number; // gram
  length?: number; // cm
  width?: number;
  height?: number;
  serviceTypeId?: number;
  insuranceValue?: number;
}

export interface ShippingFeeResult {
  total: number;
  serviceFee: number;
  insuranceFee: number;
  expectedDeliveryDate: string;
}

export interface CreateShipmentRequest {
  orderId: number;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode: string;
  toDistrictId: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  codAmount?: number;
  note?: string;
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
  }>;
}

export interface CreateShipmentResult {
  orderCode: string;
  expectedDeliveryTime: string;
  totalFee: number;
  sortCode: string;
}

export interface TrackingResult {
  orderCode: string;
  status: ShippingStatusType;
  statusDescription: string;
  updatedAt: string;
  logs: Array<{
    status: string;
    description: string;
    timestamp: string;
  }>;
}

// ========================
// Email — Resend
// ========================

export type EmailTemplateType =
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "welcome"
  | "password_reset";

export interface SendEmailRequest {
  to: string;
  subject: string;
  template: EmailTemplateType;
  data: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
}
