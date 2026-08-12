/**
 * api.ts
 * Generic API response types used across all service calls.
 * Strongly typed — no `any` allowed.
 */

// ─── Base Response Shapes ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

// ─── API Error Class ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ─── ID Types ────────────────────────────────────────────────────────────────

export type ResourceId = number;

export interface WithId {
  id: ResourceId;
}

export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface WithWpId {
  wpId?: number | null;
}

// ─── Select Option (for dropdowns) ───────────────────────────────────────────

export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
}

// ─── Table Column Definition ─────────────────────────────────────────────────

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}
