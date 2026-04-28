import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Plus, Trash2 } from 'lucide-react';
import { SpellList } from '../../types';
import SpellEditorModal from '../SpellEditorModal';

export default function SpellListsManager() {
  const { spellLists, setSpellLists } = useAppContext();
  const { confirm } = useConfirm();

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingMagicTypeListId, setEditingMagicTypeListId] = useState<string | null>(null);

  const availableMagicTypes = React.useMemo(() => {
    const types = new Set(spellLists.map(l => l.magicType).filter(Boolean));
    types.add('Arcane');
    types.add('Divine');
    return Array.from(types).sort();
  }, [spellLists]);

  const handleSpellListChange = (id: string, field: keyof SpellList, value: any) => {
    setSpellLists(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const removeSpellList = async (id: string) => {
    if (await confirm({ title: 'Delete Spell List', message: 'Delete this spell list? All assignments to spells belonging to this list will be lost.' })) {
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

  const handleMagicTypeSelect = (listId: string, value: string) => {
    if (value === '__new__') {
      setEditingMagicTypeListId(listId);
      handleSpellListChange(listId, 'magicType', '');
    } else {
      handleSpellListChange(listId, 'magicType', value);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Spell Lists</h2>
        <p className="text-muted text-sm">Create and modify lists of spells.</p>
      </header>

      <div className="bg-surface border border-app rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-app">
          <h3 className="font-medium text-lg text-main">Configured Lists</h3>
          <button onClick={addSpellList} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 shadow-sm">
            <Plus size={16} />
            <span>Add List</span>
          </button>
        </div>

        <div className="space-y-4">
          {spellLists.length === 0 && (
            <div className="p-8 text-center bg-app border border-dashed border-app rounded-xl flex flex-col items-center">
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
                    {editingMagicTypeListId !== list.id ? (
                      <select 
                        value={availableMagicTypes.includes(list.magicType) ? list.magicType : ''}
                        onChange={e => handleMagicTypeSelect(list.id, e.target.value)}
                        className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                      >
                        {availableMagicTypes.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        {!availableMagicTypes.includes(list.magicType) && list.magicType && (
                          <option value={list.magicType}>{list.magicType}</option>
                        )}
                        <option value="__new__">+ Create New Magic Type</option>
                      </select>
                    ) : (
                      <input 
                        autoFocus
                        type="text"
                        value={list.magicType}
                        onChange={e => handleSpellListChange(list.id, 'magicType', e.target.value)}
                        onBlur={() => {
                          if (!list.magicType.trim()) {
                            handleSpellListChange(list.id, 'magicType', 'Arcane');
                          }
                          setEditingMagicTypeListId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (!list.magicType.trim()) {
                              handleSpellListChange(list.id, 'magicType', 'Arcane');
                            }
                            setEditingMagicTypeListId(null);
                          }
                        }}
                        placeholder="e.g. Psionic"
                        className="w-full bg-surface border border-accent ring-1 ring-accent rounded-lg px-3 py-1.5 text-sm outline-none font-medium"
                      />
                    )}
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
