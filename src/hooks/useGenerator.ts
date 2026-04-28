import { useState } from 'react';
import { generateStep1, generateStep2_1, generateStep2_2, generateStep2_3, generateStep2_4, formatFinalOutput, SpellResult } from '../lib/generatorUtils';
import { Language, MagicType, SpellList } from '../types';

export interface GenerationState {
  isGenerating: boolean;
  log: string[];
  isFinished: boolean;
  finalOutput?: string;
  resultData?: {
    magicType: MagicType;
    language: string;
    totalLevels: number;
    spells: { level: number, name: string }[];
    spellListName?: string;
  }
}

export function useGenerator(languages: Language[], spellLists: SpellList[]) {
  const availableMagicTypes = Array.from(new Set(spellLists.map(list => list.magicType)));
  const defaultMagicType = availableMagicTypes[0] || 'Arcane';

  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    log: [],
    isFinished: false,
  });

  const [lockedMagicType, setLockedMagicType] = useState<{ isLocked: boolean, value: string }>({
    isLocked: false,
    value: defaultMagicType
  });

  const [lockedLanguage, setLockedLanguage] = useState<{ isLocked: boolean, id: string | null }>({
    isLocked: false,
    id: null
  });

  const [lockedLevels, setLockedLevels] = useState<{ isLocked: boolean, value: number | '' }>({
    isLocked: false,
    value: 1
  });

  const startGeneration = () => {
    setState({
       isGenerating: true,
       log: [],
       isFinished: false,
    });
    
    setTimeout(() => {
      let newLog: string[] = [];

      // Step 1
      const step1 = generateStep1(lockedLevels.isLocked ? (lockedLevels.value === '' ? 1 : lockedLevels.value) : null);
      
      let finalOutput = step1.message;
      if (step1.isFinished && step1.message.includes('\n')) {
        const parts = step1.message.split('\n');
        newLog.push(parts[0]);
        finalOutput = parts.slice(1).join('\n');
      } else {
        newLog.push(step1.message);
      }
      
      if (step1.isFinished) {
        let language = '';

        if (step1.type === 'Creature Warding Scroll' || step1.type === 'Cursed Scroll' || step1.type === 'Magic Warding Scroll') {
          const step2_2 = generateStep2_2(languages, 'None', lockedLanguage.isLocked ? lockedLanguage.id : null);
          newLog = newLog.concat(step2_2.logs);
          language = step2_2.languageName;
          finalOutput = `This sheet of papyrus is written in ${language}.\n${finalOutput}`;
        }

        setState({
          isGenerating: false,
          log: newLog,
          isFinished: true,
          finalOutput,
          resultData: language ? {
            magicType: 'None',
            language,
            totalLevels: 0,
            spells: []
          } : undefined
        });
        return;
      }
      
      // Step 2.1
      const step2_1 = generateStep2_1(lockedMagicType.isLocked ? lockedMagicType.value : null, availableMagicTypes);
      newLog.push(step2_1.message);

      // Step 2.2
      const step2_2 = generateStep2_2(languages, step2_1.type, lockedLanguage.isLocked ? lockedLanguage.id : null);
      newLog = newLog.concat(step2_2.logs);

      // Step 2.3
      const isRitual = step1.type === 'Ritual Spell';
      const step2_3 = generateStep2_3(step1.totalLevels, isRitual);
      newLog = newLog.concat(step2_3.logs);
      
      // Step 2.4
      const step2_4 = generateStep2_4(spellLists, step2_1.type, step2_3.spellLevels);
      newLog = newLog.concat(step2_4.logs);

      finalOutput = formatFinalOutput(step2_2.languageName, step2_1.type, step1.totalLevels, step2_4.spells);
      
      setState({
        isGenerating: false,
        log: newLog,
        isFinished: true,
        finalOutput,
        resultData: {
          magicType: step2_1.type as MagicType,
          language: step2_2.languageName,
          totalLevels: step1.totalLevels,
          spells: step2_4.spells.map(s => ({ level: s.level, name: s.name })),
          spellListName: step2_4.spellListName
        }
      });
      
    }, 300); // Small artificial delay to show a generation effect
  };

  return {
    state,
    lockedMagicType,
    setLockedMagicType,
    lockedLanguage,
    setLockedLanguage,
    lockedLevels,
    setLockedLevels,
    startGeneration
  };
}
