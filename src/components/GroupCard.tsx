import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Group, Member } from "../types";

const GROUP_COLORS = [
  "bg-blue-50 border-blue-100",
  "bg-violet-50 border-violet-100",
  "bg-emerald-50 border-emerald-100",
  "bg-amber-50 border-amber-100",
  "bg-rose-50 border-rose-100",
  "bg-cyan-50 border-cyan-100",
];

const AVATAR_COLORS = [
  "bg-blue-200 text-blue-700",
  "bg-violet-200 text-violet-700",
  "bg-emerald-200 text-emerald-700",
  "bg-amber-200 text-amber-700",
  "bg-rose-200 text-rose-700",
  "bg-cyan-200 text-cyan-700",
];

interface MemberItemProps {
  member: Member;
  groupId: string;
  colorClass: string;
}

function MemberItem({ member, groupId, colorClass }: MemberItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
    data: { groupId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 py-2 cursor-grab active:cursor-grabbing select-none"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${colorClass}`}>
        {member.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{member.name}</p>
        {member.department && (
          <p className="text-xs text-slate-400 truncate">{member.department}</p>
        )}
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: Group;
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  const colorIdx = index % GROUP_COLORS.length;

  return (
    <div className={`rounded-2xl border p-5 ${GROUP_COLORS[colorIdx]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">グループ {index + 1}</h3>
        <span className="text-xs bg-white/80 text-slate-500 px-2.5 py-1 rounded-full border border-white">
          {group.members.length}名
        </span>
      </div>
      <div className="divide-y divide-white/60">
        {group.members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            groupId={group.id}
            colorClass={AVATAR_COLORS[colorIdx]}
          />
        ))}
      </div>
    </div>
  );
}
