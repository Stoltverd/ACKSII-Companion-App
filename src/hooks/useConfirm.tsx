import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmOptions {
  id?: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isAlert?: boolean;
}

interface PromptOptions {
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  validate?: (value: string) => string | null;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: Omit<ConfirmOptions, 'isAlert' | 'cancelText'>) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert' | 'prompt';
    options: any; // ConfirmOptions | PromptOptions
    resolve: (value: any) => void;
  } | null>(null);
  
  const [promptValue, setPromptValue] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDontShowAgain(false);
      setModalState({ isOpen: true, type: 'confirm', options: { ...options, isAlert: false }, resolve });
    });
  };

  const alert = (options: Omit<ConfirmOptions, 'isAlert' | 'cancelText'>) => {
    if (options.id && localStorage.getItem(`hide_alert_${options.id}`) === 'true') {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      setDontShowAgain(false);
      setModalState({ isOpen: true, type: 'alert', options: { ...options, isAlert: true }, resolve });
    });
  };

  const prompt = (options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(options.defaultValue || "");
      setPromptError(null);
      setModalState({ isOpen: true, type: 'prompt', options, resolve });
    });
  };

  const handleConfirm = () => {
    if (modalState) {
      if (modalState.type === 'prompt') {
        const pOpts = modalState.options as PromptOptions;
        if (pOpts.validate) {
          const err = pOpts.validate(promptValue);
          if (err) {
            setPromptError(err);
            return;
          }
        }
        modalState.resolve(promptValue);
        setModalState(null);
        return;
      }

      if (modalState.options.id && dontShowAgain) {
        localStorage.setItem(`hide_alert_${modalState.options.id}`, 'true');
      }
      modalState.resolve(true);
      setModalState(null);
    }
  };

  const handleCancel = () => {
    if (modalState) {
      modalState.resolve(modalState.type === 'prompt' ? null : false);
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-app rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-app">
              <h3 className="font-semibold text-lg text-main">{modalState.options.title}</h3>
            </div>
            <div className="p-4 flex-1">
              <p className="text-sm text-main">{modalState.options.message}</p>
              
              {modalState.type === 'prompt' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={promptValue}
                    onChange={(e) => {
                      setPromptValue(e.target.value);
                      if (promptError) setPromptError(null);
                    }}
                    placeholder={(modalState.options as PromptOptions).placeholder || ""}
                    className="w-full px-3 py-2 bg-app border border-app rounded-lg text-sm text-main outline-none focus:border-accent font-medium mt-2"
                  />
                  {promptError && <p className="text-xs text-red-500 mt-1">{promptError}</p>}
                </div>
              )}

              {modalState.type !== 'prompt' && modalState.options.id && modalState.options.isAlert && (
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
              {(modalState.type === 'prompt' || !modalState.options.isAlert) && (
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-app bg-surface rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-main transition-colors"
                >
                  {modalState.options.cancelText || 'Cancel'}
                </button>
              )}
              <button 
                onClick={handleConfirm}
                className={`px-4 py-2 ${modalState.type !== 'prompt' && modalState.options.isAlert ? 'bg-accent hover:bg-accent-hover' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm font-medium transition-colors`}
              >
                {modalState.options.confirmText || (modalState.type !== 'prompt' && modalState.options.isAlert ? 'OK' : 'Confirm')}
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
