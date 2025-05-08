import BaseResource from "./BaseResource";
import { Activity, Attachment, Case, Comment } from "./types";

enum ActivityIDEnums {
  StartEvent = "StartEvent",
  Examine = "examine",
  Review = "review",
  EndEvent = "EndEvent",
}

export const MOCK_CASE_DATA = {
  content: [
    {
      title: "Pep Customer on boarding",
      summary: "This user is coming from a non-cooperative jurisdiction",
      auto_generated: false,
      created_at: "2025-02-02T15:21:20Z",
      updated_at: "2025-02-02T15:21:21Z",
      case_type: "PEP_MATCH",
      priority: "MEDIUM",
      status: "INITIATED",
      bpmn: {
        title: "Example bpmn",
        version: "1.0",
        created_by: "276abb53-5b20-4197-8591-dd79e039217d",
        created_at: "2025-02-02T15:20:39Z",
        links: [],
        id: "0254e750-d967-43f9-87ef-1f21e4c8247b",
      },
      links: [
        {
          rel: "self",
          href: "http://dev.cleardil.com:80/cases/e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4",
        },
        {
          rel: "allActiveTasks",
          href: "http://dev.cleardil.com:80/cases/e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4/examine",
        },
      ],
      id: "e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4",
      concerned_customer_ids: ["b38ce6d5-2236-4608-85cf-c7f59de4b02e"],
      concerned_transaction_ids: [],
    },
    {
      title: "Misterious user onboarding",
      summary: "This user is coming from a non-cooperative jurisdiction",
      auto_generated: false,
      created_at: "2025-02-02T19:38:06Z",
      updated_at: "2025-02-02T19:38:17Z",
      case_type: "SUSPICIOUS_CUSTOMER",
      priority: "MEDIUM",
      status: "CLOSED",
      request_close: true,
      approval_required: true,
      close: true,
      bpmn: {
        title: "Example bpmn",
        description: "This is description of the test bpmn",
        version: "1.0",
        created_by: "3a68549e-ce39-43f5-b854-54812ef6b0b8",
        created_at: "2025-02-02T19:38:01Z",
        links: [],
        id: "6d4d3209-3db2-4c22-9568-90f23b7f9087",
      },
      links: [
        {
          rel: "self",
          href: "http://dev.cleardil.com:80/cases/1ad68fef-02e1-4082-9dbb-6fd94ff60fcf",
        },
      ],
      id: "1ad68fef-02e1-4082-9dbb-6fd94ff60fcf",
      concerned_customer_ids: ["customer_s1"],
      concerned_transaction_ids: [],
    },
    {
      title: "Pep Customer on boarding",
      summary: "This user is coming from a non-cooperative jurisdiction",
      auto_generated: false,
      created_at: "2025-02-14T14:10:18Z",
      updated_at: "2025-02-14T14:10:19Z",
      case_type: "PEP_MATCH",
      priority: "MEDIUM",
      status: "INITIATED",
      bpmn: {
        title: "Example bpmn",
        description: "This is description of the test bpmn",
        version: "1.0",
        created_by: "276abb53-5b20-4197-8591-dd79e039217d",
        created_at: "2025-02-14T14:10:10Z",
        links: [],
        id: "445b72c0-0c1d-4e67-b08f-7f4f06573598",
      },
      links: [
        {
          rel: "self",
          href: "http://dev.cleardil.com:80/cases/9d3990ac-8a4d-4fa8-98fa-e93edc1e36cf",
        },
        {
          rel: "allActiveTasks",
          href: "http://dev.cleardil.com:80/cases/9d3990ac-8a4d-4fa8-98fa-e93edc1e36cf/examine",
        },
      ],
      id: "9d3990ac-8a4d-4fa8-98fa-e93edc1e36cf",
      concerned_customer_ids: ["16b6739b-a385-437a-81e9-1170336e3cc7"],
      concerned_transaction_ids: [],
    },
    {
      title: "Pep Customer on boarding",
      summary: "This user is coming from a non-cooperative jurisdiction",
      auto_generated: false,
      created_at: "2025-02-02T19:21:28Z",
      updated_at: "2025-02-02T19:21:28Z",
      case_type: "PEP_MATCH",
      priority: "MEDIUM",
      status: "INITIATED",
      bpmn: {
        title: "Example bpmn",
        version: "1.0",
        created_by: "276abb53-5b20-4197-8591-dd79e039217d",
        created_at: "2025-02-02T19:21:21Z",
        links: [],
        id: "8a5b71c6-c95f-4eeb-9c3c-5eb5b1daa66e",
      },
      links: [
        {
          rel: "self",
          href: "http://dev.cleardil.com:80/cases/19fae5de-7543-4b63-b14c-b4c46c2bb730",
        },
        {
          rel: "allActiveTasks",
          href: "http://dev.cleardil.com:80/cases/19fae5de-7543-4b63-b14c-b4c46c2bb730/examine",
        },
      ],
      id: "19fae5de-7543-4b63-b14c-b4c46c2bb730",
      concerned_customer_ids: ["45f571e9-e002-47e2-bdd3-05822ed9376e"],
      concerned_transaction_ids: [],
    },
  ],
  total_pages: 1,
  last: true,
  total_elements: 4,
  first: true,
  number_of_elements: 4,
  size: 20,
  number: 0,
};

