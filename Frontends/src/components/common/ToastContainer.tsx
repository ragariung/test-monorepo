import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <aside 
      aria-label="Notifikasi Sistem"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-300 bg-emerald-50 text-emerald-950';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;

        if (toast.type === 'info') {
          borderClass = 'border-blue-300 bg-blue-50 text-blue-950';
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-300 bg-amber-50 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-300 bg-rose-50 text-rose-950';
          icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
