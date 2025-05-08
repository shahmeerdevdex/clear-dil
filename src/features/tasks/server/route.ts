import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { AttachmentDetail, CaseDetail } from "../types";
import {
  createTaskSchema,
  downloadAttachmentsSchema,
  downloadBpmnSchema,
  editTaskSchema,
  examineTaskSchema,
  reviewTaskSchema,
  taskAttachmentsSchema,
  taskCommentsSchema,
} from "../schemas";
import clearDilWrapper from "@/clearDil/wrapper";
import {
  Attachment,
  CaseStatus,
  Comment,
  Case,
  Project,
} from "@/clearDil/types";
import { ProjectDetail } from "@/features/projects/types";
import { detectImageMimeType } from "@/lib/utils";

const app = new Hono()
  .delete("/:taskId", async (c) => {
    const { taskId } = c.req.param();
    const taskID = taskId.split(",")[0];
    const workspaceId = taskId.split(",")[1];
    const projectId = taskId.split(",")[2];

    const { data, error } = await clearDilWrapper.cases.deleteCase(
      taskID,
      workspaceId,
      projectId
    );

    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data });
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(CaseStatus).nullish(),
        created_at: z.string().nullish(),
      })
    ),
    async (c) => {
      const { projectId, status, assigneeId, created_at, workspaceId } =
        c.req.valid("query");

      const { data: cases, error } = await clearDilWrapper.cases.getCases(
        workspaceId,
        projectId ?? ""
      );
      if (error) {
        throw new Error("Something happened", error);
      }
      if (!cases) {
        throw new Error("No cases found");
      }

      const { data: projectsList, error: projectErr } =
        await clearDilWrapper.projects.getProjects(workspaceId);

      if (projectErr) {
        throw new Error("Something happened", projectErr);
      }

      if (!projectsList) {
        throw new Error("No projects found");
      }

      const allProjects: ProjectDetail[] = await Promise.all(
        projectsList.map(async (item) => {
          const { data: image } = await clearDilWrapper.projects.getProjectIcon(
            item.id,
            workspaceId
          );
          const base64String = Buffer.from(
            image as unknown as ArrayBuffer
          ).toString("base64");
          const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);

          const dataUrl = `data:${mimeType};base64,${base64String}`;
          return {
            ...item,
            imageUrl: dataUrl,
          };
        })
      );
      const { data: members, error: memberErr } =
        await clearDilWrapper.members.getMembers();

      if (memberErr) {
        throw new Error("Something went wrong", memberErr);
      }

      if (!members) {
        throw new Error("Members not found");
      }

      const populatedCases: CaseDetail[] = cases.map((caseItem: Case) => {
        const member = members.find(
          (member) => member.id === caseItem.assignee_id
        );
        const assignee = {
          name:
            member?.first_name || member?.last_name
              ? `${member?.first_name ?? ""} ${member?.last_name ?? ""}`
              : member?.username ?? "senior",
        };
        const project = allProjects.find(
          (item: Project) => item.id === caseItem.project_id
        );

        return {
          ...caseItem,
          assignee,
          project,
        };
      });

      const filteredCases = populatedCases.filter((item: Case) => {
        return (
          (!projectId || item.project_id === projectId) &&
          (!status || item.status === status) &&
          (!assigneeId || item.assignee_id === assigneeId) &&
          (!created_at ||
            new Date(item.created_at).toDateString() ===
              new Date(created_at).toDateString())
        );
      });

      return c.json({
        data: filteredCases,
      });
    }
  )
  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const { name, priority, description, workspaceId, projectId } =
      c.req.valid("json");
    const payload = {
      title: name,
      summary: description,
      case_type: "SUSPICIOUS_CUSTOMER",
      priority,
      concerned_customer_ids: ["customer_42"],
      bpmn_id: "445b72c0-0c1d-4e67-b08f-7f4f06573598",
    };

    const { data, error } = await clearDilWrapper.cases.createCase(
      payload,
      workspaceId,
      projectId
    );

    if (error) {
      throw new Error("Something happened", error);
    }
    if (!data) {
      throw new Error("No cases found");
    }

    return c.json({ data });
  })
  .patch(
    "/:taskId",
    zValidator("json", editTaskSchema.partial()),
    async (c) => {
      //     const user = c.get("user");
      //     const databases = c.get("databases");
      //     const { name, status, description, projectId, assigneeId } =
      //       c.req.valid("json");
      //     const { taskId } = c.req.param();

      //     const member = await getMember({
      //       userId: user.$id,
      //     });

      //     if (!member) {
      //       return c.json({ error: "Unauthorized" }, 401);
      //     }

      //     const task = await databases.updateDocument(
      //       DATABASE_ID,
      //       TASKS_ID,
      //       taskId,
      //       {
      //         name,
      //         status,
      //         projectId,
      //         assigneeId,
      //         description,
      //       }
      //     );

      // return c.json({ data: task });
      return c.json({ data: null });
    }
  )
  .get("/:taskId", async (c) => {
    const { taskId } = c.req.param();
    const taskID = taskId.split(",")[0];
    const workspaceId = taskId.split(",")[1];

    const { data: projectsData, error: projectsError } =
      await clearDilWrapper.projects.getProjects(workspaceId);

    if (projectsError) {
      throw new Error("Something happened", projectsError);
    }
    if (!projectsData) {
      throw new Error("No projects Data found");
    }

    const { data: caseData, error } = await clearDilWrapper.cases.getCase(
      taskID,
      workspaceId,
      projectsData[0].id
    );
    if (error) {
      throw new Error("Something happened", error);
    }
    if (!caseData) {
      throw new Error("No cases found");
    }

    const { data: commentsData, error: commentsErr } =
      await clearDilWrapper.cases.getCaseComments(
        taskID,
        workspaceId,
        projectsData[0].id
      );
    if (commentsErr) {
      throw new Error("Something happened", commentsErr);
    }
    let comments: Comment[] = [];

    const { data: members, error: memberErr } =
      await clearDilWrapper.members.getMembers();

    if (memberErr) {
      throw new Error("Something went wrong", memberErr);
    }

    if (!members) {
      throw new Error("Members not found");
    }

    if (commentsData?.content) {
      comments = commentsData.content?.map((comment: Comment) => {
        const member = members.find(
          (member) => member.id === comment.commented_by_id
        );
        const name =
          member?.first_name || member?.last_name
            ? `${member?.first_name ?? ""} ${member?.last_name ?? ""}`
            : member?.username ?? "senior";

        return {
          ...comment,
          commented_by_id: name,
        };
      });
    }

    const { data: attachementsData, error: attachmentErr } =
      await clearDilWrapper.cases.getCaseAttachments(
        taskID,
        workspaceId,
        projectsData[0].id
      );

    if (attachmentErr) {
      throw new Error("Something happened", attachmentErr);
    }

    const attachments: AttachmentDetail[] =
      attachementsData?.map((item: Attachment) => ({
        ...item,
        name: item.file_name ? item.file_name : item.title,
      })) ?? [];

    const { data: activities, error: activitiesErr } =
      await clearDilWrapper.cases.getCaseHistory(
        taskID,
        workspaceId,
        projectsData[0].id
      );

    if (activitiesErr) {
      throw new Error("Something happened", activitiesErr);
    }

    const { data: projectData, error: projectErr } =
      await clearDilWrapper.projects.getProject(
        caseData.project_id,
        workspaceId
      );

    if (projectErr) {
      throw new Error("Something happened", projectErr);
    }
    if (!projectData) {
      throw new Error("No project found");
    }

    const { data: image, error: iconErr } =
      await clearDilWrapper.projects.getProjectIcon(
        caseData.project_id,
        workspaceId
      );

    if (iconErr) {
      throw new Error("Something happened", iconErr);
    }
    if (!image) {
      throw new Error("No icon found");
    }

    const base64String = Buffer.from(image).toString("base64");
    const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);

    const dataUrl = `data:${mimeType};base64,${base64String}`;

    const member = members.find((member) => member.id === caseData.assignee_id);

    const assignee = {
      name:
        member?.first_name || member?.last_name
          ? `${member?.first_name ?? ""} ${member?.last_name ?? ""}`
          : member?.username ?? "senior",
    };
    const project: ProjectDetail = {
      ...projectData,
      imageUrl: dataUrl,
    };

    const caseDetail: CaseDetail = {
      ...caseData,
      attachments,
      comments,
      project,
      activities: activities ?? [],
      assignee,
    };

    return c.json({
      data: caseDetail,
    });
  })
  .post("/bpmnDownload", zValidator("json", downloadBpmnSchema), async (c) => {
    const { workspaceId, projectId } = c.req.valid("json");
    let bpmnId: string = "";

    if (!projectId) {
      const { data: project, error } =
        await clearDilWrapper.projects.getProjects(workspaceId);
      console.log("no project found", project, error);
      if (error) {
        throw new Error("Something happened", error);
      }
      if (!project?.length) {
        throw new Error("No project found");
      }
      bpmnId = project[0].bpmn?.id ?? "";
    } else {
      const { data: project, error } =
        await clearDilWrapper.projects.getProject(projectId, workspaceId);
      if (error) {
        throw new Error("Something happened", error);
      }
      if (!project) {
        throw new Error("No project found");
      }
      bpmnId = project.bpmn?.id ?? "";
    }
    const { data: bmpnDownload, error: bpmnErr } =
      await clearDilWrapper.bpmn.getBPMNDownload(bpmnId, workspaceId);

    if (bpmnErr) {
      throw new Error("Something happened", bpmnErr);
    }

    return c.json({
      data: bmpnDownload,
    });
  })
  // .post(
  //   "/bulk-update",
  //
  //   zValidator(
  //     "json",
  //     z.object({
  //       tasks: z.array(
  //         z.object({
  //           $id: z.string(),
  //           status: z.nativeEnum(TaskStatus),
  //           position: z.number().int().positive().min(1000).max(1_000_000),
  //         })
  //       ),
  //     })
  //   ),
  //   async (c) => {
  //     const databases = c.get("databases");
  //     const user = c.get("user");
  //     const { tasks } = await c.req.valid("json");

  //     const tasksToUpdate = await databases.listDocuments<Task>(
  //       DATABASE_ID,
  //       TASKS_ID,
  //       [
  //         Query.contains(
  //           "$id",
  //           tasks.map((task) => task.$id)
  //         ),
  //       ]
  //     );

  //     const workspaceIds = new Set(
  //       tasksToUpdate.documents.map((task) => task.workspaceId)
  //     );
  //     if (workspaceIds.size !== 1) {
  //       return c.json({ error: "All tasks must belong to the same workspace" });
  //     }

  //     const workspaceId = workspaceIds.values().next().value;

  //     if (!workspaceId) {
  //       return c.json({ error: "Workspace ID is required" }, 400);
  //     }

  //     const member = await getMember({
  //       userId: user.$id,
  //     });

  //     if (!member) {
  //       return c.json({ error: "Unauthorized" }, 401);
  //     }

  //     const updatedTasks = await Promise.all(
  //       tasks.map(async (task) => {
  //         const { $id, status, position } = task;
  //         return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
  //           status,
  //           position,
  //         });
  //       })
  //     );

  //     return c.json({ data: updatedTasks });
  //   }
  // )
  .post("/examine", zValidator("json", examineTaskSchema), async (c) => {
    const { taskId, action, userId, workspaceId, projectId } =
      c.req.valid("json");

    let caseData: {
      assignee_id?: string;
      action: string;
      request_close?: boolean;
      resolution?: string;
    } = {
      assignee_id: userId,
      action,
    };

    if (action === "COMPLETE") {
      caseData = {
        action,
        request_close: true,
        resolution: "CANCELLED",
      };
    }

    const { data, error } = await clearDilWrapper.cases.examineCase(
      taskId,
      caseData,
      workspaceId,
      projectId
    );

    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data });
  })
  .post("/review", zValidator("json", reviewTaskSchema), async (c) => {
    const { taskId, action, userId, closed, workspaceId, projectId } =
      c.req.valid("json");

    let payload: {
      assignee_id?: string;
      action: string;
      close?: boolean;
      resolution?: string;
    } = {
      assignee_id: userId,
      action,
    };

    if (action === "COMPLETE") {
      payload = {
        action,
        close: closed,
        resolution: "CANCELLED",
      };
    }

    const { data, error } = await clearDilWrapper.cases.reviewCase(
      taskId,
      payload,
      workspaceId,
      projectId
    );

    if (error) {
      throw Error("Something happened", error);
    }
    return c.json({ data });
  })
  .post("/comments", zValidator("json", taskCommentsSchema), async (c) => {
    const { taskId, comment, workspaceId, projectId } = c.req.valid("json");

    const { data, error } = await clearDilWrapper.cases.createCaseComment(
      taskId,
      {
        body: comment,
      },
      workspaceId,
      projectId
    );

    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data });
  })
  .post("/attachment", zValidator("form", taskAttachmentsSchema), async (c) => {
    const data = await c.req.formData();
    const file = data.get("attachment");
    const taskId = data.get("taskId");
    const workspaceId = data.get("workspaceId");
    const projectId = data.get("projectId");
    let fileData = {};

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileData = {
        filename: file?.name ?? "",
        content_type: file?.type ?? "",
        content: Buffer.from(arrayBuffer).toString("base64"),
      };
    }
    const payload = {
      title: "Attachment File",
      description: "This Attachment is for caseId = " + taskId,
      file: fileData,
    };
    const { data: resData, error } =
      await clearDilWrapper.cases.uploadCaseAttachment(
        taskId as string,
        payload,
        workspaceId as string,
        projectId as string
      );

    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data: resData });
  })
  .post(
    "/download-attachment",
    zValidator("json", downloadAttachmentsSchema),
    async (c) => {
      const { taskId, attachmentId, mimeType, workspaceId, projectId } =
        c.req.valid("json");

      const { data, error } = await clearDilWrapper.cases.downloadAttachment(
        taskId as string,
        attachmentId,
        mimeType,
        workspaceId,
        projectId
      );

      if (error) {
        throw new Error("Something happened", error);
      }

      return c.json({ data });
    }
  );

export default app;
