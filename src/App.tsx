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
import { Button } from "./components/ui/button";
import { GroupCard } from "./components/GroupCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { MemberListPanel } from "./components/MemberListPanel";
import { smartShuffle, groupsToText } from "./lib/shuffle";
import { getMembers, saveMembers, addHistoryEntry } from "./lib/storage";
import type { Group, Member } from "./types";

type Tab = "dashboard" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [members, setMembers] = useState<Member[]>(getMembers);
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleMembersChange(updated: Member[]) {
    setMembers(updated);
    saveMembers(updated);
    // reset groups when member list changes
    setGroups([]);
  }

  function handleShuffle() {
    const attending = members.filter((m) => m.attending);
    if (attending.length === 0) return;
    setGroups(smartShuffle(attending));
  }

  function handleSaveAndCopy() {
    if (groups.length === 0) return;
    addHistoryEntry({
      date: new Date().toISOString().split("T")[0],
      groups,
    });
    const text = groupsToText(groups);
    navigator.clipboard.writeText(text).then(() => {
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

  const attendingCount = members.filter((m) => m.attending).length;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">金曜ペアランチ</h1>
          <nav className="flex gap-2">
            <Button
              variant={tab === "dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("dashboard")}
            >
              ダッシュボード
            </Button>
            <Button
              variant={tab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("settings")}
            >
              設定
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "settings" ? (
          <SettingsPanel />
        ) : (
          <div className="space-y-6">
            {/* Member management */}
            <div className="rounded-lg border p-4 space-y-3">
              <h2 className="font-semibold text-sm text-gray-600">メンバー管理</h2>
              <MemberListPanel members={members} onChange={handleMembersChange} />
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-3 items-center">
              <Button onClick={handleShuffle} disabled={attendingCount === 0}>
                シャッフル実行
              </Button>
              <Button
                onClick={handleSaveAndCopy}
                disabled={groups.length === 0}
                variant="secondary"
              >
                {copied ? "コピーしました!" : "テキストコピー & 履歴保存"}
              </Button>
              {attendingCount > 0 && (
                <span className="text-sm text-gray-400 ml-auto">
                  参加者: {attendingCount}名
                </span>
              )}
            </div>

            {/* Groups preview */}
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
              <div className="rounded-lg border border-dashed p-12 text-center text-gray-400">
                <p className="text-sm">
                  {attendingCount === 0
                    ? "メンバーを追加して参加者を設定してください"
                    : `${attendingCount}名が参加予定です。「シャッフル実行」でグループを生成します`}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
