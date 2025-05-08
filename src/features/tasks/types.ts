import { Activity, Attachment, Case, Comment } from "@/clearDil/types";
import { ProjectDetail } from "../projects/types";

export interface AttachmentDetail extends Attachment {
  name: string;
}

export interface CaseDetail extends Case {
  assignee: { name: string };
  project?: ProjectDetail;
  comments?: Comment[];
  attachments?: AttachmentDetail[];
  activities?: Activity[];
}
