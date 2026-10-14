import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => {
        let bgStyle = 'bg-zinc-900 border-zinc-700 text-zinc-100';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-red-950/90 border-red-500/30 text-red-100';
          icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-950/90 border-amber-500/30 text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md w-full transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${bgStyle}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-200 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
              aria-label="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
