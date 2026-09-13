"use client";

import React, { useEffect } from "react";
import { Trash2, X } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to remove this item? This action cannot be undone.",
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDeleting = false,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const loading = isDeleting || isLoading;
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[24px] p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500" />

        <div className="flex items-start justify-between gap-3 pt-0.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
            {title}
          </h3>
          {itemName && (
            <p className="text-xs font-bold text-rose-700 bg-rose-50/90 px-3 py-1.5 rounded-xl truncate border border-rose-100/80">
              "{itemName}"
            </p>
          )}
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
