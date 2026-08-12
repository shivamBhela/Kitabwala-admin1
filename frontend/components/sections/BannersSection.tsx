'use client';

import React, { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store';
import { Banner, BannerActionType } from '@/lib/types';
import { Image as ImageIcon, Plus, Edit2, Trash2, Power, Link as LinkIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalTable, ColumnDef } from '@/components/ui/UniversalTable';
import { UniversalModal } from '@/components/ui/UniversalModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function BannersSection() {
  const { banners, addBanner, editBanner, deleteBanner, toggleBannerActive } = useAdminStore();
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Delete Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800');
  const [actionType, setActionType] = useState<BannerActionType>('category');
  const [actionValue, setActionValue] = useState('');

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800');
    setActionType('category');
    setActionValue('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.image_url);
    setActionType(banner.action_type);
    setActionValue(banner.action_value || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast.error('Title and Image URL are required');
      return;
    }

    try {
      if (editingBanner) {
        editBanner(editingBanner.id, {
          title,
          subtitle,
          image_url: imageUrl,
          action_type: actionType,
          action_value: actionValue,
        });
        toast.success('Banner updated successfully');
      } else {
        addBanner({
          title,
          subtitle,
          image_url: imageUrl,
          action_type: actionType,
          action_value: actionValue,
          display_order: banners.length + 1,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: '2026-12-31',
          is_active: true,
        });
        toast.success('Banner created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save banner');
    }
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(bannerToDelete.id);
      toast.success('Banner deleted permanently');
    }
  };

  const handleToggle = (banner: Banner) => {
    toggleBannerActive(banner.id);
    toast.success(`Banner is now ${!banner.is_active ? 'Active' : 'Inactive'}`);
  };

  const filteredBanners = useMemo(() => {
    return banners.filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) || 
      (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase()))
    );
  }, [banners, search]);

  const columns: ColumnDef<Banner>[] = [
    {
      key: 'image',
      header: 'Preview',
      width: '140px',
      accessor: (item) => item.image_url,
      cell: (item) => (
        <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Banner Details',
      accessor: (item) => item.title,
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-800">{item.title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{item.subtitle || 'No subtitle'}</div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
              Slot #{item.display_order}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Tap Action',
      accessor: (item) => item.action_type,
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <LinkIcon className="w-3 h-3 text-amber-500" />
            <span className="uppercase">{item.action_type}</span>
          </div>
          <div className="text-slate-500">{item.action_value || 'No value'}</div>
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
              setBannerToDelete(item);
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
            <ImageIcon className="w-5 h-5 text-amber-500" /> Homepage Banners
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage mobile app homepage carousel banners and promotions
          </p>
        </div>

        <button onClick={openAddModal} className="kw-btn-primary">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Universal Table */}
      <div className="flex-1 min-h-[400px]">
        <UniversalTable
          data={filteredBanners}
          columns={columns}
          keyExtractor={(b) => b.id}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search banners by title..."
          emptyMessage="No banners found matching your search."
          exportFileName="banners.csv"
        />
      </div>

      {/* Add/Edit Modal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="kw-btn-secondary px-4 py-2">
              Cancel
            </button>
            <button onClick={handleSave} className="kw-btn-primary px-4 py-2">
              {editingBanner ? 'Save Changes' : 'Create Banner'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banner Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle (Optional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
              />
              {imageUrl && (
                <div className="mt-3 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tap Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as BannerActionType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
                >
                  <option value="none">None</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                  <option value="url">External URL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target ID/URL</label>
                <input
                  type="text"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  disabled={actionType === 'none'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#FFD400] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </form>
      </UniversalModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete the banner "${bannerToDelete?.title}"?`}
        confirmText="Delete Banner"
        isDestructive={true}
      />
    </div>
  );
}
