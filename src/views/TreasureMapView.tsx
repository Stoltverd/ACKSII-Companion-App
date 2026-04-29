import React, { useState } from 'react';
import { Lock, Unlock, Save, ChevronDown, ChevronRight, Dices } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { useTreasureMapGenerator } from '../hooks/useTreasureMapGenerator';
import {
  TREASURE_TYPES, UNIQUE_MAP_LOCATIONS, UNIQUE_CLUE_DETAILS, UNIQUE_CLUE_CONTENTS,
  UNIQUE_CLUE_OBSCURITIES, CLUE_CONCEALMENTS, CLUE_CODES
} from '../data/treasureMapData';
import { HoardTableType } from '../types';

export default function TreasureMapView() {
  const { saveTreasureMap } = useAppContext();
  const { promptWithNote, alert: showAlert } = useConfirm();
  const { state, setGlobalLock, setHoardTable, setClueLock, generate, reset } = useTreasureMapGenerator();
  
  const [expandedClues, setExpandedClues] = useState<boolean[]>([true, false, false]);

  const toggleClue = (index: number) => {
    setExpandedClues(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSave = async () => {
    if (state.result && state.result.finalSummary) {
      const result = await promptWithNote({
        title: 'Save Treasure Map',
        message: 'Please enter a name for this map:',
        placeholder: 'e.g. Captain Blackbeard\'s Stash',
        notePlaceholder: 'Write notes about the map, like how rare it is, what monster the hoard belongs to, specifics about clues or how reliable is the map...',
        confirmText: 'Save',
        validate: (value) => {
          const trimmed = value.trim();
          if (trimmed.length === 0) return "Name cannot be empty.";
          const validNameRegex = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚöÖñÑ]+$/;
          if (!validNameRegex.test(trimmed)) return "Name contains invalid characters.";
          return null;
        }
      });

      if (!result) return;

      saveTreasureMap({
        id: crypto.randomUUID(),
        name: result.value.trim(),
        dateSaved: Date.now(),
        treasureType: state.result.treasureType,
        tableUsed: state.config.hoardTableType,
        hoardValue: state.result.hoardValue,
        location: state.result.location,
        clues: state.result.clues,
        generatedText: state.result.finalSummary,
        note: result.note.trim()
      });

      showAlert({
        title: 'Saved',
        message: 'Treasure map saved to your collection!'
      });
    }
  };

  const renderSelectGroup = (
    label: string,
    value: string | number | null,
    options: string[] | number[],
    onChange: (val: string | null) => void,
    placeholder: string
  ) => {
    const isLocked = value !== null;
    return (
      <div className="flex flex-col gap-1.5 mb-4 max-w-full">
        <label className="text-sm font-medium text-main block truncate">{label}</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select
              className="w-full bg-surface border border-app rounded-xl px-4 py-2 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
              value={value === null ? "" : String(value)}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                    onChange(null);
                } else {
                    onChange(val);
                }
              }}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <button
            title={isLocked ? "Unlock" : "Lock"}
            onClick={() => {
              if (isLocked) {
                onChange(null);
              } else {
                // Lock the first item if locked without selection
                onChange(String(options[0]));
              }
            }}
            className={`p-2.5 rounded-xl border flex-shrink-0 transition-colors ${
              isLocked 
                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400' 
                : 'bg-surface border-app text-muted hover:text-main'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <header className="mb-4 shrink-0">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Treasure Map Build</h2>
        <p className="text-muted text-sm">Generate treasure maps quickly and transparently using the ACKS II rules.</p>
      </header>

      <div className={`flex flex-col flex-1 ${state.isFinished || state.result?.log?.length ? 'lg:flex-row lg:h-[calc(100vh-14rem)]' : 'items-center'} gap-8`}>
        
        {/* Control Area */}
        <div className={`flex flex-col space-y-6 w-full ${state.isFinished || state.result?.log?.length ? 'lg:w-1/2 lg:h-full lg:overflow-y-auto lg:pr-2' : 'max-w-2xl'} pb-4 lg:pb-0`}>
          <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col space-y-6 flex-1 shrink-0">
            <h3 className="font-serif text-xl font-medium border-b border-app pb-2">Map Configuration</h3>

            <div className="space-y-6">
              
              <div className="bg-surface border border-app rounded-2xl p-5 shadow-sm">
                <h3 className="font-medium text-lg mb-4 text-main font-serif">General Rules</h3>
                
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-main block">Hoard Value Table</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface border border-app rounded-xl px-4 py-2 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
                      value={state.config.hoardTableType}
                      onChange={(e) => setHoardTable(e.target.value as HoardTableType)}
                    >
                      <option value="Classic">Classic</option>
                      <option value="Heroic">Heroic</option>
                      <option value="Gritty">Gritty</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {renderSelectGroup("Treasure Type", state.config.treasureType, TREASURE_TYPES as unknown as string[], (v) => setGlobalLock('treasureType', v), "Random Treasure Type")}
                {renderSelectGroup("Treasure Location", state.config.location, UNIQUE_MAP_LOCATIONS, (v) => setGlobalLock('location', v), "Random Location")}
                {renderSelectGroup("Number of Clues", state.config.numClues, [0, 1, 2, 3], (v) => setGlobalLock('numClues', v ? parseInt(v, 10) : null), "Random Clue Count")}
              </div>

              {state.config.numClues !== null && state.config.numClues > 0 && (
                <div className="bg-surface border border-app rounded-2xl p-5 shadow-sm">
                  <h3 className="font-medium text-lg mb-4 text-main font-serif">Clue Constraints</h3>

                  {[0, 1, 2].map((i) => {
                    const isDisabled = state.config.numClues !== null && i >= state.config.numClues;
                    if (isDisabled) return null;
                    return (
                      <div key={i} className="mb-4 last:mb-0 border border-app rounded-xl overflow-hidden">
                        <button 
                          className="w-full bg-surface-alt hover:bg-surface px-4 py-3 flex items-center justify-between text-left transition-colors"
                          onClick={() => toggleClue(i)}
                        >
                          <span className="font-medium text-sm">Clue #{i + 1}</span>
                          {expandedClues[i] ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
                        </button>
                        {expandedClues[i] && (
                          <div className="p-4 bg-surface border-t border-app">
                            {renderSelectGroup(`Detail`, state.config.clues[i].detail, UNIQUE_CLUE_DETAILS, (v) => setClueLock(i, 'detail', v), "Random Detail")}
                            {renderSelectGroup(`Content`, state.config.clues[i].content, UNIQUE_CLUE_CONTENTS, (v) => setClueLock(i, 'content', v), "Random Content")}
                            {renderSelectGroup(`Obscurity`, state.config.clues[i].obscurity, UNIQUE_CLUE_OBSCURITIES, (v) => setClueLock(i, 'obscurity', v), "Random Obscurity")}
                            
                            {state.config.clues[i].obscurity === 'Concealed' && (
                               <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-900/50 mt-2">
                                 {renderSelectGroup(`Concealment`, state.config.clues[i].concealment, CLUE_CONCEALMENTS, (v) => setClueLock(i, 'concealment', v), "Random Concealment")}
                               </div>
                            )}
                            {state.config.clues[i].obscurity === 'Coded' && (
                               <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50 mt-2">
                                 {renderSelectGroup(`Code`, state.config.clues[i].code, CLUE_CODES, (v) => setClueLock(i, 'code', v), "Random Code")}
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <button 
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all focus:outline-none flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            onClick={generate}
            disabled={!state.isFinished && state.result?.log.length > 0}
          >
            <Dices className="w-5 h-5"/> {(!state.isFinished && state.result?.log.length > 0) ? 'Generating...' : 'Generate Treasure Map'}
          </button>

        </div>

        {/* Result Area */}
        {(state.isFinished || (state.result?.log && state.result.log.length > 0)) && (
          <div className="w-full lg:w-1/2 lg:h-full lg:overflow-y-auto lg:pr-2 flex flex-col space-y-6">
            {state.isFinished && state.result?.finalSummary && (
               <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col shrink-0">
                 <h3 className="font-serif text-xl font-medium border-b border-app pb-2 mb-4 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">Map Summary</h3>
                 <div className="bg-[#fcfaf2] dark:bg-[#202522] text-emerald-900 dark:text-emerald-100 p-4 lg:p-6 rounded-xl font-serif text-sm lg:text-base border border-emerald-200 dark:border-emerald-900/50 whitespace-pre-wrap leading-relaxed shadow-inner">
                   {state.result.finalSummary}
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
            
            <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col flex-1 shrink-0">
              <h3 className="font-serif text-xl font-medium border-b border-app pb-2 mb-4">Transparency Log</h3>

              <div className="space-y-4 flex-1">
                {state.result?.log.map((entry, idx) => (
                  <div key={idx} className="p-3 bg-app rounded-lg border border-app text-sm leading-relaxed text-main font-mono">
                    <span className="text-accent opacity-50 select-none mr-2">&gt;</span>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

