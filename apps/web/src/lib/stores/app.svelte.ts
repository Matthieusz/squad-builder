import type { Account, SquadGroup, AppData, Character } from "$lib/types";
import { saveToLocalStorage, loadFromLocalStorage, clearAllData } from "$lib/utils/export";

class AppStore {
  #accounts = $state<Account[]>([]);
  #groups = $state<SquadGroup[]>([]);

  constructor() {
    if (typeof window !== "undefined") {
      const data = loadFromLocalStorage();
      if (data) {
        this.#accounts = data.accounts;
        this.#groups = data.groups;
      }
    }
  }

  get accounts() {
    return this.#accounts;
  }

  get groups() {
    return this.#groups;
  }

  #persist() {
    saveToLocalStorage({
      accounts: this.#accounts,
      groups: this.#groups,
    });
  }

  // Account operations
  addAccount(account: Account) {
    this.#accounts = [...this.#accounts, account];
    this.#persist();
  }

  removeAccount(id: string) {
    const account = this.#accounts.find((a) => a.id === id);
    if (!account) return;

    const accountCharIds = new Set(account.characters.map((c) => c.id));

    // Remove characters from all squads
    this.#groups = this.#groups.map((group) => ({
      ...group,
      squads: group.squads.map((squad) => ({
        ...squad,
        characterIds: squad.characterIds.filter((id) => !accountCharIds.has(id)),
      })),
    }));

    this.#accounts = this.#accounts.filter((a) => a.id !== id);
    this.#persist();
  }

  updateAccountName(id: string, name: string) {
    const account = this.#accounts.find((a) => a.id === id);
    if (account) {
      account.name = name;
      this.#persist();
    }
  }

  // Group operations
  addGroup(name: string): string {
    const id = crypto.randomUUID();
    this.#groups = [...this.#groups, { id, name, squads: [] }];
    this.#persist();
    return id;
  }

  removeGroup(id: string) {
    this.#groups = this.#groups.filter((g) => g.id !== id);
    this.#persist();
  }

  updateGroupName(id: string, name: string) {
    const group = this.#groups.find((g) => g.id === id);
    if (group) {
      group.name = name;
      this.#persist();
    }
  }

  getGroup(id: string): SquadGroup | undefined {
    return this.#groups.find((g) => g.id === id);
  }

  // Squad operations
  addSquad(groupId: string, name: string): string | null {
    const group = this.#groups.find((g) => g.id === groupId);
    if (!group) return null;

    const id = crypto.randomUUID();
    group.squads = [...group.squads, { id, name, characterIds: [] }];
    this.#persist();
    return id;
  }

  removeSquad(groupId: string, squadId: string) {
    const group = this.#groups.find((g) => g.id === groupId);
    if (group) {
      group.squads = group.squads.filter((s) => s.id !== squadId);
      this.#persist();
    }
  }

  updateSquadName(groupId: string, squadId: string, name: string) {
    const group = this.#groups.find((g) => g.id === groupId);
    const squad = group?.squads.find((s) => s.id === squadId);
    if (squad) {
      squad.name = name;
      this.#persist();
    }
  }

  // Character operations in squad
  addCharacterToSquad(groupId: string, squadId: string, characterId: string): boolean {
    const group = this.#groups.find((g) => g.id === groupId);
    const squad = group?.squads.find((s) => s.id === squadId);
    if (!squad || squad.characterIds.length >= 10) return false;

    if (squad.characterIds.includes(characterId)) return false;

    // Check if character already used in another squad in this group
    const usedInGroup = group!.squads
      .filter((s) => s.id !== squadId)
      .some((s) => s.characterIds.includes(characterId));
    if (usedInGroup) return false;

    // Check if account already represented in this squad
    const char = this.findCharacter(characterId);
    if (!char) return false;

    const accountCharsInSquad = squad.characterIds
      .map((id) => this.findCharacter(id))
      .filter((c): c is Character => c !== null && c.accountId === char.accountId);

    if (accountCharsInSquad.length > 0) return false;

    squad.characterIds = [...squad.characterIds, characterId];
    this.#persist();
    return true;
  }

  removeCharacterFromSquad(groupId: string, squadId: string, characterId: string) {
    const group = this.#groups.find((g) => g.id === groupId);
    const squad = group?.squads.find((s) => s.id === squadId);
    if (squad) {
      squad.characterIds = squad.characterIds.filter((id) => id !== characterId);
      this.#persist();
    }
  }

  // Helper to find a character
  findCharacter(id: string): Character | null {
    for (const account of this.#accounts) {
      const char = account.characters.find((c) => c.id === id);
      if (char) return char;
    }
    return null;
  }

  findCharacterWithAccount(id: string): { character: Character; account: Account } | null {
    for (const account of this.#accounts) {
      const char = account.characters.find((c) => c.id === id);
      if (char) return { character: char, account };
    }
    return null;
  }

  // Import/Export
  importData(data: AppData) {
    this.#accounts = data.accounts;
    this.#groups = data.groups;
    this.#persist();
  }

  exportData(): AppData {
    return {
      version: 1,
      accounts: this.#accounts,
      groups: this.#groups,
    };
  }

  clearAll() {
    this.#accounts = [];
    this.#groups = [];
    clearAllData();
  }

  clearAccounts() {
    // Remove all character references from squads first
    this.#groups = this.#groups.map((group) => ({
      ...group,
      squads: group.squads.map((squad) => ({
        ...squad,
        characterIds: [],
      })),
    }));
    this.#accounts = [];
    this.#persist();
  }

  clearGroups() {
    this.#groups = [];
    this.#persist();
  }
}

export const appStore = new AppStore();
