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
    return { valid: false, reason: "Character not found" };
  }

  if (squad.characterIds.length >= 10) {
    return { valid: false, reason: "Squad is full (max 10 characters)" };
  }

  if (squad.characterIds.includes(characterId)) {
    return { valid: false, reason: "Character already in this squad" };
  }

  const accountCharsInSquad = squad.characterIds
    .map((id) => findCharacter(id, accounts))
    .filter((c): c is Character => c !== null && c.accountId === character.accountId);

  if (accountCharsInSquad.length > 0) {
    return {
      valid: false,
      reason: "Another character from this account is already in the squad",
    };
  }

  const usedInOtherSquad = group.squads
    .filter((s) => s.id !== squad.id)
    .some((s) => s.characterIds.includes(characterId));

  if (usedInOtherSquad) {
    return {
      valid: false,
      reason: "Character already used in another squad in this group",
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
    errors.push({ field: "name", message: "Group name is required" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Group name must be 100 characters or less",
    });
  }
  return errors;
}

export function validateSquadName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: "name", message: "Squad name is required" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Squad name must be 100 characters or less",
    });
  }
  return errors;
}

export function validateAccountName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: "name", message: "Account name is required" });
  }
  if (name.length > 100) {
    errors.push({
      field: "name",
      message: "Account name must be 100 characters or less",
    });
  }
  return errors;
}
