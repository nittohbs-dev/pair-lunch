import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
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
    onChange([
      ...members,
      { id: crypto.randomUUID(), name: trimmed, department: department.trim(), attending: true },
    ]);
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
    <div className="max-w-2xl space-y-6">
      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">メンバー追加</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition-colors"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="w-36 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition-colors"
            placeholder="部署（任意）"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <UserPlus size={16} />
            追加
          </button>
        </div>
      </div>

      {/* Member list */}
      {members.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">参加・不参加</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {attendingCount}名参加 / {members.length - attendingCount}名不参加
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  m.attending ? "bg-white" : "bg-slate-50"
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-600">
                    {m.name.charAt(0)}
                  </span>
                </div>

                {/* Name & dept */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${m.attending ? "text-slate-900" : "text-slate-400"}`}>
                    {m.name}
                  </p>
                  {m.department && (
                    <p className="text-xs text-slate-400">{m.department}</p>
                  )}
                </div>

                {/* Radio buttons */}
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${m.id}`}
                      checked={m.attending}
                      onChange={() => handleAttendance(m.id, true)}
                      className="w-4 h-4 accent-slate-900 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">参加</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${m.id}`}
                      checked={!m.attending}
                      onChange={() => handleAttendance(m.id, false)}
                      className="w-4 h-4 accent-slate-400 cursor-pointer"
                    />
                    <span className="text-sm text-slate-400">不参加</span>
                  </label>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">まだメンバーがいません。上から追加してください。</p>
        </div>
      )}
    </div>
  );
}
