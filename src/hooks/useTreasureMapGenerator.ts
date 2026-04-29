import { useReducer, useCallback } from 'react';
import { HoardTableType } from '../types';
import { generateTreasureMap, TreasureMapConfig, GenerationResult, ClueConfig } from '../lib/treasureMapUtils';

export interface TreasureMapState {
  config: TreasureMapConfig;
  result: GenerationResult | null;
  isFinished: boolean;
}

type Action =
  | { type: 'SET_GLOBAL_LOCK'; field: keyof Omit<TreasureMapConfig, 'clues' | 'hoardTableType'>; value: string | number | null }
  | { type: 'SET_HOARD_TABLE'; value: HoardTableType }
  | { type: 'SET_CLUE_LOCK'; index: number; field: keyof ClueConfig; value: string | null }
  | { type: 'GENERATE' }
  | { type: 'RESET' };

const initialCluesConfig = (): ClueConfig[] => Array.from({ length: 3 }, () => ({
  detail: null,
  content: null,
  obscurity: null,
  code: null,
  concealment: null
}));

const initialState: TreasureMapState = {
  config: {
    hoardTableType: 'Classic',
    treasureType: null,
    location: null,
    numClues: null,
    clues: initialCluesConfig()
  },
  result: null,
  isFinished: false
};

function reducer(state: TreasureMapState, action: Action): TreasureMapState {
  switch (action.type) {
    case 'SET_GLOBAL_LOCK':
      return {
        ...state,
        config: {
          ...state.config,
          [action.field]: action.value
        }
      };
    case 'SET_HOARD_TABLE':
      return {
         ...state,
         config: { ...state.config, hoardTableType: action.value }
      };
    case 'SET_CLUE_LOCK': {
      const newClues = [...state.config.clues];
      newClues[action.index] = {
        ...newClues[action.index],
        [action.field]: action.value
      };
      return {
        ...state,
        config: {
          ...state.config,
          clues: newClues
        }
      };
    }
    case 'GENERATE': {
      const result = generateTreasureMap(state.config);
      return {
        ...state,
        result,
        isFinished: true // Mark generation step completed
      };
    }
    case 'RESET':
      return {
         ...initialState,
         config: { ...state.config }, // We retain their locks on reset, but clear the logs/results
         result: null,
         isFinished: false
      };
    default:
      return state;
  }
}

export function useTreasureMapGenerator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setGlobalLock = useCallback((field: keyof Omit<TreasureMapConfig, 'clues'|'hoardTableType'>, value: string | number | null) => {
    dispatch({ type: 'SET_GLOBAL_LOCK', field, value });
  }, []);

  const setHoardTable = useCallback((value: HoardTableType) => {
    dispatch({ type: 'SET_HOARD_TABLE', value });
  }, []);

  const setClueLock = useCallback((index: number, field: keyof ClueConfig, value: string | null) => {
    dispatch({ type: 'SET_CLUE_LOCK', index, field, value });
  }, []);

  const generate = useCallback(() => {
    dispatch({ type: 'GENERATE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, setGlobalLock, setHoardTable, setClueLock, generate, reset };
}
