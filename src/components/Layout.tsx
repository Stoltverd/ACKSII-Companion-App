import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Scroll, Map, Settings2, Bookmark, Settings, Sun, Moon, Shield, User, Database } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../AppContext';

const JUDGE_NAV_ITEMS = [
  { section: 'Generators' },
  { name: 'Scroll Generator', path: '/', icon: Scroll },
  { name: 'Treasure Map Generator', path: '/treasure-map', icon: Map },
  { section: 'Judge Data' },
  { name: 'Data Management', path: '/customization', icon: Database },
  { name: 'Saved Items', path: '/saved', icon: Bookmark },
  { section: 'System' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const PLAYER_NAV_ITEMS = [
  { section: 'Player Tools' },
  { name: 'Character Manager (Soon)', path: '/player/characters', icon: User },
  { section: 'Player Data' },
  { name: 'Inventory (Soon)', path: '/player/inventory', icon: Bookmark },
  { section: 'System' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppContext();

  const NAV_ITEMS = appMode === 'judge' ? JUDGE_NAV_ITEMS : PLAYER_NAV_ITEMS;

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-app text-main font-sans selection:bg-accent selection:text-white transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-app shadow-sm h-16 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-main focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold tracking-tight text-accent leading-none">
              ACKS II
            </h1>
            <span className="text-xs text-muted tracking-widest uppercase font-semibold">Companion <span className="opacity-70">| {appMode === 'judge' ? 'Judge' : 'Player'}</span></span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-main transition-colors border border-transparent hover:border-app"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 transform transition-transform duration-300 ease-in-out border-r border-app shadow-xl flex flex-col ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-app">
          <div className="flex flex-col">
            <h2 className="font-serif text-xl font-bold tracking-tight text-accent leading-none">Menu</h2>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-main focus:outline-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {NAV_ITEMS.map((item, idx) => {
              if (item.section) {
                return (
                  <li key={`header-${idx}`} className="px-6 py-2 mt-2">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
                      {item.section}
                    </h3>
                  </li>
                );
              }

              const Icon = item.icon!;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) => 
                      `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-accent/10 border-l-4 border-accent text-accent' 
                          : 'border-l-4 border-transparent text-main hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Icon size={18} className="mr-3" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer actions in drawer showing appMode toggle */}
        <div className="p-4 border-t border-app">
          <button 
            onClick={() => setAppMode(appMode === 'judge' ? 'player' : 'judge')}
            className="w-full flex items-center justify-center py-2 px-4 rounded-md border border-app hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            {appMode === 'judge' ? (
              <><Shield size={16} className="mr-2 text-accent" /> Switch to Player Mode</>
            ) : (
              <><User size={16} className="mr-2 text-accent" /> Switch to Judge Mode</>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto mt-4 px-4 sm:px-6 lg:px-8 pb-4 lg:pb-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
