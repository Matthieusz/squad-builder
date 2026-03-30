import type { Character, Squad, SquadGroup, Account, CharacterFilters } from "$lib/types";
import type { ValidationError } from "$lib/types";

export function canAddCharacterToSquad(
  characterId: string,
  squad: Squad,
  group: SquadGroup,
  accounts: Account[],
): { valid: boolean; reason?: string } {
  const character = findCharacter(characterId, accounts);

  if (!character) {
    return { valid: false, reason: "Postać nie znaleziona" };
  }

  if (squad.characterIds.length >= 10) {
    return { valid: false, reason: "Squad jest pełny (maks. 10 postaci)" };
  }

  if (squad.characterIds.includes(characterId)) {
    return { valid: false, reason: "Postać już jest w tym squadzie" };
  }

  const accountCharsInSquad = squad.characterIds
    .map((id) => findCharacter(id, accounts))
    .filter((c): c is Character => c !== null && c.accountId === character.accountId);

  if (accountCharsInSquad.length > 0) {
    return {
      valid: false,
      reason: "Inna postać z tego konta jest już w squadzie",
    };
  }

  const usedInOtherSquad = group.squads
    .filter((s) => s.id !== squad.id)
    .some((s) => s.characterIds.includes(characterId));

  if (usedInOtherSquad) {
    return {
      valid: false,
      reason: "Postać jest już użyta w innym squadzie w tej grupie",
    };
  }

  return { valid: true };
}

export function findCharacter(id: string, accounts: Account[]): Character | null {
  for (const account of accounts) {
    const char = account.characters.find((c) => c.id === id);
    if (char) return char;
  }
  return null;
}

export function findCharacterWithAccount(
  id: string,
  accounts: Account[],
): { character: Character; account: Account } | null {
  for (const account of accounts) {
    const char = account.characters.find((c) => c.id === id);
    if (char) return { character: char, account };
  }
  return null;
}

export function getAvailableCharacters(
  squad: Squad,
  group: SquadGroup,
  accounts: Account[],
  filters?: CharacterFilters,
): Character[] {
  const allCharacters = accounts.flatMap((a) => a.characters);

  return allCharacters.filter((char) => {
    const { valid } = canAddCharacterToSquad(char.id, squad, group, accounts);
    if (!valid) return false;

    if (filters) {
      if (filters.search && !char.nick.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.world && char.world.toLowerCase() !== filters.world.toLowerCase()) {
        return false;
      }
      if (filters.profession && char.prof !== filters.profession) {
        return false;
      }
      if (filters.minLevel && char.lvl < filters.minLevel) {
        return false;
      }
      if (filters.maxLevel && char.lvl > filters.maxLevel) {
        return false;
      }
    }

    return true;
  });
}

export function getWorlds(accounts: Account[]): string[] {
  const worlds = new Set<string>();
  accounts.forEach((a) => a.characters.forEach((c) => worlds.add(c.world)));
  return Array.from(worlds).sort();
}

export function getUsedCharactersInGroup(group: SquadGroup): Set<string> {
  const used = new Set<string>();
  group.squads.forEach((squad) => {
    squad.characterIds.forEach((id) => used.add(id));
  });
  return used;
}

export function validateGroupName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: "name", message: "Nazwa grupy jest wymagana" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Nazwa grupy musi mieć maks. 100 znaków",
    });
  }
  return errors;
}

export function validateSquadName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: "name", message: "Nazwa squadu jest wymagana" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Nazwa squadu musi mieć maks. 100 znaków",
    });
  }
  return errors;
}

export function validateAccountName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: "name", message: "Nazwa konta jest wymagana" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Nazwa konta musi mieć maks. 100 znaków",
    });
  }
  return errors;
}
