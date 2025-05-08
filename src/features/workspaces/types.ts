import { Workspace as ClearDilWorkspace } from "@/clearDil/types";

export interface WorkspaceDetail extends ClearDilWorkspace {
  imageUrl: string;
  inviteCode: string;
}
