'use client';

import React, { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store';
import { Coupon, CouponType } from '@/lib/types';
import { TicketPercent, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalTable, ColumnDef } from '@/components/ui/UniversalTable';
import { UniversalModal } from '@/components/ui/UniversalModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CouponsSection() {
  const { coupons, addCoupon, editCoupon, deleteCoupon, toggleCouponActive } = useAdminStore();

  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponType>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [isBirthday, setIsBirthday] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setType('percentage');
    setValue(10);
    setMinOrder(0);
    setMaxDiscount(0);
    setIsBirthday(false);
    setIsFirstOrder(false);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value);
    setMinOrder(coupon.min_order_amount || 0);
    setMaxDiscount(coupon.max_discount_amount || 0);
    setIsBirthday(coupon.is_birthday_coupon || false);
    setIsFirstOrder(coupon.is_first_order_only || false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error('Coupon code is required');
      return;
    }

    try {
      if (editingCoupon) {
        editCoupon(editingCoupon.id, {
          code: code.toUpperCase(),
          type,
          value,
          min_order_amount: minOrder > 0 ? minOrder : undefined,
          max_discount_amount: maxDiscount > 0 ? maxDiscount : undefined,
          is_birthday_coupon: isBirthday,
          is_first_order_only: isFirstOrder,
        });
        toast.success(`Coupon ${code.toUpperCase()} updated successfully`);
      } else {
        addCoupon({
          code: code.toUpperCase(),
          type,
          value,
          min_order_amount: minOrder > 0 ? minOrder : undefined,
          max_discount_amount: maxDiscount > 0 ? maxDiscount : undefined,
          is_birthday_coupon: isBirthday,
          is_first_order_only: isFirstOrder,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: '2026-12-31',
          is_active: true,
        });
        toast.success(`Coupon ${code.toUpperCase()} created successfully`);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save coupon');
    }
  };

  const confirmDelete = () => {
    if (couponToDelete) {
      deleteCoupon(couponToDelete.id);
      toast.success(`Coupon ${couponToDelete.code} deleted permanently`);
    }
  };

  const handleToggle = (coupon: Coupon) => {
    toggleCouponActive(coupon.id);
    toast.success(`${coupon.code} is now ${!coupon.is_active ? 'Active' : 'Inactive'}`);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [coupons, search]);

  const columns: ColumnDef<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      accessor: (item) => item.code,
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-mono font-extrabold text-base tracking-wider text-slate-800">
            {item.code}
          </div>
          <div className="text-xs text-slate-500 flex gap-2 mt-1">
            {item.is_first_order_only && <span className="text-blue-500 font-medium">First Order</span>}
            {item.is_birthday_coupon && <span className="text-purple-500 font-medium">Birthday</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount Details',
      accessor: (item) => item.value,
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-bold text-amber-600">
            {item.type === 'percentage' ? `${item.value}% OFF` : `₹${item.value} FLAT`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Min: ₹{item.min_order_amount || 0} | Max Cap: ₹{item.max_discount_amount || 'None'}
          </div>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      accessor: (item) => item.used_count,
      sortable: true,
      cell: (item) => (
        <div className="text-slate-600 font-medium">
          {item.used_count} times
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => (item.is_active ? 'Active' : 'Inactive'),
      sortable: true,
      align: 'center',
      cell: (item) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            item.is_active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      align: 'right',
      cell: (item) => (
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => handleToggle(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title={item.is_active ? "Deactivate" : "Activate"}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCouponToDelete(item);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Bar */}
      <div className="kw-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-amber-500" /> Platform Coupons
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage discount codes, birthday promotions, and vouchers
          </p>
        </div>

        <button onClick={openAddModal} className="kw-btn-primary">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Universal Table */}
      <div className="flex-1 min-h-[400px]">
        <UniversalTable
          data={filteredCoupons}
          columns={columns}
          keyExtractor={(c) => c.id}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search coupon codes..."
          emptyMessage="No coupons found matching your search."
          exportFileName="coupons.csv"
        />
      </div>

      {/* Add/Edit Modal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="kw-btn-secondary px-4 py-2">
              Cancel
            </button>
            <button onClick={handleSave} className="kw-btn-primary px-4 py-2">
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="E.g., FESTIVE20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-[#FFD400] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CouponType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value ({type === 'percentage' ? '%' : '₹'})</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Order (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Cap (₹)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={isFirstOrder}
                onChange={(e) => setIsFirstOrder(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">First-Order Only (New users)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={isBirthday}
                onChange={(e) => setIsBirthday(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Auto-apply during Birthday Month</span>
            </label>
          </div>
        </form>
      </UniversalModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${couponToDelete?.code}"? This action cannot be undone.`}
        confirmText="Delete Coupon"
        isDestructive={true}
      />
    </div>
  );
}
