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
  // Address
  AddressDto,
  UpdateAddressDto,
  // Brand
  BrandDto,
  // Category
  CategoryDto,
  // Product
  ProductDto,
  CreateProductDto,
  ProductImageDto,
  CreateProductImageDto,
  CreateProductVariantDto,
  ProductSearchFilter,
  GetAllProductsByFilterDto,
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

      if (status === 401) {
        // Token expired or invalid — clear and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          // Don't force redirect — let components handle auth state
          console.warn("[API] Unauthorized (401) — token cleared.");
        }
      }

      if (status === 403) {
        console.warn("[API] Forbidden (403) — insufficient permissions.");
      }

      if (status >= 500) {
        console.error("[API] Server error:", error.response.data);
      }
    } else if (error.request) {
      console.error(
        "[API] Network error — no response received:",
        error.message,
      );
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
  register: async (dto: RegisterUserDto): Promise<string> => {
    const { data } = await apiClient.post<string>("/User/register", dto);
    return data;
  },

  /** GET /api/User/Get-All-Users */
  getAllUsers: async (): Promise<GetUserDto[]> => {
    const { data } = await apiClient.get<GetUserDto[]>("/User/Get-All-Users");
    return data;
  },

  /** GET /api/User/Get-User-By-UserId{userId} */
  getUserById: async (userId: string): Promise<GetUserDto> => {
    const { data } = await apiClient.get<GetUserDto>(
      `/User/Get-User-By-UserId${userId}`,
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
    return data;
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
    return data;
  },
};

// ======================================================================
// API Services — Product Variant
// ======================================================================

export const productVariantApi = {
  /** GET /api/ProductVariant/Get-ProductVariant/{productVariantId} */
  getProductVariantById: async (productVariantId: string) => {
    const { data } = await apiClient.get(
      `/ProductVariant/Get-ProductVariant/${productVariantId}`,
    );
    return data;
  },

  /** POST /api/ProductVariant/Create-ProductVariant */
  createProductVariant: async (dto: CreateProductVariantDto) => {
    const { data } = await apiClient.post(
      "/ProductVariant/Create-ProductVariant",
      dto,
    );
    return data;
  },

  /** PUT /api/ProductVariant/Update-ProductVariant/{productVariantId} */
  updateProductVariant: async (
    productVariantId: string,
    dto: CreateProductVariantDto,
  ) => {
    const { data } = await apiClient.put(
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
  getAllBrands: async () => {
    const { data } = await apiClient.get("/Brand/Get-All-Brands");
    return data;
  },

  /** GET /api/Brand/Get-All-Brands-Active */
  getAllBrandsActive: async () => {
    const { data } = await apiClient.get("/Brand/Get-All-Brands-Active");
    return data;
  },

  /** GET /api/Brand/Get-Brand-By-Id-{brandId} */
  getBrandById: async (brandId: string) => {
    const { data } = await apiClient.get(`/Brand/Get-Brand-By-Id-${brandId}`);
    return data;
  },

  /** GET /api/Brand/Get-Brand-Active-By-Id-{brandId} */
  getBrandActiveById: async (brandId: string) => {
    const { data } = await apiClient.get(
      `/Brand/Get-Brand-Active-By-Id-${brandId}`,
    );
    return data;
  },

  /** POST /api/Brand/Create-Brand */
  createBrand: async (dto: BrandDto) => {
    const { data } = await apiClient.post("/Brand/Create-Brand", dto);
    return data;
  },

  /** PUT /api/Brand/Update-Brand-{brandId} */
  updateBrand: async (brandId: string, dto: BrandDto) => {
    const { data } = await apiClient.put(`/Brand/Update-Brand-${brandId}`, dto);
    return data;
  },

  /** PUT /api/Brand/Delete-Brand-{brandId} (soft delete) */
  deleteBrand: async (brandId: string): Promise<string> => {
    const { data } = await apiClient.put<string>(
      `/Brand/Delete-Brand-${brandId}`,
    );
    return data;
  },
};

// ======================================================================
// API Services — Category
// ======================================================================

export const categoryApi = {
  /** GET /api/Category/Get-All-Categories */
  getAllCategories: async () => {
    const { data } = await apiClient.get("/Category/Get-All-Categories");
    return data;
  },

  /** GET /api/Category/Get-All-Categories-Active */
  getAllCategoriesActive: async () => {
    const { data } = await apiClient.get("/Category/Get-All-Categories-Active");
    return data;
  },

  /** GET /api/Category/Get-Category-By-Id/{id} */
  getCategoryById: async (id: string) => {
    const { data } = await apiClient.get(`/Category/Get-Category-By-Id/${id}`);
    return data;
  },

  /** GET /api/Category/Get-Category-Active-By-Id/{id} */
  getCategoryActiveById: async (id: string) => {
    const { data } = await apiClient.get(
      `/Category/Get-Category-Active-By-Id/${id}`,
    );
    return data;
  },

  /** POST /api/Category/Create-Category */
  createCategory: async (dto: CategoryDto) => {
    const { data } = await apiClient.post("/Category/Create-Category", dto);
    return data;
  },

  /** PUT /api/Category/Update-Category/{id} */
  updateCategory: async (id: string, dto: CategoryDto) => {
    const { data } = await apiClient.put(
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
  getAllAddresses: async () => {
    const { data } = await apiClient.get("/Address/Get-All-Addresses");
    return data;
  },

  /** GET /api/Address/Get-Address-By-AddressId{addressId} */
  getAddressById: async (addressId: string) => {
    const { data } = await apiClient.get(
      `/Address/Get-Address-By-AddressId${addressId}`,
    );
    return data;
  },

  /** GET /api/Address/Get-Address-By-UserId{userId} */
  getAddressByUserId: async (userId: string) => {
    const { data } = await apiClient.get(
      `/Address/Get-Address-By-UserId${userId}`,
    );
    return data;
  },

  /** POST /api/Address/Create-Address */
  createAddress: async (dto: AddressDto) => {
    const { data } = await apiClient.post("/Address/Create-Address", dto);
    return data;
  },

  /** PUT /api/Address/Update-Address{addressId} */
  updateAddress: async (addressId: string, dto: UpdateAddressDto) => {
    const { data } = await apiClient.put(
      `/Address/Update-Address${addressId}`,
      dto,
    );
    return data;
  },
};

// ======================================================================
// API Services — AI Image Generation
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
  ): Promise<GenerateResponse> => {
    // Use a separate axios instance for Next.js internal routes (no /api prefix from backend)
    const { data } = await axios.post<GenerateResponse>(
      "/api/generate",
      request,
      {
        timeout: 60_000, // AI generation can take up to 60s
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data;
  },
};

// ======================================================================
// Export the raw client for advanced usage
// ======================================================================

export default apiClient;
