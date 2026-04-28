import React, { useState, useMemo } from 'react';
import { SpellList, Spell, SpellListLevel } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../hooks/useConfirm';

interface SpellEditorModalProps {
  listId: string;
  spellLists: SpellList[];
  setSpellLists: React.Dispatch<React.SetStateAction<SpellList[]>>;
  onClose: () => void;
}

export default function SpellEditorModal({ listId, spellLists, setSpellLists, onClose }: SpellEditorModalProps) {
  const { confirm } = useConfirm();
  const currentList = spellLists.find(l => l.id === listId);
  
  if (!currentList) {
    onClose();
    return null;
  }

  // Flatten all spells for the "Add Existing Spell" dropdown
  const allExistingSpells = useMemo(() => {
    const spellMap = new Map<string, {name: string, level: number, magicType: string}>();
    spellLists.forEach(list => {
      list?.levels?.forEach(lvl => {
        lvl?.spells?.forEach(s => {
          if (s?.name) {
             if (!spellMap.has(s.name.toLowerCase())) {
               spellMap.set(s.name.toLowerCase(), { name: s.name, level: lvl.level, magicType: list.magicType });
             }
          }
        });
      });
    });
    return Array.from(spellMap.values());
  }, [spellLists]);

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

  const availableMagicTypes = useMemo(() => {
    return Array.from(new Set(spellLists.map(l => l.magicType)));
  }, [spellLists]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState(1);
  const [newSpellMagicType, setNewSpellMagicType] = useState(currentList.magicType);
  const [newSpellBelongsTo, setNewSpellBelongsTo] = useState<string[]>([currentList.id]);
  const [isCreatingMagicType, setIsCreatingMagicType] = useState(false);

  const [existingSpellToAdd, setExistingSpellToAdd] = useState('');

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
    addSpellToTargetLists(spell.name, spell.level, spell.magicType, [currentList.id]);
    setExistingSpellToAdd('');
  };

  const addSpellToTargetLists = (name: string, level: number, magicType: string, targetListIds: string[]) => {
    setSpellLists(prev => {
      let updated = [...prev];
      let finalTargetIds = [...targetListIds];

      const magicTypeTrimmed = magicType.trim();
      const isNewType = magicTypeTrimmed && !updated.some(l => l.magicType.toLowerCase() === magicTypeTrimmed.toLowerCase());
      
      if (isNewType) {
        const newStandardListId = crypto.randomUUID();
        
        updated.push({
          id: newStandardListId,
          name: `${magicTypeTrimmed} Spell List`,
          magicType: magicTypeTrimmed,
          levels: []
        });

        finalTargetIds.push(newStandardListId);
      }

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
    
    // Auto-select ritual lists if level >= 7 and belongsToLists is empty? At least we enforce they can be in ritual lists.
    let finalTargets = [...newSpellBelongsTo];
    if (finalTargets.length === 0) finalTargets.push(currentList.id);

    addSpellToTargetLists(newSpellName.trim(), newSpellLevel, newSpellMagicType, finalTargets);
    
    setShowAddForm(false);
    setNewSpellName('');
    setNewSpellLevel(1);
    setNewSpellMagicType(currentList.magicType);
    setNewSpellBelongsTo([currentList.id]);
    setIsCreatingMagicType(false);
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

        <div className="p-4 border-b border-app bg-app/30 flex justify-between items-center space-x-4">
          <input 
            type="text" 
            placeholder="Search spells in this list..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-surface border border-app rounded-lg px-3 py-2 text-sm text-main focus:ring-2 focus:ring-accent outline-none"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center flex-shrink-0"
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
                  <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Level</label>
                  <input 
                    type="number"
                    min="1" max="9"
                    value={newSpellLevel}
                    onChange={e => setNewSpellLevel(Number(e.target.value))}
                    className="w-full bg-surface border border-app rounded-md px-3 py-2 text-sm text-main"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Magic Type</label>
                  {!isCreatingMagicType ? (
                    <select 
                      value={availableMagicTypes.includes(newSpellMagicType) ? newSpellMagicType : ''}
                      onChange={e => {
                        if (e.target.value === '__new__') {
                          setIsCreatingMagicType(true);
                          setNewSpellMagicType('');
                        } else {
                          setNewSpellMagicType(e.target.value);
                        }
                      }}
                      className="w-full bg-surface border border-app rounded-md px-3 py-2 text-sm text-main"
                    >
                      {availableMagicTypes.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="__new__">+ Create New Magic Type</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={newSpellMagicType}
                        onChange={e => setNewSpellMagicType(e.target.value)}
                        className="flex-1 bg-surface border border-app rounded-md px-3 py-2 text-sm text-main"
                        placeholder="e.g. Psionic"
                        autoFocus
                      />
                      <button 
                        onClick={() => { setIsCreatingMagicType(false); setNewSpellMagicType(currentList.magicType); }}
                        className="p-2 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
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
              className="w-full bg-main text-surface px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Save & Assign Spell
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 bg-app p-4 rounded-xl border border-app">
            <h4 className="text-sm font-medium text-main mb-2">Add Existing Spell to this List</h4>
            <div className="flex space-x-2">
              <select 
                value={existingSpellToAdd}
                onChange={e => setExistingSpellToAdd(e.target.value)}
                className="flex-1 bg-surface border border-app rounded-md px-3 py-2 text-sm text-main focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="">-- Select an existing spell --</option>
                {allExistingSpells
                  .filter(s => !currentListSpells.find(cs => cs.name.toLowerCase() === s.name.toLowerCase()))
                  .sort((a,b) => a.name.localeCompare(b.name))
                  .map(s => (
                    <option key={s.name} value={s.name}>{s.name} (Lvl {s.level} {s.magicType})</option>
                  ))}
              </select>
              <button 
                onClick={handleAddExistingSpell}
                disabled={!existingSpellToAdd}
                className="bg-surface border border-app px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Add
              </button>
            </div>
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
