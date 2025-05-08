import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { WorkspaceDetail } from "../types";
import {
  createWorkspaceSchema,
  inviteUserSchema,
  updateWorkspaceSchema,
} from "../schemas";
import clearDilWrapper from "@/clearDil/wrapper";
import { Case, Workspace as ClearDilWorkspace } from "@/clearDil/types";
import { detectImageMimeType } from "@/lib/utils";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const { data: workspaces, error } =
      await clearDilWrapper.workspaces.getWorkspaces();

    if (error) {
      throw new Error("Something happened", error);
    }
    if (!workspaces) {
      throw new Error("No workspace found");
    }

    const allWorkspaces: WorkspaceDetail[] = await Promise.all(
      workspaces.map(async (item: ClearDilWorkspace) => {
        const { data: image } =
          await clearDilWrapper.workspaces.getWorkspaceIcon(item.id);
        const base64String = Buffer.from(
          image as unknown as ArrayBuffer
        ).toString("base64");
        const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);

        const dataUrl = `data:${mimeType};base64,${base64String}`;
        return {
          ...item,
          inviteCode: "1234",
          imageUrl: dataUrl,
        };
      })
    );

    return c.json({
      data: allWorkspaces,
    });
  })
  .get("/:workspaceId", async (c) => {
    const { workspaceId } = c.req.param();

    const { data: workspace, error } =
      await clearDilWrapper.workspaces.getWorkspace(workspaceId);

    if (error) {
      throw new Error("Something happened", error);
    }
    if (!workspace) {
      throw new Error("No workspace found");
    }

    const { data: image, error: iconErr } =
      await clearDilWrapper.workspaces.getWorkspaceIcon(workspaceId);
    if (iconErr) {
      throw new Error("Something happened", iconErr);
    }

    let dataUrl = "";
    if (image) {
      const base64String = Buffer.from(image).toString("base64");
      const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);
      dataUrl = `data:${mimeType};base64,${base64String}`;
    }

    return c.json({
      data: {
        ...workspace,
        inviteCode: "1234",
        imageUrl: dataUrl,
      },
    });
  })
  .get("/:workspaceId/info", async (c) => {
    const { workspaceId } = c.req.param();

    const { data: workspace, error } =
      await clearDilWrapper.workspaces.getWorkspace(workspaceId);

    if (error) {
      throw new Error("Something happened", error);
    }
    if (!workspace) {
      throw new Error("No workspace found");
    }

    const { data: image, error: iconErr } =
      await clearDilWrapper.workspaces.getWorkspaceIcon(workspaceId);

    if (iconErr) {
      throw new Error("Something happened", iconErr);
    }

    let dataUrl = "";
    if (image) {
      const base64String = Buffer.from(image).toString("base64");
      const mimeType = detectImageMimeType(image as unknown as ArrayBuffer);

      dataUrl = `data:${mimeType};base64,${base64String}`;
    }
    return c.json({
      data: {
        ...workspace,
        inviteCode: "1234",
        imageUrl: dataUrl,
      },
    });
  })
  .post("/", zValidator("form", createWorkspaceSchema), async (c) => {
    const { name, image } = c.req.valid("form");
    const user = clearDilWrapper.workspaces.getUserInfo();

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

    const { data: workspace, error } =
      await clearDilWrapper.workspaces.createWorkspace({
        title: name,
        description: "This is a workspace",
        members: user?.id ? [user?.id] : [],
        icon: uploadedImage,
      });

    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data: workspace });
  })
  .patch(
    "/:workspaceId",
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { name, image, members } = c.req.valid("form");

      let payload: {
        title?: string;
        description: string;
        members?: string[];
        icon?: {
          filename: string;
          content_type: string;
          content: string;
        };
      } = {
        title: name,
        description: "This is a workspace",
        members,
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

      const { data: workspace, error } =
        await clearDilWrapper.workspaces.updateWorkspace(workspaceId, payload);
      if (error) {
        throw new Error("Something happened", error);
      }

      return c.json({ data: workspace });
    }
  )
  .delete("/:workspaceId", async (c) => {
    const { workspaceId } = c.req.param();

    const { error } = await clearDilWrapper.workspaces.deleteWorkspace(
      workspaceId
    );
    if (error) {
      throw new Error("Something happened", error);
    }

    return c.json({ data: workspaceId });
  })
  .post(
    "/:workspaceId/invite-user",
    zValidator("form", inviteUserSchema),
    async (c) => {
      const { email } = c.req.valid("form");
      const { error } = await clearDilWrapper.members.createMembers({
        email,
        username: email.split("@")[0],
        password: "12345678",
        first_name: "",
        last_name: "",
        send_password_reset_mail: true,
        login_url: `http://localhost:3000/reset-password?username=${
          email.split("@")[0]
        }&password=12345678`,
      });

      if (error) {
        throw new Error("Error inviting user", error);
      }

      return c.json({ data: "success" });
    }
  )
  .post(
    "/:workspaceId/join",
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      // const { workspaceId } = c.req.param();
      // const { code } = c.req.valid("json");

      // const databases = c.get("databases");
      // const user = c.get("user");

      // const member = await getMember({
      //   userId: user.$id,
      // });

      // if (member) {
      //   return c.json({ error: "Already a member" }, 400);
      // }

      // const workspace = await databases.getDocument<Workspace>(
      //   DATABASE_ID,
      //   WORKSPACES_ID,
      //   workspaceId
      // );

      // if (workspace.inviteCode !== code) {
      //   return c.json({ error: "Invalid invite code" }, 400);
      // }

      // await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
      //   workspaceId,
      //   userId: user.$id,
      //   role: MemberRoleEnum.ViewOnly,
      // });

      return c.json({ data: null });
    }
  )
  .get("/:workspaceId/analytics", async (c) => {
    const { workspaceId } = c.req.param();

    const { data: projectsData, error: projectsError } =
      await clearDilWrapper.projects.getProjects(workspaceId);

    if (projectsError) {
      throw new Error("Something happened getting Projects", projectsError);
    }
    if (!projectsData?.length) {
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

    console.log("PROJECT_SISJDS(DS(", projectsData[0].id);

    const { data: cases, error } = await clearDilWrapper.cases.getCases(
      workspaceId,
      projectsData[0].id
    );

    if (error) {
      throw new Error("Something happened getting cases", error);
    }
    if (!cases) {
      throw new Error("No cases found");
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
        item.workspace_id === workspaceId
      );
    });

    const lastMonthTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.workspace_id === workspaceId
      );
    });

    const taskCount = thisMonthTasks?.length;
    const taskDifference = taskCount - lastMonthTasks?.length;

    const thisMonthAssignedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= thisMonthStart &&
        createdAt <= thisMonthEnd &&
        item.workspace_id === workspaceId &&
        item.assignee_id === currentUser?.id
      );
    });

    const lastMonthAssignedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.workspace_id === workspaceId &&
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
        item.workspace_id === workspaceId &&
        item.status.toLowerCase() !== "closed"
      );
    });

    const lastMonthIncompleteTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.workspace_id === workspaceId &&
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
        item.workspace_id === workspaceId &&
        item.status.toLowerCase() === "closed"
      );
    });

    const lastMonthCompletedTasks = cases.filter((item: Case) => {
      const createdAt = new Date(item.created_at);
      return (
        createdAt >= lastMonthStart &&
        createdAt <= lastMonthEnd &&
        item.workspace_id === workspaceId &&
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
