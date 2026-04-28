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
        setLanguages(parsed.languages || JSON.parse(JSON.stringify(defaultLanguages)));
        setSpellLists(parsed.spellLists || JSON.parse(JSON.stringify(defaultSpellLists)));
        setSavedScrolls(parsed.savedScrolls || []);
      } catch (e) {
        console.error("Failed to parse local storage, loading defaults", e);
        setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
        setSpellLists(JSON.parse(JSON.stringify(defaultSpellLists)));
        setSavedScrolls([]);
      }
    } else {
      setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
      setSpellLists(JSON.parse(JSON.stringify(defaultSpellLists)));
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
    setLanguages(JSON.parse(JSON.stringify(defaultLanguages)));
    setSpellLists(JSON.parse(JSON.stringify(defaultSpellLists)));
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
