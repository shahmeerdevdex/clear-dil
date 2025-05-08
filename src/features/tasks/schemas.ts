import { z } from "zod";

import { CasePriority, CaseStatus } from "@/clearDil/types";

export const editTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(CaseStatus, { required_error: "Required" }),
  priority: z.nativeEnum(CasePriority, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  createdAt: z.coerce.date(),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  priority: z.nativeEnum(CasePriority, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().trim().min(1, "Required"),
});

export const examineTaskSchema = z.object({
  action: z.string().trim().min(1, "Required"),
  taskId: z.string().trim(),
  userId: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string(),
});
export const reviewTaskSchema = z.object({
  action: z.string().trim().min(1, "Required"),
  taskId: z.string().trim(),
  userId: z.string().optional(),
  closed: z.boolean().optional(),
  workspaceId: z.string(),
  projectId: z.string(),
});

export const taskCommentsSchema = z.object({
  comment: z.string().min(1, "Required"),
  taskId: z.string().trim(),
  workspaceId: z.string(),
  projectId: z.string(),
});

export const taskAttachmentsSchema = z.object({
  attachment: z.instanceof(File),
  taskId: z.string().trim(),
  workspaceId: z.string(),
  projectId: z.string(),
});

export const downloadAttachmentsSchema = z.object({
  attachmentId: z.string().trim(),
  taskId: z.string().trim(),
  mimeType: z.string().trim(),
  workspaceId: z.string(),
  projectId: z.string(),
});

export const downloadBpmnSchema = z.object({
  projectId: z.string().trim().optional(),
  workspaceId: z.string().trim(),
});
