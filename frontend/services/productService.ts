/**
 * services/productService.ts
 * Axios service for Products API — uses API-native types (numeric IDs from Prisma),
 * not the legacy frontend string-ID mock types from lib/types.ts.
 */
import adminPortalClient from "@/lib/api/adminPortalClient";
import type { ApiResponse } from "@/types/api";

// ---- API-native types (matching the NestJS/Prisma backend) ----

export type ApiProductStatus = "pending_review" | "active" | "inactive" | "rejected";

export interface ApiProductImage {
  id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ApiVendor {
  id: number;
  store_name: string;
}

export interface ApiProduct {
  id: number;
  vendor_id: number;
  vendor?: ApiVendor;
  vendor_name?: string; // not from API, kept for compat
  title: string;
  slug: string;
  regular_price: number;
  sale_price?: number | null;
  gst_rate?: number;
  hsn_code?: string;
  sku: string;
  isbn?: string;
  author?: string;
  stock_quantity: number;
  in_stock: boolean;
  status: ApiProductStatus;
  images: ApiProductImage[];
  city_prices?: Record<string, number>;
  isFeatured?: boolean;
  featuredUntil?: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  status?: ApiProductStatus;
  search?: string;
}

export interface ListProductsResponse {
  data: ApiProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductPayload {
  vendor_id: number;
  title: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  gst_rate?: number;
  hsn_code?: string;
  sku: string;
  isbn?: string;
  author?: string;
  stock_quantity?: number;
  in_stock?: boolean;
}

export interface UpdateProductPayload {
  title?: string;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  in_stock?: boolean;
  sku?: string;
  author?: string;
  [key: string]: unknown;
}

// ---- API calls ----

export async function getProducts(params?: ListProductsParams): Promise<ListProductsResponse> {
  const { data } = await adminPortalClient.get<ApiResponse<ListProductsResponse>>("/products", { params });
  return data.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<ApiProduct> {
  const { data } = await adminPortalClient.post<ApiResponse<ApiProduct>>("/products", payload);
  return data.data;
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<ApiProduct> {
  const { data } = await adminPortalClient.patch<ApiResponse<ApiProduct>>(`/products/${id}`, payload);
  return data.data;
}

export async function approveProduct(id: number): Promise<ApiProduct> {
  const { data } = await adminPortalClient.patch<ApiResponse<ApiProduct>>(`/products/${id}/approve`);
  return data.data;
}

export async function bulkApproveProducts(ids: number[]) {
  const { data } = await adminPortalClient.post(`/products/bulk-approve`, { ids });
  return data;
}

export async function rejectProduct(id: number, rejectionReason: string): Promise<ApiProduct> {
  const { data } = await adminPortalClient.patch<ApiResponse<ApiProduct>>(`/products/${id}/reject`, {
    rejectionReason,
  });
  return data.data;
}

export async function deactivateProduct(id: number): Promise<void> {
  await adminPortalClient.post(`/products/bulk-deactivate`, { ids: [id] });
}

export async function bulkDeactivateProducts(ids: number[]) {
  const { data } = await adminPortalClient.post(`/products/bulk-deactivate`, { ids });
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await adminPortalClient.delete(`/products/${id}`);
}

export async function featureProduct(id: number, days?: number, featuredUntil?: string): Promise<ApiProduct> {
  const payload = days ? { days } : { featuredUntil };
  const { data } = await adminPortalClient.patch<ApiResponse<ApiProduct>>(`/products/${id}/feature`, payload);
  return data.data;
}

export async function unfeatureProduct(id: number): Promise<void> {
  await adminPortalClient.delete(`/products/${id}/feature`);
}

export async function updateCityPrices(id: number, prices: { cityId: number, price: string }[]): Promise<void> {
  await adminPortalClient.put(`/products/${id}/city-prices`, { prices });
}
