import type { Member, Group } from "../types";
import { getPairCounts } from "./storage";

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

function score(group: Member[], pairCounts: Map<string, number>): number {
  let s = 0;
  const ids = group.map((m) => m.id);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      // penalty for past pairs
      s += (pairCounts.get(pairKey(ids[i], ids[j])) ?? 0) * 10;
    }
  }
  // penalty for same department
  const depts = group.map((m) => m.department);
  for (let i = 0; i < depts.length; i++) {
    for (let j = i + 1; j < depts.length; j++) {
      if (depts[i] && depts[j] && depts[i] === depts[j]) s += 5;
    }
  }
  return s;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGroups(members: Member[], targetSize: number): Member[][] {
  const n = members.length;
  if (n === 0) return [];

  // Calculate group sizes: distribute remainder to last groups
  const numGroups = Math.max(1, Math.round(n / targetSize));
  const base = Math.floor(n / numGroups);
  const extra = n % numGroups;

  // sizes: (numGroups - extra) groups of base, extra groups of (base+1)
  // Put larger groups at the end to avoid 2-person groups when possible
  const sizes: number[] = [];
  for (let i = 0; i < numGroups; i++) {
    sizes.push(i < numGroups - extra ? base : base + 1);
  }

  const groups: Member[][] = [];
  let idx = 0;
  for (const size of sizes) {
    groups.push(members.slice(idx, idx + size));
    idx += size;
  }
  return groups;
}

export function smartShuffle(members: Member[]): Group[] {
  if (members.length === 0) return [];

  const pairCounts = getPairCounts();
  const settings = JSON.parse(localStorage.getItem("pair_lunch_settings") || '{"targetGroupSize":4}');
  const targetSize: number = settings.targetGroupSize ?? 4;

  // Run multiple trials and pick best
  let bestGroups: Member[][] = [];
  let bestScore = Infinity;

  for (let trial = 0; trial < 200; trial++) {
    const shuffled = shuffle(members);
    const groups = buildGroups(shuffled, targetSize);
    const totalScore = groups.reduce((sum, g) => sum + score(g, pairCounts), 0);
    if (totalScore < bestScore) {
      bestScore = totalScore;
      bestGroups = groups;
    }
  }

  return bestGroups.map((members, i) => ({
    id: `group-${i + 1}`,
    members,
  }));
}

export function groupsToText(groups: Group[]): string {
  return groups
    .map((g, i) => {
      const memberList = g.members.map((m) => `  - ${m.name}（${m.department}）`).join("\n");
      return `【グループ${i + 1}】\n${memberList}`;
    })
    .join("\n\n");
}
