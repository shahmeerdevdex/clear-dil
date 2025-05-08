import React from "react";
import { useRouter } from "next/navigation";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

import { ProjectDetail } from "@/features/projects/types";
import { CaseStatus } from "@/clearDil/types";

interface EventCardProps {
  title: string;
  assignee: { name: string };
  project?: ProjectDetail;
  status: CaseStatus;
  id: string;
}

const statusColorMap: Record<CaseStatus, string> = {
  [CaseStatus.INITIATED]: "border-l-red-500",
  [CaseStatus.UNDER_EXAMINATION]: "border-l-yellow-500",
  [CaseStatus.REVIEW_REQUESTED]: "border-l-blue-500",
  [CaseStatus.CLOSED]: "border-l-emerald-500",
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee?.name} />
          <div className="size-1 rounded-full bg-neutral-300" />
          <ProjectAvatar
            name={project?.title ?? ""}
            image={project?.imageUrl}
          />
        </div>
      </div>
    </div>
  );
};
