"use client";

import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetProject({
    projectId: `${projectId},${workspaceId}`,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};