export const MOCK_CASE = {
  title: "Pep Customer on boarding",
  summary: "This user is coming from a non-cooperative jurisdiction",
  auto_generated: false,
  created_at: "2025-02-02T15:21:20Z",
  updated_at: "2025-02-02T15:21:21Z",
  case_type: "PEP_MATCH",
  priority: "MEDIUM",
  status: "INITIATED",
  bpmn: {
    title: "Example bpmn",
    version: "1.0",
    created_by: "276abb53-5b20-4197-8591-dd79e039217d",
    created_at: "2025-02-02T15:20:39Z",
    links: [],
    id: "0254e750-d967-43f9-87ef-1f21e4c8247b",
  },
  links: [
    {
      rel: "self",
      href: "http://dev.cleardil.com:80/cases/e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4",
    },
    {
      rel: "allActiveTasks",
      href: "http://dev.cleardil.com:80/cases/e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4/examine",
    },
  ],
  id: "e4ce9c2a-7eb1-4843-a0bf-a54c61ff22a4",
  concerned_customer_ids: ["b38ce6d5-2236-4608-85cf-c7f59de4b02e"],
  concerned_transaction_ids: [],
};

type ApiResponse = Case | Case[] | { error: string };
export class CasesResource extends BaseResource<unknown, ApiResponse> {
  static generateId(): string {
    return [...Array(24)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  mapActivityData(data: Activity[]) {
    const filteredData = data.filter((item) =>
      Object.values(ActivityIDEnums).includes(
        item.activity_id as ActivityIDEnums
      )
    );
    return filteredData;
  }

  async createCase(
    payload: Partial<Case>,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case | null; error: unknown }> {
    try {
      const { data } = await this.create(
        payload,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteCase(
    id: string,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: unknown; error: unknown }> {
    try {
      const response = await this.deleteById(
        id,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return response;
    } catch (error) {
      return { data: null, error };
    }
  }

  async examineCase(
    id: string,
    c: {
      assignee_id?: string;
      action: string;
      request_close?: boolean;
      resolution?: string;
    },
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case | null; error: unknown }> {
    try {
      const { data } = await this.examineById(
        id,
        c,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async reviewCase(
    id: string,
    c: {
      assignee_id?: string;
      action: string;
      close?: boolean;
      resolution?: string;
    },
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case | null; error: unknown }> {
    try {
      const { data } = await this.reviewById(
        id,
        c,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createCaseComment(
    id: string,
    c: { body: string },
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Comment | null; error: unknown }> {
    try {
      const { data } = await this.createComment(
        id,
        c,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async uploadCaseAttachment(
    id: string,
    c: {
      title: string;
      description: string;
      file: {
        filename?: string;
        content_type?: string;
        content?: string;
      };
    },
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Attachment | null; error: unknown }> {
    try {
      const { data } = await this.uploadAttachment(
        id,
        c,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCaseAttachments(
    id: string,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Attachment[] | null; error: unknown }> {
    try {
      const { data } = await this.getAttachments(
        id,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { error, data: null };
    }
  }

  async getCaseHistory(
    id: string,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Activity[] | null; error: unknown }> {
    try {
      const { data } = await this.getHistory(
        id,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );

      return { data: this.mapActivityData(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCaseComments(
    id: string,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: { content: Comment[] } | null; error: unknown }> {
    try {
      const { data } = await this.getComments(
        id,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateCase(
    id: string,
    c: Partial<Case>,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case | null; error: unknown }> {
    try {
      const caseData = {
        title: c.title,
        summary: c.summary,
        case_type: c.case_type ?? "PEP_MATCH",
        priority: c.priority ?? "MEDIUM",
        concerned_customer_ids: ["92daf3ab-a7e9-4939-96c7-d7b80482d1a4"],
        status: c.status,
      };

      const { data } = await this.updateById(
        id,
        caseData,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCase(
    id: string,
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case | null; error: unknown }> {
    try {
      const { data } = await this.getById(
        id,
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCases(
    workspaceId: string,
    projectId: string
  ): Promise<{ data: Case[] | null; error: unknown }> {
    try {
      const { data } = await this.getAll(
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases`
      );
      return { data: data.content, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default CasesResource;
