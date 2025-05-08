import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { CaseStatus } from "@/clearDil/types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: CaseStatus | null;
  assigneeId?: string | null;
  created_at?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  assigneeId,
  created_at,
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: ["tasks", workspaceId, projectId, status, assigneeId, created_at],
    enabled: !!projectId,
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          created_at: created_at ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
