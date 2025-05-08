import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  loginSchema,
  registerSchema,
  resetPasswordApiSchema,
} from "../schemas";
import clearDilWrapper from "@/clearDil/wrapper";
import { Member, TokenResponse } from "@/clearDil/types";
import { cookies } from "next/headers";

const app = new Hono()
  .get("/current", async (c) => {
    const cookieStore = cookies();
    const user_id = cookieStore.get("user_id")?.value || null;
    if (!user_id) {
      throw new Error("Error Getting User Info");
    }

    const { data, error } = await clearDilWrapper.members.getMembers();

    if (error) {
      throw new Error("Error getting Members", error);
    }

    const user: Member | undefined = data?.find(
      (member) => member.id === user_id
    );

    return c.json({ data: user });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { username, password } = c.req.valid("json");

    const { error } = await clearDilWrapper.auth.login({ username, password });

    if (error) {
      throw new Error("Error Loging In", error);
    }

    return c.json({
      success: true,
    });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { username, firstName, lastName, email, password } =
      c.req.valid("json");

    const { error } = await clearDilWrapper.members.createMembers({
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });

    if (error) {
      throw new Error("Error Creating User", error);
    }

    const { error: loginErr } = await clearDilWrapper.auth.login({
      username,
      password,
    });

    if (loginErr) {
      throw new Error("Error Loging In", loginErr);
    }

    return c.json({ success: true });
  })
  .post(
    "/resetPassword",
    zValidator("json", resetPasswordApiSchema),
    async (c) => {
      const { newPassword, username, password } = c.req.valid("json");

      const { data, error } = await clearDilWrapper.auth.login(
        {
          username,
          password,
        },
        true
      );

      if (error) {
        throw new Error("Error getting token", error);
      }

      if (!data) {
        throw new Error("Error getting token");
      }

      const user_id = clearDilWrapper.auth.getUserInfo()?.id;
      if (!user_id) {
        throw new Error("Error Getting User Info");
      }

      const { error: resetErr } =
        await clearDilWrapper.members.updateMembersPassword(
          user_id,
          {
            value: newPassword,
          },
          (data as TokenResponse)?.access_token
        );

      if (resetErr) {
        throw new Error("Error Updating Password", resetErr);
      }

      return c.json({ success: true });
    }
  )
  .post("/logout", async (c) => {
    clearDilWrapper.auth.handleLogout();

    return c.json({ success: true });
  });

export default app;
