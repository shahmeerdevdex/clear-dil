import { CaseStatus } from "@/clearDil/types";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(CaseStatus)),
    assigneeId: parseAsString,
    search: parseAsString,
    created_at: parseAsString,
  });
};
