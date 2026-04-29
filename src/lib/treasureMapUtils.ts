import { HoardTableType, TreasureMapClue } from '../types';
import {
  TREASURE_TYPES, MAP_LOCATIONS, CLUE_DETAILS, CLUE_CONTENTS,
  CLUE_OBSCURITIES, CLUE_CONCEALMENTS, CLUE_CODES, HOARD_VALUES
} from '../data/treasureMapData';

export interface ClueConfig {
  detail: string | null;
  content: string | null;
  obscurity: string | null;
  code: string | null;
  concealment: string | null;
}

export interface TreasureMapConfig {
  hoardTableType: HoardTableType;
  treasureType: string | null;
  location: string | null;
  numClues: number | null;
  clues: ClueConfig[]; // We maintain length 3 max
}

export interface GenerationResult {
  treasureType: string;
  location: string;
  numClues: number;
  clues: TreasureMapClue[];
  hoardValue: string;
  log: string[];
  finalSummary: string;
}

const rand = (max: number) => Math.floor(Math.random() * max) + 1;
const generateId = () => Math.random().toString(36).substring(2, 11);

export function generateTreasureMap(config: TreasureMapConfig): GenerationResult {
  const log: string[] = [];
  const result: Partial<GenerationResult> = { clues: [] };

  // --- Step 1: Treasure Type ---
  if (config.treasureType) {
    result.treasureType = config.treasureType;
    log.push(`Step one of the generation: Choosing Treasure Type, you manually selected; ${config.treasureType}.`);
  } else {
    const roll = rand(18);
    const tType = TREASURE_TYPES[(roll - 1) % TREASURE_TYPES.length];
    result.treasureType = tType;
    log.push(`Step one of the generation: Choosing Treasure Type, you rolled ${roll}; Treasure Type: ${tType}.`);
  }

  // --- Step 2.1: Location ---
  if (config.location) {
    result.location = config.location;
    log.push(`Step two - roll 1: Determine Treasure Location, you manually selected; ${config.location}.`);
  } else {
    const roll = rand(6);
    const loc = MAP_LOCATIONS[(roll - 1) % MAP_LOCATIONS.length];
    result.location = loc;
    log.push(`Step two - roll 1: Determine Treasure Location, you rolled ${roll}; ${loc}.`);
  }

  // --- Step 2.2: Number of Clues ---
  if (config.numClues !== null) {
    // Edge Case Mitigation: Strict Limit Clamping (Max 3)
    result.numClues = Math.max(1, Math.min(3, config.numClues));
    log.push(`Step two - roll 2: Determine Number of Clues, you manually selected; ${result.numClues} Clues.`);
  } else {
    const roll = rand(6);
    // Standard tables typically group 1-2 = 1, 3-4 = 2, 5-6 = 3
    const num = Math.ceil(roll / 2);
    result.numClues = num;
    log.push(`Step two - roll 2: Determine Number of Clues, you rolled ${roll}; ${num} Clues.`);
  }

  result.clues = [];

  // --- Step 3 & 4: Clue Specifics ---
  for (let i = 0; i < result.numClues; i++) {
    const clueConfig: Partial<ClueConfig> = config.clues[i] || {};
    const clueNum = i + 1;
    const clueResult: TreasureMapClue = {
      id: generateId(),
      detail: '',
      content: '',
      obscurity: '',
    };

    let detailStr = '';
    if (clueConfig.detail) {
      clueResult.detail = clueConfig.detail;
      detailStr = `you manually selected; ${clueResult.detail}`;
    } else {
      const detailRoll = rand(6);
      clueResult.detail = CLUE_DETAILS[(detailRoll - 1) % CLUE_DETAILS.length];
      detailStr = `you rolled ${detailRoll}; ${clueResult.detail}`;
    }

    let contentStr = '';
    if (clueConfig.content) {
      clueResult.content = clueConfig.content;
      contentStr = `you manually selected; ${clueResult.content}`;
    } else {
      const contentRoll = rand(6);
      clueResult.content = CLUE_CONTENTS[(contentRoll - 1) % CLUE_CONTENTS.length];
      contentStr = `you rolled ${contentRoll}; ${clueResult.content}`;
    }

    let obscStr = '';
    if (clueConfig.obscurity) {
      clueResult.obscurity = clueConfig.obscurity;
      obscStr = `you manually selected; ${clueResult.obscurity}`;
    } else {
      const obscRoll = rand(6);
      clueResult.obscurity = CLUE_OBSCURITIES[(obscRoll - 1) % CLUE_OBSCURITIES.length];
      obscStr = `you rolled ${obscRoll}; ${clueResult.obscurity}`;
    }

    log.push(`Clue #${clueNum} Detail: ${detailStr}. Clue #${clueNum} Content: ${contentStr}. Clue #${clueNum} Obscurity: ${obscStr}.`);

    // Dependent Sub-Roll Logic & Orphaned Lock Mitigation
    const isCoded = clueResult.obscurity === 'Coded' || clueResult.obscurity === 'Coded and Concealed';
    const isConcealed = clueResult.obscurity === 'Concealed' || clueResult.obscurity === 'Coded and Concealed';

    if (isConcealed) {
      if (clueConfig.concealment) {
        clueResult.concealment = clueConfig.concealment;
        log.push(`Clue #${clueNum} Concealment: you manually selected; ${clueResult.concealment}.`);
      } else {
        const concRoll = rand(20);
        // Fallback checks boundaries to avoid crashes when dealing with incoming raw or missing data
        clueResult.concealment = CLUE_CONCEALMENTS[(concRoll - 1) % CLUE_CONCEALMENTS.length] || 'Unknown Concealment';
        log.push(`Clue #${clueNum} Concealment: you rolled ${concRoll}; ${clueResult.concealment}.`);
      }
    }

    if (isCoded) {
      if (clueConfig.code) {
        clueResult.code = clueConfig.code;
        log.push(`Clue #${clueNum} Code: you manually selected; ${clueResult.code}.`);
      } else {
        const codeRoll = rand(20);
        // Fallback bounds
        clueResult.code = CLUE_CODES[(codeRoll - 1) % CLUE_CODES.length] || 'Unknown Cipher';
        log.push(`Clue #${clueNum} Code: you rolled ${codeRoll}; ${clueResult.code}.`);
      }
    }

    result.clues.push(clueResult);
  }

  // --- Step 5: General Value ---
  // If a table type is incomplete, default to classic or placeholder "Unknown gp"
  const hoardTable = HOARD_VALUES[config.hoardTableType] || HOARD_VALUES['Classic'];
  const value = hoardTable[result.treasureType] || 'Unknown gp';
  result.hoardValue = value;

  log.push(`Step four of the generation: Determine Hoard Value, using ${config.hoardTableType} table. Treasure Type ${result.treasureType} average value: ${value}.`);

  // --- Step 6: Final Summary output processing ---
  const finalLines: string[] = [];
  
  // Clean string formatter for grammar concerns (e.g. "a few miles away" vs "in a nearby location")
  const locRaw = result.location.toLowerCase();
  let locPhrase = '';
  if (locRaw.includes('nearby') || locRaw.includes('far away')) locPhrase = `in a ${locRaw} location`;
  else if (locRaw.startsWith('in a ') || locRaw.startsWith('a ')) locPhrase = locRaw;
  else locPhrase = `in a ${locRaw} location`;
  
  const cluesWord = result.numClues > 1 ? 'Clues' : 'Clue';

  finalLines.push(`This Treasure Map leads to a Treasure Type ${result.treasureType} Hoard (Average Value: ${value}) ${locPhrase}. The map contains ${result.numClues} ${cluesWord}:`);
  finalLines.push(''); // Add a blank spacing line

  result.clues.forEach((clue, idx) => {
    let clueStr = `* Clue #${idx + 1}: ${clue.content}. The clue's details are ${clue.detail}. This clue is ${clue.obscurity}`;
    if (clue.code && clue.concealment) {
        clueStr += `, the type of code is: ${clue.code}, and the type of concealment is: ${clue.concealment}.`;
    } else if (clue.code) {
        clueStr += `, the type of code is: ${clue.code}.`;
    } else if (clue.concealment) {
        clueStr += `, the type of concealment is: ${clue.concealment}.`;
    } else {
        clueStr += `.`;
    }
    finalLines.push(clueStr);
  });

  result.finalSummary = finalLines.join('\n');
  result.log = log;

  return result as GenerationResult;
}
