import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmOptions {
  id?: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isAlert?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: Omit<ConfirmOptions, 'isAlert' | 'cancelText'>) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDontShowAgain(false);
      setModalState({ isOpen: true, options: { ...options, isAlert: false }, resolve });
    });
  };

  const alert = (options: Omit<ConfirmOptions, 'isAlert' | 'cancelText'>) => {
    if (options.id && localStorage.getItem(`hide_alert_${options.id}`) === 'true') {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      setDontShowAgain(false);
      setModalState({ isOpen: true, options: { ...options, isAlert: true }, resolve });
    });
  };

  const handleConfirm = () => {
    if (modalState) {
      if (modalState.options.id && dontShowAgain) {
        localStorage.setItem(`hide_alert_${modalState.options.id}`, 'true');
      }
      modalState.resolve(true);
      setModalState(null);
    }
  };

  const handleCancel = () => {
    if (modalState) {
      modalState.resolve(false);
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-app rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-app">
              <h3 className="font-semibold text-lg text-main">{modalState.options.title}</h3>
            </div>
            <div className="p-4 flex-1">
              <p className="text-sm text-main">{modalState.options.message}</p>
              {modalState.options.id && modalState.options.isAlert && (
                <div className="mt-4 flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="rounded border-app text-accent focus:ring-accent"
                    />
                    <span>Don't show this again</span>
                  </label>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-app bg-app/50 flex justify-end space-x-3">
              {!modalState.options.isAlert && (
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-app bg-surface rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-main transition-colors"
                >
                  {modalState.options.cancelText || 'Cancel'}
                </button>
              )}
              <button 
                onClick={handleConfirm}
                className={`px-4 py-2 ${modalState.options.isAlert ? 'bg-accent hover:bg-accent-hover' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg text-sm font-medium transition-colors`}
              >
                {modalState.options.confirmText || (modalState.options.isAlert ? 'OK' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
