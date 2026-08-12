'use client';

import React from 'react';
import { useAdminStore } from '@/lib/store';
import { Truck, MapPin, Phone, ShieldCheck, UserCheck, AlertCircle, Clock } from 'lucide-react';
import { Badge, StatusBadge } from '@/components/ui/badge';

export default function DeliverySection() {
  const { deliveryPersons, shipments, orders } = useAdminStore();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Same-Day Delivery Team</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{deliveryPersons.length} Drivers</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Own fleet for Muzaffarpur zone</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shadowfax Shipments</span>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {shipments.filter((s) => s.delivery_type === 'normal').length} Active
          </h3>
          <p className="text-xs text-slate-500 mt-1">Normal courier deliveries across India</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attempt Rules Enforced</span>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">Max 1 (SD) / Max 3 (Norm)</h3>
          <p className="text-xs text-slate-500 mt-1">On cancellation: shipping deducted, rest refunded</p>
        </div>
      </div>

      {/* Same-Day Fleet Drivers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500" /> Muzaffarpur Same-Day Fleet Personnel
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Driver Name & Phone</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">GPS Location</th>
                <th className="p-3">Assigned Orders</th>
                <th className="p-3">Monthly Salary</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {deliveryPersons.map((dp) => (
                <tr key={dp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{dp.name}</p>
                    <p className="text-[11px] text-slate-500">{dp.phone}</p>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {dp.vehicle_type} ({dp.vehicle_number})
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    Lat: {dp.last_location_lat}, Lng: {dp.last_location_lng}
                  </td>
                  <td className="p-3 font-bold text-amber-600">
                    {dp.current_assigned_orders || 0} active
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    ₹{dp.salary_per_month.toLocaleString()}/mo
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Available & Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Shipments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" /> Active Shipments & Live Tracking
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Type</th>
                <th className="p-3">Tracking ID / Courier</th>
                <th className="p-3">Driver / Partner</th>
                <th className="p-3">OTP / Proof</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Shipment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {shipments.map((shp) => (
                <tr key={shp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {shp.order_number}
                  </td>
                  <td className="p-3">
                    <Badge variant={shp.delivery_type === 'same_day' ? 'info' : 'neutral'}>
                      {shp.delivery_type === 'same_day' ? '⚡ Same-Day' : 'Normal'}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                    {shp.tracking_id || shp.shadowfax_order_id || 'Pending Auto-call'}
                  </td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {shp.delivery_person_name || 'Shadowfax Courier'}
                  </td>
                  <td className="p-3">
                    {shp.delivery_otp ? (
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-amber-600">
                        OTP: {shp.delivery_otp}
                      </span>
                    ) : (
                      <span className="text-slate-400">Milestone Track</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                    {shp.delivery_attempts} / {shp.delivery_type === 'same_day' ? 1 : 3}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={shp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
