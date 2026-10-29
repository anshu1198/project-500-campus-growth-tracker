import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`toast ${isError ? 'toast-error' : isSuccess ? 'toast-success' : 'toast-info'}`}
            role="status"
          >
            {isSuccess && <CheckCircle2 size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />}
            {isError && <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
            {!isSuccess && !isError && <Info size={18} style={{ color: 'var(--color-info)', flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
