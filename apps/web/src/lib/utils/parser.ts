import type { Character, ProfessionCode } from "$lib/types";

export interface ParseResult {
  accountName: string;
  profileUrl?: string;
  characters: Omit<Character, "accountId">[];
}

export function parseProfileHtml(html: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const accountName = extractAccountName(doc);
  const profileUrl = extractProfileUrl(doc);
  const characters = extractCharacters(doc);

  return { accountName, profileUrl, characters };
}

function extractAccountName(doc: Document): string {
  const heading = doc.querySelector(".heading.heading--left");
  if (heading?.textContent) {
    const match = heading.textContent.match(/Witaj,\s*(.+?)!/);
    if (match?.[1]) return match[1].trim();
  }

  const profileNameEl = doc.querySelector(".profile-header__name span");
  if (profileNameEl?.textContent) {
    const name = profileNameEl.textContent.trim();
    if (name) return name;
  }

  const profileLink = doc.querySelector('a[href*="/profile/view,"]');
  if (profileLink) {
    const match = profileLink.getAttribute("href")?.match(/view,(\d+)/);
    if (match) {
      return `Konto ${match[1]}`;
    }
  }

  return "Nieznane konto";
}

function extractProfileUrl(doc: Document): string | undefined {
  const profileLink = doc.querySelector('a[href*="/profile/view,"]');
  const href = profileLink?.getAttribute("href");
  return href ? `https://www.margonem.pl${href}` : undefined;
}

function extractCharacters(doc: Document): Omit<Character, "accountId">[] {
  const characters: Omit<Character, "accountId">[] = [];
  const seenIds = new Set<string>();

  const charElements = doc.querySelectorAll(".charc[data-id], .char-row[data-id]");

  for (const el of charElements) {
    const char = parseCharacterElement(el as HTMLElement);
    if (char && !seenIds.has(char.id)) {
      characters.push(char);
      seenIds.add(char.id);
    }
  }

  return characters;
}

function getInputValue(el: HTMLElement, name: string, cls: string): string | undefined {
  return (
    (el.querySelector(`input[name="${name}"]`) as HTMLInputElement)?.value ||
    (el.querySelector(`input.${cls}`) as HTMLInputElement)?.value ||
    undefined
  );
}

function parseCharacterElement(el: HTMLElement): Omit<Character, "accountId"> | null {
  try {
    const id = el.dataset.id || getInputValue(el, "id", "chid") || undefined;
    if (!id) return null;

    const charNick = getInputValue(el, "nick", "chnick") || el.dataset.nick || "";
    const charLvl = parseInt(getInputValue(el, "lvl", "chlvl") || el.dataset.lvl || "0", 10);
    const rawProf = getInputValue(el, "prof", "chprof") || el.dataset.prof || "w";
    const charProf = (rawProf === "b" ? "k" : rawProf) as ProfessionCode;
    const charProfName = getInputValue(el, "profname", "chprofname") || "Wojownik";
    const charWorld =
      getInputValue(el, "world", "chworld") || el.dataset.world || extractWorldFromElement(el);
    const charClan = getInputValue(el, "clan", "chguild") || "";
    const charGender = (getInputValue(el, "gender", "chgender") || "m") as "m" | "k";

    let spriteUrl = "";
    const spriteEl = el.querySelector(".cimg, #charimg");
    if (spriteEl) {
      const style = spriteEl.getAttribute("style") || "";
      const match = style.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        spriteUrl = match[1].replace(/&quot;/g, "");
      }
    }

    if (!charNick || charLvl <= 0) {
      return null;
    }

    return {
      id,
      nick: charNick,
      lvl: charLvl,
      prof: charProf,
      profname: charProfName,
      world: charWorld,
      clan: charClan,
      gender: charGender,
      spriteUrl,
    };
  } catch {
    return null;
  }
}

function extractWorldFromElement(el: HTMLElement): string {
  const worldEl = el.querySelector(".world");
  if (worldEl?.textContent) {
    const match = worldEl.textContent.match(/Świat:\s*(.+)/i);
    if (match) return match[1].trim();
  }

  const descEl = el.querySelector(".char-description");
  if (descEl?.textContent) {
    const match = descEl.textContent.match(/Świat:\s*(\w+)/i);
    if (match) return match[1].trim();
  }

  return "Unknown";
}
