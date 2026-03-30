export type ProfessionCode = "w" | "t" | "h" | "p" | "m" | "b";

export interface Character {
  id: string;
  nick: string;
  lvl: number;
  prof: ProfessionCode;
  profname: string;
  world: string;
  clan: string;
  gender: "m" | "k";
  accountId: string;
  spriteUrl: string;
}

export interface Account {
  id: string;
  name: string;
  profileUrl?: string;
  characters: Character[];
}

export interface Squad {
  id: string;
  name: string;
  characterIds: string[];
}

export interface SquadGroup {
  id: string;
  name: string;
  squads: Squad[];
}

export interface AppData {
  version: number;
  accounts: Account[];
  groups: SquadGroup[];
}

export interface CharacterFilters {
  search?: string;
  world?: string;
  profession?: string;
  minLevel?: number;
  maxLevel?: number;
}

export type ValidationError = { field: string; message: string };
