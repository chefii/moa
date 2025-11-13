'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const showSuccess = (message: string) => showToast('success', message);
  const showError = (message: string) => showToast('error', message);
  const showInfo = (message: string) => showToast('info', message);

  const toastContainer = (
    <div className="fixed top-4 right-4 space-y-2" style={{ zIndex: 99998 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-lg animate-in slide-in-from-right duration-300 min-w-[300px] ${
              toast.type === 'success'
                ? 'bg-green-50/95 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }`}
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            {toast.type === 'success' ? (
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            ) : toast.type === 'error' ? (
              <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
            )}
            <p className="font-semibold text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className={`ml-2 p-1 rounded-full transition-colors ${
                toast.type === 'success'
                  ? 'hover:bg-green-200'
                  : toast.type === 'error'
                  ? 'hover:bg-red-200'
                  : 'hover:bg-blue-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

      {/* Keyframes for animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {mounted && toasts.length > 0 && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
};
