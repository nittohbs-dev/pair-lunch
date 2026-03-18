import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Shuffle, Copy, Check } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { smartShuffle, groupsToText } from "../lib/shuffle";
import { addHistoryEntry, getPairCounts } from "../lib/storage";
import type { Member, Group, PairHistory, AppSettings } from "../types";

interface Props {
  members: Member[];
  history: PairHistory[];
  settings: AppSettings;
  onHistoryAdd: (entry: PairHistory) => void;
}

export function ShufflePanel({ members, history, settings, onHistoryAdd }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));
  const attendingCount = members.filter((m) => m.attending).length;

  function handleShuffle() {
    const attending = members.filter((m) => m.attending);
    if (attending.length === 0) return;
    const pairCounts = getPairCounts(history);
    setGroups(smartShuffle(attending, pairCounts, settings.targetGroupSize));
  }

  async function handleSaveAndCopy() {
    if (groups.length === 0) return;
    const entry: PairHistory = {
      date: new Date().toISOString().split("T")[0],
      groups,
    };
    await addHistoryEntry(entry);
    onHistoryAdd(entry);
    navigator.clipboard.writeText(groupsToText(groups)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeGroupId = active.data.current?.groupId as string;
    const overGroupId = (over.data.current?.groupId as string) ?? (over.id as string);
    if (!activeGroupId || activeGroupId === overGroupId) return;

    setGroups((prev) => {
      const memberId = active.id as string;
      const fromGroup = prev.find((g) => g.id === activeGroupId);
      const toGroup = prev.find((g) => g.id === overGroupId);
      if (!fromGroup || !toGroup) return prev;
      const member = fromGroup.members.find((m) => m.id === memberId);
      if (!member) return prev;
      return prev.map((g) => {
        if (g.id === activeGroupId) return { ...g, members: g.members.filter((m) => m.id !== memberId) };
        if (g.id === overGroupId) return { ...g, members: [...g.members, member] };
        return g;
      });
    });
  }

  function handleDragEnd(_event: DragEndEvent) {}

  return (
    <div className="space-y-6">
      {/* Action card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShuffle}
            disabled={attendingCount === 0}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Shuffle size={16} />
            シャッフル実行
          </button>
          <button
            onClick={handleSaveAndCopy}
            disabled={groups.length === 0}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            {copied ? "コピーしました！" : "テキストコピー & 履歴保存"}
          </button>
          {attendingCount > 0 && (
            <span className="ml-auto text-sm text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              参加者 {attendingCount}名
            </span>
          )}
        </div>
      </div>

      {/* Groups */}
      {groups.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groups.map((group, i) => (
              <SortableContext
                key={group.id}
                id={group.id}
                items={group.members.map((m) => m.id)}
                strategy={rectSortingStrategy}
              >
                <GroupCard group={group} index={i} />
              </SortableContext>
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shuffle size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">
            {attendingCount === 0
              ? "メンバー画面で参加者を設定してください"
              : `${attendingCount}名が参加予定です。「シャッフル実行」でグループを生成します`}
          </p>
        </div>
      )}
    </div>
  );
}
