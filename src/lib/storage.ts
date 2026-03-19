import { supabase } from "./supabase";
import type { PairHistory, Member, AppSettings } from "../types";

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from("members").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function saveMembers(members: Member[]): Promise<void> {
  await supabase.from("members").delete().neq("id", "");
  if (members.length > 0) {
    const { error } = await supabase.from("members").insert(
      members.map((m) => ({
        id: m.id,
        name: m.name,
        department: m.department,
        attending: m.attending,
        email: m.email ?? "",
      }))
    );
    if (error) throw error;
  }
}

export async function getHistory(): Promise<PairHistory[]> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((row) => ({ date: row.date, groups: row.groups }));
}

export async function addHistoryEntry(entry: PairHistory): Promise<void> {
  const { error } = await supabase
    .from("history")
    .insert({ date: entry.date, groups: entry.groups });
  if (error) throw error;
}

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) return { targetGroupSize: 4 };
  return { targetGroupSize: data.target_group_size };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, target_group_size: settings.targetGroupSize });
  if (error) throw error;
}

export async function getCurrentSession(): Promise<PairHistory | null> {
  const { data, error } = await supabase
    .from("current_session")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) return null;
  return { date: data.date, groups: data.groups };
}

export async function saveCurrentSession(entry: PairHistory): Promise<void> {
  const { error } = await supabase.from("current_session").upsert({
    id: 1,
    date: entry.date,
    groups: entry.groups,
    shuffled_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function getPairCounts(history: PairHistory[]): Map<string, number> {
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
