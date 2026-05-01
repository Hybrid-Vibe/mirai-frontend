// ----------------------------------------------------------------------
// Database Types
// Derived from the provided DB Schema for the MIRAI Frontend.
// Note: These interfaces represent the shapes of data as they might be
// returned by the API (often camelCased or kept as PascalCase based on backend mapper).
// Here we use PascalCase to match the DB schema provided by the user.
// ----------------------------------------------------------------------

export interface Role {
  RoleId: string;
  RoleName: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  UserId: number;
  FullName: string | null;
  Email: string;
  PasswordHash: string; // Likely won't be sent to frontend, but kept for completeness
  Phone: string | null;
  RoleId: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Address {
  AddressId: number;
  UserId: number;
  RecipientName: string | null;
  RecipientPhone: string | null;
  AddressLine: string;
  Ward: string | null;
  District: string | null;
  City: string | null;
  Province: string | null;
  PostalCode: string | null;
  Note: string | null;
  IsDefault: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Category {
  CategoryId: number;
  Name: string;
  Description: string | null;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Product {
  ProductId: number;
  Name: string;
  Description: string | null;
  Price: number;
  CategoryId: number | null;
  BrandId: number | null;
  IsActive: boolean;
  RatingAvg: number;
  RatingCount: number;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface ProductVariant {
  VariantId: number;
  ProductId: number;
  Color: string | null;
  PhoneModel: string | null;
  Price: number;
  CompareAtPrice: number | null;
  CostPrice: number | null;
  Barcode: string | null;
  Stock: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface ProductImage {
  ImageId: number;
  ProductId: number;
  VariantId: number | null;
  ImageUrl: string;
  AltText: string | null;
  IsPrimary: boolean;
  CreatedAt: string;
}

// ⚠️ ARCHITECTURAL GAP:
// MIRAI is a custom phone case platform. The user creates a custom design (prompt, generated image, canvas elements).
// The CartItem and OrderItem currently only link to a `VariantId`.
// They NEED fields to store the custom design data.
// E.g., CustomDesignUrl, CustomPrompt, CustomCanvasJson.

export interface Cart {
  CartId: number;
  UserId: number;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface CartItem {
  CartItemId: number;
  CartId: number;
  VariantId: number;
  Quantity: number;
  UnitPrice: number;
  CreatedAt: string;
  UpdatedAt: string | null;
  // TODO: Add fields for custom design
  // CustomDesignUrl?: string;
  // CustomCanvasData?: string;
}

export interface Order {
  OrderId: number;
  UserId: number;
  OrderNumber: string;
  Subtotal: number;
  DiscountAmount: number;
  ShippingFee: number;
  TaxAmount: number;
  TotalAmount: number;
  Currency: string;
  Status: string;
  PaymentStatus: string;
  Note: string | null;
  CreatedAt: string;
  PlacedAt: string | null;
  UpdatedAt: string | null;
  CancelledAt: string | null;
}

export interface OrderItem {
  OrderItemId: number;
  OrderId: number;
  VariantId: number;
  Quantity: number;
  ProductName: string | null;
  VariantName: string | null;
  Price: number;
  UnitPrice: number;
  DiscountAmount: number | null;
  // TODO: Add fields for custom design
  // CustomDesignUrl?: string;
  // CustomCanvasData?: string;
}

export interface Payment {
  PaymentId: number;
  OrderId: number;
  Method: string;
  Provider: string;
  Status: string;
  Amount: number;
  TransactionId: string | null;
  PaidAt: string | null;
  FailureReason: string | null;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Shipping {
  ShippingId: number;
  OrderId: number;
  AddressId: number;
  ShippingStatus: string;
  Carrier: string | null;
  TrackingCode: string | null;
  ShippingFee: number;
  ShippedAt: string | null;
  DeliveredAt: string | null;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Review {
  ReviewId: number;
  UserId: number;
  ProductId: number;
  VariantId: number | null;
  Rating: number;
  Title: string | null;
  Comment: string | null;
  IsApproved: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}
