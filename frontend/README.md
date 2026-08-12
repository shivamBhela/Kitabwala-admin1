# Kitabwalah Admin Portal

Enterprise Admin Portal for managing the Kitabwalah platform. This dashboard serves as the central control room for administrators to oversee orders, users, vendors, products, deliveries, and app settings.

## 🚀 Tech Stack Used

- **Frontend**: [React 19](https://react.dev/) (via Next.js App Router for serving the UI)
- **Backend API**: [NestJS](https://nestjs.com/) (Modular, enterprise-grade REST API server)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) (Accessible headless components)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms & Validation**: React Hook Form + Zod
- **API Client**: Axios (connected to the NestJS backend server)

## ✅ What is Done

The frontend architecture and user interface have been fully built out with mock data to simulate real behavior.

**Core Architecture & UI:**
- Fully responsive layout with a collapsible sidebar and top header.
- Global Dark/Light mode theme support.
- Centralized state management utilizing Zustand (`lib/store.tsx`).
- Unified API client configuration (`lib/axios.ts`) with request/response interceptors and error handling.
- Comprehensive UI components (Tables, Modals, Tabs, Forms, Charts).

**Implemented Admin Sections (Fully Functional with Mock Data):**
- **Dashboard**: High-level metrics, revenue charts, and recent activity.
- **Orders**: View orders, update statuses, and process refunds (wallet/original payment).
- **Products**: Review newly added books, approve/reject listings, and manage inventory.
- **Vendors**: Manage vendor profiles, verify KYC, suspend accounts, and update commission rates.
- **Users**: Search customers, adjust wallet balances, ban/unban users, and view migration statuses.
- **Delivery**: Manage delivery personnel, PIN code serviceability, COD eligibility, and same-day delivery flags.
- **Returns & Withdrawals**: Review and approve/reject return requests and vendor payout withdrawals.
- **Marketing**: Create and toggle coupons, manage homepage banners, and override homepage category pins.
- **Support**: Manage customer support tickets, issue reports, and product reviews.
- **Exams**: Manage competitive exam categories.
- **Settings**: Configure platform-wide business rules (commission rates, delivery charges, return windows).
- **Logs**: View Admin Audit Logs, Push Notifications history, Email logs, and App Migration logs.

## ⏳ What is Left (Pending Integration)

The UI is complete, but the portal currently relies on dummy data (`lib/mockData.ts`). The following tasks remain to make the portal fully operational:

1. **Real API Integration**: 
   - Replace the `mockData.ts` arrays in `store.tsx` with actual `fetch` or `axios` API calls.
   - Connect all the action handlers (e.g., `toggleUserBan`, `approveProduct`, etc.) to send POST/PUT/PATCH requests to the real backend server.
2. **Authentication**: 
   - Implement the actual login flow for admins.
   - Connect the token management in `axios.ts` to the real authentication endpoints.
3. **Third-party Service Integration**:
   - **AWS S3**: Wire up image/banner upload forms to directly upload files to the S3 bucket.
   - **Firebase**: Connect the push notification dispatch action to actually trigger Firebase Cloud Messaging (FCM).
   - **Razorpay**: Connect automated refund/payout actions to Razorpay APIs if applicable.
4. **Environment Variables**:
   - Populate `.env.local` with production/staging API URLs, Firebase credentials, and Razorpay keys.

## 🛠️ Getting Started

First, make sure you are in the project directory (`kitabwalah-admin`), then install the dependencies (if you haven't already):

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
