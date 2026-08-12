/**
 * constants/navigation.ts
 * All 22 admin sections mapped to sidebar nav items.
 * Single source of truth for routes and nav structure.
 */

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  Users,
  Truck,
  MapPin,
  RotateCcw,
  Wallet,
  Tag,
  Image,
  Pin,
  Star,
  HeadphonesIcon,
  AlertCircle,
  GraduationCap,
  Settings,
  FileText,
  Bell,
  ScrollText,
  Mail,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: "pending" | "count";
  description: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Real-time stats, revenue graph, recent orders",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        badge: "count",
        description: "View all orders, update status, process refunds",
      },
      {
        label: "Products",
        href: "/products",
        icon: Package,
        badge: "pending",
        description: "Approve/reject listings, edit products, manage catalogue",
      },
      {
        label: "Vendors",
        href: "/vendors",
        icon: Store,
        badge: "pending",
        description: "KYC verification, commission control, earnings",
      },
      {
        label: "Users",
        href: "/users",
        icon: Users,
        description: "View, ban/unban, wallet management, order history",
      },
      {
        label: "Delivery",
        href: "/delivery",
        icon: Truck,
        description: "Manage delivery persons, assign orders, track shipments",
      },
      {
        label: "Pincodes & Cities",
        href: "/pincodes",
        icon: MapPin,
        description: "COD rules per pincode, delivery zones, same-day eligibility",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Returns",
        href: "/returns",
        icon: RotateCcw,
        badge: "pending",
        description: "Review return requests, approve/reject, initiate refunds",
      },
      {
        label: "Withdrawals",
        href: "/withdrawals",
        icon: Wallet,
        badge: "pending",
        description: "Approve vendor withdrawal requests, mark as paid",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Coupons",
        href: "/coupons",
        icon: Tag,
        description: "Create/edit/deactivate coupons, assign to users",
      },
      {
        label: "Banners",
        href: "/banners",
        icon: Image,
        description: "Add/edit/remove homepage banners, set validity dates",
      },
      {
        label: "Homepage Pins",
        href: "/homepage-pins",
        icon: Pin,
        description: "Pin specific products/categories/banners to display slots",
      },
      {
        label: "Reviews",
        href: "/reviews",
        icon: Star,
        badge: "pending",
        description: "Approve/reject product reviews, manage ratings",
      },
      {
        label: "Competitive Exams",
        href: "/competitive-exams",
        icon: GraduationCap,
        description: "Create exam sections (UPSC/SSC/NEET), link products",
      },
      {
        label: "Static Pages",
        href: "/static-pages",
        icon: FileText,
        description: "Edit About Us, Terms, Privacy Policy, Refund Policy",
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        description: "Send push notifications to users or specific segments",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        label: "Support Tickets",
        href: "/support",
        icon: HeadphonesIcon,
        badge: "count",
        description: "View and resolve customer + vendor support tickets",
      },
      {
        label: "Issue Reports",
        href: "/issues",
        icon: AlertCircle,
        badge: "count",
        description: "View and resolve user-reported platform issues",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "App Settings",
        href: "/settings",
        icon: Settings,
        description: "Platform config: delivery charges, commission, GST",
      },
    ],
  },
  {
    title: "Logs",
    items: [
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: ScrollText,
        description: "Full history of all admin actions with before/after data",
      },
      {
        label: "Email Logs",
        href: "/email-logs",
        icon: Mail,
        description: "View all outgoing emails sent by the platform",
      },
      {
        label: "Migration Logs",
        href: "/migration-logs",
        icon: Database,
        description: "View data migration run history and row counts per table",
      },
    ],
  },
];

// Flat list for quick lookup
export const ALL_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((g) => g.items);

// Route to label map
export const ROUTE_LABELS: Record<string, string> = Object.fromEntries(
  ALL_NAV_ITEMS.map((item) => [item.href, item.label])
);
