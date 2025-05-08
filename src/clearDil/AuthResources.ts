import BaseResource from "./BaseResource";
import { TokenResponse, UserInfoProfile } from "./types";

type ApiResponse = unknown | unknown[] | { error: string };
export class AuthResources extends BaseResource<unknown, ApiResponse> {
  static generateId(): string {
    return [...Array(24)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  async login(
    user: {
      username: string;
      password: string;
    },
    returnToken?: boolean
  ): Promise<{ data: string | TokenResponse | null; error: unknown }> {
    try {
      const { data } = await this.client.fetchToken(user, returnToken);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  getUserInfo(): UserInfoProfile | null {
    const data = this.client.userInfo;
    if (!data) return null;

    return data;
  }
}

export default AuthResources;
