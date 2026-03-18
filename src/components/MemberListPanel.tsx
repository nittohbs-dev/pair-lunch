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

  function handleAttendance(id: string, attending: boolean) {
    onChange(members.map((m) => (m.id === id ? { ...m, attending } : m)));
  }

  function handleDelete(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
  }

  const attendingCount = members.filter((m) => m.attending).length;

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">メンバー追加</h3>
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
      </div>

      {/* Member list */}
      {members.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">参加・不参加</h3>
            <span className="text-xs text-gray-400">{attendingCount}名参加 / {members.length - attendingCount}名不参加</span>
          </div>
          <div className="divide-y border rounded-lg overflow-hidden">
            {members.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-4 px-4 py-3 ${
                  m.attending ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.department && (
                    <span className="text-xs text-gray-400 ml-2">{m.department}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${m.id}`}
                      checked={m.attending}
                      onChange={() => handleAttendance(m.id, true)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">参加</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${m.id}`}
                      checked={!m.attending}
                      onChange={() => handleAttendance(m.id, false)}
                      className="accent-gray-400"
                    />
                    <span className="text-sm text-gray-500">不参加</span>
                  </label>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                  title="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
