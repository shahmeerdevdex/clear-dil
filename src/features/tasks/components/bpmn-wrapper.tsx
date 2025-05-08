"use client";

import { useGetBpmnDownload } from "../api/use-get-bpmn-download";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import BpmnViewer from "./bpmn-viewer";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const BpmnWrapper = () => {
  const [xml, setXml] = useState<string | null>(null);
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { mutate, isPending } = useGetBpmnDownload();

  useEffect(() => {
    mutate(
      { json: { projectId, workspaceId } },
      {
        onSuccess: ({ data }) => {
          setXml(data);
        },
      }
    );
  }, [mutate, projectId, workspaceId]);

  if (isPending) {
    return (
      <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!xml) {
    return null;
  }

  return (
    <div>
      <h1>BPMN Viewer</h1>
      <BpmnViewer xml={xml} />
    </div>
  );
};
