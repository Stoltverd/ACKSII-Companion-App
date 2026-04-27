import React, { createContext, useContext, ReactNode } from 'react';
import { useDataStore } from './hooks/useDataStore';

type DataStore = ReturnType<typeof useDataStore>;

const AppContext = createContext<DataStore | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const store = useDataStore();
  
  if (!store.isLoaded) {
    return <div className="min-h-screen bg-app flex items-center justify-center text-main">Loading...</div>;
  }
  
  return (
    <AppContext.Provider value={store}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
