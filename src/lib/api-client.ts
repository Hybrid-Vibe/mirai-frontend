// ======================================================================
// MIRAI — Centralized Axios API Client
// Connects to .NET Backend at http://localhost:5236/api
// and Next.js internal API routes at /api/*
// ======================================================================

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  // Auth
  LoginRequestDto,
  RegisterUserDto,
  AuthResponseDto,
  GetUserDto,
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
  // Address
  AddressDto,
  UpdateAddressDto,
  AddressResponseDto,
  // Brand
  BrandDto,
  BrandResponseDto,
  // Category
  CategoryDto,
  CategoryResponseDto,
  // Product
  ProductDto,
  CreateProductDto,
  ProductImageDto,
  CreateProductImageDto,
  CreateProductVariantDto,
  ProductSearchFilter,
  GetAllProductsByFilterDto,
  GetFlashSaleProductsDto,
  // Order
  OrderRequestDto,
  OrderResponseDto,
  OrderStatus,
  PaymentStatus,
  // Payment
  PaymentInformationModel,
  PaymentByCODDto,
  PaymentDto,
  PaymentResponseModel,
  PaymentStatusInPayment,
  CreatePaymentUrlResponse,
  // Cart
  CartDto,
  CreateCartDto,
  CartSearchFilter,
  // Product Variant
  ProductVariantDto,
  // New Product Features
  CreateProductRequestDto,
  // AI Image
  CreateAIImageDto,
  AIImageDto,
  UpdateAIImageStatusDto,
  // Admin
  AdminDashboardDto,
  AdminRevenueChartDto,
  AdminUserFilter,
  AdminUpdateUserDto,
  AdminUpdateUserRoleDto,
  AdminUpdateUserStatusDto,
  AdminOrderFilter,
  AdminOrderListDto,
  AdminOrderDetailDto,
  AdminPaymentFilter,
  AdminPaymentDto,
  AdminReviewFilter,
  AdminReviewDto,
  AdminShippingFilter,
  AdminShippingDto,
  AdminCreateShippingDto,
  AdminUpdateShippingDto,
  AdminAIImageFilter,
} from "@/types/api";
import type { GenerateRequest, GenerateResponse } from "@/types/ai";

// ======================================================================
// Constants
// ======================================================================

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5236";

const TOKEN_KEY = "mirai_auth_token";

// ======================================================================
// Axios Instance — .NET Backend
// ======================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor — Auto-attach Bearer token
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get token from localStorage (set after login/OAuth)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response Interceptor — Centralized error handling
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 401) {
        // Token expired or invalid — clear and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          console.warn("[API] Unauthorized (401) — token cleared.");
        }
      }

      if (status === 403) {
        console.warn("[API] Forbidden (403) — insufficient permissions.");
      }

      if (status >= 500) {
        // Improved logging for server errors
        console.group("[API] Server Error (500+)");
        console.error("Status:", status);
        console.error("URL:", error.config?.url);
        console.error(
          "Response Data:",
          responseData || "No data received from server",
        );
        if (
          typeof responseData === "string" &&
          responseData.includes("ConnectionString")
        ) {
          console.error(
            "HINT: Backend Database ConnectionString is likely not configured.",
          );
        }
        console.groupEnd();
      }
    } else if (error.request) {
      console.warn(
        "[API] Network error — no response received:",
        error.message,
      );
    } else {
      console.warn("[API] Request configuration error:", error.message);
    }

    return Promise.reject(error);
  },
);

// ======================================================================
// Token Management Utilities
// ======================================================================

/** Store auth token (call after successful login) */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Clear stored auth token (call on logout) */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Get the currently stored auth token */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/** Safely normalizes list arrays from backend that might be PagedResult or reference-looped ($values) */
export function normalizeArray<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const items = obj.items || obj.Items || obj.values || obj.$values;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

// ======================================================================
// API Services — User / Auth
// ======================================================================

