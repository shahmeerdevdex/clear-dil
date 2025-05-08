import {
  CircleCheckIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

import { snakeCaseToTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CaseStatus } from "@/clearDil/types";

interface KanbanColumnHeaderProps {
  board: CaseStatus;
  taskCount: number;
}

const statusIconMap: Record<CaseStatus, React.ReactNode> = {
  [CaseStatus.INITIATED]: <CircleIcon className="size-[18px] text-red-400" />,
  [CaseStatus.UNDER_EXAMINATION]: (
    <CircleDotDashedIcon className="size-[18px] text-yellow-400" />
  ),
  [CaseStatus.REVIEW_REQUESTED]: (
    <CircleDotIcon className="size-[18px] text-blue-400" />
  ),
  [CaseStatus.CLOSED]: (
    <CircleCheckIcon className="size-[18px] text-emerald-400" />
  ),
};

export const KanbanColumnHeader = ({
  board,
  taskCount,
}: KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();

  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button onClick={open} variant="ghost" size="icon" className="size-5">
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};
