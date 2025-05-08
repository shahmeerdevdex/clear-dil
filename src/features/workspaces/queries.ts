import clearDilWrapper from "@/clearDil/wrapper";

export const getWorkspaces = async () => {
  const { data: workspaces } = await clearDilWrapper.workspaces.getWorkspaces();

  return { data: workspaces };
};
