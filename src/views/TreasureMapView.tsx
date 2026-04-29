import React, { useState } from 'react';
import { Lock, Unlock, Save, ChevronDown, ChevronRight, Dices } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { useTreasureMapGenerator } from '../hooks/useTreasureMapGenerator';
import {
  TREASURE_TYPES, MAP_LOCATIONS, CLUE_DETAILS, CLUE_CONTENTS,
  CLUE_OBSCURITIES, CLUE_CONCEALMENTS, CLUE_CODES
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden">
      
      {/* Control Area (Left) */}
      <div className="w-full md:w-1/2 flex flex-col bg-surface-alt border-r border-app overflow-y-auto custom-scrollbar shadow-inner mt-px">
        <div className="p-4 md:p-6 lg:p-8 flex-1">
          <h2 className="font-serif text-2xl font-bold mb-6 text-main">Map Configuration</h2>

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
              {renderSelectGroup("Treasure Location", state.config.location, MAP_LOCATIONS, (v) => setGlobalLock('location', v), "Random Location")}
              {renderSelectGroup("Number of Clues", state.config.numClues, [1, 2, 3], (v) => setGlobalLock('numClues', v ? parseInt(v, 10) : null), "Random Clue Count")}
            </div>

            <div className="bg-surface border border-app rounded-2xl p-5 shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-main font-serif">Clues Constraints</h3>

              {[0, 1, 2].map((i) => (
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
                      {renderSelectGroup(`Detail`, state.config.clues[i].detail, CLUE_DETAILS, (v) => setClueLock(i, 'detail', v), "Random Detail")}
                      {renderSelectGroup(`Content`, state.config.clues[i].content, CLUE_CONTENTS, (v) => setClueLock(i, 'content', v), "Random Content")}
                      {renderSelectGroup(`Obscurity`, state.config.clues[i].obscurity, CLUE_OBSCURITIES, (v) => setClueLock(i, 'obscurity', v), "Random Obscurity")}
                      
                      {state.config.clues[i].obscurity && ['Concealed', 'Coded and Concealed'].includes(state.config.clues[i].obscurity as string) && (
                         <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-900/50 mt-2">
                           {renderSelectGroup(`Concealment`, state.config.clues[i].concealment, CLUE_CONCEALMENTS, (v) => setClueLock(i, 'concealment', v), "Random Concealment")}
                         </div>
                      )}
                      {state.config.clues[i].obscurity && ['Coded', 'Coded and Concealed'].includes(state.config.clues[i].obscurity as string) && (
                         <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50 mt-2">
                           {renderSelectGroup(`Code`, state.config.clues[i].code, CLUE_CODES, (v) => setClueLock(i, 'code', v), "Random Code")}
                         </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-surface border-t border-app sticky bottom-0 z-10 shadow-lg">
          <button 
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center gap-2 active:scale-[0.98]"
            onClick={() => {
              if (state.isFinished) {
                reset();
              } else {
                generate();
              }
            }}
          >
            {state.isFinished ? 'Reset Generator' : <><Dices className="w-5 h-5"/> Generate Treasure Map</>}
          </button>
        </div>
      </div>

      {/* Result Area (Right) */}
      <div className="w-full md:w-1/2 flex flex-col bg-surface overflow-y-auto custom-scrollbar mt-px relative">
        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-bold text-main">Result Log</h2>

          {!state.isFinished ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4 opacity-50">
              <Dices className="w-16 h-16 opacity-30" />
              <p className="font-medium text-lg">Click generate to map the treasure</p>
            </div>
          ) : (
            <>
              <div className="bg-surface-alt border border-app rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-sm uppercase tracking-wider font-semibold text-muted mb-4 pb-2 border-b border-app">Generation Steps</h3>
                <div className="font-mono text-xs md:text-sm text-sub space-y-3">
                  {state.result?.log.map((entry, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-accent opacity-50 select-none">&gt;</span>
                      <span className="leading-relaxed">{entry}</span>
                    </div>
                  ))}
                </div>
              </div>

              {state.result?.finalSummary && (
                <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col mt-2">
                  <h3 className="font-serif text-xl font-medium border-b border-app pb-2 mb-4 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">Map Summary</h3>
                  <div className="bg-[#fcfaf2] dark:bg-[#202522] text-emerald-900 dark:text-emerald-100 p-4 lg:p-6 rounded-xl font-serif text-sm lg:text-base border border-emerald-200 dark:border-emerald-900/50 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {state.result.finalSummary}
                  </div>
                  <button 
                    className="mt-6 self-end bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4" /> Save Map
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

