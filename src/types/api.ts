// ======================================================================
// MIRAI — Backend API TypeScript Interfaces
// Auto-derived from .NET Backend DTOs, Entities, and Enums
// Base URL: http://localhost:5236/api
// ======================================================================

// ----------------------------------------------------------------------
// Enums (mapped to string unions from C# enums)
// ----------------------------------------------------------------------

/** Order lifecycle status — maps to Mirai.Domain.Enum.OrderStatus */
export type OrderStatus =
  | "Created"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

/** Payment status on an Order — maps to Mirai.Domain.Enum.PaymentStatus */
export type PaymentStatus = "Unpaid" | "Paid" | "Failed" | "Refunded";

/** Payment status within Payment entity — maps to Mirai.Domain.Enum.PaymentStatusInPayment */
export type PaymentStatusInPayment =
  | "Pending"
  | "Succeed"
  | "Failed"
  | "Refunded";

/** User role — maps to Mirai.Domain.Enum.Role */
export type RoleEnum = "Admin" | "Staff" | "Customer";

// Numeric enum values (for when the backend expects integer values)
export const OrderStatusValue = {
  Created: 1,
  Confirmed: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 5,
} as const;

export const PaymentStatusValue = {
  Unpaid: 1,
  Paid: 2,
  Failed: 3,
  Refunded: 4,
} as const;

export const PaymentStatusInPaymentValue = {
  Pending: 1,
  Succeed: 2,
  Failed: 3,
  Refunded: 4,
} as const;

// ----------------------------------------------------------------------
// Auth DTOs
// ----------------------------------------------------------------------

/** POST /api/User/login — Request body */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/** POST /api/User/register — Request body */
export interface RegisterUserDto {
  fullName?: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

/** Login response — contains JWT token and user info */
export interface AuthResponseDto {
  token: string;
  userId: string;
  email: string;
  fullName?: string;
  role: string;
}

// ----------------------------------------------------------------------
// User DTOs
// ----------------------------------------------------------------------

/** GET /api/User/Get-All-Users — Response item */
export interface GetUserDto {
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------
// Address DTOs
// ----------------------------------------------------------------------

/** POST /api/Address/Create-Address — Request body */
export interface AddressDto {
  userId: string;
  recipientName?: string;
  recipientPhone?: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  note?: string;
}

/** PUT /api/Address/Update-Address{id} — Request body */
export interface UpdateAddressDto {
  recipientName?: string;
  recipientPhone?: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  note?: string;
}

// ----------------------------------------------------------------------
// Brand DTOs
// ----------------------------------------------------------------------

/** POST /api/Brand/Create-Brand — Request body */
export interface BrandDto {
  brandName: string;
  description?: string;
}

// ----------------------------------------------------------------------
// Category DTOs
// ----------------------------------------------------------------------

/** POST /api/Category/Create-Category — Request body */
export interface CategoryDto {
  categoryName: string;
  description?: string;
}

// ----------------------------------------------------------------------
// Product DTOs
// ----------------------------------------------------------------------

/** Product response — GET /api/Product endpoints */
export interface ProductDto {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  isActive: boolean;
  ratingAvg?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt?: string;
}

/** POST /api/Product/Create-Product — Request body */
export interface CreateProductDto {
  name: string;
  description?: string;
  price?: number;
  categoryId?: string;
  brandId?: string;
}

/** Product image response */
export interface ProductImageDto {
  imageId?: string;
  imageUrl?: string;
  altText?: string;
}

/** POST /api/ProductImage/Create-ProductImage — Request body */
export interface CreateProductImageDto {
  productId: string;
  variantId?: string;
  imageUrl: string;
  altText?: string;
}

// ----------------------------------------------------------------------
// Product Variant DTOs
// ----------------------------------------------------------------------

/** POST /api/ProductVariant/Create-ProductVariant — Request body */
export interface CreateProductVariantDto {
  productId: string;
  color?: string;
  phoneModel?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
}

/** Variant summary in filter results */
export interface GetAllProductVariantsByFilterDto {
  variantId?: string;
  color?: string;
  phoneModel?: string;
  price?: number;
  stock?: number;
}

// ----------------------------------------------------------------------
// Product Search & Filter
// ----------------------------------------------------------------------

/** GET /api/Product/Get-Products-By-Filter — Query parameters */
export interface ProductSearchFilter {
  productId?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  variantId?: string;
  color?: string;
  phoneModel?: string;
  fromPrice?: number;
  toPrice?: number;
  pageNumber?: number;
  pageSize?: number;
}

/** Product with variants and images — filter response item */
export interface GetAllProductsByFilterDto {
  productId: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  ratingAvg?: number;
  ratingCount: number;
  variants: GetAllProductVariantsByFilterDto[];
  productImages: ProductImageDto[];
}

// ----------------------------------------------------------------------
// Order DTOs
// ----------------------------------------------------------------------

/** POST /api/Order/Create-Order — Order item in request */
export interface OrderItemRequestDto {
  variantId?: string;
  quantity: number;
}

/** POST /api/Order/Create-Order — Request body */
export interface OrderRequestDto {
  userId: string;
  note?: string;
  products: OrderItemRequestDto[];
}

/** Order item in response */
export interface OrderItemResponseDto {
  productName?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  price: number;
}

/** Order response — GET /api/Order endpoints */
export interface OrderResponseDto {
  orderId?: string;
  orderNumber?: string;
  totalAmount: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  items: OrderItemResponseDto[];
}

// ----------------------------------------------------------------------
// Payment DTOs
// ----------------------------------------------------------------------

/** Payment info response */
export interface PaymentDto {
  orderId?: string;
  amount?: number;
  transactionId?: string;
}

/** POST /api/Payment/Create-Payment-Url — Request body (VNPay) */
export interface PaymentInformationModel {
  orderId?: string;
  amount: number;
}

/** POST /api/Payment/Create-Payment-By-COD — Request body */
export interface PaymentByCODDto {
  orderId?: string;
  amount?: number;
}

/** VNPay callback response */
export interface PaymentResponseModel {
  paymentMethod?: string;
  orderDescription?: string;
  orderId?: string;
  amount: number;
  paymentId?: string;
  transactionId?: string;
  success: boolean;
  token?: string;
  vnPayResponseCode?: string;
  message?: string;
}

/** Create payment URL response */
export interface CreatePaymentUrlResponse {
  paymentUrl: string;
}
