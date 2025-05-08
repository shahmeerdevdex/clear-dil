import { Member, MemberRoleEnum } from "@/clearDil/types";

export interface MemberDetail extends Member {
  role: MemberRoleEnum[];
  workspace_id?: string;
  name: string;
}
