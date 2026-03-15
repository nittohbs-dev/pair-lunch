import { useState } from "react";
import { Button } from "./ui/button";
import type { Member } from "../types";

interface Props {
  members: Member[];
  onChange: (members: Member[]) => void;
}

export function MemberListPanel({ members, onChange }: Props) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: trimmed,
      department: department.trim(),
      attending: true,
    };
    onChange([...members, newMember]);
    setName("");
    setDepartment("");
  }

  function handleToggle(id: string) {
    onChange(members.map((m) => m.id === id ? { ...m, attending: !m.attending } : m));
  }

  function handleDelete(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
  }

  const attendingCount = members.filter((m) => m.attending).length;

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="border rounded-md px-3 py-2 text-sm w-32"
          placeholder="部署（任意）"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleAdd} size="sm">追加</Button>
      </div>

      {/* Member list */}
      {members.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-400 mb-2">
            {attendingCount}名参加 / {members.length - attendingCount}名不参加
          </div>
          {members.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                m.attending
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-gray-100 opacity-50"
              }`}
            >
              <button
                onClick={() => handleToggle(m.id)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                  m.attending
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
                title={m.attending ? "不参加にする" : "参加にする"}
              />
              <span className="flex-1 text-sm font-medium">{m.name}</span>
              {m.department && (
                <span className="text-xs text-gray-400">{m.department}</span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  m.attending
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {m.attending ? "参加" : "不参加"}
              </span>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none"
                title="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
