'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Order, OrderStatus, DeliveryType, PaymentMethod } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Eye,
  FileText,
  RefreshCw,
  X,
  CheckCircle,
  Truck,
  IndianRupee,
  Calendar,
  Download,
  AlertCircle,
} from 'lucide-react';

export default function OrdersSection() {
  const { orders, updateOrderStatus, processOrderRefund } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<'original_payment' | 'wallet'>('wallet');
  const [showInvoiceModal, setShowInvoiceModal] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_phone && o.customer_phone.includes(searchQuery)) ||
      (o.city && o.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    const matchesDelivery = selectedDelivery === 'all' || o.delivery_type === selectedDelivery;
    const matchesPayment = selectedPayment === 'all' || o.payment_method === selectedPayment;

    return matchesSearch && matchesStatus && matchesDelivery && matchesPayment;
  });

  const exportToCsv = () => {
    const headers = ['Order Number', 'Customer', 'Phone', 'City', 'Delivery Type', 'Payment Method', 'Total', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o.order_number,
      o.customer_name || '',
      o.customer_phone || '',
      o.city || '',
      o.delivery_type,
      o.payment_method,
      o.total,
      o.status,
      o.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={exportToCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="font-semibold text-slate-500 ml-4 flex items-center gap-1">
            Delivery:
          </span>
          {['all', 'same_day', 'normal'].map((dt) => (
            <button
              key={dt}
              onClick={() => setSelectedDelivery(dt)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedDelivery === dt
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {dt === 'same_day' ? '⚡ Same-Day' : dt === 'normal' ? 'Normal' : 'All Delivery'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Order Number</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Delivery Type</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {ord.order_number}
                      <p className="text-[10px] font-normal text-slate-400">{ord.created_at}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{ord.customer_name}</p>
                      <p className="text-[11px] text-slate-500">{ord.customer_phone}</p>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={ord.delivery_type === 'same_day' ? 'info' : 'neutral'}>
                        {ord.delivery_type === 'same_day' ? '⚡ Same-Day' : 'Normal Shipping'}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ord.payment_method}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                      ₹{ord.total}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowRefundModal(ord);
                            setRefundAmount(ord.total);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100"
                          title="Process Refund"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowInvoiceModal(ord)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100"
                          title="GST Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Order Details — #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-slate-500">Placed on {selectedOrder.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Customer Info
                  </h4>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-slate-500">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Shipping Address
                  </h4>
                  {selectedOrder.shipping_address ? (
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {selectedOrder.shipping_address.address_1}, {selectedOrder.shipping_address.city},{' '}
                      {selectedOrder.shipping_address.pincode}
                    </p>
                  ) : (
                    <p className="text-slate-400 mt-1">Address preserved in PostgreSQL DB</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Order Line Items</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.product_name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.unit_price}</p>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping ({selectedOrder.delivery_type})</span>
                  <span>₹{selectedOrder.shipping_amount}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>COD Charge</span>
                  <span>₹{selectedOrder.cod_charge}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount_amount}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Process Order Refund — #{showRefundModal.order_number}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Refund Amount (Max ₹{showRefundModal.total})</label>
                <input
                  type="number"
                  min={0}
                  max={showRefundModal.total}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Math.min(Number(e.target.value), showRefundModal.total))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as 'original_payment' | 'wallet')}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="wallet">Kitabwalah Wallet Credit (Instant)</option>
                  <option value="original_payment">Original Payment Gateway (Razorpay/Cashfree)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRefundModal(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  processOrderRefund(showRefundModal.id, refundAmount, refundMethod);
                  setShowRefundModal(null);
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GST Invoice Preview Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">GST Tax Invoice Preview</h3>
                <p className="text-xs text-slate-500">Invoice #{showInvoiceModal.invoice_number || 'INV-2026-AUTO'}</p>
              </div>
              <button onClick={() => setShowInvoiceModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] space-y-3">
              <div className="flex justify-between font-bold">
                <span>KITABWALAH HQ (Muzaffarpur)</span>
                <span>GSTIN: 10ABCDE9999F1Z0</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex justify-between">
                <span>Billed To: {showInvoiceModal.customer_name}</span>
                <span>City: {showInvoiceModal.city}</span>
              </div>
              <div>
                {showInvoiceModal.items.map((i) => (
                  <div key={i.id} className="flex justify-between py-1">
                    <span>{i.product_name} (x{i.quantity})</span>
                    <span>₹{i.total_price} (GST {i.gst_rate}%)</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-amber-600">
                <span>TOTAL AMOUNT PAID</span>
                <span>₹{showInvoiceModal.total}</span>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceModal(null)}
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
            >
              Download PDF Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
