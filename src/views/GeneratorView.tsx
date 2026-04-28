import React, { useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useGenerator } from '../hooks/useGenerator';
import { useConfirm } from '../hooks/useConfirm';
import { Lock, Unlock, Save } from 'lucide-react';
import { MagicType } from '../types';

export default function GeneratorView() {
  const { languages, spellLists, saveScroll } = useAppContext();
  const { state, lockedMagicType, setLockedMagicType, lockedLanguage, setLockedLanguage, lockedLevels, setLockedLevels, startGeneration } = useGenerator(languages, spellLists);
  const { alert: showAlert, prompt } = useConfirm();
  
  useEffect(() => {
    // If not locked or ID is invalid, pick default to avoid empty selects
    if (!lockedLanguage.id && languages.length > 0) {
      setLockedLanguage(prev => ({ ...prev, id: languages[0].id }));
    }
  }, [languages]);

  const handleSave = async () => {
    if (state.resultData && state.finalOutput) {
      const name = await prompt({
        title: 'Save Scroll',
        message: 'Please enter a name for this scroll:',
        placeholder: 'e.g. Scroll of Fireball',
        confirmText: 'Save',
        validate: (value) => {
          const trimmed = value.trim();
          if (trimmed.length === 0) return "Name cannot be empty.";
          const validNameRegex = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚöÖñÑ]+$/;
          if (!validNameRegex.test(trimmed)) return "Name contains invalid characters.";
          return null;
        }
      });

      if (!name) return; // User cancelled

      saveScroll({
        id: crypto.randomUUID(),
        name: name.trim(),
        dateSaved: Date.now(),
        magicType: state.resultData.magicType,
        language: state.resultData.language,
        totalLevels: state.resultData.totalLevels,
        spells: state.resultData.spells,
        generatedText: state.finalOutput,
        spellListName: state.resultData.spellListName
      });
      showAlert({ title: 'Success', message: 'Scroll saved successfully! You can view it in the Saved tab.' });
    }
  };

  const availableMagicTypes = Array.from(new Set(spellLists.map(list => list.magicType)));
  const magicTypeCount = availableMagicTypes.length;

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Scroll Generation</h2>
        <p className="text-muted text-sm">Generate magic scrolls quickly and transparently using the ACKS II rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Control Area */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col space-y-6 flex-1">
            <h3 className="font-serif text-xl font-medium border-b border-app pb-2">Generation Controls</h3>
            
            <div className="space-y-4 flex-1">
              {/* Magic Type Toggle */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-main">Magic Type Constraint</label>
                  <button 
                    onClick={() => setLockedMagicType(prev => ({ ...prev, isLocked: !prev.isLocked }))}
                    className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                      lockedMagicType.isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lockedMagicType.isLocked ? <Lock size={14} className="mr-1" /> : <Unlock size={14} className="mr-1" />}
                    {lockedMagicType.isLocked ? 'Locked' : 'Randomize'}
                  </button>
                </div>
                {lockedMagicType.isLocked && (
                  <div className="flex bg-app rounded-lg p-1 border border-app flex-wrap gap-1">
                    {availableMagicTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setLockedMagicType(prev => ({ ...prev, value: type }))}
                        className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-md transition-colors ${
                          lockedMagicType.value === type 
                            ? 'bg-surface shadow-sm text-main' 
                            : 'text-muted hover:text-main'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
                {!lockedMagicType.isLocked && (
                  <p className="text-xs text-muted">A d{magicTypeCount} roll will determine the magic type.</p>
                )}
              </div>

              {/* Language Toggle */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-main">Language Constraint</label>
                  <button 
                    onClick={() => setLockedLanguage(prev => ({ ...prev, isLocked: !prev.isLocked }))}
                    className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                      lockedLanguage.isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lockedLanguage.isLocked ? <Lock size={14} className="mr-1" /> : <Unlock size={14} className="mr-1" />}
                    {lockedLanguage.isLocked ? 'Locked' : 'Randomize'}
                  </button>
                </div>
                {lockedLanguage.isLocked && (
                  <select
                    value={lockedLanguage.id || ''}
                    onChange={(e) => setLockedLanguage(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full bg-app border border-app text-main rounded-lg px-3 py-2 text-sm outline-none focus:border-accent font-medium"
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name} {lang.isDivineOnly ? '(Divine Only)' : ''}
                      </option>
                    ))}
                  </select>
                )}
                {!lockedLanguage.isLocked && (
                  <p className="text-xs text-muted">A d100 roll will determine the language based on your language tables.</p>
                )}
              </div>

              {/* Spell Levels Toggle */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-main">Total Spell Levels</label>
                  <button 
                    onClick={() => setLockedLevels(prev => ({ ...prev, isLocked: !prev.isLocked }))}
                    className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                      lockedLevels.isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lockedLevels.isLocked ? <Lock size={14} className="mr-1" /> : <Unlock size={14} className="mr-1" />}
                    {lockedLevels.isLocked ? 'Locked' : 'Randomize'}
                  </button>
                </div>
                {lockedLevels.isLocked && (
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={lockedLevels.value}
                    onChange={(e) => setLockedLevels(prev => ({ ...prev, value: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-app border border-app text-main rounded-lg px-3 py-2 text-sm outline-none focus:border-accent font-medium"
                  />
                )}
                {!lockedLevels.isLocked && (
                  <p className="text-xs text-muted">A d100 roll will determine total spell levels.</p>
                )}
              </div>
            </div>

            <button 
              onClick={() => {
                if (languages.length === 0) {
                  showAlert({ title: 'Warning', message: "There are no languages available. Please add languages in the Customization tab first." });
                  return;
                }
                if (spellLists.length === 0) {
                  showAlert({ title: 'Warning', message: "There are no spell lists available. Please add spell lists in the Customization tab first." });
                  return;
                }
                
                let hasSpells = false;
                for (const list of spellLists) {
                  if (list.levels) {
                    for (const lvl of list.levels) {
                      if (lvl.spells && lvl.spells.length > 0) {
                        hasSpells = true;
                        break;
                      }
                    }
                  }
                  if (hasSpells) break;
                }
              
                if (!hasSpells) {
                  showAlert({ title: 'Warning', message: "There are no spells in any spell list. Please add spells in the Customization tab first." });
                  return;
                }
              
                startGeneration();
              }}
              disabled={state.isGenerating}
              className="w-full py-3 bg-accent text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
            >
               <span>{state.isGenerating ? 'Generating...' : 'Generate New Scroll'}</span>
            </button>
          </div>
          
          {state.isFinished && state.finalOutput && (
             <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col">
               <h3 className="font-serif text-xl font-medium border-b border-app pb-2 mb-4 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50">Generation Complete</h3>
               <div className="bg-yellow-50 dark:bg-[#2a2820] text-amber-900 dark:text-amber-100 p-4 rounded-xl font-serif text-sm border border-yellow-200 dark:border-yellow-900/50 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {state.finalOutput}
               </div>
               <button 
                 onClick={handleSave}
                 className="mt-6 w-full py-2.5 bg-surface border-2 border-accent text-accent rounded-xl font-medium shadow-sm hover:bg-accent hover:text-white transition-all flex items-center justify-center space-x-2"
               >
                 <Save size={18} />
                 <span>Save to Collection</span>
               </button>
             </div>
          )}
        </div>

        {/* Result Log */}
        <div className="lg:col-span-7">
          <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
            <h3 className="font-serif text-xl font-medium border-b border-app pb-2 mb-4">Transparency Log</h3>
            
            {state.log.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted font-serif italic text-lg opacity-50">
                Awaiting generation...
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {state.log.map((entry, idx) => (
                  <div key={idx} className="p-3 bg-app rounded-lg border border-app text-sm leading-relaxed text-main font-mono">
                    {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
