/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiClient from "./ApiClient";
import { API_URL, USERID, PASS } from "./config";

class BaseResource<T, U> {
  protected client: ApiClient;
  protected endpoint: string;

  // Optional: Add headers for authorization or other custom headers
  protected headers: Record<string, string>;

  constructor(path: string, headers: Record<string, string> = {}) {
    this.client = new ApiClient(API_URL, USERID, PASS);
    this.endpoint = `${API_URL}${path}`;
    this.headers = headers;
  }

  // Helper function to handle errors
  private handleError(message: string, error: any) {
    console.error(message, error); // Optionally log the error
    return { error: message };
  }

  // GET request: Fetch a single resource by ID
  async getById(id: number | string, url?: string): Promise<any> {
    try {
      // Perform the GET request
      const response = await this.client.get<U>(
        `${url ?? this.endpoint}/${id}`,
        {
          headers: this.headers,
        }
      );

      return response;
    } catch (error) {
      // Handle error and return it in an ApiResponse format
      return this.handleError(
        `GET request failed for ${this.endpoint}/${id}`,
        error
      );
    }
  }

  async getDownload(id: number | string, url?: string): Promise<any> {
    try {
      // Perform the GET request
      const response = await this.client.get<U>(
        `${url ?? this.endpoint}/${id}/download`,
        {
          headers: this.headers,
        }
      );

      return response;
    } catch (error) {
      // Handle error and return it in an ApiResponse format
      return this.handleError(
        `GET request failed for ${url ?? this.endpoint}/${id}/download`,
        error
      );
    }
  }

  // GET request: Fetch all resources with optional query parameters
  async getAll(url?: string): Promise<any> {
    try {
      const response = await this.client.get(`${url ?? this.endpoint}`, {
        headers: this.headers,
      });
      return response;
    } catch (error) {
      return this.handleError(
        `GET all request failed for ${url ?? this.endpoint}`,
        error
      );
    }
  }

  // POST request: Create a new resource
  async create(data: T, url?: string): Promise<any> {
    try {
      const response = await this.client.post<T, U>(
        `${url ?? this.endpoint}`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `POST request failed for ${url ?? this.endpoint}`,
        error
      );
    }
  }

  async reviewById(id: number | string, data: T, url?: string): Promise<any> {
    try {
      const response = await this.client.post<T, U>(
        `${url ?? this.endpoint}/${id}/review`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `POST request failed for ${url ?? this.endpoint}/${id}/review`,
        error
      );
    }
  }

  async examineById(id: number | string, data: T, url?: string): Promise<any> {
    try {
      const response = await this.client.post<T, U>(
        `${url ?? this.endpoint}/${id}/examine`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `POST request failed for ${url ?? this.endpoint}/${id}/examine`,
        error
      );
    }
  }

  async uploadAttachment(
    id: number | string,
    data: T,
    url?: string
  ): Promise<any> {
    try {
      const response = await this.client.post<T, U>(
        `${url ?? this.endpoint}/${id}/attachments`,
        data,
        {
          headers: { ...this.headers, "Content-Type": "multipart/form-data" },
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `POST request failed for ${url ?? this.endpoint}/${id}/attachments`,
        error
      );
    }
  }

  async getAttachments(id: number | string, url?: string): Promise<any> {
    try {
      const response = await this.client.get(
        `${url ?? this.endpoint}/${id}/attachments`,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${url ?? this.endpoint}/${id}/attachments`,
        error
      );
    }
  }

  async getRoles(id: number | string): Promise<any> {
    try {
      const response = await this.client.get(`${this.endpoint}/${id}/roles`, {
        headers: this.headers,
      });
      return response;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${this.endpoint}/${id}/roles`,
        error
      );
    }
  }

  async getAllRoles(): Promise<any> {
    try {
      const response = await this.client.get(`${this.endpoint}/roles`, {
        headers: this.headers,
      });
      return response;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${this.endpoint}/roles`,
        error
      );
    }
  }

  async updateRoles(id: number | string, data: T): Promise<any> {
    try {
      const response = await this.client.put<T, U>(
        `${this.endpoint}/${id}/roles`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `PUT request failed for ${this.endpoint}/${id}/roles`,
        error
      );
    }
  }

  async updatePassword(
    id: number | string,
    data: T,
    access_token?: string
  ): Promise<any> {
    try {
      const response = await this.client.put<T, U>(
        `${this.endpoint}/${id}/password`,
        data,
        {
          headers: this.headers,
        },
        access_token
      );
      return response;
    } catch (error) {
      return this.handleError(
        `PUT request failed for ${this.endpoint}/${id}/password`,
        error
      );
    }
  }

  async downloadAttachment(
    caseId: string,
    id: string,
    mimeType: string,
    workspaceId: string,
    projectId: string
  ): Promise<any> {
    try {
      const { data } = await this.client.get_download(
        `${this.endpoint}/${workspaceId}/projects/${projectId}/cases/${caseId}/attachments/${id}`,
        {
          headers: {
            ...this.headers,
            "Content-Type": mimeType,
            "Content-Disposition": "inline",
          },
        }
      );
      return data;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${this.endpoint}/${caseId}/attachments/${id}`,
        error
      );
    }
  }

  async getIcon(id: string, url?: string): Promise<any> {
    try {
      const { data } = await this.client.get_download(
        `${url ?? this.endpoint}/${id}/icon`,
        {
          headers: {
            ...this.headers,
          },
        }
      );
      return data;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${url ?? this.endpoint}/${id}/icon`,
        error
      );
    }
  }

  async createComment(
    id: number | string,
    data: T,
    url?: string
  ): Promise<any> {
    try {
      const response = await this.client.post<T, U>(
        `${url ?? this.endpoint}/${id}/comments`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `POST request failed for ${url ?? this.endpoint}/${id}/comments`,
        error
      );
    }
  }

  async getComments(id: number | string, url?: string): Promise<any> {
    try {
      const response = await this.client.get(
        `${url ?? this.endpoint}/${id}/comments`,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${url ?? this.endpoint}/${id}/comments`,
        error
      );
    }
  }

  async getHistory(id: number | string, url?: string): Promise<any> {
    try {
      const response = await this.client.get(
        `${url ?? this.endpoint}/${id}/history`,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `GET request failed for ${url ?? this.endpoint}/${id}/history`,
        error
      );
    }
  }

  // PUT request: Update an existing resource by ID
  async updateById(id: number | string, data: T, url?: string): Promise<any> {
    try {
      const response = await this.client.put<T, U>(
        `${url ?? this.endpoint}/${id}`,
        data,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `PUT request failed for ${url ?? this.endpoint}/${id}`,
        error
      );
    }
  }

  // DELETE request: Delete a resource by ID
  async deleteById(id: number | string, url?: string): Promise<any> {
    try {
      const response = await this.client.delete(
        `${url ?? this.endpoint}/${id}`,
        {
          headers: this.headers,
        }
      );
      return response;
    } catch (error) {
      return this.handleError(
        `DELETE request failed for ${url ?? this.endpoint}/${id}`,
        error
      );
    }
  }

  handleLogout(): void {
    this.client.handleLogout();
  }

  getUserInfo() {
    return this.client.userInfo;
  }
}

export default BaseResource;
