import React from 'react';
import { useAppContext } from '../../AppContext';
import { Save, Globe } from 'lucide-react';

export default function WorldSettingsManager() {
  const { settings, updateSettings } = useAppContext();

  const currentType = settings?.defaultWorldType || 'Classic';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold flex items-center gap-3">
          <Globe className="text-amber-500" size={32} />
          World Type
        </h2>
        <p className="text-muted text-sm">
          Set the default campaign flavor. Generators (like the Treasure Map Generator) will automatically favor tables that match this setting.
        </p>
      </header>

      <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm space-y-4">
        <label className="block text-sm font-medium text-main mb-2">Default World Flavor</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Classic', 'Heroic', 'Gritty'] as const).map(type => (
            <button
              key={type}
              onClick={() => updateSettings({ defaultWorldType: type })}
              className={`p-4 rounded-xl border text-center transition-all ${
                currentType === type 
                  ? 'bg-accent/10 border-accent text-accent font-semibold shadow-sm' 
                  : 'bg-app border-app text-muted hover:border-accent/50 hover:text-main'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          When this is set, any generation table containing "Classic", "Heroic", or "Gritty" in its name will be automatically selected if available. You can still manually change the table in individual generators.
        </p>
      </div>
    </div>
  );
}
