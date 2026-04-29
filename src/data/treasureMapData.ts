import { HoardTableType } from '../types';

// d18
export const TREASURE_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] as const;

// d6
export const MAP_LOCATIONS = [
  'Adjacent',
  'Nearby',
  'Nearby',
  'Distant',
  'Distant',
  'Very distant',
];

// d6
export const CLUE_COUNT_ROLLS = [0, 1, 1, 2, 2, 3];

// d6
export const CLUE_DETAILS = [
  'Brief',
  'Brief',
  'Moderate',
  'Moderate',
  'Detailed',
  'Very detailed',
];

// d6
export const CLUE_CONTENTS = [
  'Local map of site or surrounding area',
  'Monsters present at or near hoard',
  'Traps/hazards other than monsters',
  'Secret passages or doors',
  'Further details about treasure',
  'Further details about treasure',
];

// d6
export const CLUE_OBSCURITIES = [
  'Obvious',
  'Obvious',
  'Coded',
  'Coded',
  'Coded',
  'Concealed',
];

// d20
export const CLUE_CONCEALMENTS = [
  'Map Segments',
  'Folding or Rolling',
  'Anamorphic View',
  'Minute Detail',
  'Hidden Pockets',
  'Impressions',
  'Layered Detail',
  'Reflective Elements',
  'Reverse Illumination',
  'Watermarked Regions',
  'Temperature Ink',
  'Reactive Ink',
  'Firefly Ink',
  'Moon Ink',
  'Lodestone Ink',
  'Invisible Ink',
  'Illusory Masking',
  'Activated Illusion',
  'Artwork',
  'Ashes',
];

// d20
export const CLUE_CODES = [
  'Palindromic Phrases',
  'Pig Auran Text',
  'Acrostic Message',
  'Clockwise Cipher',
  'Anagram',
  'Atbash Cipher',
  'Shifting Substitution Cipher',
  'Affine Cipher',
  'Numeric Substitution Cipher',
  'Coordinate Square',
  'Isopsephic Cipher',
  'Scytale Cipher',
  'Grid Cipher',
  'Musical Cipher',
  'Nautical Flag Cipher',
  'Game Cipher',
  'Cant',
  'Special Knowledge',
  'Homophonic Cipher',
  'Playfair Cipher',
];

export const CLUE_CONCEALMENT_DESCRIPTIONS: Record<string, string> = {
  'Map Segments': 'The map is divided into segments which must be overlaid or arranged in just the right manner to reveal the clue (typically not the same way the map is normally viewed).',
  'Folding or Rolling': 'Folding or rolling the map in just the right manner lines up parts of the clue to make it apparent.',
  'Anamorphic View': 'Viewing the map from a certain unnatural angle allows the clue to be discovered.',
  'Minute Detail': 'The clue is hidden within tiny details in the landscape, visible with a successful Searching throw or by use of magnified vision (such as a visor of the eagle).',
  'Hidden Pockets': 'Minute pockets embedded in the map, disguised as folds and creases, contain thin concealed notes or smaller maps.',
  'Impressions': 'The clue is hidden within faint impressions in the map, which can be discerned by touch or a successful Searching throw, or revealed by charcoal rub.',
  'Layered Detail': 'The clue is found in a secret second layer, revealed by removing the wax or other material forming the upper layer in the right portion(s) of the map.',
  'Reflective Elements': 'Holding the map up to a mirrored surface makes the clue visible or apparent.',
  'Reverse Illumination': 'Viewing the map with light shining evenly from behind or beneath it makes the clue apparent.',
  'Watermarked Regions': 'Certain areas of the map reveal hidden details when wet.',
  'Temperature Ink': 'Gently heating the map makes the clue change color or become visible.',
  'Reactive Ink': 'Carefully applying wine to the map will cause the clue to appear or change color.',
  'Firefly Ink': 'The clue can only be seen by the light of a bioluminescent creature, such as fireflies or certain moss.',
  'Moon Ink': 'The clue is visible only under the light of a certain moon. (ROLL_MOON)',
  'Lodestone Ink': 'Applying a lodestone close to the paper alters the ink of the clue and makes it visible.',
  'Invisible Ink': 'The clue can only be seen by a creature able to discern invisible. Dispelling the map will destroy the clue.',
  'Illusory Masking': 'The clue is covered by a very realistic illusion, and only creatures with the Illusion Resistance proficiency receive a throw to disbelieve it to see the clue beneath; dust of revelation or dispelling will also reveal it.',
  'Activated Illusion': 'The clue is contained in an illusion spell that will briefly activate upon a particular trigger, such as a certain word or phrase being spoken nearby, in the same manner as the spell auditory illusion. (ROLL_ILLUSION) Dispelling the map will destroy the clue.',
  'Artwork': 'The clue is hidden in decorative embellishments, perhaps as a deliberately mistaken depiction, which is evident to those with related knowledge who succeed on the relevant throw. (ROLL_ARTWORK)',
  'Ashes': 'The clue can be found by burning the map and observing the pattern in the ashes left behind.',
};

