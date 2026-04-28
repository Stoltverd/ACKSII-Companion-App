import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { ConfirmProvider } from './hooks/useConfirm';
import Layout from './components/Layout';
import GeneratorView from './views/GeneratorView';
import CustomizationView from './views/CustomizationView';
import SavedItemsView from './views/SavedItemsView';
import SettingsView from './views/SettingsView';

import ScrollGeneratorLayout from './views/ScrollGeneratorLayout';

// Placeholder views for new routes
const TreasureMapPlaceholder = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-app rounded-lg bg-surface">
    <h2 className="text-2xl font-serif font-bold text-accent mb-4">Treasure Map Generator</h2>
    <p className="text-muted">This feature is currently under development (Phase 2).</p>
  </div>
);

export default function App() {
  return (
    <ConfirmProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ScrollGeneratorLayout />}>
                <Route index element={<GeneratorView />} />
                <Route path="customization" element={<CustomizationView />} />
                <Route path="saved" element={<SavedItemsView />} />
              </Route>
              <Route path="/treasure-map" element={<TreasureMapPlaceholder />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ConfirmProvider>
  );
}
