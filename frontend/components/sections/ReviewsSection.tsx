'use client';

import React from 'react';
import { useAdminStore } from '@/lib/store';
import { Star, CheckCircle2, XCircle, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Badge, StatusBadge } from '@/components/ui/badge';

export default function ReviewsSection() {
  const { reviews, approveReview, rejectReview } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Customer Product Reviews Queue ({reviews.length})
        </h2>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rev.product_name}</h3>
                  <p className="text-xs text-slate-500">
                    By <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.user_name}</span> • Sold by {rev.vendor_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {rev.is_verified_purchase && (
                    <Badge variant="success">
                      <ShieldCheck className="w-3 h-3" /> Verified Purchase
                    </Badge>
                  )}
                  <StatusBadge status={rev.status} />
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}
                  />
                ))}
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 ml-1">{rev.title}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                &ldquo;{rev.content}&rdquo;
              </p>

              {rev.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => approveReview(rev.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Update Vendor Rating
                  </button>
                  <button
                    onClick={() => rejectReview(rev.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
