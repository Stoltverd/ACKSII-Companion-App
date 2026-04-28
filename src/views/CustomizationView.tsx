import React, { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { Settings2, BookA, Trash2, Plus, GripVertical, FileDown, FileUp, X } from 'lucide-react';
import { Language, SpellList } from '../types';
import * as yaml from 'js-yaml';
import SpellEditorModal from './SpellEditorModal';

export default function CustomizationView() {
  const { languages, setLanguages, spellLists, setSpellLists, restoreDefaults } = useAppContext();
  const { confirm, alert: showAlert } = useConfirm();
  
  const [activeTab, setActiveTab] = useState<'languages' | 'spellLists' | 'importExport'>('languages');
  const [importStrategy, setImportStrategy] = useState<'merge' | 'skip' | 'overwrite'>('merge');
  const [importLog, setImportLog] = useState<string>('');
  const [exportSelection, setExportSelection] = useState<string[]>([]); // URLs/IDs of spell lists
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [draftLanguages, setDraftLanguages] = useState<(Language & { percentage: number })[]>([]);

  // Languages Handlers (Edit Mode)
  const enterEditMode = () => {
    setDraftLanguages(languages.map(l => ({ ...l, percentage: l.rangeMax - l.rangeMin + 1 })));
    setIsEditingLanguages(true);
  };

  const cancelEditMode = () => {
    setIsEditingLanguages(false);
    setDraftLanguages([]);
  };

  const saveLanguages = () => {
    const sum = draftLanguages.reduce((acc, curr) => acc + curr.percentage, 0);
    if (sum !== 100) {
      showAlert({ title: 'Invalid Total', message: `The total probability must be exactly 100%. Currently it is ${sum}%. Please adjust the values.` });
      return;
    }

    if (draftLanguages.some(l => l.percentage < 0)) {
      showAlert({ title: 'Invalid Negative', message: `All languages must have a probability of at least 0%.` });
      return;
    }
    
    let currentMin = 1;
    const newLanguages = draftLanguages.map(l => {
      const rangeMin = l.percentage > 0 ? currentMin : 0;
      const rangeMax = l.percentage > 0 ? currentMin + l.percentage - 1 : -1;
      if (l.percentage > 0) {
        currentMin = rangeMax + 1;
      }
      return {
        id: l.id,
        name: l.name,
        isDivineOnly: l.isDivineOnly,
        rangeMin,
        rangeMax
      };
    });
    
    setLanguages(newLanguages);
    setIsEditingLanguages(false);
  };

  const handleDraftLanguageChange = (id: string, field: keyof (Language & { percentage: number }), value: any) => {
    setDraftLanguages(prev => prev.map(l => {
      if (l.id === id) {
        let finalValue = value;
        if (field === 'percentage') {
            if (value === '') {
                finalValue = '';
            } else {
                finalValue = Math.min(100, Math.max(0, parseInt(value as any) || 0));
            }
        }
        return { ...l, [field]: finalValue };
      }
      return l;
    }));
  };

  const removeDraftLanguage = (id: string) => {
    setDraftLanguages(prev => prev.filter(l => l.id !== id));
  };

  const addDraftLanguage = () => {
    setDraftLanguages(prev => {
       const newDrafts = [...prev];
       newDrafts.push({
          id: crypto.randomUUID(),
          name: 'New Language',
          isDivineOnly: false,
          rangeMin: 0,
          rangeMax: -1,
          percentage: 0
       });
       return newDrafts;
    });
    showAlert({ id: 'addLanguageWarning', title: 'Language Added', message: "Language added, but has a 0% encounter chance. Allocate space for it." });
  };

  const autoBalanceLanguages = () => {
    setDraftLanguages(prev => {
      const N = prev.length;
      if (N === 0) return prev;
      
      const total = prev.reduce((acc, curr) => acc + Math.max(0, curr.percentage || 0), 0);
      const zeroLangs = prev.filter(l => Math.max(0, l.percentage || 0) === 0);
      const nonZeroLangs = prev.filter(l => Math.max(0, l.percentage || 0) > 0);
      
      if (total === 100 && zeroLangs.length === 0) return prev;
      
      const newDrafts = prev.map(l => ({ ...l, percentage: Math.max(0, l.percentage || 0) }));
      
      if (total === 0 || nonZeroLangs.length === 0) {
        const base = Math.floor(100 / N);
        let remainder = 100 % N;
        newDrafts.forEach(l => {
          l.percentage = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;
        });
        return newDrafts;
      }
      
      const targetForZero = N <= 100 ? Math.max(1, Math.floor(100 / N)) : 0;
      newDrafts.forEach(l => {
        if (l.percentage === 0) l.percentage = targetForZero;
      });
      
      const spaceForZeroes = zeroLangs.length * targetForZero;
      const remainingSpace = Math.max(0, 100 - spaceForZeroes);
      
      if (remainingSpace === 0) {
        newDrafts.forEach(l => {
          if (nonZeroLangs.find(p => p.id === l.id)) l.percentage = 0;
        });
      } else {
        const originalNonZeroTotal = nonZeroLangs.reduce((acc, curr) => acc + curr.percentage, 0);
        newDrafts.forEach(l => {
          const orig = nonZeroLangs.find(p => p.id === l.id);
          if (orig) {
            const ratio = orig.percentage / originalNonZeroTotal;
            l.percentage = Math.floor(ratio * remainingSpace);
          }
        });
      }
      
      const currentNewTotal = newDrafts.reduce((acc, curr) => acc + curr.percentage, 0);
      let diff = 100 - currentNewTotal;
      
      let cycleIndex = 0;
      while (diff !== 0) {
        const increment = diff > 0 ? 1 : -1;
        let candidates = newDrafts.filter(l => nonZeroLangs.find(p => p.id === l.id));
        let eligible = candidates.filter(c => increment > 0 || c.percentage > 0);
        
        if (eligible.length === 0) {
          eligible = newDrafts.filter(c => increment > 0 || c.percentage > 0);
        }
        if (eligible.length === 0) break;
        
        const targetLang = eligible[cycleIndex % eligible.length];
        targetLang.percentage += increment;
        diff -= increment;
        cycleIndex++;
      }
      
      return newDrafts;
    });
  };

  // Spell Lists Handlers
  const handleSpellListChange = (id: string, field: keyof SpellList, value: any) => {
    setSpellLists(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const removeSpellList = async (id: string) => {
    if (await confirm({ title: 'Delete Spell List', message: 'Delete this spell list?' })) {
      setSpellLists(prev => prev.filter(s => s.id !== id));
    }
  };

  const addSpellList = () => {
    const newList: SpellList = {
      id: crypto.randomUUID(),
      name: 'New Spell List',
      magicType: 'Arcane',
      levels: []
    };
    setSpellLists(prev => [...prev, newList]);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Customization</h2>
        <p className="text-muted text-sm">Edit lists, spells, and languages according to your specific campaign world.</p>
      </header>

      <div className="bg-surface border border-app rounded-2xl shadow-sm">
        
        <div className="flex border-b border-app bg-app rounded-t-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab('languages')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'languages' ? 'bg-surface text-main border-t-2 border-t-accent' : 'text-muted hover:text-main'
            }`}
          >
            <BookA size={16} />
            <span>Languages</span>
          </button>
          <button
            onClick={() => setActiveTab('spellLists')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'spellLists' ? 'bg-surface text-main border-t-2 border-t-accent' : 'text-muted hover:text-main'
            }`}
          >
            <Settings2 size={16} />
            <span>Spell Lists</span>
          </button>
          <button
            onClick={() => setActiveTab('importExport')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'importExport' ? 'bg-surface text-main border-t-2 border-t-accent' : 'text-muted hover:text-main'
            }`}
          >
            <FileDown size={16} />
            <span>Import / Export</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div className="sticky top-16 bg-surface z-10 -mx-6 -mt-6 p-6 pb-4 border-b border-app shadow-sm space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg text-main">Language Tables</h3>
                  {!isEditingLanguages ? (
                    <button onClick={enterEditMode} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                      <Settings2 size={16} />
                      <span>Edit Languages</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button onClick={cancelEditMode} className="flex items-center space-x-1 text-sm bg-surface border border-app text-main px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span>Cancel</span>
                      </button>
                      {(() => {
                        const isValid = draftLanguages.reduce((acc, curr) => acc + (curr.percentage || 0), 0) === 100 && draftLanguages.every(l => l.percentage >= 0);
                        return (
                          <button 
                            onClick={saveLanguages} 
                            disabled={!isValid}
                            className={`flex items-center space-x-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${isValid ? 'bg-accent text-white hover:opacity-90' : 'bg-app border-app text-muted cursor-not-allowed opacity-50'}`}
                          >
                            <span>Save Edits</span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {isEditingLanguages && (
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-end min-h-[32px]">
                      <span className="text-sm text-muted">Adjust the probability percentages. Must equal 100%.</span>
                      {(() => {
                        const total = draftLanguages.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
                        const isExactly100 = total === 100;
                        const hasNewZeroPercent = draftLanguages.some(l => (l.percentage || 0) === 0 && !languages.some(orig => orig.id === l.id));
                        const shouldShowButton = !isExactly100 || hasNewZeroPercent;
                        return (
                          <div className="flex items-center space-x-3">
                            {shouldShowButton && (
                              <button
                                onClick={autoBalanceLanguages}
                                className="px-2 py-1 text-xs border border-app rounded bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 text-main font-medium transition-colors shadow-sm"
                              >
                                Auto-balance
                              </button>
                            )}
                            <div className={`text-sm font-medium ${isExactly100 ? 'text-green-500' : 'text-red-500'}`}>
                              Current Total: {total}% / 100%
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full h-3 bg-app rounded-full overflow-hidden flex shadow-inner">
                      {draftLanguages.map((lang, index) => {
                        // Generate a pseudo-random determinisitic color based on id or index
                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'];
                        const colorClass = colors[index % colors.length];
                        const width = `${Math.min(Math.max(lang.percentage || 0, 0), 100)}%`;
                        return (
                          <div 
                            key={`bar-${lang.id}`} 
                            style={{ width }} 
                            onClick={(e) => {
                               // Optional: e.preventDefault()
                               const inputEl = document.getElementById(`lang-input-${lang.id}`);
                               const cardEl = document.getElementById(`lang-card-${lang.id}`);
                               if (inputEl && cardEl) {
                                 cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                 setTimeout(() => inputEl.focus(), 50);
                                 
                                 // Add visual pulse/breath effect
                                 cardEl.classList.add('ring-2', 'ring-accent', 'scale-[1.02]', 'shadow-lg');
                                 setTimeout(() => {
                                   cardEl.classList.remove('ring-2', 'ring-accent', 'scale-[1.02]', 'shadow-lg');
                                 }, 400);
                               }
                            }}
                            className={`h-full ${colorClass} transition-all duration-300 ease-in-out border-r border-[#ffffff20] last:border-r-0 cursor-pointer hover:opacity-80`}
                            title={`${lang.name}: ${lang.percentage}%`}
                          />
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-end pt-1">
                      <button onClick={addDraftLanguage} className="flex items-center space-x-1 text-xs bg-surface border border-app px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus size={14} />
                        <span>Add Language</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isEditingLanguages ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-app rounded-xl border border-app font-medium text-sm text-muted">
                    <div className="col-span-4">Language Name</div>
                    <div className="col-span-2 text-center">Probability</div>
                    <div className="col-span-3 text-center">D100 Range</div>
                    <div className="col-span-3 text-center">Constraints</div>
                  </div>
                  {languages.map(lang => (
                    <div key={lang.id} className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface rounded-xl border border-app items-center text-sm">
                      <div className="col-span-4 text-main font-medium">{lang.name}</div>
                      <div className="col-span-2 text-center text-muted">{lang.rangeMax - lang.rangeMin + 1}%</div>
                      <div className="col-span-3 text-center text-muted font-mono bg-app rounded px-1 py-0.5">
                        {lang.rangeMax >= lang.rangeMin ? `${lang.rangeMin} - ${lang.rangeMax}` : 'None'}
                      </div>
                      <div className="col-span-3 text-center text-muted">
                        {lang.isDivineOnly ? <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md text-xs">Divine Only</span> : <span className="text-gray-400">None</span>}
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-xs text-muted pt-2 px-2">
                    Total: {languages.reduce((acc, curr) => acc + (curr.rangeMax - curr.rangeMin + 1), 0)}%
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {draftLanguages.map((lang, index) => {
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'];
                    const colorClass = colors[index % colors.length];
                    return (
                    <div id={`lang-card-${lang.id}`} key={lang.id} className="flex items-center gap-4 bg-app p-4 rounded-xl border border-app transition-all duration-300 transform">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <label className="flex items-center space-x-1.5 text-xs font-medium text-muted mb-1">
                            <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                            <span>Name</span>
                          </label>
                          <input 
                            id={`lang-input-${lang.id}`}
                            type="text" 
                            value={lang.name} 
                            onChange={e => handleDraftLanguageChange(lang.id, 'name', e.target.value)}
                            className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-muted mb-1">Probability (%)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={lang.percentage === '' ? '' : (lang.percentage || 0)} 
                              onChange={e => handleDraftLanguageChange(lang.id, 'percentage', e.target.value)}
                              className="w-full bg-surface border border-app rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:border-accent"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex items-center pt-5">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={lang.isDivineOnly}
                              onChange={e => handleDraftLanguageChange(lang.id, 'isDivineOnly', e.target.checked)}
                              className="rounded border-app text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-main">Divine Only</span>
                          </label>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeDraftLanguage(lang.id)}
                        className="text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors self-end md:self-auto md:mt-5"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}

          {activeTab === 'spellLists' && (
            <div className="space-y-6">
              <div className="sticky top-16 bg-surface z-10 -mx-6 -mt-6 p-6 pb-4 border-b border-app shadow-sm flex justify-between items-center mb-6">
                <h3 className="font-medium text-lg text-main">Spell Lists</h3>
                <button onClick={addSpellList} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 shadow-sm">
                  <Plus size={16} />
                  <span>Add List</span>
                </button>
              </div>

              <div className="space-y-4">
                {spellLists.length === 0 && (
                  <div className="p-8 text-center bg-surface border border-dashed border-app rounded-xl flex flex-col items-center">
                    <p className="text-muted text-sm mb-4">No spell lists created yet.</p>
                    <button onClick={addSpellList} className="flex items-center space-x-1 text-sm bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-sm">
                      <Plus size={16} />
                      <span>Create your first Spell List</span>
                    </button>
                  </div>
                )}
                {spellLists.map(list => (
                  <div key={list.id} className="bg-app border border-app rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                          <label className="block text-xs font-medium text-muted mb-1">List Name</label>
                          <input 
                            type="text" 
                            value={list.name} 
                            onChange={e => handleSpellListChange(list.id, 'name', e.target.value)}
                            className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent font-medium text-lg"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-muted mb-1">Magic Type</label>
                          <select 
                            value={list.magicType}
                            onChange={e => handleSpellListChange(list.id, 'magicType', e.target.value)}
                            className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                          >
                            <option value="Arcane">Arcane</option>
                            <option value="Divine">Divine</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeSpellList(list.id)}
                        className="ml-4 mt-6 text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-app flex items-center justify-between">
                       <p className="text-sm text-muted">You have {list.levels.length} levels configured for this list.</p>
                       <button
                         onClick={() => setEditingListId(list.id)}
                         className="px-3 py-1.5 bg-surface border border-app hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
                       >
                         Edit Spells
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {spellLists.length > 5 && (
                <div className="flex justify-end pt-2">
                  <button onClick={addSpellList} className="flex items-center space-x-1 text-sm bg-surface border border-app text-main px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
                    <Plus size={16} />
                    <span>Add List</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'importExport' && (
            <div className="space-y-8">
              {/* EXPORT SECTION */}
              <div className="bg-app border border-app rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <FileDown size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-main">Export Data</h3>
                    <p className="text-sm text-muted">Download your custom tables and spell lists as a YAML file.</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-main mb-3">
                    Select Spell Lists to Export (Leave empty to export EVERYTHING)
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-surface border border-app rounded-lg min-h-[60px]">
                    {spellLists.length === 0 ? (
                      <span className="text-sm text-muted self-center">No spell lists available.</span>
                    ) : (
                      spellLists.map(list => {
                        const isSelected = exportSelection.includes(list.id);
                        return (
                          <button
                            key={list.id}
                            onClick={() => setExportSelection(prev => 
                              isSelected ? prev.filter(id => id !== list.id) : [...prev, list.id]
                            )}
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                              isSelected 
                                ? 'bg-accent text-white border-accent' 
                                : 'bg-app text-muted border-app hover:border-accent hover:text-main'
                            }`}
                          >
                            <span>{list.name}</span>
                            {isSelected && <X size={14} className="ml-1 opacity-70 hover:opacity-100" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    let dataToExport: any = {};
                    if (exportSelection.length === 0) {
                      const exportLangs = languages.map(l => ({
                         name: l.name,
                         isDivineOnly: l.isDivineOnly,
                         percentage: l.rangeMax - l.rangeMin + 1
                      }));
                      dataToExport = { languages: exportLangs, spellLists };
                    } else {
                      dataToExport = { spellLists: spellLists.filter(sl => exportSelection.includes(sl.id)) };
                    }
                    try {
                        const yamlStr = yaml.dump(dataToExport, { skipInvalid: true, indent: 2 });
                        const blob = new Blob([yamlStr], { type: 'text/yaml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `acks-ii-data-${new Date().toISOString().split('T')[0]}.yaml`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        console.error(e);
                        showAlert({ title: 'Export Failed', message: "There was an error while generating the export file." });
                    }
                  }}
                  className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 flex items-center shadow-sm"
                >
                  <FileDown size={18} className="mr-2" />
                  Export to YAML
                </button>
              </div>

              {/* IMPORT SECTION */}
              <div className="bg-app border border-app rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                    <FileUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-main">Import Data</h3>
                    <p className="text-sm text-muted">Upload a YAML file to import languages and spell lists.</p>
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-main mb-2">Import Strategy</label>
                    <div className="flex bg-surface rounded-lg p-1 border border-app w-max">
                      <button
                        onClick={() => setImportStrategy('merge')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          importStrategy === 'merge' ? 'bg-app shadow-sm text-main' : 'text-muted hover:text-main'
                        }`}
                      >
                        Merge (Append)
                      </button>
                      <button
                        onClick={() => setImportStrategy('skip')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          importStrategy === 'skip' ? 'bg-app shadow-sm text-main' : 'text-muted hover:text-main'
                        }`}
                      >
                        Skip Existing
                      </button>
                      <button
                        onClick={() => setImportStrategy('overwrite')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          importStrategy === 'overwrite' ? 'bg-app shadow-sm text-main text-red-500' : 'text-muted hover:text-main'
                        }`}
                      >
                        Overwrite All
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {importStrategy === 'merge' && 'Merge retains existing items and adds/updates matched by name.'}
                      {importStrategy === 'skip' && 'Skip adds only new items; existing ones are ignored.'}
                      {importStrategy === 'overwrite' && 'Overwrite deletes ALL current custom data and replaces it.'}
                    </p>
                  </div>

                  <input
                    type="file"
                    accept=".yaml,.yml"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const result = yaml.load(event.target?.result as string) as any;
                          if (!result) return;
                          
                          let log = `Importing file: ${file.name}\nStrategy: ${importStrategy}\n\n`;

                          if (Array.isArray(result) && result.length > 0 && result[0].spellName) {
                            let addedSpellCount = 0;
                            let skippedSpellCount = 0;
                            let mergedSpellCount = 0;
                            let overwrittenSpellCount = 0;

                            setSpellLists(prev => {
                               const newLists = JSON.parse(JSON.stringify(prev)) as SpellList[];
                               
                               result.forEach(imported => {
                                  const { spellName, level, magicType, belongsToLists } = imported;
                                  if (!spellName || typeof level !== 'number' || !belongsToLists || !Array.isArray(belongsToLists)) return;
                                  
                                  let existsAtAll = false;
                                  let existingLevel = -1;
                                  newLists.forEach(list => {
                                     list.levels.forEach(lvl => {
                                        if (lvl.spells.some(s => s.name === spellName)) {
                                           existsAtAll = true;
                                           existingLevel = lvl.level;
                                        }
                                     });
                                  });

                                  if (existsAtAll) {
                                      if (importStrategy === 'skip') {
                                          skippedSpellCount++;
                                          return;
                                      } else if (importStrategy === 'overwrite') {
                                          newLists.forEach(list => {
                                             list.levels.forEach(lvl => {
                                                lvl.spells = lvl.spells.filter(s => s.name !== spellName);
                                             });
                                          });
                                          belongsToLists.forEach((targetListName: string) => {
                                             let list = newLists.find(l => l.name === targetListName);
                                             if (!list) {
                                                list = { id: crypto.randomUUID(), name: targetListName, magicType: magicType || 'Arcane', levels: [] };
                                                newLists.push(list);
                                             }
                                             let listLvl = list.levels.find(l => l.level === level);
                                             if (!listLvl) {
                                                listLvl = { level, spells: [] };
                                                list.levels.push(listLvl);
                                             }
                                             listLvl.spells.push({ id: crypto.randomUUID(), name: spellName });
                                          });
                                          overwrittenSpellCount++;
                                      } else if (importStrategy === 'merge') {
                                          const targetLevel = existingLevel !== -1 ? existingLevel : level;
                                          belongsToLists.forEach((targetListName: string) => {
                                             let list = newLists.find(l => l.name === targetListName);
                                             if (!list) {
                                                list = { id: crypto.randomUUID(), name: targetListName, magicType: magicType || 'Arcane', levels: [] };
                                                newLists.push(list);
                                             }
                                             let listLvl = list.levels.find(l => l.level === targetLevel);
                                             if (!listLvl) {
                                                listLvl = { level: targetLevel, spells: [] };
                                                list.levels.push(listLvl);
                                             }
                                             if (!listLvl.spells.some(s => s.name === spellName)) {
                                                 listLvl.spells.push({ id: crypto.randomUUID(), name: spellName });
                                             }
                                          });
                                          mergedSpellCount++;
                                      }
                                  } else {
                                      belongsToLists.forEach((targetListName: string) => {
                                         let list = newLists.find(l => l.name === targetListName);
                                         if (!list) {
                                            list = { id: crypto.randomUUID(), name: targetListName, magicType: magicType || 'Arcane', levels: [] };
                                            newLists.push(list);
                                         }
                                         let listLvl = list.levels.find(l => l.level === level);
                                         if (!listLvl) {
                                            listLvl = { level, spells: [] };
                                            list.levels.push(listLvl);
                                         }
                                         listLvl.spells.push({ id: crypto.randomUUID(), name: spellName });
                                      });
                                      addedSpellCount++;
                                  }
                               });

                               newLists.forEach(list => {
                                   list.levels.sort((a,b) => a.level - b.level);
                               });
                               
                               return newLists;
                            });

                            log += `- Processed spells dataset: ${addedSpellCount} added, ${mergedSpellCount} merged, ${overwrittenSpellCount} overwritten, ${skippedSpellCount} skipped.\n`;
                          } else {
                            if (importStrategy === 'overwrite') {
                              if (result.languages && Array.isArray(result.languages)) {
                                let currentMin = 1;
                                let parsedLangs = result.languages.map((il: any) => {
                                  const percent = il.percentage || ((il.rangeMax || 0) - (il.rangeMin || 0) + 1) || 1;
                                  const rangeMin = currentMin;
                                  const rangeMax = currentMin + percent - 1;
                                  currentMin = rangeMax + 1;
                                  return { ...il, id: crypto.randomUUID(), rangeMin, rangeMax };
                                });
                                
                                const totalPercent = parsedLangs.reduce((acc: number, curr: Language) => acc + (curr.rangeMax - curr.rangeMin + 1), 0);
                                if (totalPercent !== 100) {
                                  throw new Error(`Language sum must be exactly 100%. Got ${totalPercent}%.`);
                                }
                                setLanguages(parsedLangs);
                                log += `- Overwrote ${parsedLangs.length} languages.\n`;
                              }
                              if (result.spellLists) {
                                setSpellLists(result.spellLists);
                                log += `- Overwrote ${result.spellLists.length} spell lists.\n`;
                              }
                            } else {
                              if (result.languages && Array.isArray(result.languages)) {
                                let addCount = 0; let updateCount = 0; let skipCount = 0;
                                let newLangs = languages.map(l => ({...l, percentage: l.rangeMax - l.rangeMin + 1}));
                                
                                result.languages.forEach((il: any) => {
                                  const percent = il.percentage || ((il.rangeMax || 0) - (il.rangeMin || 0) + 1) || 1;
                                  const idx = newLangs.findIndex(l => l.name === il.name);
                                  if (idx >= 0) {
                                    if (importStrategy === 'merge') {
                                      newLangs[idx] = { ...newLangs[idx], isDivineOnly: il.isDivineOnly ?? newLangs[idx].isDivineOnly, percentage: percent };
                                      updateCount++;
                                    } else if (importStrategy === 'skip') {
                                      skipCount++;
                                    }
                                  } else {
                                    newLangs.push({ id: crypto.randomUUID(), name: il.name, isDivineOnly: il.isDivineOnly || false, percentage: percent, rangeMin: 0, rangeMax: 0 });
                                    addCount++;
                                  }
                                });
                                
                                const total = newLangs.reduce((acc, curr) => acc + curr.percentage, 0);
                                if (total !== 100 && (addCount > 0 || updateCount > 0)) {
                                  throw new Error(`Language sum must be exactly 100%. Currently it would be ${total}%. Import cancelled for languages.`);
                                }

                                let currentMin = 1;
                                const finalLangs = newLangs.map(l => {
                                  const rangeMin = currentMin;
                                  const rangeMax = currentMin + l.percentage - 1;
                                  currentMin = rangeMax + 1;
                                  return { 
                                    id: l.id, 
                                    name: l.name, 
                                    isDivineOnly: l.isDivineOnly, 
                                    rangeMin, 
                                    rangeMax 
                                  };
                                });
                                
                                setLanguages(finalLangs);
                                log += `- Languages: ${addCount} added, ${updateCount} updated, ${skipCount} skipped.\n`;
                              }

                              if (result.spellLists && Array.isArray(result.spellLists)) {
                                let addCount = 0; let updateCount = 0; let skipCount = 0;
                                setSpellLists(prev => {
                                  let newLists = [...prev];
                                  result.spellLists.forEach((il: SpellList) => {
                                    const idx = newLists.findIndex(l => l.name === il.name);
                                    if (idx >= 0) {
                                      if (importStrategy === 'merge') {
                                        newLists[idx] = { ...il, id: newLists[idx].id };
                                        updateCount++;
                                      } else if (importStrategy === 'skip') {
                                        skipCount++;
                                      }
                                    } else {
                                      newLists.push({ ...il, id: crypto.randomUUID() });
                                      addCount++;
                                    }
                                  });
                                  return newLists;
                                });
                                log += `- Spell lists: ${addCount} added, ${updateCount} updated, ${skipCount} skipped.\n`;
                              }
                            }
                          }
                          
                          setImportLog(log + '\nImport successful.');
                        } catch (err: any) {
                          setImportLog(`Error during import:\n${err.message}`);
                        }
                        
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      };
                      reader.readAsText(file);
                    }}
                  />
                  
                  <div className="pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center shadow-sm"
                    >
                      <FileUp size={18} className="mr-2" />
                      Select YAML File
                    </button>
                  </div>
                  
                  {importLog && (
                    <div className="mt-4 p-4 bg-surface border border-app rounded-lg font-mono text-xs text-main whitespace-pre-wrap">
                      {importLog}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-app bg-app/50 flex justify-end">
          <button 
            onClick={async () => {
              if (await confirm({ title: 'Restore Defaults', message: 'Are you sure you want to restore defaults? All custom languages and spell lists will be lost.' })) {
                restoreDefaults();
              }
            }}
            className="px-4 py-2 border border-app bg-surface rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#2a2a28] transition-colors"
          >
            Restore Defaults
          </button>
        </div>
      </div>
      
      {editingListId && (
        <SpellEditorModal
          listId={editingListId}
          spellLists={spellLists}
          setSpellLists={setSpellLists}
          onClose={() => setEditingListId(null)}
        />
      )}
    </div>
  );
}
