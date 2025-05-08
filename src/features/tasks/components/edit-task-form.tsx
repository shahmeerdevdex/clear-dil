"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";

import { Calendar as CalendarIcon } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/date-picker";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Paperclip } from "lucide-react";

import { useUpdateTask } from "../api/use-update-task";
import { useExamineTask } from "../api/use-examine-task";
import { useCreateComment } from "../api/use-create-comment";
import { useAddAttachment } from "../api/use-add-attachment";
import { useDownloadAttachment } from "../api/use-download-attachment";
import { format } from "date-fns";
import { editTaskSchema } from "../schemas";
import { useReviewTask } from "../api/use-review-task";
import { CaseDetail } from "../types";
import { CasePriority, CaseStatus } from "@/clearDil/types";

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  memberOptions: { id: string; name: string }[];
  initialValues: CaseDetail;
}

const CommentInput = ({
  taskId,
  projectId,
  workspaceId,
}: {
  taskId: string;
  projectId: string;
  workspaceId: string;
}) => {
  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { mutate, isPending } = useCreateComment();

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      mutate({
        json: {
          comment,
          taskId,
          workspaceId,
          projectId,
        },
      });
      setComment("");
    } finally {
    }
  };

  useEffect(() => {
    if (!isPending) {
      setIsFocused(false);
    }
  }, [isPending]);

  return (
    <div className="space-y-2">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          if (!comment.trim()) setIsFocused(false);
        }}
        placeholder="Write a comment..."
        className="resize-none border-2 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        rows={isFocused ? 3 : 1}
      />
      {isFocused && (
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsFocused(false);
              setComment("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !comment.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  initialValues,
}: EditTaskFormProps) => {
  const { mutate, isPending } = useUpdateTask();
  const { mutate: mutateExamine } = useExamineTask();
  const { mutate: mutateReview } = useReviewTask();
  const { mutate: mutateAttachment } = useAddAttachment();
  const { mutate: mutateDownloadAttachment } = useDownloadAttachment();
  const [attachments, setAttachments] = useState<
    { name: string; id: string; content_type: string }[]
  >([]);
  const [showActivities, setShowActivities] = useState<boolean>(true);

  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(
      editTaskSchema.omit({ workspaceId: true, description: true })
    ),
    defaultValues: {
      name: initialValues?.title,
      status: initialValues?.status,
      priority: initialValues?.priority,
      workspaceId: initialValues?.workspace_id,
      projectId: initialValues?.project_id,
      description: initialValues?.summary,
      assigneeId: initialValues?.assignee_id,
      createdAt: initialValues.created_at
        ? new Date(initialValues.created_at)
        : undefined,
    } as z.infer<typeof editTaskSchema>,
  });

  const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
    mutate(
      { json: values, param: { taskId: initialValues.id } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  const onAssigneeChange = (userId: string) => {
    if (initialValues.status === CaseStatus.REVIEW_REQUESTED) {
      mutateReview({
        json: {
          taskId: initialValues.id,
          workspaceId: initialValues.workspace_id,
          projectId: initialValues.project_id,
          action: "ASSIGN",
          userId,
        },
      });
    } else {
      mutateExamine({
        json: {
          taskId: initialValues.id,
          workspaceId: initialValues.workspace_id,
          projectId: initialValues.project_id,
          action: "ASSIGN",
          userId,
        },
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      mutateAttachment({
        form: {
          taskId: initialValues.id,
          attachment: files[0],
          workspaceId: initialValues.workspace_id,
          projectId: initialValues.project_id,
        },
      });
    }
  };

  const downloadAttachments = useCallback(
    async (file: { id: string; name: string; content_type: string }) => {
      mutateDownloadAttachment(
        {
          json: {
            taskId: initialValues.id,
            attachmentId: file.id,
            workspaceId: initialValues.workspace_id,
            projectId: initialValues.project_id,
            mimeType: file.content_type,
          },
        },
        {
          onSuccess: async ({ data }) => {
            // Make this function async

            const binaryBuffer = Buffer.from(data, "binary");

            // Convert to Blob
            const blob = new Blob([binaryBuffer], { type: file.content_type });

            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup object URL
            setTimeout(() => URL.revokeObjectURL(url), 7000);
          },
        }
      );
    },
    [
      initialValues.id,
      initialValues.project_id,
      initialValues.workspace_id,
      mutateDownloadAttachment,
    ]
  );

  const formatActivities = useMemo(() => {
    const messages: string[] = [];

    (initialValues?.activities ?? []).forEach((activity) => {
      if (activity.activity_id === "StartEvent") {
        const created_by =
          memberOptions.find((member) => member.id === activity.created_by)
            ?.name ?? "";
        messages.push(
          `${activity.activity_name} by ${created_by} at ${format(
            activity.created_at,
            "Pp"
          )}.`
        );
      }

      if (activity.activity_id === "EndEvent") {
        const completed_by =
          memberOptions.find((member) => member.id === activity.completed_by)
            ?.name ?? "";
        messages.push(
          `${activity.activity_name} by ${completed_by} at ${format(
            activity.created_at,
            "Pp"
          )}.`
        );
      }

      activity.actions?.forEach((action) => {
        const created_by =
          memberOptions.find((member) => member.id === action.created_by)
            ?.name ?? "";

        if (action.action === "ASSIGN_TASK") {
          const match = action.details.match(/Assign user'(.+?)'/);
          const assigned_user = !match
            ? "Unknown"
            : memberOptions.find((member) => member.id === match[1])?.name ??
              "";

          messages.push(
            `${
              activity.activity_name
            } was assigned to ${assigned_user} by ${created_by} at ${format(
              action.created_at,
              "Pp"
            )}.`
          );
        }

        if (action.action === "ADD_ATTACHMENT") {
          const match = action.details.match(/file: '(.+?)'/);
          const extractedDetail = match ? match[1] : "Unknown file";

          messages.push(
            `Attachment "${extractedDetail}" added by ${created_by} at ${format(
              action.created_at,
              "Pp"
            )}.`
          );
        }
      });
    });

    return messages;
  }, [initialValues?.activities, memberOptions]);

  useEffect(() => {
    if (initialValues?.attachments?.length) {
      setAttachments(initialValues.attachments);
    }
  }, [initialValues.attachments]);

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Edit a case</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-x-4 w-full">
              <div className="flex flex-col gap-y-4 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter case name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter case details"
                          rows={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {attachments.length ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between content-center mb-3">
                      <h3 className="font-medium ">Attachments</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <Paperclip className="h-3 w-3 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              downloadAttachments(file);
                            }}
                          >
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-xs truncate">
                              {file.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!!formatActivities?.length && (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between content-center mb-3">
                      <h3 className="font-medium ">Activities</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => {
                          setShowActivities((prev) => !prev);
                        }}
                      >
                        {showActivities ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {showActivities && (
                      <div className="flex flex-col gap-2">
                        {formatActivities?.map((activity, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p>{activity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Comments</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-4">
                      <CommentInput
                        taskId={initialValues.id}
                        projectId={initialValues.project_id}
                        workspaceId={initialValues.workspace_id}
                      />
                      {initialValues?.comments?.map((comment, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <MemberAvatar
                                className="size-8"
                                name={comment.commented_by_id}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {comment.commented_by_id}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(comment.commented_at), "Pp")}
                                </span>
                              </div>
                              <p className="text-sm mt-1 text-gray-700">
                                {comment.body}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 w-[150px] pt-5">
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          onAssigneeChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          {memberOptions.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-x-2">
                                <MemberAvatar
                                  className="size-6"
                                  name={member.name}
                                />
                                {member.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex flex-nowrap items-center gap-x-2">
                        <CalendarIcon className=" h-4 w-4" />
                        Created At
                      </FormLabel>
                      <FormControl>
                        <DatePicker {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          {projectOptions.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center gap-x-2">
                                <ProjectAvatar
                                  className="size-6"
                                  name={project.name}
                                  image={project.imageUrl}
                                />
                                {project.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Paperclip className="h-3 w-3 mr-2" />
                  Attachments
                </Button>
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          <SelectItem value={CasePriority.LOW}>Low</SelectItem>
                          <SelectItem value={CasePriority.MEDIUM}>
                            Medium
                          </SelectItem>
                          <SelectItem value={CasePriority.HIGH}>
                            High
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          <SelectItem value={CaseStatus.INITIATED}>
                            Todo
                          </SelectItem>
                          <SelectItem value={CaseStatus.UNDER_EXAMINATION}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={CaseStatus.REVIEW_REQUESTED}>
                            In Review
                          </SelectItem>
                          <SelectItem value={CaseStatus.CLOSED}>
                            Done
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit" size="lg">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
