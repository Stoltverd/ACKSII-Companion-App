import React, { useState, useMemo } from 'react';
import { SpellList, Spell, SpellListLevel, GlobalSpell } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../hooks/useConfirm';
import { useAppContext } from '../AppContext';

interface SpellEditorModalProps {
  listId: string;
  spellLists: SpellList[];
  setSpellLists: React.Dispatch<React.SetStateAction<SpellList[]>>;
  onClose: () => void;
}

export default function SpellEditorModal({ listId, spellLists, setSpellLists, onClose }: SpellEditorModalProps) {
  const { spells, setSpells } = useAppContext();
  const { confirm } = useConfirm();
  const currentList = spellLists.find(l => l.id === listId);
  
  if (!currentList) {
    onClose();
    return null;
  }

  // Flatten all spells for the "Add Existing Spell" dropdown
  const allExistingSpells = useMemo(() => {
    return spells.map(s => ({ name: s.name })).sort((a,b) => a.name.localeCompare(b.name));
  }, [spells]);

  // Flatten current list spells
  const currentListSpells = useMemo(() => {
    const list: {name: string, level: number, id: string}[] = [];
    currentList?.levels?.forEach(lvl => {
      lvl?.spells?.forEach(s => {
        if (s?.name) {
           list.push({ name: s.name, level: lvl.level, id: s.id });
        }
      });
    });
    return list.sort((a, b) => a.level - b.level);
  }, [currentList]);


  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState<number | ''>(1);
  const [newSpellBelongsTo, setNewSpellBelongsTo] = useState<string[]>([currentList.id]);

  const [existingSpellToAdd, setExistingSpellToAdd] = useState('');
  const [existingSpellLevel, setExistingSpellLevel] = useState<number | ''>(1);

  const filteredSpells = currentListSpells.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRemoveSpell = async (spellId: string, level: number) => {
    if (await confirm({ title: 'Remove Spell', message: 'Remove spell from this list?' })) {
      setSpellLists(prev => {
        return prev.map(list => {
          if (list.id !== currentList.id) return list;
          return {
            ...list,
            levels: list.levels.map(lvl => {
              if (lvl.level !== level) return lvl;
              return {
                ...lvl,
                spells: lvl.spells.filter(s => s.id !== spellId)
              };
            })
          };
        });
      });
    }
  };

  const handleAddExistingSpell = () => {
    const spell = allExistingSpells.find(s => s.name === existingSpellToAdd);
    if (!spell) return;
    const level = existingSpellLevel === '' || existingSpellLevel < 1 ? 1 : existingSpellLevel;
    addSpellToTargetLists(spell.name, level, [currentList.id]);
    setExistingSpellToAdd('');
    setExistingSpellLevel(1);
  };

  const addSpellToTargetLists = (name: string, level: number, targetListIds: string[]) => {
    if (!spells.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSpells(prev => [...prev, { id: crypto.randomUUID(), name }]);
    }

    setSpellLists(prev => {
      let updated = [...prev];
      let finalTargetIds = [...targetListIds];

      finalTargetIds.forEach(targetId => {
        const listIdx = updated.findIndex(l => l.id === targetId);
        if (listIdx === -1) return;
        const targetList = { ...updated[listIdx] };
        
        // Find or create level
        let lvlIdx = targetList.levels.findIndex(l => l.level === level);
        const newLevels = [...targetList.levels];
        
        if (lvlIdx === -1) {
          newLevels.push({ level, spells: [] });
          lvlIdx = newLevels.length - 1;
        }
        
        const targetLevel = { ...newLevels[lvlIdx], spells: [...newLevels[lvlIdx].spells] };
        
        // Check if spell exists
        if (!targetLevel.spells.find(s => s.name.toLowerCase() === name.toLowerCase())) {
          targetLevel.spells.push({ id: crypto.randomUUID(), name });
        }
        
        // sort spells alphabetically to keep it neat
        targetLevel.spells.sort((a, b) => a.name.localeCompare(b.name));
        newLevels[lvlIdx] = targetLevel;
        // Sort levels
        newLevels.sort((a, b) => a.level - b.level);
        
        targetList.levels = newLevels;
        updated[listIdx] = targetList;
      });
      return updated;
    });
  };

  const handleAddNewSpell = () => {
    if (!newSpellName.trim()) return;
    
    const finalLevel = newSpellLevel === '' || newSpellLevel < 1 ? 1 : newSpellLevel;
    let finalTargets = [...newSpellBelongsTo];
    if (finalTargets.length === 0) finalTargets.push(currentList.id);

    addSpellToTargetLists(newSpellName.trim(), finalLevel, finalTargets);
    
    setShowAddForm(false);
    setNewSpellName('');
    setNewSpellLevel(1);
    setNewSpellBelongsTo([currentList.id]);
  };

  const toggleTargetList = (id: string) => {
    setNewSpellBelongsTo(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-app rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-app">
          <h3 className="font-semibold text-lg text-main">Edit Spells: <span className="text-accent">{currentList.name}</span></h3>
          <button onClick={onClose} className="p-2 text-muted hover:text-main rounded-md hover:bg-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-app bg-app/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:space-x-4">
          <input 
            type="text" 
            placeholder="Search spells in this list..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 bg-surface border border-app rounded-lg px-3 py-2 text-sm text-main focus:ring-2 focus:ring-accent outline-none"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center flex-shrink-0"
          >
            <Plus size={16} className="mr-1" /> Add New Spell
          </button>
        </div>

        {/* ADD NEW SPELL FORM */}
        {showAddForm && (
          <div className="p-4 border-b border-app bg-accent/5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-main">Create New Spell</h4>
              <button onClick={() => setShowAddForm(false)} className="text-muted hover:text-main"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Spell Name</label>
                <input 
                  type="text" 
                  value={newSpellName}
                  onChange={e => setNewSpellName(e.target.value)}
                  className="w-full bg-surface border border-app rounded-md px-3 py-2 text-sm text-main"
                  placeholder="e.g. Fireball"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Level</span>
                    <span className="text-[10px] text-muted/70 font-normal normal-case tracking-normal">Specific to this list</span>
                  </label>
                  <input 
                    type="number"
                    min="1" max="9"
                    value={newSpellLevel}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setNewSpellLevel('');
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          setNewSpellLevel(Math.min(9, Math.max(1, parsed)));
                        }
                      }
                    }}
                    onBlur={() => {
                      if (newSpellLevel === '' || newSpellLevel < 1) {
                        setNewSpellLevel(1);
                      }
                    }}
                    className="w-full bg-surface border border-app rounded-md px-3 py-2 text-sm text-main"
                  />
                  <p className="text-[10px] text-muted mt-1 leading-tight">
                    Levels are defined per list. This spelling will be added at this level to the selected lists.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
                Belongs To Lists (Multi-Select Token Field)
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-surface min-h-[44px] rounded-md border border-app">
                {spellLists.map(list => {
                  const isSelected = newSpellBelongsTo.includes(list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => toggleTargetList(list.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center transition-colors border ${
                        isSelected 
                          ? 'bg-accent/20 text-accent border-accent/30' 
                          : 'bg-app text-muted border-app hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {list.name}
                      {isSelected && <X size={12} className="ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleAddNewSpell}
              className="w-full bg-accent text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:bg-accent/90 transform transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex justify-center items-center mt-2 gap-2"
            >
              <Plus size={18} />
              <span>Save & Assign Spell</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 bg-app p-4 rounded-xl border border-app">
            <h4 className="text-sm font-medium text-main mb-2">Add Existing Spell to this List</h4>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <select 
                value={existingSpellToAdd}
                onChange={e => setExistingSpellToAdd(e.target.value)}
                className="w-full sm:flex-1 bg-surface border border-app rounded-md px-3 py-2 text-sm text-main focus:ring-1 focus:ring-accent outline-none truncate"
              >
                <option value="">-- Select an existing spell --</option>
                {allExistingSpells
                  .filter(s => !currentListSpells.find(cs => cs.name.toLowerCase() === s.name.toLowerCase()))
                  .sort((a,b) => a.name.localeCompare(b.name))
                  .map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
              </select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted whitespace-nowrap hidden sm:inline">at Level:</span>
                <input 
                  type="number"
                  min="1" max="9"
                  value={existingSpellLevel}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') setExistingSpellLevel('');
                    else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) setExistingSpellLevel(Math.min(9, Math.max(1, parsed)));
                    }
                  }}
                  onBlur={() => {
                    if (existingSpellLevel === '' || existingSpellLevel < 1) setExistingSpellLevel(1);
                  }}
                  className="w-full sm:w-20 bg-surface border border-app rounded-md px-3 py-2 text-sm text-main focus:ring-1 focus:ring-accent outline-none"
                  placeholder="Level"
                />
                <button 
                  onClick={handleAddExistingSpell}
                  disabled={!existingSpellToAdd}
                  className="w-full sm:w-auto bg-surface border border-app px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted mt-2 leading-tight">
              Levels are defined per list. The level you enter above only applies to this list.
            </p>
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-app text-muted">
                <th className="pb-2 font-medium">Spell Name</th>
                <th className="pb-2 font-medium w-24">Level</th>
                <th className="pb-2 font-medium w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpells.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted">
                    No spells found in this list.
                  </td>
                </tr>
              ) : (
                filteredSpells.map(spell => (
                  <tr key={spell.id} className="border-b border-app last:border-0 hover:bg-app/50 transition-colors">
                    <td className="py-3 font-medium text-main">{spell.name}</td>
                    <td className="py-3 text-muted">Level {spell.level}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleRemoveSpell(spell.id, spell.level)}
                        className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-flex"
                        title="Remove from list"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
