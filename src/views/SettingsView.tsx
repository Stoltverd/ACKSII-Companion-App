import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { Sun, Moon, RotateCcw, PaintRoller, BellRing } from 'lucide-react';

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const { restoreDefaults } = useAppContext();
  const { confirm, alert: showAlert } = useConfirm();

  const handleRestoreDefaults = async () => {
    const isConfirmed = await confirm({
      title: 'Restore Defaults',
      message: 'Are you sure you want to restore languages and spell lists to their defaults? This will erase any custom spells or languages you have added. Saved scrolls will NOT be deleted.',
      confirmText: 'Restore'
    });

    if (isConfirmed) {
      restoreDefaults();
    }
  };

  const handleRestoreWarnings = () => {
    let count = 0;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hide_alert_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    count = keysToRemove.length;

    showAlert({
      title: 'Warnings Restored',
      message: count > 0 ? `Successfully restored ${count} warning message(s).` : `No hidden warnings found.`
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-surface border border-app rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-app">
          <SettingsIcon className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-serif font-bold text-accent">App Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <section>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <PaintRoller size={16} /> Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted">Toggle between light and dark themes</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-main transition-colors border border-app"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
              </button>
            </div>
          </section>

          {/* Data Management Settings */}
          <section className="pt-4 border-t border-app">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <RotateCcw size={16} /> Data Management
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div className="pr-4">
                <p className="font-medium text-main">Restore Warning Messages</p>
                <p className="text-sm text-muted">Restore any warning messages you previously chose to hide.</p>
              </div>
              <button
                onClick={handleRestoreWarnings}
                className="px-4 py-2 border border-app bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 text-main rounded-md transition-colors flex items-center gap-2 font-medium shrink-0"
              >
                <BellRing size={18} />
                Restore
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-medium text-red-600 dark:text-red-400">Restore Defaults</p>
                <p className="text-sm text-muted">Reset all spell lists and languages to ACKS II defaults. Your saved scrolls will not be deleted.</p>
              </div>
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md transition-colors flex items-center gap-2 font-medium shrink-0"
              >
                <RotateCcw size={18} />
                Restore
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
