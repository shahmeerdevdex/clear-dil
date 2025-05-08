import BaseResource from "./BaseResource";
import { Workspace } from "./types";

type ApiResponse = Workspace | Workspace[] | { error: string };
export class WorkspaceResource extends BaseResource<unknown, ApiResponse> {
  static generateId(): string {
    return [...Array(24)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  async getWorkspaces(): Promise<{ data: Workspace[] | null; error: unknown }> {
    try {
      const { data } = await this.getAll();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getWorkspace(
    id: string
  ): Promise<{ data: Workspace | null; error: unknown }> {
    try {
      const { data } = await this.getById(id);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getWorkspaceIcon(
    id: string
  ): Promise<{ data: string | null; error: unknown }> {
    try {
      const data = await this.getIcon(id);
      console.log("image", id, data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createWorkspace(
    payload: Partial<Workspace>
  ): Promise<{ data: Workspace | null; error: unknown }> {
    try {
      const { data } = await this.create(payload);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateWorkspace(
    id: string,
    c: Partial<Workspace>
  ): Promise<{ data: Workspace | null; error: unknown }> {
    try {
      const { data } = await this.updateById(id, c);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteWorkspace(
    id: string
  ): Promise<{ data: unknown; error: unknown }> {
    try {
      const response = await this.deleteById(id);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default WorkspaceResource;
