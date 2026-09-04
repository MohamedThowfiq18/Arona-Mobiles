'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

export function ToastContainer() {
  const { toasts, removeToast } = useProductStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        let borderClass = 'border-blue-500/40';

        if (toast.type === 'live') {
          icon = <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />;
          borderClass = 'border-cyan-500/60 shadow-cyan-glow';
        } else if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-500/60 shadow-neon-glow';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/60';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border ${borderClass} shadow-2xl flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-5`}
          >
            {icon}
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-white font-display">{toast.title}</h4>
              <p className="text-xs text-slate-300 leading-snug">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
