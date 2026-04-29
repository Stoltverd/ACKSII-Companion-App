import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { Search, Trash2, Pencil, FileDown, FileUp, Map, ScrollText, Filter } from 'lucide-react';
import { MagicType, SavedScroll, SavedTreasureMap } from '../types';
import * as yaml from 'js-yaml';

export default function SavedItemsView() {
  const { savedScrolls, setSavedScrolls, deleteScroll, updateScroll, spellLists, savedTreasureMaps = [], setSavedTreasureMaps, deleteTreasureMap, updateTreasureMap } = useAppContext();
  const { confirm, alert, promptWithNote } = useConfirm();
  const fileInputRefScrolls = useRef<HTMLInputElement>(null);
  const fileInputRefMaps = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'scrolls' | 'maps'>('scrolls');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMagicType, setFilterMagicType] = useState<MagicType | 'All'>('All');
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [filterSpellList, setFilterSpellList] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const handleExportScrolls = () => {
    try {
      const yamlStr = yaml.dump({ savedScrolls }, { skipInvalid: true, indent: 2 });
      const blob = new Blob([yamlStr], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acks-ii-saved-scrolls-${new Date().toISOString().split('T')[0]}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert({ title: 'Export Failed', message: "There was an error while generating the export file." });
    }
  };

  const handleExportMaps = () => {
    try {
      const yamlStr = yaml.dump({ savedTreasureMaps }, { skipInvalid: true, indent: 2 });
      const blob = new Blob([yamlStr], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acks-ii-saved-maps-${new Date().toISOString().split('T')[0]}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert({ title: 'Export Failed', message: "There was an error while generating the export file." });
    }
  };

  // Import Scrolls
  const handleImportScrolls = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = yaml.load(event.target?.result as string) as any;
        if (!result || !Array.isArray(result.savedScrolls)) {
          alert({ title: 'Invalid File', message: 'The uploaded file does not contain a valid savedScrolls array.' });
          return;
        }

        const shouldMerge = await confirm({
          title: 'Import Scrolls',
          message: `Found ${result.savedScrolls.length} scrolls in file. Would you like to keep your existing scrolls? (Click Cancel to overwrite completely)`,
          confirmText: 'Merge (Keep Existing)',
          cancelText: 'Overwrite All'
        });

        // Basic validation and ID regeneration
        const importedScrolls: SavedScroll[] = result.savedScrolls.map((s: any) => ({
          ...s,
          id: s.id || crypto.randomUUID()
        })).filter((s: any) => s.name && s.generatedText);

        if (shouldMerge) {
          setSavedScrolls(prev => [...importedScrolls, ...prev]);
        } else {
          setSavedScrolls(importedScrolls);
        }

        alert({ title: 'Import Successful', message: `Imported ${importedScrolls.length} scrolls.` });
      } catch (err: any) {
        alert({ title: 'Import Error', message: `Failed to import file: ${err.message}` });
      }
      
      if (fileInputRefScrolls.current) fileInputRefScrolls.current.value = '';
    };
    reader.readAsText(file);
  };

  // Import Maps
  const handleImportMaps = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = yaml.load(event.target?.result as string) as any;
        if (!result || !Array.isArray(result.savedTreasureMaps)) {
          alert({ title: 'Invalid File', message: 'The uploaded file does not contain a valid savedTreasureMaps array.' });
          return;
        }

        const shouldMerge = await confirm({
          title: 'Import Maps',
          message: `Found ${result.savedTreasureMaps.length} maps in file. Would you like to keep your existing maps? (Click Cancel to overwrite completely)`,
          confirmText: 'Merge (Keep Existing)',
          cancelText: 'Overwrite All'
        });

        // Basic validation and ID regeneration
        const importedMaps: SavedTreasureMap[] = result.savedTreasureMaps.map((s: any) => ({
          ...s,
          id: s.id || crypto.randomUUID()
        })).filter((s: any) => s.name && s.generatedText);

        const applyImport = setSavedTreasureMaps || (() => {});
        if (applyImport) {
           applyImport(prev => shouldMerge ? [...importedMaps, ...prev] : importedMaps);
        }

        alert({ title: 'Import Successful', message: `Imported ${importedMaps.length} maps.` });
      } catch (err: any) {
        alert({ title: 'Import Error', message: `Failed to import file: ${err.message}` });
      }
      
      if (fileInputRefMaps.current) fileInputRefMaps.current.value = '';
    };
    reader.readAsText(file);
  };

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>();
    savedScrolls.forEach(s => langs.add(s.language));
    return Array.from(langs);
  }, [savedScrolls]);

  const uniqueMagicTypes = useMemo(() => {
    const types = new Set<string>();
    savedScrolls.forEach(s => types.add(s.magicType));
    return Array.from(types);
  }, [savedScrolls]);

  const uniqueSpellListsOptions = useMemo(() => {
    return Array.from(new Set(spellLists.map(list => list?.name).filter(Boolean)));
  }, [spellLists]);

  const filteredScrolls = useMemo(() => {
    return savedScrolls.filter(scroll => {
      const matchesSearchText = scroll?.generatedText?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearchName = scroll?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = matchesSearchText || matchesSearchName;
      
      const matchesMagicType = filterMagicType === 'All' || scroll.magicType === filterMagicType;
      const matchesLanguage = filterLanguage === 'All' || scroll.language === filterLanguage;
      
      const matchesSpellList = filterSpellList === 'All' || (scroll.spells || []).some(scrollSpell => {
        if (!scrollSpell) return false;
        const targetList = spellLists.find(l => l?.name === filterSpellList);
        if (!targetList) return false;
        return (targetList.levels || []).some(lvl => (lvl.spells || []).some(s => s?.name === scrollSpell?.name));
      });

      return matchesSearch && matchesMagicType && matchesLanguage && matchesSpellList;
    });
  }, [savedScrolls, searchTerm, filterMagicType, filterLanguage, filterSpellList, spellLists]);

  const filteredMaps = useMemo(() => {
    return savedTreasureMaps.filter(map => {
      const matchesSearchText = map?.generatedText?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearchName = map?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchText || matchesSearchName;
    });
  }, [savedTreasureMaps, searchTerm]);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Saved Items</h2>
          <p className="text-muted text-sm">Consult and search your previously generated scrolls and maps.</p>
        </div>
        
        <div className="flex gap-3 bg-surface p-1 rounded-xl shadow-sm border border-app self-start">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'scrolls' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main hover:bg-surface-alt'}`}
            onClick={() => { setActiveTab('scrolls'); setSearchTerm(''); }}
          >
            <ScrollText size={16} /> Scrolls
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'maps' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main hover:bg-surface-alt'}`}
            onClick={() => { setActiveTab('maps'); setSearchTerm(''); }}
          >
            <Map size={16} /> Treasure Maps
          </button>
        </div>
      </header>

      <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                id="search-items-input"
                type="text" 
                placeholder={`Search for generated text or ${activeTab === 'scrolls' ? 'scroll' : 'map'} name...`} 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] bg-app border border-app text-main rounded-xl text-sm outline-none focus:border-accent"
              />
            </div>
            {activeTab === 'scrolls' && savedScrolls.length > 0 && (
              <button
                id="toggle-filters-btn"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center justify-center p-2 min-h-[44px] min-w-[44px] rounded-xl border transition-colors ${showFilters ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface-alt border-app text-muted hover:text-main hover:bg-surface'}`}
                title="Toggle Filters"
              >
                <Filter size={18} className={showFilters ? 'fill-accent/20' : ''} />
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <input
              id="import-file-input"
              type="file"
              accept=".yaml,.yml"
              ref={activeTab === 'scrolls' ? fileInputRefScrolls : fileInputRefMaps}
              className="hidden"
              onChange={activeTab === 'scrolls' ? handleImportScrolls : handleImportMaps}
            />
            <button
              id="import-items-btn"
              onClick={() => activeTab === 'scrolls' ? fileInputRefScrolls.current?.click() : fileInputRefMaps.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 min-h-[44px] bg-surface-alt border border-app rounded-lg text-sm text-muted hover:text-main transition-colors shadow-sm whitespace-nowrap"
            >
              <FileUp size={16} />
              <span>Import {activeTab === 'scrolls' ? 'Scrolls' : 'Maps'}</span>
            </button>
            <button
              id="export-items-btn"
              onClick={activeTab === 'scrolls' ? handleExportScrolls : handleExportMaps}
              className="flex items-center space-x-2 px-3 py-2 min-h-[44px] bg-accent text-white rounded-lg text-sm transition-colors shadow-sm hover:opacity-90 whitespace-nowrap"
            >
              <FileDown size={16} />
              <span>Export {activeTab === 'scrolls' ? 'Scrolls' : 'Maps'}</span>
            </button>
          </div>
        </div>

        {showFilters && activeTab === 'scrolls' && savedScrolls.length > 0 && (
          <div id="filters-container" className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 bg-surface-alt border border-app rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <select 
              id="filter-magic-type"
              value={filterMagicType}
              onChange={e => setFilterMagicType(e.target.value as any)}
              className="w-full sm:w-auto flex-1 bg-surface border border-app text-main rounded-xl px-4 py-2 min-h-[44px] text-sm outline-none focus:border-accent transition-colors hover:border-app-hover"
            >
              <option value="All">All Magic Types</option>
              {uniqueMagicTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              id="filter-language"
              value={filterLanguage}
              onChange={e => setFilterLanguage(e.target.value)}
              className="w-full sm:w-auto flex-1 bg-surface border border-app text-main rounded-xl px-4 py-2 min-h-[44px] text-sm outline-none focus:border-accent transition-colors hover:border-app-hover"
            >
              <option value="All">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select 
              id="filter-spell-list"
              value={filterSpellList}
              onChange={e => setFilterSpellList(e.target.value)}
              className="w-full sm:w-auto flex-1 bg-surface border border-app text-main rounded-xl px-4 py-2 min-h-[44px] text-sm outline-none focus:border-accent transition-colors hover:border-app-hover"
            >
              <option value="All">All Spell Lists</option>
              {uniqueSpellListsOptions.map(list => (
                <option key={list} value={list}>{list}</option>
              ))}
            </select>
          </div>
        )}

        {/* scrolls Tab content */}
        {activeTab === 'scrolls' && (
          <>
            {savedScrolls.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-muted border-2 border-dashed border-app rounded-xl">
                 <div className="text-center">
                  <p className="font-serif text-lg mb-2 text-main">No saved scrolls yet</p>
                  <p className="text-sm">Generations saved during the scroll generation workflow will appear here.</p>
                </div>
              </div>
            ) : filteredScrolls.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-muted border-2 border-dashed border-app rounded-xl">
                 <div className="text-center">
                  <p className="font-serif text-lg mb-2 text-main">No matches found</p>
                  <p className="text-sm">Try adjusting your filters or search term.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredScrolls.map(scroll => (
                   <div key={scroll.id} className="relative bg-app border border-app rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
                     <div className="absolute top-4 right-4 flex space-x-1">
                       <button 
                         onClick={async () => {
                            const result = await promptWithNote({
                              title: 'Edit Scroll Name & Notes',
                              message: 'Please enter a name for this scroll and optional notes:',
                              defaultValue: scroll.name,
                              defaultNote: scroll.note || '',
                              confirmText: 'Save',
                              validate: (value) => {
                                const trimmed = value.trim();
                                if (trimmed.length === 0) return "Name cannot be empty.";
                                const validNameRegex = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚöÖñÑ]+$/;
                                if (!validNameRegex.test(trimmed)) return "Name contains invalid characters.";
                                return null;
                              }
                            });
                            if (result) {
                              updateScroll(scroll.id, { 
                                name: result.value.trim(),
                                note: result.note.trim()
                              });
                            }
                         }}
                         className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                         title="Edit Scroll"
                       >
                         <Pencil size={16} />
                       </button>
                       <button 
                         onClick={async () => {
                            if (await confirm({ title: 'Delete Scroll', message: 'Are you sure you want to delete this scroll?' })) {
                              deleteScroll(scroll.id);
                            }
                         }}
                         className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                         title="Delete Scroll"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                     
                     <div className="mb-4 pr-16 space-y-3">
                       {scroll.name && (
                         <h3 className="font-serif text-xl font-bold text-main">{scroll.name}</h3>
                       )}
                       <div>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-app text-main mr-2">
                           {new Date(scroll.dateSaved).toLocaleDateString()}
                         </span>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${scroll.magicType === 'Arcane' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'}`}>
                           {scroll.magicType}
                         </span>
                       </div>
                       
                       {scroll.note && (
                         <div className="bg-surface/50 p-3 rounded-lg border border-app shadow-sm mt-2">
                           <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Notes</h4>
                           <p className="text-sm text-main whitespace-pre-wrap">{scroll.note}</p>
                         </div>
                       )}
                     </div>
                     
                     <div className="flex-1 bg-yellow-50 dark:bg-[#2a2820] text-amber-900 dark:text-amber-100 p-4 rounded-xl font-serif text-sm border border-yellow-200 dark:border-yellow-900/50 whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto max-h-[300px]">
                        {scroll.generatedText}
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </>
        )}

        {/* MAPS tab content */}
        {activeTab === 'maps' && (
          <>
            {savedTreasureMaps.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-muted border-2 border-dashed border-app rounded-xl">
                 <div className="text-center">
                  <p className="font-serif text-lg mb-2 text-main">No saved treasure maps yet</p>
                  <p className="text-sm">Generations saved during the map generation workflow will appear here.</p>
                </div>
              </div>
            ) : filteredMaps.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-muted border-2 border-dashed border-app rounded-xl">
                 <div className="text-center">
                  <p className="font-serif text-lg mb-2 text-main">No matches found</p>
                  <p className="text-sm">Try adjusting your filters or search term.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredMaps.map(map => (
                   <div key={map.id} className="relative bg-app border border-app rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
                     <div className="absolute top-4 right-4 flex space-x-1">
                       <button 
                         onClick={async () => {
                            const result = await promptWithNote({
                              title: 'Edit Map Name & Notes',
                              message: 'Please enter a name for this map and optional notes:',
                              defaultValue: map.name,
                              defaultNote: map.note || '',
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
                            if (result && updateTreasureMap) {
                              updateTreasureMap(map.id, { 
                                name: result.value.trim(),
                                note: result.note.trim()
                              });
                            }
                         }}
                         className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                         title="Edit Map"
                       >
                         <Pencil size={16} />
                       </button>
                       <button 
                         onClick={async () => {
                            if (await confirm({ title: 'Delete Map', message: 'Are you sure you want to delete this treasure map?' })) {
                              if(deleteTreasureMap) deleteTreasureMap(map.id);
                            }
                         }}
                         className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                         title="Delete Map"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                     
                     <div className="mb-4 pr-16 space-y-3">
                       {map.name && (
                         <h3 className="font-serif text-xl font-bold text-main">{map.name}</h3>
                       )}
                       <div>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-app text-main mr-2">
                           {new Date(map.dateSaved).toLocaleDateString()}
                         </span>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800`}>
                           {map.tableUsed}
                         </span>
                       </div>
                       
                       {map.note && (
                         <div className="bg-surface/50 p-3 rounded-lg border border-app shadow-sm mt-2">
                           <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Notes</h4>
                           <p className="text-sm text-main whitespace-pre-wrap">{map.note}</p>
                         </div>
                       )}
                     </div>
                     
                     <div className="flex-1 bg-[#fcfaf2] dark:bg-[#202522] text-emerald-900 dark:text-emerald-100 p-4 rounded-xl font-serif text-sm border border-emerald-200 dark:border-emerald-900/50 whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto max-h-[300px]">
                        {map.generatedText}
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
