'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User,
  VendorProfile,
  Order,
  DeliveryPerson,
  Shipment,
  ReturnRequest,
  WithdrawalRequest,
  Coupon,
  Banner,
  HomepagePin,
  ProductReview,
  SupportTicket,
  IssueReport,
  CompetitiveExam,
  AppSetting,
  PushNotificationLog,
  AdminActionLog,
  Pincode,
  City,
  Category,
  AdminActionType,
} from './types';


export interface AdminStoreContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Datasets
  users: User[];
  vendors: VendorProfile[];
  categories: Category[];
  orders: Order[];
  deliveryPersons: DeliveryPerson[];
  shipments: Shipment[];
  returnRequests: ReturnRequest[];
  withdrawalRequests: WithdrawalRequest[];
  coupons: Coupon[];
  banners: Banner[];
  homepagePins: HomepagePin[];
  reviews: ProductReview[];
  supportTickets: SupportTicket[];
  issueReports: IssueReport[];
  exams: CompetitiveExam[];
  settings: AppSetting[];
  notifications: PushNotificationLog[];
  auditLogs: AdminActionLog[];
  pincodes: Pincode[];
  cities: City[];
  emailLogs: any[];
  migrationLogs: any[];

  // Actions
  toggleUserBan: (userId: string, reason?: string) => void;
  verifyVendorKyc: (vendorId: string) => void;
  toggleVendorActive: (vendorId: string) => void;
  updateVendorCommission: (vendorId: string, rate: number) => void;
  processOrderRefund: (orderId: string, amount: number, method: 'original_payment' | 'wallet') => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  approveWithdrawal: (requestId: string, reference: string) => void;
  rejectWithdrawal: (requestId: string, note: string) => void;
  updatePincodeCod: (pincodeId: string, codType: Pincode['cod_type']) => void;
  togglePincodeSameDay: (pincodeId: string) => void;
  approveReturnRequest: (returnId: string) => void;
  rejectReturnRequest: (returnId: string, note: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
  editCoupon: (couponId: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCouponActive: (couponId: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  editBanner: (bannerId: string, updates: Partial<Banner>) => void;
  deleteBanner: (bannerId: string) => void;
  toggleBannerActive: (bannerId: string) => void;
  addHomepagePin: (pin: Omit<HomepagePin, 'id' | 'updated_at'>) => void;
  removeHomepagePin: (pinId: string) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  resolveTicket: (ticketId: string, note: string) => void;
  resolveIssue: (issueId: string, note: string) => void;
  updateSetting: (key: string, value: string) => void;
  sendNotification: (notification: Omit<PushNotificationLog, 'id' | 'sent_at' | 'sent_count'>) => void;
  addWalletBalance: (userId: string, amount: number) => void;

  // Static legal pages — session-persistent (not DB-backed yet)
  staticPages: Record<string, string>;
  updateStaticPage: (slug: string, content: string) => void;
}

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [categories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPersons] = useState<DeliveryPerson[]>([]);
  const [shipments] = useState<Shipment[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [homepagePins, setHomepagePins] = useState<HomepagePin[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [exams] = useState<CompetitiveExam[]>([]);
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [notifications, setNotifications] = useState<PushNotificationLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminActionLog[]>([]);
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [cities] = useState<City[]>([]);

  // Static legal / policy pages — keyed by slug
  const DEFAULT_STATIC_PAGES: Record<string, string> = {
    terms: 'KITABWALAH PLATFORM TERMS & CONDITIONS\n\n1. Introduction\nWelcome to Kitabwalah Admin & Multi-vendor Marketplace (HQ: Muzaffarpur, Bihar). By placing orders or listing products, you agree to our 7-day return policy and standard delivery fees.',
    privacy: 'KITABWALAH PRIVACY POLICY\n\n1. Information We Collect\nWe collect phone numbers for passwordless OTP authentication (Truecaller/WhatsApp/SMS), delivery addresses, and Razorpay transaction IDs.',
    refund: 'KITABWALAH REFUND & RETURN POLICY\n\nCustomers have 7 days from delivery date to initiate return requests for wrong products or damaged items. Refunds are issued to Kitabwalah Wallet or original payment gateway.',
    about: "ABOUT KITABWALAH\n\nKitabwalah is Bihar's premier online bookstore offering same-day delivery in Muzaffarpur and fast courier shipping across Patna, Gaya, Darbhanga, and Rest of India.",
  };
  const [staticPages, setStaticPages] = useState<Record<string, string>>(DEFAULT_STATIC_PAGES);

  const logAction = (
    action_type: AdminActionType,
    target_table: string,
    target_id: string,
    description: string,
    old_data?: string,
    new_data?: string
  ) => {
    const newLog: AdminActionLog = {
      id: `log-${Date.now()}`,
      admin_id: 'admin-001',
      admin_name: 'Super Admin',
      action_type,
      target_table,
      target_id,
      description,
      old_data,
      new_data,
      created_at: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const toggleUserBan = (userId: string, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextBan = !u.is_banned;
          logAction(
            nextBan ? 'user_ban' : 'user_unban',
            'users',
            userId,
            `${nextBan ? 'Banned' : 'Unbanned'} user ${u.display_name}. ${reason ? `Reason: ${reason}` : ''}`
          );
          return { ...u, is_banned: nextBan, ban_reason: nextBan ? reason : undefined };
        }
        return u;
      })
    );
  };

  const verifyVendorKyc = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          logAction('vendor_verify', 'vendor_profiles', vendorId, `Verified KYC for vendor "${v.store_name}"`);
          return { ...v, is_verified: true };
        }
        return v;
      })
    );
  };

  const toggleVendorActive = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const nextState = !v.is_active;
          logAction('vendor_suspend', 'vendor_profiles', vendorId, `${nextState ? 'Reactivated' : 'Suspended'} vendor "${v.store_name}"`);
          return { ...v, is_active: nextState };
        }
        return v;
      })
    );
  };

  const updateVendorCommission = (vendorId: string, rate: number) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          logAction('settings_update', 'vendor_profiles', vendorId, `Updated commission rate to ${rate}% for "${v.store_name}"`);
          return { ...v, commission_rate: rate };
        }
        return v;
      })
    );
  };

  const processOrderRefund = (orderId: string, amount: number, method: 'original_payment' | 'wallet') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          logAction('order_refund', 'orders', orderId, `Processed ₹${amount} refund via ${method} for order #${o.order_number}`);
          return {
            ...o,
            refund_amount: (o.refund_amount || 0) + amount,
            payment_status: amount >= o.total ? 'refunded' : 'partially_refunded',
          };
        }
        return o;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          logAction('settings_update', 'orders', orderId, `Updated order #${o.order_number} status to ${status}`);
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const approveWithdrawal = (requestId: string, reference: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => {
        if (w.id === requestId) {
          logAction('withdrawal_approve', 'withdrawal_requests', requestId, `Approved ₹${w.amount} payout for ${w.store_name}. UTR: ${reference}`);
          return {
            ...w,
            status: 'completed',
            payment_reference: reference,
            processed_at: new Date().toLocaleString(),
          };
        }
        return w;
      })
    );
  };

  const rejectWithdrawal = (requestId: string, note: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => {
        if (w.id === requestId) {
          logAction('withdrawal_reject', 'withdrawal_requests', requestId, `Rejected withdrawal of ₹${w.amount} for ${w.store_name}. Note: ${note}`);
          return {
            ...w,
            status: 'rejected',
            admin_note: note,
            processed_at: new Date().toLocaleString(),
          };
        }
        return w;
      })
    );
  };

  const updatePincodeCod = (pincodeId: string, codType: Pincode['cod_type']) => {
    setPincodes((prev) =>
      prev.map((p) => {
        if (p.id === pincodeId) {
          logAction('pincode_update', 'pincodes', pincodeId, `Updated pincode ${p.pincode} COD type to ${codType}`);
          return { ...p, cod_type: codType };
        }
        return p;
      })
    );
  };

  const togglePincodeSameDay = (pincodeId: string) => {
    setPincodes((prev) =>
      prev.map((p) => {
        if (p.id === pincodeId) {
          const next = !p.is_same_day_eligible;
          logAction('pincode_update', 'pincodes', pincodeId, `Toggled pincode ${p.pincode} same-day eligibility to ${next}`);
          return { ...p, is_same_day_eligible: next };
        }
        return p;
      })
    );
  };

  const approveReturnRequest = (returnId: string) => {
    setReturnRequests((prev) =>
      prev.map((r) => {
        if (r.id === returnId) {
          logAction('order_refund', 'return_requests', returnId, `Approved return request for order #${r.order_number}`);
          return { ...r, status: 'approved', reviewed_at: new Date().toLocaleString() };
        }
        return r;
      })
    );
  };

  const rejectReturnRequest = (returnId: string, note: string) => {
    setReturnRequests((prev) =>
      prev.map((r) => {
        if (r.id === returnId) {
          logAction('order_refund', 'return_requests', returnId, `Rejected return request for order #${r.order_number}. Note: ${note}`);
          return { ...r, status: 'rejected', admin_note: note, reviewed_at: new Date().toLocaleString() };
        }
        return r;
      })
    );
  };

  const addCoupon = (coupon: Omit<Coupon, 'id' | 'used_count'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `c-${Date.now()}`,
      used_count: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    logAction('coupon_create', 'coupons', newCoupon.id, `Created coupon code ${coupon.code}`);
  };

  const editCoupon = (couponId: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          logAction('settings_update', 'coupons', couponId, `Updated coupon ${c.code}`);
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    logAction('settings_update', 'coupons', couponId, `Deleted coupon ${couponId}`);
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const next = !c.is_active;
          logAction('coupon_deactivate', 'coupons', couponId, `${next ? 'Activated' : 'Deactivated'} coupon ${c.code}`);
          return { ...c, is_active: next };
        }
        return c;
      })
    );
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...banner,
      id: `b-${Date.now()}`,
    };
    setBanners((prev) => [newBanner, ...prev]);
    logAction('banner_update', 'banners', newBanner.id, `Added new banner "${banner.title}"`);
  };

  const editBanner = (bannerId: string, updates: Partial<Banner>) => {
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === bannerId) {
          logAction('banner_update', 'banners', bannerId, `Updated banner "${b.title}"`);
          return { ...b, ...updates };
        }
        return b;
      })
    );
  };

  const deleteBanner = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    logAction('banner_update', 'banners', bannerId, `Deleted banner ${bannerId}`);
  };

  const toggleBannerActive = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === bannerId) {
          const next = !b.is_active;
          logAction('banner_update', 'banners', bannerId, `Toggled banner "${b.title}" active to ${next}`);
          return { ...b, is_active: next };
        }
        return b;
      })
    );
  };

  const addHomepagePin = (pin: Omit<HomepagePin, 'id' | 'updated_at'>) => {
    const newPin: HomepagePin = {
      ...pin,
      id: `pin-${Date.now()}`,
      updated_at: new Date().toISOString().split('T')[0],
    };
    setHomepagePins((prev) => [newPin, ...prev]);
    logAction('settings_update', 'homepage_pins', newPin.id, `Pinned ${pin.type} "${pin.title}" to position #${pin.position}`);
  };

  const removeHomepagePin = (pinId: string) => {
    setHomepagePins((prev) => prev.filter((p) => p.id !== pinId));
    logAction('settings_update', 'homepage_pins', pinId, `Removed homepage pin override ${pinId}`);
  };

  const approveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          logAction('settings_update', 'product_reviews', reviewId, `Approved review for product "${r.product_name}"`);
          return { ...r, status: 'approved' };
        }
        return r;
      })
    );
  };

  const rejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          logAction('settings_update', 'product_reviews', reviewId, `Rejected review for product "${r.product_name}"`);
          return { ...r, status: 'rejected' };
        }
        return r;
      })
    );
  };

  const resolveTicket = (ticketId: string, note: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          logAction('settings_update', 'support_tickets', ticketId, `Resolved support ticket #${ticketId}`);
          return { ...t, status: 'resolved', resolution_note: note };
        }
        return t;
      })
    );
  };

  const resolveIssue = (issueId: string, note: string) => {
    setIssueReports((prev) =>
      prev.map((i) => {
        if (i.id === issueId) {
          logAction('settings_update', 'issue_reports', issueId, `Resolved issue report #${issueId}`);
          return { ...i, status: 'resolved', resolution_note: note };
        }
        return i;
      })
    );
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => {
        if (s.key === key) {
          logAction('settings_update', 'app_settings', key, `Updated setting "${key}" to "${value}"`);
          return { ...s, value, updated_at: new Date().toISOString().split('T')[0] };
        }
        return s;
      })
    );
  };

  const sendNotification = (notification: Omit<PushNotificationLog, 'id' | 'sent_at' | 'sent_count'>) => {
    const newNotif: PushNotificationLog = {
      ...notification,
      id: `pn-${Date.now()}`,
      sent_count: notification.target_group === 'all' ? 14200 : 450,
      sent_at: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    logAction('settings_update', 'notifications', newNotif.id, `Sent push notification "${notification.title}" to ${notification.target_group}`);
  };

  const addWalletBalance = (userId: string, amount: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextBal = u.wallet_balance + amount;
          logAction('settings_update', 'users', userId, `Adjusted wallet balance by ₹${amount} for user ${u.display_name}`);
          return { ...u, wallet_balance: nextBal };
        }
        return u;
      })
    );
  };

  return (
    <AdminStoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        users,
        vendors,
        categories,
        orders,
        deliveryPersons,
        shipments,
        returnRequests,
        withdrawalRequests,
        coupons,
        banners,
        homepagePins,
        reviews,
        supportTickets,
        issueReports,
        exams,
        settings,
        notifications,
        auditLogs,
        pincodes,
        cities,
        emailLogs: [],
        migrationLogs: [],

        toggleUserBan,
        verifyVendorKyc,
        toggleVendorActive,
        updateVendorCommission,
        processOrderRefund,
        updateOrderStatus,
        approveWithdrawal,
        rejectWithdrawal,
        updatePincodeCod,
        togglePincodeSameDay,
        approveReturnRequest,
        rejectReturnRequest,
        addCoupon,
        editCoupon,
        deleteCoupon,
        toggleCouponActive,
        addBanner,
        editBanner,
        deleteBanner,
        toggleBannerActive,
        addHomepagePin,
        removeHomepagePin,
        approveReview,
        rejectReview,
        resolveTicket,
        resolveIssue,
        updateSetting,
        sendNotification,
        addWalletBalance,

        staticPages,
        updateStaticPage: (slug: string, content: string) => {
          setStaticPages((prev) => ({ ...prev, [slug]: content }));
          logAction('settings_update', 'static_pages', slug, `Updated static page: ${slug}`, undefined, content.substring(0, 80));
        },
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore must be used within an AdminStoreProvider');
  }
  return context;
}
