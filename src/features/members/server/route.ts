import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import clearDilWrapper from "@/clearDil/wrapper";
import { MemberDetail } from "../types";
import { MemberRoleEnum } from "@/clearDil/types";

const app = new Hono()
  .get(
    "/",
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const { data: workspace, error } =
        await clearDilWrapper.workspaces.getWorkspace(workspaceId);
      if (error) {
        throw new Error("Something went wrong", error);
      }

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const { data: membersData, error: mmebersErr } =
        await clearDilWrapper.members.getMembers();

      if (mmebersErr) {
        throw new Error("Something went wrong", mmebersErr);
      }

      if (!membersData) {
        throw new Error("Members not found");
      }

      const workspaceMembers = membersData.filter((user) =>
        workspace.members.includes(user.id)
      );

      if (!workspaceMembers) {
        throw new Error("Members not found in workspace");
      }

      const members: MemberDetail[] = await Promise.all(
        workspaceMembers?.map(async (item) => {
          let name = item.username;
          if (item.first_name || item.last_name) {
            name = `${item.first_name} ${item.last_name}`;
          }

          const { data: roleData, error: roleErr } =
            await clearDilWrapper.members.getMembersRole(item.id);

          if (roleErr) {
            throw new Error("Something went wrong");
          }

          return {
            ...item,
            name,
            role: roleData?.map((role) => role.name) || [],
            workspace_id: workspaceId,
          };
        }) || []
      );

      return c.json({
        data: members,
      });
    }
  )
  .delete("/:memberId", async (c) => {
    const { memberId } = c.req.param();

    const { error } = await clearDilWrapper.members.deleteMembers(memberId);
    if (error) {
      throw new Error("Something went wrong", error);
    }

    return c.json({ data: memberId });
  })
  .patch(
    "/:memberId",
    zValidator("json", z.object({ role: z.nativeEnum(MemberRoleEnum) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");

      const { data: memberToUpdate, error: memberErr } =
        await clearDilWrapper.members.getMember(memberId);
      if (memberErr) {
        throw new Error("Something went wrong", memberErr);
      }
      if (!memberToUpdate) {
        throw new Error("Member not found");
      }

      const { data: roleList, error: roleListErr } =
        await clearDilWrapper.members.getRoleList();

      if (roleListErr) {
        throw new Error("Something went wrong", roleListErr);
      }

      const memberRole = roleList?.find((item) => item.name === role);

      const { error: updateErr } =
        await clearDilWrapper.members.updateMembersRole(memberId, {
          id: memberRole?.id,
          name: memberRole?.name,
        });
      if (updateErr) {
        throw new Error("Something went wrong", updateErr);
      }

      return c.json({ data: { $id: memberId } });
    }
  );

export default app;
