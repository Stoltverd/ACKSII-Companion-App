import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { useConfirm } from '../hooks/useConfirm';
import { Search, Trash2, Pencil } from 'lucide-react';
import { MagicType } from '../types';

export default function SavedItemsView() {
  const { savedScrolls, deleteScroll, updateScroll, spellLists } = useAppContext();
  const { confirm, prompt } = useConfirm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMagicType, setFilterMagicType] = useState<MagicType | 'All'>('All');
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [filterSpellList, setFilterSpellList] = useState<string>('All');

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

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Saved Items</h2>
        <p className="text-muted text-sm">Consult and search your previously generated scrolls.</p>
      </header>

      <div className="bg-surface border border-app rounded-2xl p-6 shadow-sm space-y-6">
        
        {savedScrolls.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search for generated text or scroll name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-app border border-app text-main rounded-xl text-sm outline-none focus:border-accent"
              />
            </div>
            
            <div className="flex gap-4">
              <select 
                value={filterMagicType}
                onChange={e => setFilterMagicType(e.target.value as any)}
                className="bg-app border border-app text-main rounded-xl px-4 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="All">All Magic Types</option>
                {uniqueMagicTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select 
                value={filterLanguage}
                onChange={e => setFilterLanguage(e.target.value)}
                className="bg-app border border-app text-main rounded-xl px-4 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="All">All Languages</option>
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <select 
                value={filterSpellList}
                onChange={e => setFilterSpellList(e.target.value)}
                className="bg-app border border-app text-main rounded-xl px-4 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="All">All Spell Lists</option>
                {uniqueSpellListsOptions.map(list => (
                  <option key={list} value={list}>{list}</option>
                ))}
              </select>
            </div>
          </div>
        )}

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
                        const newName = await prompt({
                          title: 'Rename Scroll',
                          message: 'Please enter a new name for this scroll:',
                          defaultValue: scroll.name,
                          confirmText: 'Rename',
                          validate: (value) => {
                            const trimmed = value.trim();
                            if (trimmed.length === 0) return "Name cannot be empty.";
                            const validNameRegex = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚöÖñÑ]+$/;
                            if (!validNameRegex.test(trimmed)) return "Name contains invalid characters.";
                            return null;
                          }
                        });
                        if (newName) {
                          updateScroll(scroll.id, newName.trim());
                        }
                     }}
                     className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                     title="Rename Scroll"
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
                 
                 <div className="mb-4 pr-16 space-y-2">
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
                 </div>
                 
                 <div className="flex-1 bg-yellow-50 dark:bg-[#2a2820] text-amber-900 dark:text-amber-100 p-4 rounded-xl font-serif text-sm border border-yellow-200 dark:border-yellow-900/50 whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto max-h-[300px]">
                    {scroll.generatedText}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
