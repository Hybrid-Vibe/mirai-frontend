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

/** POST /api/User/change-password — Request body */
export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

/** PUT /api/User/update-profile — Request body */
export interface UpdateProfileRequestDto {
  fullName: string;
  phone?: string;
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

/** Address response — maps to Mirai.Domain.Entities.Address */
export interface AddressResponseDto {
  addressId: string;
  userId: string;
  recipientName?: string;
  recipientPhone?: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  note?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
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

/** Brand response — maps to Mirai.Domain.Entities.Brand */
export interface BrandResponseDto {
  brandId: string;
  brandName: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------
// Category DTOs
// ----------------------------------------------------------------------

/** POST /api/Category/Create-Category — Request body */
export interface CategoryDto {
  name: string;
  description?: string;
}

/** Category response — maps to Mirai.Domain.Entities.Category */
export interface CategoryResponseDto {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------
// Product DTOs
// ----------------------------------------------------------------------

/** Product response — GET /api/Product endpoints */
export interface ProductDto {
  productId: string;
  name?: string;
  description?: string;
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
  categoryId?: string;
  brandId?: string;
}

/** Product image request */
export interface ProductImageRequestDto {
  imageUrl?: string;
  isPrimary: boolean;
}

/** Product variant request */
export interface ProductVariantRequestDto {
  color?: string;
  phoneModel?: string;
  price: number;
  imageUrl?: string;
}

/** POST /api/Product/Create-Product-ProductImages-ProductVariants */
export interface CreateProductRequestDto {
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  images: ProductImageRequestDto[];
  variants: ProductVariantRequestDto[];
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

/** Product variant response */
export interface ProductVariantDto {
  variantId: string;
  productId: string;
  color?: string;
  phoneModel?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  barcode?: string;
  stock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Variant summary in filter results */
export interface GetAllProductVariantsByFilterDto {
  variantId?: string;
  color?: string;
  phoneModel?: string;
  price?: number;
  stock?: number;
  flashSalePrice?: number;
  isFlashSale?: boolean;
  flashSaleStartTime?: string;
  flashSaleEndTime?: string;
}

export interface GetFlashSaleProductsDto {
  productId: string;
  productName?: string;
  variantId?: string;
  color?: string;
  phoneModel?: string;
  originalPrice: number;
  flashSalePrice: number;
  stock: number;
  imageUrl?: string;
  startTime: string;
  endTime: string;
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
  status?: number;
  paymentStatus?: number;
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

// ----------------------------------------------------------------------
// Cart DTOs
// ----------------------------------------------------------------------

/** GET /api/CartItem/Get-cart-by-id — Query parameters */
export interface CartSearchFilter {
  userId?: string;
  cartId?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** Cart item response item */
export interface CartItemDto {
  cartItemId?: string;
  variantId?: string;
  productName?: string;
  image?: string;
  price?: number;
  quantity?: number;
  total?: number;
}

/** Cart response */
export interface CartDto {
  cartId?: string;
  items?: CartItemDto[];
  totalPrice: number;
}

/** POST /api/CartItem/Create-cart-items — Request body */
export interface CreateCartDto {
  userId: string;
  variantId: string;
  quantity: number;
}

// ----------------------------------------------------------------------
// AI Image DTOs
// ----------------------------------------------------------------------

/** AI Image Status enum */
export type AIImageStatus = "Pending" | "Processing" | "Completed" | "Failed";

export const AIImageStatusValue = {
  Pending: 1,
  Processing: 2,
  Completed: 3,
  Failed: 4,
} as const;

/** POST /api/ai-images — Request body */
export interface CreateAIImageDto {
  prompt: string;
  negativePrompt?: string;
  style?: string;
  width?: number;
  height?: number;
}

/** AI Image response */
export interface AIImageDto {
  aiImageId: string;
  userId: string;
  prompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  style?: string;
  width?: number;
  height?: number;
  status: AIImageStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

/** PUT /api/ai-images/{id}/status — Request body */
export interface UpdateAIImageStatusDto {
  status: AIImageStatus;
  imageUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

// ----------------------------------------------------------------------
// Admin DTOs & Query Filters
// ----------------------------------------------------------------------

export interface AdminDashboardDto {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  activeProducts: number;
  pendingReviews: number;
  totalPayments: number;
}

export interface AdminRevenueChartPointDto {
  label: string;
  date: string;
  revenue: number;
}

export interface AdminRevenueChartDto {
  period: string;
  data: AdminRevenueChartPointDto[];
}

export interface AdminUserFilter {
  search?: string;
  roleId?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminUpdateUserDto {
  fullName?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface AdminUpdateUserRoleDto {
  roleId: string;
}

export interface AdminUpdateUserStatusDto {
  isActive: boolean;
}

export interface AdminOrderFilter {
  status?: number;
  paymentStatus?: number;
  userId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminOrderListDto {
  orderId: string;
  orderNumber: string;
  userId: string;
  userFullName?: string;
  totalAmount: number;
  status: number;
  paymentStatus: number;
  createdAt: string;
}

export interface AdminOrderDetailDto {
  orderId: string;
  orderNumber: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  totalAmount: number;
  status: number;
  paymentStatus: number;
  note?: string;
  createdAt: string;
  items: OrderItemResponseDto[];
}

export interface AdminPaymentFilter {
  status?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminPaymentDto {
  paymentId: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: string;
  createdAt: string;
}

export interface AdminReviewFilter {
  isApproved?: boolean;
  productId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminReviewDto {
  reviewId: string;
  productId: string;
  productName?: string;
  userId: string;
  userName?: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminShippingFilter {
  orderId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminShippingDto {
  shippingId: string;
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  shippingFee: number;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
}

export interface AdminCreateShippingDto {
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  shippingFee: number;
  estimatedDelivery?: string;
}

export interface AdminUpdateShippingDto {
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  actualDelivery?: string;
}

export interface AdminAIImageFilter {
  status?: string;
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
}
