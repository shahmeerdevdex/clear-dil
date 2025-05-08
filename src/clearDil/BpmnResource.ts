/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseResource from "./BaseResource";
import { BPMN } from "./types";

type ApiResponse = BPMN | BPMN[] | { error: string };
export class BpmnResource extends BaseResource<BPMN, ApiResponse> {
  static generateId(): string {
    return [...Array(24)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  async getBpmns(
    workspaceId: string
  ): Promise<{ data: BPMN[] | null; error: unknown }> {
    try {
      const { data } = await this.getAll(
        `${this.endpoint}/${workspaceId}/bpmns`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createBpmns(
    payload: any,
    workspaceId: string
  ): Promise<{ data: BPMN | null; error: unknown }> {
    try {
      const { data } = await this.create(
        payload,
        `${this.endpoint}/${workspaceId}/bpmns`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getBpmn(
    id: string,
    workspaceId: string
  ): Promise<{ data: BPMN | null; error: unknown }> {
    try {
      const { data } = await this.getById(
        id,
        `${this.endpoint}/${workspaceId}/bpmns`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getBPMNDownload(
    id: string,
    workspaceId: string
  ): Promise<{ data: string | null; error: unknown }> {
    try {
      const { data } = await this.getDownload(
        id,
        `${this.endpoint}/${workspaceId}/bpmns`
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default BpmnResource;
