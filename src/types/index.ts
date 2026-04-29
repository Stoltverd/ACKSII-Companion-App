export type MagicType = string;

export interface Language {
  id: string;
  name: string;
  isDivineOnly: boolean;
  rangeMin: number;
  rangeMax: number;
}

export interface Spell {
  id: string;
  name: string;
}

export interface SpellListLevel {
  level: number;
  spells: Spell[];
}

export interface SpellList {
  id: string;
  name: string;
  magicType: MagicType;
  levels: SpellListLevel[];
}

export interface SavedScroll {
  id: string;
  name: string;
  dateSaved: number;
  magicType: MagicType;
  language: string;
  totalLevels: number;
  spells: {
    level: number;
    name: string;
  }[];
  generatedText: string;
  spellListName?: string;
  note?: string;
}

export interface GlobalSpell {
  id: string;
  name: string;
}

export type HoardTableType = 'Classic' | 'Heroic' | 'Gritty';

export interface TreasureMapClue {
  id: string;
  detail: string;
  content: string;
  obscurity: string;
  code?: string;
  concealment?: string;
}

export interface SavedTreasureMap {
  id: string;
  name: string;
  dateSaved: number;
  treasureType: string;
  tableUsed: HoardTableType;
  hoardValue: string;
  location: string;
  clues: TreasureMapClue[];
  generatedText: string;
  note?: string;
}

export interface AppSettings {
  autoScrollToTop: {
    [generatorId: string]: boolean;
  };
}

export interface AppState {
  appMode?: 'judge' | 'player';
  languages: Language[];
  spellLists: SpellList[];
  spells: GlobalSpell[];
  savedScrolls: SavedScroll[];
  savedTreasureMaps?: SavedTreasureMap[];
  settings?: AppSettings;
}
