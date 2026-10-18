import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Global Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl shadow-xl border transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
                isSuccess
                  ? 'bg-white border-emerald-200 text-stone-800'
                  : isError
                    ? 'bg-white border-rose-200 text-stone-800'
                    : 'bg-[#2B1810] border-[#3D2318] text-white'
              }`}
            >
              <div
                className={`p-1 rounded-full shrink-0 mt-0.5 ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-600'
                    : isError
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-white/10 text-brand-yellow'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={16} className="stroke-[2.2]" />
                ) : isError ? (
                  <AlertCircle size={16} className="stroke-[2.2]" />
                ) : (
                  <Info size={16} className="stroke-[2.2]" />
                )}
              </div>

              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-600 p-0.5 rounded-sm transition-colors cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
