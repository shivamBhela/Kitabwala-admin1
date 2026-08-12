'use client';

import React, { useState } from 'react';
import { Code2, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function SchemaRefSection() {
  const [activeTab, setActiveTab] = useState<'models' | 'enums'>('models');

  const modelsList = [
    { name: 'User', fields: 49, source: 'wp_users + wp_usermeta', info: '938 rows migrated. wp_id tracking.' },
    { name: 'VendorProfile', fields: 44, source: 'wp_wcfm_marketplace_vendor_data', info: '10% platform commission rate.' },
    { name: 'Category', fields: 14, source: 'wp_terms + wp_term_taxonomy', info: 'product_cat taxonomy.' },
    { name: 'City', fields: 10, source: 'NEW (PostgreSQL)', info: 'Muzaffarpur, Patna, Boring Road, Others.' },
    { name: 'Pincode', fields: 11, source: 'NEW (PostgreSQL)', info: 'Admin-configurable COD & zone rules per pincode.' },
    { name: 'Product', fields: 31, source: 'wp_posts + wp_postmeta', info: '4,986 products. 3,240 have city prices.' },
    { name: 'ProductCityPrice', fields: 8, source: 'wp_postmeta (wcca_city_prices)', info: 'Tiered city-wise pricing.' },
    { name: 'Order', fields: 47, source: 'wp_wc_orders (HPOS)', info: '1,001 orders. 680 guest orders excluded.' },
    { name: 'OrderItem', fields: 21, source: 'wp_woocommerce_order_items', info: 'Product snapshot preserved.' },
    { name: 'DeliveryPerson', fields: 20, source: 'NEW (PostgreSQL)', info: 'Same-day fleet personnel.' },
    { name: 'Shipment', fields: 21, source: 'NEW (PostgreSQL)', info: 'Same-day GPS+OTP+photo. Normal Shadowfax.' },
    { name: 'Coupon', fields: 21, source: 'wp_posts (shop_coupon)', info: 'KITABWALAH, NEW10, BIRTHDAY10, WELCOME30.' },
    { name: 'ReturnRequest', fields: 15, source: 'NEW (PostgreSQL)', info: '7-day wrong item returns.' },
    { name: 'WithdrawalRequest', fields: 12, source: 'wp_wcfm_marketplace_withdraw', info: 'Manual vendor payout approval.' },
    { name: 'AppSetting', fields: 6, source: 'wp_options', info: 'Platform-wide config keys.' },
  ];

  const enumsList = [
    { name: 'UserRole', values: ['customer', 'vendor', 'admin', 'delivery_person', 'reseller'] },
    { name: 'ProductStatus', values: ['draft', 'pending_review', 'active', 'inactive', 'rejected'] },
    { name: 'BookCondition', values: ['new_condition', 'like_new', 'good', 'acceptable', 'poor'] },
    { name: 'OrderStatus', values: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'] },
    { name: 'DeliveryType', values: ['same_day', 'normal'] },
    { name: 'PaymentMethod', values: ['razorpay', 'cashfree', 'cod', 'wallet'] },
    { name: 'DeliveryZone', values: ['local', 'rest_bihar', 'south_india', 'rest_india'] },
    { name: 'CodType', values: ['full_cod', 'partial_cod', 'prepaid_only'] },
    { name: 'WithdrawalStatus', values: ['pending', 'approved', 'processing', 'completed', 'rejected'] },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-amber-500" /> PostgreSQL Prisma ORM Production Schema (46 Models | 30 Enums)
        </h2>
        <p className="text-xs text-slate-500">
          Source DB: u101172427_newdev (NestJS + PostgreSQL AWS RDS). Complete specification reference.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'models' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
        >
          Prisma Models (46 Total)
        </button>
        <button
          onClick={() => setActiveTab('enums')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'enums' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
        >
          Prisma Enums (30 Total)
        </button>
      </div>

      {activeTab === 'models' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Model Name</th>
                  <th className="p-3.5">Field Count</th>
                  <th className="p-3.5">Source Table / Origin</th>
                  <th className="p-3.5">Key Information</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {modelsList.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                    <td className="p-3.5 font-bold text-amber-600">{m.fields} fields</td>
                    <td className="p-3.5 text-slate-500">{m.source}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-sans">{m.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enumsList.map((e) => (
            <div key={e.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <h3 className="font-mono font-bold text-amber-500 text-xs">{e.name}</h3>
              <div className="flex flex-wrap gap-1">
                {e.values.map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
