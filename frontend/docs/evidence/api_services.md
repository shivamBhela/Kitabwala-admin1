# API Services — Kitabwalah Admin Portal

> The portal is currently built with **mock data** (no live backend). The following files form the API layer.

## API Client (lib/axios.ts)

| Item | Detail |
|------|--------|
| File | lib/axios.ts |
| Purpose | Preconfigured Axios instance with base URL, request/response interceptors, auth header injection, and error normalization |
| Base URL | process.env.NEXT_PUBLIC_API_URL (from .env.local) |
| Auth | Bearer token via Authorization header |
| Error handling | Interceptor normalizes API errors to a standard shape |

## Mock Data Layer (lib/mockData.ts)

| Item | Detail |
|------|--------|
| File | lib/mockData.ts |
| Purpose | Realistic seed data for all 22 admin sections (46+ domain entities) |
| Coverage | Users, Vendors, Products, Orders, DeliveryPersons, Shipments, ReturnRequests, WithdrawalRequests, Coupons, Banners, HomepagePins, Reviews, SupportTickets, IssueReports, Notifications, AuditLogs, EmailLogs, MigrationLogs, Cities, Pincodes, ExamCategories, StaticPages |

## React Query Client (lib/queryClient.ts)

| Item | Detail |
|------|--------|
| File | lib/queryClient.ts |
| Purpose | TanStack Query client configuration — staleTime, retry policy, error handler |

## Types / API Contracts (types/api.ts)

| Item | Detail |
|------|--------|
| File | types/api.ts |
| Purpose | TypeScript interfaces for API request payloads and response envelopes |
| Exports | ApiResponse<T>, PaginatedResponse<T>, ApiError, LoginRequest, LoginResponse |

> Note: Production integration would replace lib/mockData.ts with real API calls through lib/axios.ts using TanStack Query hooks.
