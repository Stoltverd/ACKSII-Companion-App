export const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

export interface Step1Result {
  roll: number;
  type: string;
  isSpellScroll: boolean;
  totalLevels: number;
  isFinished: boolean;
  message: string;
  ritualRoll?: number;
}

export const generateStep1 = (lockedLevels: number | null = null): Step1Result => {
  if (lockedLevels !== null) {
    return {
      roll: 0,
      type: 'Spell Scroll',
      isSpellScroll: true,
      totalLevels: lockedLevels,
      isFinished: false,
      message: 'User explicitly set total spell levels',
    };
  }
  const roll = rollDie(100);
  if (roll >= 1 && roll <= 10) return { roll, type: 'Creature Warding Scroll', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Creature Warding Scroll.\nGeneration Ends: A Creature Warding Scroll was generated. Please consult page 146 of the Judges Journal` };
  if (roll >= 11 && roll <= 13) return { roll, type: 'Cursed Scroll', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Cursed Scroll.\nGeneration Ends: A Cursed Scroll was generated. Please consult page 146 of the Judges Journal` };
  if (roll >= 14 && roll <= 18) return { roll, type: 'Magic Warding Scroll', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Magic Warding Scroll.\nGeneration Ends: A Magic Warding Scroll was generated. Please consult page 146 of the Judges Journal` };

  if (roll >= 80 && roll <= 84) return { roll, type: 'Treasure Map (Treasure Type B)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type B).\nGeneration Ends: A Treasure Map (Treasure Type B) was generated. Please proceed to the Treasure Map Generator.`};
  if (roll >= 85 && roll <= 88) return { roll, type: 'Treasure Map (Treasure Type D)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type D).\nGeneration Ends: A Treasure Map (Treasure Type D) was generated. Please proceed to the Treasure Map Generator.`};
  if (roll >= 89 && roll <= 91) return { roll, type: 'Treasure Map (Treasure Type H)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type H).\nGeneration Ends: A Treasure Map (Treasure Type H) was generated. Please proceed to the Treasure Map Generator.`};
  if (roll >= 92 && roll <= 94) return { roll, type: 'Treasure Map (Treasure Type N)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type N).\nGeneration Ends: A Treasure Map (Treasure Type N) was generated. Please proceed to the Treasure Map Generator.`};
  if (roll >= 95 && roll <= 97) return { roll, type: 'Treasure Map (Treasure Type Q)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type Q).\nGeneration Ends: A Treasure Map (Treasure Type Q) was generated. Please proceed to the Treasure Map Generator.`};
  if (roll >= 98 && roll <= 100) return { roll, type: 'Treasure Map (Treasure Type R)', isSpellScroll: false, totalLevels: 0, isFinished: true, message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Treasure Map (Treasure Type R).\nGeneration Ends: A Treasure Map (Treasure Type R) was generated. Please proceed to the Treasure Map Generator.`};

  let totalLevels = 0;
  if (roll >= 19 && roll <= 32) totalLevels = 1;
  else if (roll >= 33 && roll <= 41) totalLevels = 2;
  else if (roll >= 42 && roll <= 48) totalLevels = 3;
  else if (roll >= 49 && roll <= 53) totalLevels = 4;
  else if (roll >= 54 && roll <= 57) totalLevels = 5;
  else if (roll >= 58 && roll <= 61) totalLevels = 6;
  else if (roll >= 62 && roll <= 64) totalLevels = 7;
  else if (roll >= 65 && roll <= 67) totalLevels = 8;
  else if (roll >= 68 && roll <= 69) totalLevels = 9;
  else if (roll >= 70 && roll <= 71) totalLevels = 10;
  else if (roll === 72) totalLevels = 12;
  else if (roll === 73) totalLevels = 14;
  else if (roll === 74) totalLevels = 16;
  else if (roll === 75) totalLevels = 18;
  else if (roll === 76) totalLevels = 20;
  else if (roll === 77) totalLevels = 22;
  else if (roll === 78) totalLevels = 24;

  if (roll === 79) {
    const ritualRoll = rollDie(6);
    let ritualLevels = 0;
    if (ritualRoll >= 1 && ritualRoll <= 3) ritualLevels = 7;
    else if (ritualRoll >= 4 && ritualRoll <= 5) ritualLevels = 8;
    else if (ritualRoll === 6) ritualLevels = 9;
    
    return {
      roll,
      type: 'Ritual Spell',
      isSpellScroll: true,
      totalLevels: ritualLevels,
      isFinished: false,
      message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Ritual Spell. Ritual sub-roll ${ritualRoll} for ${ritualLevels} levels.`,
      ritualRoll
    }
  }

  return {
    roll,
    type: 'Spell Scroll',
    isSpellScroll: true,
    totalLevels,
    isFinished: false,
    message: `Step one of the generation: Determine Scroll Type, you rolled ${roll}; Spell Scroll with ${totalLevels} spell levels.`
  };
};

export interface Step2_1Result {
  roll: number | null;
  type: string;
  message: string;
}

export const generateStep2_1 = (lockedType: string | null, availableMagicTypes: string[]): Step2_1Result => {
  if (lockedType) {
    return {
      roll: null,
      type: lockedType,
      message: `Step 2.1 of the generation: Determine Magic Type, locked to ${lockedType}.`
    };
  }
  
  if (!availableMagicTypes || availableMagicTypes.length === 0) {
    return {
      roll: null,
      type: 'Arcane',
      message: `Step 2.1 Error: No magic types available. Defaulting to Arcane.`
    };
  }
  
  const roll = rollDie(availableMagicTypes.length);
  const type = availableMagicTypes[roll - 1];
  return {
    roll,
    type,
    message: `Step 2.1 of the generation: Determine Magic Type, you rolled ${roll}; ${type}.`
  };
};

export interface Step2_2Result {
  logs: string[];
  languageId: string | null;
  languageName: string;
}

export const generateStep2_2 = (
  languages: any[],
  magicType: string,
  lockedLanguageId: string | null
): Step2_2Result => {
  if (lockedLanguageId) {
    const lang = languages.find(l => l.id === lockedLanguageId);
    if (lang) {
      return {
        logs: [`Step 2.2 of the generation: Determine Scroll Language, locked to ${lang.name}.`],
        languageId: lang.id,
        languageName: lang.name
      };
    }
  }

  const logs: string[] = [];
  let matchingLang: any;

  while (true) {
    const roll = rollDie(100);
    matchingLang = languages.find(l => roll >= l.rangeMin && roll <= l.rangeMax);

    if (!matchingLang) {
      matchingLang = languages[Math.floor(Math.random() * languages.length)];
      logs.push(`Step 2.2 of the generation: Determine Scroll Language, you rolled ${roll}. Didn't match a range, falling back to ${matchingLang.name}.`);
      break;
    }

    if (magicType === 'Arcane' && matchingLang.isDivineOnly) {
      logs.push(`Step 2.2 of the generation: Determine Scroll Language, you rolled ${roll}; ${matchingLang.name}. This is Divine only, rerolling...`);
      continue;
    }

    logs.push(`Step 2.2 of the generation: Determine Scroll Language, you rolled ${roll}; ${matchingLang.name}.`);
    break;
  }

  return {
    logs,
    languageId: matchingLang?.id || null,
    languageName: matchingLang?.name || 'Unknown'
  };
}

export interface Step2_3Result {
  logs: string[];
  spellLevels: number[];
}

export const generateStep2_3 = (initialLevels: number, isRitual: boolean = false): Step2_3Result => {
  const spellLevels: number[] = [];
  const logs: string[] = [];

  if (isRitual) {
    spellLevels.push(initialLevels);
    logs.push(`Step 2.3: Ritual spell detected. The scroll contains a single spell of level ${initialLevels}.`);
    return { logs, spellLevels };
  }

  let remaining = initialLevels;
  while (remaining > 0) {
    const roll = rollDie(100);
    let spellLevel = 1;

    if (remaining >= 6) {
      if (roll <= 25) spellLevel = 1;
      else if (roll <= 50) spellLevel = 2;
      else if (roll <= 70) spellLevel = 3;
      else if (roll <= 85) spellLevel = 4;
      else if (roll <= 95) spellLevel = 5;
      else spellLevel = 6;
      logs.push(`Step 2.3: ${remaining} levels remaining. Roll d100 on "6+ Spell Levels remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    } else if (remaining === 5) {
      if (roll <= 25) spellLevel = 1;
      else if (roll <= 50) spellLevel = 2;
      else if (roll <= 75) spellLevel = 3;
      else if (roll <= 90) spellLevel = 4;
      else spellLevel = 5;
      logs.push(`Step 2.3: 5 levels remaining. Roll d100 on "5 Spell Levels remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    } else if (remaining === 4) {
      if (roll <= 25) spellLevel = 1;
      else if (roll <= 50) spellLevel = 2;
      else if (roll <= 75) spellLevel = 3;
      else spellLevel = 4;
      logs.push(`Step 2.3: 4 levels remaining. Roll d100 on "4 Spell Levels remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    } else if (remaining === 3) {
      if (roll <= 33) spellLevel = 1;
      else if (roll <= 66) spellLevel = 2;
      else spellLevel = 3;
      logs.push(`Step 2.3: 3 levels remaining. Roll d100 on "3 Spell Levels remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    } else if (remaining === 2) {
      if (roll <= 50) spellLevel = 1;
      else spellLevel = 2;
      logs.push(`Step 2.3: 2 levels remaining. Roll d100 on "2 Spell Levels remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    } else if (remaining === 1) {
      spellLevel = 1;
      logs.push(`Step 2.3: 1 level remaining. Roll d100 on "1 Spell Level remaining" table. Result: ${roll}. The scroll contains a spell of level ${spellLevel}.`);
    }

    spellLevels.push(spellLevel);
    remaining -= spellLevel;
  }

  return {
    logs,
    spellLevels
  };
};

export interface SpellResult {
  level: number;
  name: string;
  roll: number;
  maxRoll: number;
}

export interface Step2_4Result {
  logs: string[];
  spells: SpellResult[];
  spellListName?: string;
}

export const generateStep2_4 = (
  spellLists: any[],
  magicType: string,
  spellLevels: number[]
): Step2_4Result => {
  const logs: string[] = [];
  const spells: SpellResult[] = [];

  let filterMagicType = magicType;
  
  let availableLists = spellLists.filter(list => list.magicType === magicType);

  let selectedList = availableLists[Math.floor(Math.random() * availableLists.length)];
  
  if (!selectedList) {
    logs.push(`Step 2.4 Error: No spell lists found for ${magicType}. Generation cannot continue validly.`);
    return { logs, spells };
  }

  logs.push(`Step 2.4: Determine Spell List. Selected ${selectedList.name}.`);

  for (let i = 0; i < spellLevels.length; i++) {
    const levelToRoll = spellLevels[i];
    
    const levelData = selectedList.levels.find((l: any) => l.level === levelToRoll);
    if (!levelData || levelData.spells.length === 0) {
      logs.push(`Spell ${i + 1}: Level ${levelToRoll}: No spells found in list for this level.`);
      spells.push({ level: levelToRoll, name: 'Unknown Spell', roll: 0, maxRoll: 0 });
      continue;
    }

    const availableSpells = levelData.spells;
    const maxRoll = availableSpells.length;
    const roll = rollDie(maxRoll);

    // ACKS II spells are usually 1-36, but since Lists are customizable, we roll against the custom array length.
    const selectedSpell = availableSpells[roll - 1]; // 1-indexed roll to 0-indexed array
    
    logs.push(`Spell ${selectedSpell.name}: Level ${levelToRoll}, you rolled ${roll}`);
    spells.push({ level: levelToRoll, name: selectedSpell.name, roll, maxRoll });
  }

  return { logs, spells, spellListName: selectedList.name };
};

export const formatFinalOutput = (
  language: string,
  magicType: string,
  totalLevels: number,
  spells: SpellResult[]
): string => {
  const totalSpells = spells.length;
  
  const spellsByLevel: Record<number, number> = {};
  spells.forEach(s => {
    spellsByLevel[s.level] = (spellsByLevel[s.level] || 0) + 1;
  });

  const levelStrings = Object.entries(spellsByLevel)
    .map(([level, count]) => {
      return `${count} spell${count > 1 ? 's' : ''} of level ${level}`;
    })
    .join(', and ');

  const thirdLine = levelStrings ? `It contains ${levelStrings}.` : '';

  const spellsList = spells.map(s => `${s.name}.`).join('\n');

  return `This sheet of papyrus is written in ${language}. It contains magic of ${magicType} nature. It contains ${totalSpells} spells, totalling ${totalLevels} spell levels.
${thirdLine}
The spells contained are:
${spellsList}`;
};
