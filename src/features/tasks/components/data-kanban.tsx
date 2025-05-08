import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

import { useExamineTask } from "../api/use-examine-task";
import { useReviewTask } from "../api/use-review-task";
import { CaseStatus } from "@/clearDil/types";
import { CaseDetail } from "../types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

const boards: CaseStatus[] = [
  CaseStatus.INITIATED,
  CaseStatus.UNDER_EXAMINATION,
  CaseStatus.REVIEW_REQUESTED,
  CaseStatus.CLOSED,
];

type CasesState = {
  [key in CaseStatus]: CaseDetail[];
};

interface DataKanbanProps {
  data: CaseDetail[];
}

export const DataKanban = ({ data }: DataKanbanProps) => {
  const workspaceId = useWorkspaceId();
  const [tasks, setTasks] = useState<CasesState>(() => {
    const initialTasks: CasesState = {
      [CaseStatus.INITIATED]: [],
      [CaseStatus.UNDER_EXAMINATION]: [],
      [CaseStatus.REVIEW_REQUESTED]: [],
      [CaseStatus.CLOSED]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status as CaseStatus].push(task);
    });

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as CaseStatus].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return initialTasks;
  });

  const { mutate: mutateExamine, isError: isExamineError } = useExamineTask();
  const { mutate: mutateReview, isError: isReviewError } = useReviewTask();

  useEffect(() => {
    const newTasks: CasesState = {
      [CaseStatus.INITIATED]: [],
      [CaseStatus.UNDER_EXAMINATION]: [],
      [CaseStatus.REVIEW_REQUESTED]: [],
      [CaseStatus.CLOSED]: [],
    };

    data.forEach((task) => {
      newTasks[task.status as CaseStatus].push(task);
    });

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as CaseStatus].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    setTasks(newTasks);
  }, [data, isExamineError, isReviewError]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as CaseStatus;
      const destStatus = destination.droppableId as CaseStatus;

      let updatesPayload: {
        $id: string;
        status: CaseStatus;
        position: number;
      }[] = [];

      let movedTaskDetail: CaseDetail | null = null;
      let previousStatus = "";

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        // Safely remove the task from the source column
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        // If there's no moved task (shouldn't happen, but just in case), return the previous state
        if (!movedTask) {
          console.error("No task found at the source index");
          return prevTasks;
        }

        // Create a new task object with potentially updated status
        const updatedMovedTask =
          sourceStatus !== destStatus
            ? { ...movedTask, status: destStatus }
            : movedTask;

        if (sourceStatus !== destStatus) previousStatus = sourceStatus;

        movedTaskDetail = updatedMovedTask;

        // Update the source column
        newTasks[sourceStatus] = sourceColumn;

        // Add the task to the destination column
        const destColumn = [...newTasks[destStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destStatus] = destColumn;

        // Prepare minimal update payloads
        updatesPayload = [];

        // Always update the moved task
        updatesPayload.push({
          $id: updatedMovedTask.id,
          status: destStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // Update positions for affected tasks in the destination column
        newTasks[destStatus].forEach((task, index) => {
          if (task && task.id !== updatedMovedTask.id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            updatesPayload.push({
              $id: task.id,
              status: destStatus,
              position: newPosition,
            });
          }
        });

        // If the task moved between columns, update positions in the source column
        if (sourceStatus !== destStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              updatesPayload.push({
                $id: task.id,
                status: sourceStatus,
                position: newPosition,
              });
            }
          });
        }

        return newTasks;
      });
      if (movedTaskDetail) {
        if (destStatus === CaseStatus.UNDER_EXAMINATION) {
          mutateExamine({
            json: {
              taskId: (movedTaskDetail as CaseDetail)?.id,
              projectId: (movedTaskDetail as CaseDetail)?.project_id,
              workspaceId,
              action: "COMPLETE",
            },
          });
        }
        if (destStatus === CaseStatus.CLOSED) {
          mutateReview({
            json: {
              taskId: (movedTaskDetail as CaseDetail)?.id,
              projectId: (movedTaskDetail as CaseDetail)?.project_id,
              workspaceId,
              action: "COMPLETE",
              closed: true,
            },
          });
        }
        if (
          destStatus === CaseStatus.UNDER_EXAMINATION &&
          previousStatus === CaseStatus.REVIEW_REQUESTED
        ) {
          mutateReview({
            json: {
              taskId: (movedTaskDetail as CaseDetail)?.id,
              projectId: (movedTaskDetail as CaseDetail)?.project_id,
              workspaceId,
              action: "COMPLETE",
              closed: false,
            },
          });
        }
      }
    },
    [mutateExamine, mutateReview, workspaceId]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
