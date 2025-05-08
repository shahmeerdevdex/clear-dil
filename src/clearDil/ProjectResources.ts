import BaseResource from "./BaseResource";
import { Project } from "./types";

type ApiResponse = Project | Project[] | { error: string };
export class ProjectResource extends BaseResource<unknown, ApiResponse> {
  async getProjects(
    workspaceId: string
  ): Promise<{ data: Project[] | null; error: unknown }> {
    try {
      const { data } = await this.getAll(
        `${this.endpoint}/${workspaceId}/projects`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getProject(
    id: string,
    workspaceId: string
  ): Promise<{ data: Project | null; error: unknown }> {
    try {
      const { data } = await this.getById(
        id,
        `${this.endpoint}/${workspaceId}/projects`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getProjectIcon(
    id: string,
    workspaceId: string
  ): Promise<{ data: string | null; error: unknown }> {
    try {
      const data = await this.getIcon(
        id,
        `${this.endpoint}/${workspaceId}/projects`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createProject(
    payload: Partial<Project>,
    workspaceId: string
  ): Promise<{ data: Project | null; error: unknown }> {
    try {
      const { data } = await this.create(
        payload,
        `${this.endpoint}/${workspaceId}/projects`
      );
      console.log("NO ERRRO", data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateProject(
    id: string,
    c: Partial<Project>,
    workspaceId: string
  ): Promise<{ data: Project | null; error: unknown }> {
    try {
      const { data } = await this.updateById(
        id,
        c,
        `${this.endpoint}/${workspaceId}/projects`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteProject(
    id: string,
    workspaceId: string
  ): Promise<{ data: unknown; error: unknown }> {
    try {
      const response = await this.deleteById(
        id,
        `${this.endpoint}/${workspaceId}/projects`
      );
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default ProjectResource;
