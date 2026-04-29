import { HoardTableType } from '../types';

export const TREASURE_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] as const;

export const MAP_LOCATIONS = [
  'Nearby',
  'A few miles away',
  'Far away',
  'In a specific dungeon',
  'In a specific wilderness hex',
  'In a specific city',
];

export const CLUE_DETAILS = [
  'Brief',
  'Vague',
  'Detailed',
  'Extremely Detailed',
  'Conflicting',
  'Misleading',
];

export const CLUE_CONTENTS = [
  'Local map of site or surrounding area',
  'Description of site or surrounding area',
  'Traps/hazards other than monsters',
  'Monsters guarding the hoard',
  'History of the hoard or its creator',
  'Specific items in the hoard',
];

export const CLUE_OBSCURITIES = [
  'Clear',
  'Slightly Obscure',
  'Very Obscure',
  'Concealed',
  'Coded',
  'Coded and Concealed',
];

export const CLUE_CONCEALMENTS = [
  'Hidden compartment',
  'Invisible ink',
  'Magical illusion',
  'Micro-writing',
  'Written on back',
  'Inside a decoy object',
  // Note: These are placeholders. We will update with real data later.
];

export const CLUE_CODES = [
  'Anagram',
  'Scytale Cipher',
  'Substitution Cipher',
  'Riddle',
  'Acrostic',
  'Numeric Code',
  // Note: These are placeholders. We will update with real data later.
];

export const HOARD_VALUES: Record<HoardTableType, Record<string, string>> = {
  Classic: {
    A: '1,000 gp',
    B: '500 gp',
    H: '10,000 gp',
    // Placeholders
  },
  Heroic: {
    A: '2,000 gp',
    B: '1,000 gp',
    H: '20,000 gp',
    // Placeholders
  },
  Gritty: {
    A: '500 gp',
    B: '250 gp',
    H: '5,000 gp',
    // Placeholders
  }
};
