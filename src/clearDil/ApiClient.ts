/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL, OAUTH_PATH } from "./config";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { TokenResponse, UserInfoProfile } from "./types";
import { cookies } from "next/headers";

// Type for handling the API responses
interface ApiResponse<T> {
  data: T;
  error?: string;
}

const USERINFO_PATH = "/oauth2/userinfo"; // User info endpoint

class ApiClient {
  private readonly client: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  public userInfo: UserInfoProfile | null = null;

  constructor(baseURL: string, clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.client = axios.create({
      baseURL,
    });

    this.initializeResponseInterceptor();
  }

  // Set Basic Authentication Header for OAuth2 token retrieval
  private getBasicAuthHeader(): string {
    return `Basic ${Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64")}`;
  }

  // Helper to set token cookies
  private setTokenCookies(token: TokenResponse): void {
    const cookieStore = cookies();
    // Set access token cookie
    cookieStore.set("access_token", token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: token.expires_in, // Match token expiration
      path: "/",
    });
    // Set refresh token cookie
    cookieStore.set("refresh_token", token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: token.refresh_expires_in, // Match refresh token expiration
      path: "/",
    });
    // Optionally store expiry timestamp (not sensitive, can be non-HttpOnly if needed)
    cookieStore.set(
      "token_expiry",
      (Date.now() + token.expires_in * 1000).toString(),
      {
        httpOnly: false, // Accessible by client if needed
        secure: true,
        sameSite: "strict",
        maxAge: token.expires_in,
        path: "/",
      }
    );
    if (token.user_id) {
      cookieStore.set("user_id", token.user_id, {
        httpOnly: false, // Accessible by client if needed
        secure: true,
        sameSite: "strict",
        maxAge: token.expires_in,
        path: "/",
      });
    }
  }

  // Helper to get tokens from cookies
  private getTokensFromCookies(): {
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiry: number | null;
  } {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token")?.value || null;
    const refreshToken = cookieStore.get("refresh_token")?.value || null;
    const tokenExpiry = cookieStore.get("token_expiry")?.value
      ? parseInt(cookieStore.get("token_expiry")!.value, 10)
      : null;
    return { accessToken, refreshToken, tokenExpiry };
  }

  // Fetch a new access token
  async fetchToken(
    user: {
      username: string;
      password: string;
    },
    returnToken?: boolean
  ): Promise<ApiResponse<string | TokenResponse | null>> {
    try {
      const response = await axios.post<TokenResponse>(
        `${API_URL}${OAUTH_PATH}`,
        `grant_type=password&username=${encodeURIComponent(
          user?.username || ""
        )}&password=${encodeURIComponent(user?.password || "")}`,
        {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = response.data.access_token;
      const userInfoResponse = await axios.get(`${API_URL}${USERINFO_PATH}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      this.userInfo = userInfoResponse.data;
      if (!returnToken) {
        // Store tokens in cookies
        this.setTokenCookies({
          ...response.data,
          user_id: userInfoResponse.data.id,
        });

        return { data: "success" };
      }
      return { data: response.data };
    } catch (error: any) {
      console.error("Failed to fetch access token:", error);
      return { data: null as any, error: error?.message };
    }
  }

  // Refresh the access token using the refresh token
  private async refreshToken(): Promise<void> {
    const { refreshToken } = this.getTokensFromCookies();
    if (!refreshToken) {
      throw new Error("No Refresh Token Found");
    }

    try {
      const response = await axios.post<TokenResponse>(
        `${API_URL}${OAUTH_PATH}`,
        `grant_type=refresh_token&refresh_token=${refreshToken}`,
        {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Update tokens in cookies
      this.setTokenCookies(response.data);
    } catch (error: any) {
      console.error("Failed to refresh token:", error);
      throw error;
    }
  }

  // Ensure a valid access token is available
  async ensureToken(): Promise<void> {
    const { accessToken, tokenExpiry } = this.getTokensFromCookies();
    if (!accessToken || !tokenExpiry) {
      throw Error("No Token Found");
    }
    if (Date.now() >= tokenExpiry) {
      await this.refreshToken();
    }
  }

  // Initialize Response Interceptor for Retry Logic
  private initializeResponseInterceptor() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn("401 Unauthorized: Retrying with refreshed token...");
          await this.refreshToken();
          const originalRequest = error.config as AxiosRequestConfig;

          const { accessToken } = this.getTokensFromCookies();
          if (accessToken) {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`,
            };
          }

          return this.client.request(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  // Clear tokens on logout
  handleLogout() {
    const cookieStore = cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("token_expiry");
    cookieStore.delete("user_id");
    this.userInfo = null;
  }

  // GET Request
  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    await this.ensureToken();
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<T> = await this.client.get<T>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }

  async get_download<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    await this.ensureToken();
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<T> = await this.client.get<T>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
        responseType: "arraybuffer",
      });

      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }

  // POST Request
  async post<T, U>(
    url: string,
    data: T,
    config: AxiosRequestConfig
  ): Promise<ApiResponse<U>> {
    await this.ensureToken();
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<U> = await this.client.post<U>(url, data, {
        ...config,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }

  // PUT Request
  async put<T, U>(
    url: string,
    data: T,
    config: AxiosRequestConfig,
    access_token?: string
  ): Promise<ApiResponse<U>> {
    if (!access_token) {
      await this.ensureToken();
    }
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<U> = await this.client.put<U>(url, data, {
        ...config,
        headers: {
          Authorization: `Bearer ${access_token ?? accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }

  // PATCH Request
  async patch<T, U>(url: string, data: T): Promise<ApiResponse<U>> {
    await this.ensureToken();
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<U> = await this.client.patch<U>(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }

  // DELETE Request
  async delete<T>(
    url: string,
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    await this.ensureToken();
    const { accessToken } = this.getTokensFromCookies();

    try {
      const response: AxiosResponse<T> = await this.client.delete<T>(url, {
        ...config,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: error?.message };
    }
  }
}

export default ApiClient;
