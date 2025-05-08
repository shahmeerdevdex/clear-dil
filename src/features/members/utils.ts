import clearDilWrapper from "@/clearDil/wrapper";
import { MemberDetail } from "./types";

interface GetMemberProps {
  userId: string;
}

export const getMember = async ({ userId }: GetMemberProps) => {
  const { data, error } = await clearDilWrapper.members.getMembers();
  if (error) {
    throw new Error("Something went wrong", error);
  }
  if (!data) {
    throw new Error("Members not found");
  }
  const currentMember = data.find((user) => user.id === userId);

  if (!currentMember) {
    throw new Error("Member not available");
  }

  const { data: memberRole, error: memberRoleErr } =
    await clearDilWrapper.members.getMembersRole(userId);
  if (memberRoleErr) {
    throw new Error("Something went wrong", memberRoleErr);
  }
  if (!memberRole) {
    throw new Error("Members Role not found");
  }
  const member: MemberDetail = {
    ...currentMember,
    role: memberRole.map((role) => role.name) || [],
    name:
      currentMember?.first_name || currentMember?.last_name
        ? `${currentMember?.first_name} ${currentMember?.last_name}`
        : currentMember?.username,
  };

  return member;
};
