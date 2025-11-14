'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    title: '확인',
    confirmText: '확인',
    cancelText: '취소',
    type: 'info',
    onConfirm: () => {},
    onCancel: () => {},
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || '확인',
        message: options.message,
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        type: options.type || 'info',
        onConfirm: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  const getColors = () => {
    switch (confirmState.type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'bg-red-100 text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const colors = getColors();

  const confirmDialog = confirmState.isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          data-portal="confirm-dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={confirmState.onCancel}
            style={{ zIndex: -1 }}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-visible" style={{ zIndex: 1 }}>
            {/* Header */}
            <div className={`px-6 py-4 ${colors.bg} ${colors.border} border-b rounded-t-3xl`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${colors.icon} flex items-center justify-center`}>
                  {confirmState.type === 'danger' || confirmState.type === 'warning' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <CheckCircle className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900">{confirmState.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                {confirmState.message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-3xl">
              <button
                onClick={confirmState.onCancel}
                className="flex-1 px-4 py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={confirmState.onConfirm}
                className={`flex-1 px-4 py-3 ${colors.button} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {mounted && confirmDialog && createPortal(confirmDialog, document.body)}
    </ConfirmContext.Provider>
  );
};
