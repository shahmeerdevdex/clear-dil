import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { createProjectSchema, updateProjectSchema } from "../schemas";

import clearDilWrapper from "@/clearDil/wrapper";
import { Case, Project as ClearDilProject } from "@/clearDil/types";
import { ProjectDetail } from "../types";
import { getCurrent } from "@/features/auth/queries";
import { bpmnPayload } from "@/clearDil/config";
import { detectImageMimeType } from "@/lib/utils";

const app = new Hono()
  .post("/", zValidator("form", createProjectSchema), async (c) => {
    const { name, image, workspaceId } = c.req.valid("form");

    const user = await getCurrent();

    const { data: BPMNData, error: BPMNErr } =
      await clearDilWrapper.bpmn.createBpmns(bpmnPayload, workspaceId);
    console.log("BPMNERRRR", BPMNErr);
    if (BPMNErr || !BPMNData) {
      throw Error("BPMN not created", BPMNErr ?? "");
    }

    console.log("BPMNData", BPMNData);

    let uploadedImage: {
      filename: string;
      content_type: string;
      content: string;
    } = {
      filename: "",
      content: "",
      content_type: "",
    };

    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      uploadedImage = {
        filename: image?.name ?? "",
        content_type: image?.type ?? "",
        content: Buffer.from(arrayBuffer).toString("base64"),
      };
    }

    console.log("Payload", {
      title: name,
      description: `This is a project for workspace ${workspaceId}`,
      icon: uploadedImage,
      members: user?.id ? [user?.id] : [],
      bpmn_id: BPMNData.id,
    });

    const { data: project, error } =
      await clearDilWrapper.projects.createProject(
        {
          title: name,
          description: `This is a project for workspace ${workspaceId}`,
          icon: uploadedImage,
          members: user?.id ? [user?.id] : [],
          bpmn_id: BPMNData.id,
        },
        workspaceId
      );
    if (error) {
      throw new Error("Something happened", error);
    }

    console.log("created", project);

    return c.json({ data: project });
  })
  .get(
    "/",

    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }

      const { data: projects, error } =
        await clearDilWrapper.projects.getProjects(workspaceId);

      if (error) {
        throw new Error("Something happened", error);
      }
      if (!projects?.length) {
        return c.json({
          data: [],
        });
      }

      const allProjects: ProjectDetail[] = await Promise.all(
        projects.map(async (item: ClearDilProject) => {
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

      return c.json({
        data: allProjects,
      });
    }
  )
  .get("/:projectId", async (c) => {
    const { projectId } = c.req.param();
    const workspaceId = projectId.split(",")[1];
    const projectID = projectId.split(",")[0];

    const { data: project, error } = await clearDilWrapper.projects.getProject(
      projectID,
      workspaceId
    );

    if (error) throw new Error("Something hapenned", error);

    const { data: image, error: iconErr } =
      await clearDilWrapper.projects.getProjectIcon(projectID, workspaceId);

    if (iconErr) throw new Error("Something happened", iconErr);
    if (!image) throw new Error("Icon not found");

    const base64String = Buffer.from(image).toString("base64");
    const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);

    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return c.json({
      data: {
        ...project,
        imageUrl: dataUrl,
      } as ProjectDetail,
    });
  })
  .patch("/:projectId", zValidator("form", updateProjectSchema), async (c) => {
    const { projectId } = c.req.param();
    const { name, image, members, bpmn_id, workspace_id } = c.req.valid("form");
    let payload: Partial<ClearDilProject> = {
      title: name,
      description: "This is a workspace",
      members,
      bpmn_id,
    };

    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      payload = {
        ...payload,
        icon: {
          filename: image?.name ?? "",
          content_type: image?.type ?? "",
          content: Buffer.from(arrayBuffer).toString("base64"),
        },
      };
    }

    const { data: project, error } =
      await clearDilWrapper.projects.updateProject(
        projectId,
        payload,
        workspace_id
      );

    if (error) throw new Error("Something happened", error);

    return c.json({ data: project });
  })
  .delete("/:projectId", async (c) => {
    const { projectId } = c.req.param();
    const workspaceId = projectId.split(",")[1];
    const projectID = projectId.split(",")[0];

    await clearDilWrapper.projects.deleteProject(projectID, workspaceId);

    return c.json({ data: projectId });
  })
  .get("/:projectId/analytics", async (c) => {
    const { projectId } = c.req.param();
    const workspaceId = projectId.split(",")[1];
    const projectID = projectId.split(",")[0];

    const { data: cases, error } = await clearDilWrapper.cases.getCases(
      workspaceId,
      projectID
    );

    if (error) {
      throw new Error("Something happened", error);
    }
    if (!cases?.length) {
      return c.json({
        data: {
          taskCount: 0,
          taskDifference: 0,
          assignedTaskCount: 0,
          assignedTaskDifference: 0,
          completedTaskCount: 0,
          completedTaskDifference: 0,
          incompleteTaskCount: 0,
          incompleteTaskDifference: 0,
          overdueTaskCount: 0,
          overdueTaskDifference: 0,
        },
      });
    }

    const currentUser = clearDilWrapper.cases.getUserInfo();

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= thisMonthStart &&
        createdAt <= thisMonthEnd &&
        item.project_id === projectID
      );
    });

    const lastMonthTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.project_id === projectID
      );
    });

    const taskCount = thisMonthTasks?.length;
    const taskDifference = taskCount - lastMonthTasks?.length;

    const thisMonthAssignedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= thisMonthStart &&
        createdAt <= thisMonthEnd &&
        item.project_id === projectID &&
        item.assignee_id === currentUser?.id
      );
    });

    const lastMonthAssignedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.project_id === projectID &&
        item.assignee_id === currentUser?.id
      );
    });

    const assignedTaskCount = thisMonthAssignedTasks?.length;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks?.length;

    const thisMonthIncompleteTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= thisMonthStart &&
        createdAt <= thisMonthEnd &&
        item.project_id === projectID &&
        item.status.toLowerCase() !== "closed"
      );
    });

    const lastMonthIncompleteTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.project_id === projectID &&
        item.status.toLowerCase() !== "closed"
      );
    });

    const incompleteTaskCount = thisMonthIncompleteTasks?.length;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks?.length;

    const thisMonthCompletedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= thisMonthStart &&
        createdAt <= thisMonthEnd &&
        item.project_id === projectID &&
        item.status.toLowerCase() === "closed"
      );
    });

    const lastMonthCompletedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.project_id === projectID &&
        item.status.toLowerCase() === "closed"
      );
    });

    const completedTaskCount = thisMonthCompletedTasks?.length;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks?.length;

    const thisMonthOverdueTasks = [];

    const lastMonthOverdueTasks = [];

    const overdueTaskCount = thisMonthOverdueTasks?.length;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks?.length;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    });
  });

export default app;
