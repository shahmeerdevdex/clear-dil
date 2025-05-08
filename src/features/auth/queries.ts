import { Member } from "@/clearDil/types";
import clearDilWrapper from "@/clearDil/wrapper";
import { cookies } from "next/headers";

export const getCurrent = async () => {
  try {
    const cookieStore = cookies();
    const user_id = cookieStore.get("user_id")?.value || null;
    if (!user_id) {
      throw new Error("Error Getting User Info");
    }

    const { data, error } = await clearDilWrapper.members.getMembers();

    if (error) {
      throw new Error("Error getting Members", error);
    }

    const user: Member = data?.find(
      (member) => member.id === user_id
    ) as Member;

    return user;
  } catch {
    return null;
  }
};
