import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Group, Member } from "../types";

interface MemberItemProps {
  member: Member;
  groupId: string;
}

function MemberItem({ member, groupId }: MemberItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
    data: { groupId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 p-2 rounded-md bg-[hsl(210,40%,96%)] cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{member.name}</div>
        <div className="text-xs text-[hsl(215.4,16.3%,46.9%)]">{member.department}</div>
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: Group;
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  const size = group.members.length;
  const sizeVariant: "destructive" | "default" | "secondary" =
    size === 2 ? "destructive" : size >= 3 ? "default" : "secondary";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">グループ {index + 1}</CardTitle>
          <Badge variant={sizeVariant}>{size}名</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {group.members.map((member) => (
            <MemberItem key={member.id} member={member} groupId={group.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
