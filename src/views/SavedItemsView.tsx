import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { Search, Trash2 } from 'lucide-react';
import { MagicType } from '../types';

export default function SavedItemsView() {
  const { savedScrolls, deleteScroll } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMagicType, setFilterMagicType] = useState<MagicType | 'All'>('All');
  const [filterLanguage, setFilterLanguage] = useState<string>('All');

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>();
    savedScrolls.forEach(s => langs.add(s.language));
    return Array.from(langs);
  }, [savedScrolls]);

  const filteredScrolls = useMemo(() => {
    return savedScrolls.filter(scroll => {
      const matchesSearch = scroll.generatedText.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMagicType = filterMagicType === 'All' || scroll.magicType === filterMagicType;
      const matchesLanguage = filterLanguage === 'All' || scroll.language === filterLanguage;
      return matchesSearch && matchesMagicType && matchesLanguage;
    });
  }, [savedScrolls, searchTerm, filterMagicType, filterLanguage]);

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
                placeholder="Search generated text..." 
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
                <option value="Arcane">Arcane</option>
                <option value="Divine">Divine</option>
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
                 <div className="absolute top-4 right-4">
                   <button 
                     onClick={() => {
                        if (window.confirm('Are you sure you want to delete this scroll?')) {
                          deleteScroll(scroll.id);
                        }
                     }}
                     className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                     title="Delete Scroll"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
                 
                 <div className="mb-4">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-app text-main mr-2">
                     {new Date(scroll.dateSaved).toLocaleDateString()}
                   </span>
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${scroll.magicType === 'Arcane' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'}`}>
                     {scroll.magicType}
                   </span>
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
