import React, { useState } from 'react';
import { UniversalModal } from './UniversalModal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isProcessing}
        className="kw-btn-secondary px-4 py-2"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isProcessing}
        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-w-[100px] ${
          isDestructive
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
            : 'kw-btn-primary'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          confirmText
        )}
      </button>
    </>
  );

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="sm"
      footer={footer}
    >
      <div className="flex items-start gap-4 text-slate-600">
        <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </UniversalModal>
  );
}
