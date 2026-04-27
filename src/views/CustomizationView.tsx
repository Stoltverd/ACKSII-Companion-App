import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { Settings2, BookA, Trash2, Plus, GripVertical } from 'lucide-react';
import { Language, SpellList } from '../types';

export default function CustomizationView() {
  const { languages, setLanguages, spellLists, setSpellLists, restoreDefaults } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'languages' | 'spellLists'>('languages');

  // Languages Handlers
  const handleLanguageChange = (id: string, field: keyof Language, value: any) => {
    setLanguages(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLanguage = (id: string) => {
    if (window.confirm('Delete this language?')) {
      setLanguages(prev => prev.filter(l => l.id !== id));
    }
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: crypto.randomUUID(),
      name: 'New Language',
      isDivineOnly: false,
      rangeMin: 1,
      rangeMax: 10
    };
    setLanguages(prev => [...prev, newLang]);
  };

  // Spell Lists Handlers
  const handleSpellListChange = (id: string, field: keyof SpellList, value: any) => {
    setSpellLists(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const removeSpellList = (id: string) => {
    if (window.confirm('Delete this spell list?')) {
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

      <div className="bg-surface border border-app rounded-2xl shadow-sm overflow-hidden">
        
        <div className="flex border-b border-app bg-app">
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
        </div>

        <div className="p-6">
          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg text-main">Language Tables</h3>
                <button onClick={addLanguage} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                  <Plus size={16} />
                  <span>Add Language</span>
                </button>
              </div>

              <div className="space-y-3">
                {languages.map(lang => (
                  <div key={lang.id} className="flex items-center gap-4 bg-app p-4 rounded-xl border border-app">
                    <GripVertical className="text-muted cursor-move" size={20} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                      <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-muted mb-1">Name</label>
                        <input 
                          type="text" 
                          value={lang.name} 
                          onChange={e => handleLanguageChange(lang.id, 'name', e.target.value)}
                          className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">Min Roll</label>
                        <input 
                          type="number" 
                          value={lang.rangeMin} 
                          onChange={e => handleLanguageChange(lang.id, 'rangeMin', parseInt(e.target.value) || 0)}
                          className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">Max Roll</label>
                        <input 
                          type="number" 
                          value={lang.rangeMax} 
                          onChange={e => handleLanguageChange(lang.id, 'rangeMax', parseInt(e.target.value) || 0)}
                          className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                      </div>

                      <div className="md:col-span-3 flex items-center pt-5">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={lang.isDivineOnly}
                            onChange={e => handleLanguageChange(lang.id, 'isDivineOnly', e.target.checked)}
                            className="rounded border-app text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-main">Divine Only</span>
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeLanguage(lang.id)}
                      className="text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'spellLists' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg text-main">Spell Lists</h3>
                <button onClick={addSpellList} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                  <Plus size={16} />
                  <span>Add List</span>
                </button>
              </div>

              <div className="space-y-4">
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

                    <div className="pt-4 border-t border-app">
                       <p className="text-sm text-muted">Spell lists levels and individual spells are managed in the source for now, to be expanded into full UI in a future phase. You have {list.levels.length} levels configured for this list.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-app bg-app/50 flex justify-end">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to restore defaults? All custom languages and spell lists will be lost.')) {
                restoreDefaults();
              }
            }}
            className="px-4 py-2 border border-app bg-surface rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#2a2a28] transition-colors"
          >
            Restore Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