export const userApi = {
  /** POST /api/User/login */
  login: async (dto: LoginRequestDto): Promise<AuthResponseDto> => {
    const { data } = await apiClient.post<AuthResponseDto>("/User/login", dto);
    // Auto-store token on successful login
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /** POST /api/User/register */
  register: async (
    dto: RegisterUserDto,
    turnstileToken?: string,
  ): Promise<string> => {
    const config = turnstileToken
      ? { headers: { "X-Turnstile-Token": turnstileToken } }
      : undefined;
    const { data } = await apiClient.post<string>(
      "/User/register",
      dto,
      config,
    );
    return data;
  },

  /** GET /api/User/Get-All-Users */
  getAllUsers: async (): Promise<GetUserDto[]> => {
    const { data } = await apiClient.get<GetUserDto[]>("/User/Get-All-Users");
    return normalizeArray<GetUserDto>(data);
  },

  /** GET /api/User/Get-User-By-UserId/{userId} */
  getUserById: async (userId: string): Promise<GetUserDto> => {
    const { data } = await apiClient.get<GetUserDto>(
      `/User/Get-User-By-UserId/${userId}`,
    );
    return data;
  },

  /** POST /api/User/logout */
  logout: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/User/logout");
    clearAuthToken();
    return data;
  },

  /** POST /api/User/login-user-by-supabase */
  syncUser: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      "/User/login-user-by-supabase",
    );
    return data;
  },

  /** PUT /api/User/Change-Password/{userId} */
  changePassword: async (
    userId: string,
    dto: ChangePasswordRequestDto,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.put<{ message: string }>(
      `/User/Change-Password/${userId}`,
      dto,
    );
    return data;
  },

  /** PUT /api/User/Update-Profile/{userId} */
  updateProfile: async (
    userId: string,
    dto: UpdateProfileRequestDto,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.put<{ message: string }>(
      `/User/Update-Profile/${userId}`,
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — Product
// ======================================================================

export const productApi = {
  /** GET /api/Product/Get-All-Products */
  getAllProducts: async (): Promise<ProductDto[]> => {
    const { data } = await apiClient.get<ProductDto[]>(
      "/Product/Get-All-Products",
    );
    return normalizeArray<ProductDto>(data);
  },

  /** GET /api/Product/Get-Product-By-Id/{productId} */
  getProductById: async (productId: string): Promise<ProductDto> => {
    const { data } = await apiClient.get<ProductDto>(
      `/Product/Get-Product-By-Id/${productId}`,
    );
    return data;
  },

  /** POST /api/Product/Create-Product */
  createProduct: async (dto: CreateProductDto): Promise<ProductDto> => {
    const { data } = await apiClient.post<ProductDto>(
      "/Product/Create-Product",
      dto,
    );
    return data;
  },

  /** POST /api/Product/Create-Product-ProductImages-ProductVariants */
  createAllProducts: async (dto: CreateProductRequestDto): Promise<string> => {
    const { data } = await apiClient.post<string>(
      "/Product/Create-Product-ProductImages-ProductVariants",
      dto,
    );
    return data;
  },

  /** PUT /api/Product/Update-Product/{productId} */
  updateProduct: async (
    productId: string,
    dto: CreateProductDto,
  ): Promise<ProductDto> => {
    const { data } = await apiClient.put<ProductDto>(
      `/Product/Update-Product/${productId}`,
      dto,
    );
    return data;
  },

  /** GET /api/Product/Get-Products-By-Filter */
  getProductsByFilter: async (
    filter: ProductSearchFilter,
  ): Promise<GetAllProductsByFilterDto[]> => {
    const { data } = await apiClient.get<GetAllProductsByFilterDto[]>(
      "/Product/Get-Products-By-Filter",
      { params: filter },
    );
    return normalizeArray<GetAllProductsByFilterDto>(data);
  },

  /** GET /api/Product/Flash-Sale-Products */
  getFlashSaleProducts: async (): Promise<GetFlashSaleProductsDto[]> => {
    const { data } = await apiClient.get<GetFlashSaleProductsDto[]>(
      "/Product/Flash-Sale-Products",
    );
    return normalizeArray<GetFlashSaleProductsDto>(data);
  },
};

// ======================================================================
// API Services — Product Variant
// ======================================================================

export const productVariantApi = {
  /** GET /api/ProductVariant/Get-ProductVariant/{productVariantId} */
  getProductVariantById: async (
    productVariantId: string,
  ): Promise<ProductVariantDto> => {
    const { data } = await apiClient.get<ProductVariantDto>(
      `/ProductVariant/Get-ProductVariant/${productVariantId}`,
    );
    return data;
  },

  /** POST /api/ProductVariant/Create-ProductVariant */
  createProductVariant: async (
    dto: CreateProductVariantDto,
  ): Promise<ProductVariantDto> => {
    const { data } = await apiClient.post<ProductVariantDto>(
      "/ProductVariant/Create-ProductVariant",
      dto,
    );
    return data;
  },

  /** PUT /api/ProductVariant/Update-ProductVariant/{productVariantId} */
  updateProductVariant: async (
    productVariantId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariantDto> => {
    const { data } = await apiClient.put<ProductVariantDto>(
      `/ProductVariant/Update-ProductVariant/${productVariantId}`,
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — Product Image
// ======================================================================

export const productImageApi = {
  /** GET /api/ProductImage/Get-ProductImageById/{id} */
  getProductImageById: async (id: string): Promise<ProductImageDto> => {
    const { data } = await apiClient.get<ProductImageDto>(
      `/ProductImage/Get-ProductImageById/${id}`,
    );
    return data;
  },

  /** POST /api/ProductImage/Create-ProductImage */
  createProductImage: async (
    dto: CreateProductImageDto,
  ): Promise<ProductImageDto> => {
    const { data } = await apiClient.post<ProductImageDto>(
      "/ProductImage/Create-ProductImage",
      dto,
    );
    return data;
  },

  /** PUT /api/ProductImage/Update-ProductImage/{id} */
  updateProductImage: async (
    id: string,
    dto: CreateProductImageDto,
  ): Promise<ProductImageDto> => {
    const { data } = await apiClient.put<ProductImageDto>(
      `/ProductImage/Update-ProductImage/${id}`,
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — Order
// ======================================================================

export const orderApi = {
  /** POST /api/Order/Create-Order */
  createOrder: async (dto: OrderRequestDto): Promise<OrderResponseDto> => {
    const { data } = await apiClient.post<OrderResponseDto>(
      "/Order/Create-Order",
      dto,
    );
    return data;
  },

  /** GET /api/Order/Get-Order-By/{id} */
  getOrderById: async (id: string): Promise<OrderResponseDto> => {
    const { data } = await apiClient.get<OrderResponseDto>(
      `/Order/Get-Order-By/${id}`,
    );
    return data;
  },

  /** GET /api/Order/Orders-History-By-User/{userId} */
  getOrdersByUserId: async (userId: string): Promise<OrderResponseDto[]> => {
    const { data } = await apiClient.get<OrderResponseDto[]>(
      `/Order/Orders-History-By-User/${userId}`,
    );
    return normalizeArray<OrderResponseDto>(data);
  },

  /** PUT /api/Order/Update-Order-Status/{id} */
  updateOrderStatus: async (
    id: string,
    newStatus: OrderStatus,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Order/Update-Order-Status/${id}`,
      JSON.stringify(newStatus),
    );
    return data;
  },

  /** PUT /api/Order/Update-Payment-Status/{id} */
  updatePaymentStatus: async (
    id: string,
    newStatus: PaymentStatus,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Order/Update-Payment-Status/${id}`,
      JSON.stringify(newStatus),
    );
    return data;
  },
};

// ======================================================================
// API Services — Payment
// ======================================================================

export const paymentApi = {
  /** POST /api/Payment/Create-Payment-Url (VNPay) */
  createPaymentUrl: async (
    model: PaymentInformationModel,
  ): Promise<CreatePaymentUrlResponse> => {
    const { data } = await apiClient.post<CreatePaymentUrlResponse>(
      "/Payment/Create-Payment-Url",
      model,
    );
    return data;
  },

  /** GET /api/Payment/Callback (VNPay callback) */
  paymentCallback: async (): Promise<PaymentResponseModel> => {
    const { data } =
      await apiClient.get<PaymentResponseModel>("/Payment/Callback");
    return data;
  },

  /** GET /api/Payment/Get-Payment-By-Id/{id} */
  getPaymentById: async (id: string): Promise<PaymentDto> => {
    const { data } = await apiClient.get<PaymentDto>(
      `/Payment/Get-Payment-By-Id/${id}`,
    );
    return data;
  },

  /** PUT /api/Payment/Update-Payment-Status/{id} */
  updatePaymentStatus: async (
    id: string,
    newStatus: PaymentStatusInPayment,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Payment/Update-Payment-Status/${id}`,
      JSON.stringify(newStatus),
    );
    return data;
  },

  /** POST /api/Payment/Create-Payment-By-COD */
  createPaymentByCOD: async (dto: PaymentByCODDto): Promise<PaymentDto> => {
    const { data } = await apiClient.post<PaymentDto>(
      "/Payment/Create-Payment-By-COD",
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — Brand
// ======================================================================

export const brandApi = {
  /** GET /api/Brand/Get-All-Brands */
  getAllBrands: async (): Promise<BrandResponseDto[]> => {
    const { data } = await apiClient.get<BrandResponseDto[]>(
      "/Brand/Get-All-Brands",
    );
    return data;
  },

  /** GET /api/Brand/Get-All-Brands-Active */
  getAllBrandsActive: async (): Promise<BrandResponseDto[]> => {
    const { data } = await apiClient.get<BrandResponseDto[]>(
      "/Brand/Get-All-Brands-Active",
    );
    return data;
  },

  /** GET /api/Brand/Get-Brand-By-Id/{brandId} */
  getBrandById: async (brandId: string): Promise<BrandResponseDto> => {
    const { data } = await apiClient.get<BrandResponseDto>(
      `/Brand/Get-Brand-By-Id/${brandId}`,
    );
    return data;
  },

  /** GET /api/Brand/Get-Brand-Active-By-Id/{brandId} */
  getBrandActiveById: async (brandId: string): Promise<BrandResponseDto> => {
    const { data } = await apiClient.get<BrandResponseDto>(
      `/Brand/Get-Brand-Active-By-Id/${brandId}`,
    );
    return data;
  },

  /** POST /api/Brand/Create-Brand */
  createBrand: async (dto: BrandDto): Promise<BrandResponseDto> => {
    const { data } = await apiClient.post<BrandResponseDto>(
      "/Brand/Create-Brand",
      dto,
    );
    return data;
  },

  /** PUT /api/Brand/Update-Brand/{brandId} */
  updateBrand: async (
    brandId: string,
    dto: BrandDto,
  ): Promise<BrandResponseDto> => {
    const { data } = await apiClient.put<BrandResponseDto>(
      `/Brand/Update-Brand/${brandId}`,
      dto,
    );
    return data;
  },

  /** PUT /api/Brand/Delete-Brand/{brandId} (soft delete) */
  deleteBrand: async (brandId: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Brand/Delete-Brand/${brandId}`,
    );
    return data;
  },
};

// ======================================================================
// API Services — Category
// ======================================================================

export const categoryApi = {
  /** GET /api/Category/Get-All-Categories */
  getAllCategories: async (): Promise<CategoryResponseDto[]> => {
    const { data } = await apiClient.get<CategoryResponseDto[]>(
      "/Category/Get-All-Categories",
    );
    return normalizeArray<CategoryResponseDto>(data);
  },

  /** GET /api/Category/Get-All-Categories-Active */
  getAllCategoriesActive: async (): Promise<CategoryResponseDto[]> => {
    const { data } = await apiClient.get<CategoryResponseDto[]>(
      "/Category/Get-All-Categories-Active",
    );
    return normalizeArray<CategoryResponseDto>(data);
  },

  /** GET /api/Category/Get-Category-By-Id/{id} */
  getCategoryById: async (id: string): Promise<CategoryResponseDto> => {
    const { data } = await apiClient.get<CategoryResponseDto>(
      `/Category/Get-Category-By-Id/${id}`,
    );
    return data;
  },

  /** GET /api/Category/Get-Category-Active-By-Id/{id} */
  getCategoryActiveById: async (id: string): Promise<CategoryResponseDto> => {
    const { data } = await apiClient.get<CategoryResponseDto>(
      `/Category/Get-Category-Active-By-Id/${id}`,
    );
    return data;
  },

  /** POST /api/Category/Create-Category */
  createCategory: async (dto: CategoryDto): Promise<CategoryResponseDto> => {
    const { data } = await apiClient.post<CategoryResponseDto>(
      "/Category/Create-Category",
      dto,
    );
    return data;
  },

  /** PUT /api/Category/Update-Category/{id} */
  updateCategory: async (
    id: string,
    dto: CategoryDto,
  ): Promise<CategoryResponseDto> => {
    const { data } = await apiClient.put<CategoryResponseDto>(
      `/Category/Update-Category/${id}`,
      dto,
    );
    return data;
  },

  /** PUT /api/Category/Delete-Category/{id} (soft delete) */
  deleteCategory: async (id: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Category/Delete-Category/${id}`,
    );
    return data;
  },
};

// ======================================================================
// API Services — Address
// ======================================================================

export const addressApi = {
  /** GET /api/Address/Get-All-Addresses */
  getAllAddresses: async (): Promise<AddressResponseDto[]> => {
    const { data } = await apiClient.get<AddressResponseDto[]>(
      "/Address/Get-All-Addresses",
    );
    return data;
  },

  /** GET /api/Address/Get-Address-By-AddressId/{addressId} */
  getAddressById: async (addressId: string): Promise<AddressResponseDto> => {
    const { data } = await apiClient.get<AddressResponseDto>(
      `/Address/Get-Address-By-AddressId/${addressId}`,
    );
    return data;
  },

  /** GET /api/Address/Get-Address-By-UserId/{userId} */
  getAddressByUserId: async (userId: string): Promise<AddressResponseDto[]> => {
    const { data } = await apiClient.get<AddressResponseDto[]>(
      `/Address/Get-Address-By-UserId/${userId}`,
    );
    return data;
  },

  /** POST /api/Address/Create-Address */
  createAddress: async (dto: AddressDto): Promise<AddressResponseDto> => {
    const { data } = await apiClient.post<AddressResponseDto>(
      "/Address/Create-Address",
      dto,
    );
    return data;
  },

  /** PUT /api/Address/Update-Address/{addressId} */
  updateAddress: async (
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> => {
    const { data } = await apiClient.put<AddressResponseDto>(
      `/Address/Update-Address/${addressId}`,
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — Cart
// ======================================================================

export const cartApi = {
  /** POST /api/CartItem/Create-cart-items */
  createCartItem: async (dto: CreateCartDto): Promise<CartDto> => {
    const { data } = await apiClient.post<CartDto>(
      "/CartItem/Create-cart-items",
      dto,
    );
    return data;
  },

  /** POST /api/CartItem/Checkout-from-cart/{userId} */
  checkoutFromCart: async (userId: string): Promise<OrderResponseDto> => {
    const { data } = await apiClient.post<OrderResponseDto>(
      `/CartItem/Checkout-from-cart/${userId}`,
    );
    return data;
  },

  /** GET /api/CartItem/Get-cart-by-id */
  getCartById: async (filter: CartSearchFilter): Promise<CartDto> => {
    const { data } = await apiClient.get<CartDto>("/CartItem/Get-cart-by-id", {
      params: filter,
    });
    return data;
  },

  /** DELETE /api/CartItem/Delete-cart-item/{cartItemId} */
  deleteCartItem: async (cartItemId: string): Promise<void> => {
    await apiClient.delete(`/CartItem/Delete-cart-item/${cartItemId}`);
  },
};

// ======================================================================
// API Services — AI Image (Backend)
// ======================================================================

export const aiImageApi = {
  /** POST /api/ai-images */
  createAIImage: async (
    dto: CreateAIImageDto,
    turnstileToken?: string,
  ): Promise<AIImageDto> => {
    const config = turnstileToken
      ? { headers: { "X-Turnstile-Token": turnstileToken } }
      : undefined;
    const { data } = await apiClient.post<AIImageDto>(
      "/ai-images",
      dto,
      config,
    );
    return data;
  },

  /** GET /api/ai-images/{id} */
  getAIImageById: async (id: string): Promise<AIImageDto> => {
    const { data } = await apiClient.get<AIImageDto>(`/ai-images/${id}`);
    return data;
  },

  /** GET /api/ai-images/user */
  getUserAIImages: async (): Promise<AIImageDto[]> => {
    const { data } = await apiClient.get<AIImageDto[]>("/ai-images/user");
    return data;
  },

  /** PUT /api/ai-images/{id}/status */
  updateAIImageStatus: async (
    id: string,
    dto: UpdateAIImageStatusDto,
  ): Promise<AIImageDto> => {
    const { data } = await apiClient.put<AIImageDto>(
      `/ai-images/${id}/status`,
      dto,
    );
    return data;
  },

  /** DELETE /api/ai-images/{id} */
  deleteAIImage: async (id: string): Promise<void> => {
    await apiClient.delete(`/ai-images/${id}`);
  },
};

// ======================================================================
// API Services — AI Image Generation (Next.js Internal)
// Calls Next.js internal API route (NOT the .NET backend directly)
// because Gemini API key is a server-side secret
// ======================================================================

export const aiApi = {
  /**
   * POST /api/generate — Generate 3 AI phone case design variants.
   *
   * Sends prompt to Next.js server route which:
   * 1. Enhances Vietnamese prompt → professional English prompt (Gemini text)
   * 2. Generates 3 design variants in parallel (Gemini image)
   * 3. Returns base64 data URLs for each design
   *
   * @param request - { prompt, phoneModel, style? }
   * @returns { designs: GeneratedDesign[], durationMs: number }
   */
  generateImage: async (
    request: GenerateRequest,
    turnstileToken?: string,
  ): Promise<GenerateResponse> => {
    // Use a separate axios instance for Next.js internal routes (no /api prefix from backend)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (turnstileToken) {
      headers["X-Turnstile-Token"] = turnstileToken;
    }

    const { data } = await axios.post<GenerateResponse>(
      "/api/generate",
      request,
      {
        timeout: 60_000, // AI generation can take up to 60s
        headers,
      },
    );
    return data;
  },
};

// ======================================================================
// API Services — Admin Management
// ======================================================================

export const adminApi = {
  /** GET /api/admin/dashboard/summary */
  getDashboardSummary: async (): Promise<AdminDashboardDto> => {
    const { data } = await apiClient.get<AdminDashboardDto>(
      "/admin/dashboard/summary",
    );
    return data;
  },

  /** GET /api/admin/dashboard/revenue-chart */
  getRevenueChart: async (
    period: string = "week",
  ): Promise<AdminRevenueChartDto> => {
    const { data } = await apiClient.get<AdminRevenueChartDto>(
      "/admin/dashboard/revenue-chart",
      {
        params: { period },
      },
    );
    return data;
  },

  /** GET /api/admin/users */
  getUsers: async (filter: AdminUserFilter): Promise<GetUserDto[]> => {
    const { data } = await apiClient.get<GetUserDto[]>("/admin/users", {
      params: filter,
    });
    return normalizeArray<GetUserDto>(data);
  },

  /** GET /api/admin/users/{userId} */
  getUserById: async (userId: string): Promise<GetUserDto> => {
    const { data } = await apiClient.get<GetUserDto>(`/admin/users/${userId}`);
    return data;
  },

  /** PUT /api/admin/users/{userId} */
  updateUser: async (
    userId: string,
    dto: AdminUpdateUserDto,
  ): Promise<GetUserDto> => {
    const { data } = await apiClient.put<GetUserDto>(
      `/admin/users/${userId}`,
      dto,
    );
    return data;
  },

  /** PUT /api/admin/users/{userId}/role */
  updateUserRole: async (
    userId: string,
    dto: AdminUpdateUserRoleDto,
  ): Promise<GetUserDto> => {
    const { data } = await apiClient.put<GetUserDto>(
      `/admin/users/${userId}/role`,
      dto,
    );
    return data;
  },

  /** PUT /api/admin/users/{userId}/status */
  updateUserStatus: async (
    userId: string,
    dto: AdminUpdateUserStatusDto,
  ): Promise<GetUserDto> => {
    const { data } = await apiClient.put<GetUserDto>(
      `/admin/users/${userId}/status`,
      dto,
    );
    return data;
  },

  /** GET /api/admin/orders */
  getOrders: async (filter: AdminOrderFilter): Promise<AdminOrderListDto[]> => {
    const { data } = await apiClient.get<AdminOrderListDto[]>("/admin/orders", {
      params: filter,
    });
    return normalizeArray<AdminOrderListDto>(data);
  },

  /** GET /api/admin/orders/{orderId} */
  getOrderDetail: async (orderId: string): Promise<AdminOrderDetailDto> => {
    const { data } = await apiClient.get<AdminOrderDetailDto>(
      `/admin/orders/${orderId}`,
    );
    return data;
  },

  /** PUT /api/admin/orders/{orderId}/status */
  updateOrderStatus: async (
    orderId: string,
    newStatus: number,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/orders/${orderId}/status`,
      newStatus,
      { headers: { "Content-Type": "application/json" } },
    );
    return data;
  },

  /** PUT /api/admin/orders/{orderId}/payment-status */
  updateOrderPaymentStatus: async (
    orderId: string,
    newStatus: number,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/orders/${orderId}/payment-status`,
      newStatus,
      { headers: { "Content-Type": "application/json" } },
    );
    return data;
  },

  /** GET /api/admin/payments */
  getPayments: async (
    filter: AdminPaymentFilter,
  ): Promise<AdminPaymentDto[]> => {
    const { data } = await apiClient.get<AdminPaymentDto[]>("/admin/payments", {
      params: filter,
    });
    return normalizeArray<AdminPaymentDto>(data);
  },

  /** PUT /api/admin/payments/{paymentId}/status */
  updatePaymentStatus: async (
    paymentId: string,
    newStatus: number,
  ): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/payments/${paymentId}/status`,
      newStatus,
      { headers: { "Content-Type": "application/json" } },
    );
    return data;
  },

  /** GET /api/admin/reviews */
  getReviews: async (filter: AdminReviewFilter): Promise<AdminReviewDto[]> => {
    const { data } = await apiClient.get<AdminReviewDto[]>("/admin/reviews", {
      params: filter,
    });
    return normalizeArray<AdminReviewDto>(data);
  },

  /** PUT /api/admin/reviews/{reviewId}/approve */
  approveReview: async (reviewId: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/reviews/${reviewId}/approve`,
    );
    return data;
  },

  /** DELETE /api/admin/reviews/{reviewId} */
  deleteReview: async (reviewId: string): Promise<string> => {
    const { data } = await apiClient.delete<string>(
      `/admin/reviews/${reviewId}`,
    );
    return data;
  },

  /** GET /api/admin/shippings */
  getShippings: async (
    filter: AdminShippingFilter,
  ): Promise<AdminShippingDto[]> => {
    const { data } = await apiClient.get<AdminShippingDto[]>(
      "/admin/shippings",
      {
        params: filter,
      },
    );
    return normalizeArray<AdminShippingDto>(data);
  },

  /** GET /api/admin/shippings/{shippingId} */
  getShippingById: async (shippingId: string): Promise<AdminShippingDto> => {
    const { data } = await apiClient.get<AdminShippingDto>(
      `/admin/shippings/${shippingId}`,
    );
    return data;
  },

  /** POST /api/admin/shippings */
  createShipping: async (
    dto: AdminCreateShippingDto,
  ): Promise<AdminShippingDto> => {
    const { data } = await apiClient.post<AdminShippingDto>(
      "/admin/shippings",
      dto,
    );
    return data;
  },

  /** PUT /api/admin/shippings/{shippingId} */
  updateShipping: async (
    shippingId: string,
    dto: AdminUpdateShippingDto,
  ): Promise<AdminShippingDto> => {
    const { data } = await apiClient.put<AdminShippingDto>(
      `/admin/shippings/${shippingId}`,
      dto,
    );
    return data;
  },

  /** PUT /api/admin/products/{productId}/deactivate */
  deactivateProduct: async (productId: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/products/${productId}/deactivate`,
    );
    return data;
  },

  /** PUT /api/admin/products/{productId}/activate */
  activateProduct: async (productId: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/admin/products/${productId}/activate`,
    );
    return data;
  },

  /** DELETE /api/admin/products/{productId} */
  deleteProduct: async (productId: string): Promise<string> => {
    const { data } = await apiClient.delete<string>(
      `/admin/products/${productId}`,
    );
    return data;
  },

  /** GET /api/admin/ai-images */
  getAIImages: async (filter: AdminAIImageFilter): Promise<AIImageDto[]> => {
    const { data } = await apiClient.get<AIImageDto[]>("/admin/ai-images", {
      params: filter,
    });
    return normalizeArray<AIImageDto>(data);
  },

  /** PUT /api/admin/ai-images/{aiImageId}/status */
  updateAIImageStatus: async (
    aiImageId: string,
    dto: UpdateAIImageStatusDto,
  ): Promise<AIImageDto> => {
    const { data } = await apiClient.put<AIImageDto>(
      `/admin/ai-images/${aiImageId}/status`,
      dto,
    );
    return data;
  },

  /** DELETE /api/admin/ai-images/{aiImageId} */
  deleteAIImage: async (aiImageId: string): Promise<string> => {
    const { data } = await apiClient.delete<string>(
      `/admin/ai-images/${aiImageId}`,
    );
    return data;
  },
};

// ======================================================================
// Export the raw client for advanced usage
// ======================================================================

export default apiClient;
