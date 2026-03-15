import type { PairHistory, Member, AppSettings } from "../types";

const HISTORY_KEY = "pair_lunch_history";
const MEMBERS_KEY = "pair_lunch_members";
const SETTINGS_KEY = "pair_lunch_settings";

export function getHistory(): PairHistory[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(history: PairHistory[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addHistoryEntry(entry: PairHistory): void {
  const history = getHistory();
  history.unshift(entry);
  // keep last 20 weeks
  saveHistory(history.slice(0, 20));
}

export function getMembers(): Member[] {
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    targetGroupSize: 4,
  };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Returns a map of pair-key → count of how many times they've been grouped together.
 */
export function getPairCounts(): Map<string, number> {
  const history = getHistory();
  const counts = new Map<string, number>();
  for (const entry of history) {
    for (const group of entry.groups) {
      const ids = group.members.map((m) => m.id).sort();
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = `${ids[i]}__${ids[j]}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }
  }
  return counts;
}
