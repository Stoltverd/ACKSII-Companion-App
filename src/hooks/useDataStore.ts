import { useState, useEffect } from 'react';
import { AppState, Language, SpellList, SavedScroll, GlobalSpell, SavedTreasureMap } from '../types';
import { defaultLanguages, defaultSpellLists } from '../lib/defaultData';

const STORAGE_KEY = 'acks2_companion_data';

export function useDataStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [spellLists, setSpellLists] = useState<SpellList[]>([]);
  const [spells, setSpells] = useState<GlobalSpell[]>([]);
  const [savedScrolls, setSavedScrolls] = useState<SavedScroll[]>([]);
  const [savedTreasureMaps, setSavedTreasureMaps] = useState<SavedTreasureMap[]>([]);
  const [appMode, setAppMode] = useState<'judge' | 'player'>('judge');

  // Load initially
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as any;
        setAppMode(parsed.appMode === 'player' ? 'player' : 'judge');
        setLanguages(parsed.languages || JSON.parse(JSON.stringify(defaultLanguages)));
        
        const initialLists = parsed.spellLists || JSON.parse(JSON.stringify(defaultSpellLists));
        setSpellLists(initialLists);
        
        if (parsed.spells && Array.isArray(parsed.spells) && parsed.spells.length > 0) {
          setSpells(parsed.spells);
        } else {
          const extracted = new Map<string, GlobalSpell>();
          initialLists.forEach((list: SpellList) => {
            list.levels.forEach((lvl: any) => {
              lvl.spells.forEach((s: any) => {
                if (!extracted.has(s.name.toLowerCase())) {
                  extracted.set(s.name.toLowerCase(), {
                    id: s.id,
                    name: s.name
                  });
                }
              });
            });
          });
          setSpells(Array.from(extracted.values()));
        }

        setSavedScrolls(parsed.savedScrolls || []);
        setSavedTreasureMaps(parsed.savedTreasureMaps || []);
      } catch (e) {
        console.error("Failed to parse local storage, loading defaults", e);
        setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
        const initialLists = JSON.parse(JSON.stringify(defaultSpellLists));
        setSpellLists(initialLists);
        
        const extracted = new Map<string, GlobalSpell>();
        initialLists.forEach((list: SpellList) => {
          list.levels.forEach((lvl: any) => {
            lvl.spells.forEach((s: any) => {
              if (!extracted.has(s.name.toLowerCase())) {
                extracted.set(s.name.toLowerCase(), {
                  id: s.id,
                  name: s.name
                });
              }
            });
          });
        });
        setSpells(Array.from(extracted.values()));
        
        setSavedScrolls([]);
        setSavedTreasureMaps([]);
      }
    } else {
      setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
      const initialLists = JSON.parse(JSON.stringify(defaultSpellLists));
      setSpellLists(initialLists);
      
      const extracted = new Map<string, GlobalSpell>();
      initialLists.forEach((list: SpellList) => {
        list.levels.forEach((lvl: any) => {
          lvl.spells.forEach((s: any) => {
            if (!extracted.has(s.name.toLowerCase())) {
              extracted.set(s.name.toLowerCase(), {
                id: s.id,
                name: s.name
              });
            }
          });
        });
      });
      setSpells(Array.from(extracted.values()));
      setSavedScrolls([]);
      setSavedTreasureMaps([]);
    }
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      const stateToSave: AppState = { languages, spellLists, spells, savedScrolls, savedTreasureMaps, appMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [languages, spellLists, spells, savedScrolls, savedTreasureMaps, appMode, isLoaded]);

  const saveScroll = (scroll: SavedScroll) => {
    setSavedScrolls(prev => [scroll, ...prev]);
  };

  const updateScroll = (id: string, updates: Partial<SavedScroll>) => {
    setSavedScrolls(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteScroll = (id: string) => {
    setSavedScrolls(prev => prev.filter(s => s.id !== id));
  };
  
  const saveTreasureMap = (map: SavedTreasureMap) => {
    setSavedTreasureMaps(prev => [map, ...prev]);
  };

  const updateTreasureMap = (id: string, updates: Partial<SavedTreasureMap>) => {
    setSavedTreasureMaps(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteTreasureMap = (id: string) => {
    setSavedTreasureMaps(prev => prev.filter(m => m.id !== id));
  };

  const restoreDefaults = () => {
    setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
    const initialLists = JSON.parse(JSON.stringify(defaultSpellLists));
    setSpellLists(initialLists);
    
    const extracted = new Map<string, GlobalSpell>();
    initialLists.forEach((list: SpellList) => {
      list.levels.forEach((lvl: any) => {
        lvl.spells.forEach((s: any) => {
          if (!extracted.has(s.name.toLowerCase())) {
            extracted.set(s.name.toLowerCase(), {
              id: s.id,
              name: s.name
            });
          }
        });
      });
    });
    setSpells(Array.from(extracted.values()));
    // don't wipe saved items
  };

  return {
    isLoaded,
    appMode,
    setAppMode,
    languages,
    setLanguages,
    spellLists,
    setSpellLists,
    spells,
    setSpells,
    savedScrolls,
    setSavedScrolls,
    saveScroll,
    updateScroll,
    deleteScroll,
    savedTreasureMaps,
    setSavedTreasureMaps,
    saveTreasureMap,
    updateTreasureMap,
    deleteTreasureMap,
    restoreDefaults
  };
}
