import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { Plus, Trash2, Edit2, Copy, Search, X } from 'lucide-react';
import { useConfirm } from '../hooks/useConfirm';
import { GlobalSpell } from '../types';

export default function GlobalSpellLibrary() {
  const { spells, setSpells, spellLists, setSpellLists } = useAppContext();
  const { confirm, alert: showAlert } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingSpell, setEditingSpell] = useState<GlobalSpell | null>(null);
  
  // local edits for form
  const [editName, setEditName] = useState('');
  
  // Spell mapping: which lists contain this spell and at what level?
  const spellsListsMap = useMemo(() => {
    const map = new Map<string, { listName: string, level: number }[]>();
    spells.forEach(s => map.set(s.name.toLowerCase(), []));
    
    spellLists.forEach(list => {
      list.levels.forEach(lvl => {
        lvl.spells.forEach(ls => {
          const key = ls.name.toLowerCase();
          if (!map.has(key)) {
            map.set(key, []);
          }
          const existing = map.get(key)!;
          if (!existing.some(e => e.listName === list.name)) {
            existing.push({ listName: list.name, level: lvl.level });
          }
        });
      });
    });
    return map;
  }, [spells, spellLists]);

  const filteredSpells = useMemo(() => {
    return spells.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [spells, searchTerm]);

  const handleDeleteSpell = async (spell: GlobalSpell) => {
    if (await confirm({ title: 'Delete Spell', message: `Delete "${spell.name}" from the global library and EVERYTHING else?` })) {
      const targetName = spell.name.toLowerCase();
      setSpells(prev => prev.filter(s => s.id !== spell.id));

      setSpellLists(prev => prev.map(list => ({
        ...list,
        levels: list.levels.map(lvl => ({
          ...lvl,
          spells: lvl.spells.filter(s => s.name.toLowerCase() !== targetName)
        }))
      })));
      showAlert({ title: 'Deleted', message: `${spell.name} has been removed globally.` });
    }
  };

  const openEditor = (spell: GlobalSpell | null, isDuplicate: boolean = false) => {
    if (!spell) { // create new
      setEditingSpell({ id: crypto.randomUUID(), name: '' });
      setEditName('');
    } else {
      setEditingSpell(isDuplicate ? { ...spell, id: crypto.randomUUID() } : spell);
      setEditName(isDuplicate ? `${spell.name} (Copy)` : spell.name);
    }
  };

  const closeEditor = () => {
    setEditingSpell(null);
  };

  const saveSpell = () => {
    if (!editingSpell || !editName.trim()) return;
    
    // Validate uniqueness if changing name
    const targetName = editName.trim().toLowerCase();
    const isNewName = targetName !== editingSpell.name.toLowerCase();
    if (isNewName && spells.some(s => s.name.toLowerCase() === targetName && s.id !== editingSpell.id)) {
      showAlert({ title: 'Duplicate Name', message: 'A spell with that name already exists in the library.' });
      return;
    }

    const updatedSpell: GlobalSpell = {
      ...editingSpell,
      name: editName.trim()
    };

    // If it's an existing spell (not duplicate/new), we need to cascade changes to SpellLists
    const isEditingExisting = spells.some(s => s.id === editingSpell.id);

    if (isEditingExisting) {
      const oldNameLower = editingSpell.name.toLowerCase();
      
      setSpells(prev => prev.map(s => s.id === editingSpell.id ? updatedSpell : s));

      // Cascade update to lists (only rename, do not change level)
      setSpellLists(prev => prev.map(list => {
        let changed = false;
        
        const newLevels = list.levels.map(lvl => {
          const newSpells = lvl.spells.map(s => {
            if (s.name.toLowerCase() === oldNameLower) {
              changed = true;
              return { ...s, name: updatedSpell.name };
            }
            return s;
          });
          newSpells.sort((a,b) => a.name.localeCompare(b.name));
          return { ...lvl, spells: newSpells };
        });

        return changed ? { ...list, levels: newLevels } : list;
      }));
    } else {
      // It's a brand new spell OR a duplicate.
      setSpells(prev => [...prev, updatedSpell]);
    }
    
    closeEditor();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface sticky top-16 z-10 -mx-6 -mt-6 p-6 pb-4 border-b border-app shadow-sm mb-6">
        <h3 className="font-medium text-lg text-main">Spell Library (Global)</h3>
        <button 
          onClick={() => openEditor(null)}
          className="flex items-center space-x-1 text-sm bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-sm"
        >
          <Plus size={16} className="mr-1" /> Add New Spell
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-app p-4 rounded-xl border border-app">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search spells..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-app rounded-lg pl-9 pr-3 py-2 text-sm text-main focus:ring-2 focus:ring-accent outline-none"
          />
        </div>
        <div className="text-sm text-muted">
          {spells.length} Spells Total
        </div>
      </div>

      <div className="bg-surface border border-app rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-app border-b border-app">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Assigned To</th>
              <th className="px-4 py-3 font-medium w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpells.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted border-b border-app">
                  No spells found.
                </td>
              </tr>
            ) : (
              filteredSpells.map(spell => {
                const assignedLists = spellsListsMap.get(spell.name.toLowerCase()) || [];
                return (
                  <tr key={spell.id} className="border-b border-app last:border-0 hover:bg-app/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-main">{spell.name}</td>
                    <td className="px-4 py-3">
                      {assignedLists.length === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          0 lists (Orphaned)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5" title={assignedLists.map(a => `${a.listName} (Lvl ${a.level})`).join(', ')}>
                          {assignedLists.map((assigned, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-2.5 py-1 rounded bg-surface border border-app text-xs text-muted truncate max-w-[180px]"
                            >
                              {assigned.listName} <span className="opacity-70 ml-1">(Lvl {assigned.level})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => openEditor(spell, false)}
                          className="p-1.5 text-muted hover:text-accent rounded-md hover:bg-app transition-colors"
                          title="Edit Spell"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => openEditor(spell, true)}
                          className="p-1.5 text-muted hover:text-blue-500 rounded-md hover:bg-app transition-colors"
                          title="Duplicate Spell"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSpell(spell)}
                          className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete globally from all lists"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {editingSpell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-app rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-app">
              <h3 className="font-semibold text-lg text-main">
                {spells.some(s => s.id === editingSpell.id) ? 'Edit Spell' : 'Create Spell'}
              </h3>
              <button onClick={closeEditor} className="p-2 text-muted hover:text-main rounded-md hover:bg-app transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Spell Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-surface border border-app rounded-md px-3 py-2 text-sm text-main focus:ring-1 focus:ring-accent outline-none"
                  placeholder="e.g. Fireball"
                  autoFocus
                />
                <p className="text-xs text-muted mt-2 leading-tight">
                  Once created, you can assign levels to this spell within specific lists.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-app bg-app/50 flex justify-end gap-3">
              <button 
                onClick={closeEditor}
                className="px-4 py-2 text-sm font-medium text-main bg-surface border border-app rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveSpell}
                disabled={!editName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                Save Spell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