export const CLUE_CODE_DESCRIPTIONS: Record<string, string> = {
  'Palindromic Phrases': 'The clue is formed using palindromic phrases that reveal the message.',
  'Pig Auran Text': 'The clue is encoded by moving the first letter of each word to the final position and adding a suffix.',
  'Acrostic Message': 'The first letter of each word in some or all of the map text spells out a hidden message.',
  'Clockwise Cipher': 'The clue requires reading the map text in a specific clockwise pattern.',
  'Anagram': 'The letters of the clue can be rearranged to form a meaningful word or phrase.',
  'Atbash Cipher': 'A substitution cipher where each letter is replaced with its mirror image in the alphabet (e.g., A becomes Z, B becomes Y).',
  'Shifting Substitution Cipher': 'A substitution cipher where each letter in the text is shifted a certain number of places down or up the alphabet.',
  'Affine Cipher': 'A substitution cipher where each letter is mapped to its numeric equivalent, encrypted using a simple mathematical function.',
  'Numeric Substitution Cipher': 'A substitution cipher where each letter is replaced by a sequence of 5 letters.',
  'Coordinate Square': 'A square with letters or symbols arranged in rows and columns; a pair of coordinates is used to encode a message.',
  'Isopsephic Cipher': 'A substitution cipher assigning numerical values to letters forms a clue with their sum.',
  'Scytale Cipher': 'A transposition cipher where the message becomes visible when wrapped around a rod of a particular diameter.',
  'Grid Cipher': 'A substitution cipher which puts letters into grids and then uses their grid positions to create symbols denoting them.',
  'Musical Cipher': 'A substitution cipher where the clue is represented through musical notes, which can be decoded with a successful Performance proficiency throw.',
  'Nautical Flag Cipher': 'A substitution cipher where letters represented by nautical flags convey the coded message, which can be decoded with a successful Seafaring proficiency throw.',
  'Game Cipher': 'A substitution cipher where the clue is represented through moves on a gameboard, which can be decoded with a successful Gambling proficiency throw.',
  'Cant': 'A message in plain language with double meanings known to members of the criminal underworld, which can be decoded by a successful Streetwise proficiency throw.',
  'Special Knowledge': 'A message in plain language with coded references that require specialized knowledge to parse (e.g. chapter and verse of a holy tome, a dwarven day of remembrance, etc.). (ROLL_KNOWLEDGE)',
  'Homophonic Cipher': 'A substitution cipher where each letter is replaced with multiple symbols.',
  'Playfair Cipher': 'A substitution cipher that encrypts digraphs (pairs of two letters) instead of individual letters.',
};

export const AVG_HOARD_VALUES: Record<string, string> = {
  A: '275 gp',
  B: '500 gp',
  C: '700 gp',
  D: '1,000 gp',
  E: '1,250 gp',
  F: '1,500 gp',
  G: '2,000 gp',
  H: '2,500 gp',
  I: '3,250 gp',
  J: '4,000 gp',
  K: '5,000 gp',
  L: '6,000 gp',
  M: '8,000 gp',
  N: '9,000 gp',
  O: '12,000 gp',
  P: '17,000 gp',
  Q: '22,000 gp',
  R: '45,000 gp'
};

// ACKS II average values are constant across Classic/Heroic/Gritty according to the provided tables
export const HOARD_VALUES: Record<HoardTableType, Record<string, string>> = {
  Classic: AVG_HOARD_VALUES,
  Heroic: AVG_HOARD_VALUES,
  Gritty: AVG_HOARD_VALUES
};

// Unique subsets for dropdowns to avoid duplicate React keys
export const UNIQUE_MAP_LOCATIONS = Array.from(new Set(MAP_LOCATIONS));
export const UNIQUE_CLUE_DETAILS = Array.from(new Set(CLUE_DETAILS));
export const UNIQUE_CLUE_CONTENTS = Array.from(new Set(CLUE_CONTENTS));
export const UNIQUE_CLUE_OBSCURITIES = Array.from(new Set(CLUE_OBSCURITIES));
