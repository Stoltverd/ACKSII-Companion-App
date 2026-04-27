import { useState, useEffect } from 'react';
import { AppState, Language, SpellList, SavedScroll } from '../types';
import { defaultLanguages, defaultSpellLists } from '../lib/defaultData';

const STORAGE_KEY = 'acks2_companion_data';

export function useDataStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [spellLists, setSpellLists] = useState<SpellList[]>([]);
  const [savedScrolls, setSavedScrolls] = useState<SavedScroll[]>([]);

  // Load initially
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: AppState = JSON.parse(raw);
        setLanguages(parsed.languages || defaultLanguages);
        setSpellLists(parsed.spellLists || defaultSpellLists);
        setSavedScrolls(parsed.savedScrolls || []);
      } catch (e) {
        console.error("Failed to parse local storage, loading defaults", e);
        setLanguages(defaultLanguages);
        setSpellLists(defaultSpellLists);
        setSavedScrolls([]);
      }
    } else {
      setLanguages(defaultLanguages);
      setSpellLists(defaultSpellLists);
      setSavedScrolls([]);
    }
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      const stateToSave: AppState = { languages, spellLists, savedScrolls };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [languages, spellLists, savedScrolls, isLoaded]);

  const saveScroll = (scroll: SavedScroll) => {
    setSavedScrolls(prev => [scroll, ...prev]);
  };

  const deleteScroll = (id: string) => {
    setSavedScrolls(prev => prev.filter(s => s.id !== id));
  };
  
  const restoreDefaults = () => {
    setLanguages(defaultLanguages);
    setSpellLists(defaultSpellLists);
    // don't wipe saved scrolls
  };

  return {
    isLoaded,
    languages,
    setLanguages,
    spellLists,
    setSpellLists,
    savedScrolls,
    saveScroll,
    deleteScroll,
    restoreDefaults
  };
}
