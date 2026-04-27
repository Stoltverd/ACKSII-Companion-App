import React, { useState } from 'react';
import { AppProvider } from './AppContext';
import { useTheme } from './hooks/useTheme';
import { Sun, Moon, Scroll, Settings2, Bookmark } from 'lucide-react';
import GeneratorView from './views/GeneratorView';
import CustomizationView from './views/CustomizationView';
import SavedItemsView from './views/SavedItemsView';

type Tab = 'generator' | 'customization' | 'saved';

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  return (
    <div className="min-h-screen bg-app text-main font-sans selection:bg-accent selection:text-white pb-12 transition-colors duration-300">
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-app shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold tracking-tight text-accent leading-none">
              ACKS II
            </h1>
            <span className="text-xs text-muted tracking-widest uppercase font-semibold">Companion</span>
          </div>
          
          <nav className="flex space-x-1 border border-app rounded-full p-1 bg-app">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'generator' ? 'bg-surface shadow-sm text-main' : 'text-muted hover:text-main'
              }`}
            >
              <Scroll size={16} />
              <span className="hidden sm:inline">Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'customization' ? 'bg-surface shadow-sm text-main' : 'text-muted hover:text-main'
              }`}
            >
              <Settings2 size={16} />
              <span className="hidden sm:inline">Customization</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'saved' ? 'bg-surface shadow-sm text-main' : 'text-muted hover:text-main'
              }`}
            >
              <Bookmark size={16} />
              <span className="hidden sm:inline">Saved</span>
            </button>
          </nav>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-main transition-colors border border-transparent hover:border-app"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {activeTab === 'generator' && <GeneratorView />}
        {activeTab === 'customization' && <CustomizationView />}
        {activeTab === 'saved' && <SavedItemsView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
