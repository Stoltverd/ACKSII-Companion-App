import React, { useState, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { FileDown, FileUp, X } from 'lucide-react';
import { Language, SpellList } from '../../types';
import * as yaml from 'js-yaml';

export default function ImportExportManager() {
  const { languages, setLanguages, spellLists, setSpellLists, restoreDefaults } = useAppContext();
  const { confirm, alert: showAlert } = useConfirm();
  
  const [importStrategy, setImportStrategy] = useState<'merge' | 'skip' | 'overwrite'>('merge');
  const [importLog, setImportLog] = useState<string>('');
  const [exportSelection, setExportSelection] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Import & Export</h2>
        <p className="text-muted text-sm">Backup and restore your custom tables and spell lists.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-surface border border-app rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-app">
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
            <div className="flex flex-wrap gap-2 p-3 bg-app border border-app rounded-lg min-h-[60px]">
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
                          : 'bg-surface text-muted border-app hover:border-accent hover:text-main'
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
            onClick={handleExport}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 flex items-center shadow-sm"
          >
            <FileDown size={18} className="mr-2" />
            Export to YAML
          </button>
        </div>

        <div className="bg-surface border border-app rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-app">
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
              <div className="flex bg-app rounded-lg p-1 border border-app w-max">
                <button
                  onClick={() => setImportStrategy('merge')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    importStrategy === 'merge' ? 'bg-surface shadow-sm text-main border border-app' : 'text-muted hover:text-main border border-transparent'
                  }`}
                >
                  Merge (Append)
                </button>
                <button
                  onClick={() => setImportStrategy('skip')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    importStrategy === 'skip' ? 'bg-surface shadow-sm text-main border border-app' : 'text-muted hover:text-main border border-transparent'
                  }`}
                >
                  Skip Existing
                </button>
                <button
                  onClick={() => setImportStrategy('overwrite')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    importStrategy === 'overwrite' ? 'bg-surface shadow-sm text-main text-red-500 border border-app' : 'text-muted hover:text-main border border-transparent'
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
              onChange={handleImport}
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
              <div className="mt-4 p-4 bg-app border border-app rounded-lg font-mono text-xs text-main whitespace-pre-wrap">
                {importLog}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border border-app bg-app/50 flex justify-end rounded-2xl shadow-sm">
          <button 
            onClick={async () => {
              if (await confirm({ title: 'Restore Defaults', message: 'Are you sure you want to restore defaults? All custom languages and spell lists will be lost.' })) {
                restoreDefaults();
              }
            }}
            className="px-4 py-2 border border-app bg-surface rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
          >
            Restore Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
