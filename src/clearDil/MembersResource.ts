import BaseResource from "./BaseResource";
import { CreateMember, Member, MemberRole } from "./types";

type ApiResponse = Member | Member[] | { error: string };
export class MembersResource extends BaseResource<unknown, ApiResponse> {
  static generateId(): string {
    return [...Array(24)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  async getMembers(): Promise<{ data: Member[] | null; error: unknown }> {
    try {
      const { data } = await this.getAll();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMember(
    id: string
  ): Promise<{ data: Member | null; error: unknown }> {
    try {
      const { data } = await this.getMembers();

      return {
        data: data?.find((member) => member.id === id) as Member,
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMembersRole(
    id: string
  ): Promise<{ data: MemberRole[] | null; error: unknown }> {
    try {
      const { data } = await this.getRoles(id);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getRoleList(): Promise<{ data: MemberRole[] | null; error: unknown }> {
    try {
      const { data } = await this.getAllRoles();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createMembers(
    payload: Partial<CreateMember>
  ): Promise<{ data: Member | null; error: unknown }> {
    try {
      const { data } = await this.create(payload);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateMembers(
    id: string,
    c: Partial<Member>
  ): Promise<{ data: Member | null; error: unknown }> {
    try {
      const { data } = await this.updateById(id, c);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateMembersRole(
    id: string,
    c: Partial<{ id: string; name: string }>
  ): Promise<{ data: Member | null; error: unknown }> {
    try {
      const { data } = await this.updateRoles(id, c);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateMembersPassword(
    id: string,
    c: { value: string },
    access_token?: string
  ): Promise<{ data: Member | null; error: unknown }> {
    try {
      const { data } = await this.updatePassword(id, c, access_token);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteMembers(id: string): Promise<{ data: unknown; error: unknown }> {
    try {
      const response = await this.deleteById(id);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default MembersResource;
