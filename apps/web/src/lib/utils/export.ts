import type { AppData } from "$lib/types";
import { AppDataSchema } from "$lib/schemas";

const CURRENT_VERSION = 1;
const STORAGE_KEY = "squad-builder:data";

export function saveToLocalStorage(data: Omit<AppData, "version">): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify({ ...data, version: CURRENT_VERSION });
  localStorage.setItem(STORAGE_KEY, serialized);
}

export function loadFromLocalStorage(): AppData | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    const validated = AppDataSchema.parse(parsed);
    return validated;
  } catch {
    return null;
  }
}

export function exportToFile(data: Omit<AppData, "version">): void {
  const json = JSON.stringify({ ...data, version: CURRENT_VERSION }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `squad-builder-export-${timestamp}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const validated = AppDataSchema.parse(parsed);
        resolve(validated);
      } catch (err) {
        reject(new Error("Invalid file format"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
