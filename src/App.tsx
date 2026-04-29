import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppProvider } from './AppContext';
import { ConfirmProvider } from './hooks/useConfirm';
import Layout from './components/Layout';
import GeneratorView from './views/GeneratorView';
import SavedItemsView from './views/SavedItemsView';
import SettingsView from './views/SettingsView';
import TreasureMapView from './views/TreasureMapView';

// Nested Customization Views
import DataManagementHub from './views/customization/DataManagementHub';
import LanguagesManager from './views/customization/LanguagesManager';
import SpellListsManager from './views/customization/SpellListsManager';
import GlobalSpellLibrary from './views/GlobalSpellLibrary'; // Using the existing one
import ImportExportManager from './views/customization/ImportExportManager';
import WorldSettingsManager from './views/customization/WorldSettingsManager';

// ... Placeholder views stay the same
const PlayerPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-app rounded-lg bg-surface">
    <h2 className="text-2xl font-serif font-bold text-accent mb-4">{title}</h2>
    <p className="text-muted">This player tool is currently under development.</p>
  </div>
);

// Wrapper for Customization to allow breadcrumbs/outlet
const CustomizationLayout = () => {
  const location = useLocation();
  const isHub = location.pathname === '/customization' || location.pathname === '/customization/';

  return (
    <div className="flex flex-col h-full animate-fade-in pb-16 md:pb-0">
       {!isHub && (
         <div className="mb-4">
           <NavLink to="/customization" className="inline-flex items-center text-sm font-medium text-muted hover:text-accent transition-colors">
             <ChevronLeft size={16} className="mr-1" />
             Back to Data Hub
           </NavLink>
         </div>
       )}
       <Outlet />
    </div>
  );
};

export default function App() {
  return (
    <ConfirmProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<GeneratorView />} />
              
              <Route path="/customization" element={<CustomizationLayout />}>
                <Route index element={<DataManagementHub />} />
                <Route path="languages" element={<LanguagesManager />} />
                <Route path="world-type" element={<WorldSettingsManager />} />
                <Route path="lists" element={<SpellListsManager />} />
                <Route path="spells" element={<GlobalSpellLibrary />} />
                <Route path="import-export" element={<ImportExportManager />} />
              </Route>
              
              <Route path="/saved" element={<SavedItemsView />} />
              <Route path="/treasure-map" element={<TreasureMapView />} />
              <Route path="/player/characters" element={<PlayerPlaceholder title="Character Manager" />} />
              <Route path="/player/inventory" element={<PlayerPlaceholder title="Inventory Tracker" />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ConfirmProvider>
  );
}
