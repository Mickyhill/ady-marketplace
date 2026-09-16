import React from "react";
import { AlertTriangle } from "lucide-react";

// Reusable confirmation dialog — replaces plain browser confirm() popups,
// which look unpolished and can't be styled or given proper button labels.
export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <span className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </span>
          )}
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            {message && <p className="text-sm text-ink-500 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-sm border border-ink-300 rounded-md px-4 py-2 hover:bg-ink-100">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`text-sm text-white rounded-md px-4 py-2 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-500 hover:bg-brand-600"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
