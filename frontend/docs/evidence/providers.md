# Context Providers — Kitabwalah Admin Portal

## providers/index.tsx — AppProviders (barrel)

| Property | Value |
|----------|-------|
| File | providers/index.tsx |
| Export | AppProviders |
| Purpose | Single provider wrapper used in app/layout.tsx; composes ThemeProvider and QueryProvider |

## providers/ThemeProvider.tsx

| Property | Value |
|----------|-------|
| File | providers/ThemeProvider.tsx |
| Export | ThemeProvider |
| Package | next-themes |
| Purpose | Provides system/light/dark color mode; sets class on <html>; suppresses hydration warning |
| Attribute | class |
| Default theme | system |

## providers/QueryProvider.tsx

| Property | Value |
|----------|-------|
| File | providers/QueryProvider.tsx |
| Export | QueryProvider |
| Package | @tanstack/react-query |
| Purpose | Wraps app in QueryClientProvider; optionally mounts ReactQueryDevtools in development |
| QueryClient | Imported from lib/queryClient.ts |

## lib/store.tsx — AdminStoreProvider (domain store context)

| Property | Value |
|----------|-------|
| File | lib/store.tsx |
| Export | AdminStoreProvider, useAdminStore |
| Purpose | React Context provider that holds all mock admin state (users, orders, products, etc.) |
| Usage | Wraps AdminMainContent in app/page.tsx |

Total Providers: 4
