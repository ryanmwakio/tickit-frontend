import { logger } from "./logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Log API URL in development for debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
  validationErrors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedApiResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
  requestId?: string;
}

export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      if (data.tokens) {
        this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        return true;
      }
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { responseType?: "json" | "blob" } = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { responseType, ...fetchOptions } = options;
    const headers: HeadersInit = {
      ...(responseType !== "blob" && { "Content-Type": "application/json" }),
      ...fetchOptions.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        console.log("📤 API Request:", fetchOptions.method || "GET", url);
      }
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (error: any) {
      // Network error or CORS issue
      const errorMessage = error.message || "Failed to connect to server";
      const detailedMessage =
        errorMessage.includes("fetch") || errorMessage.includes("Failed")
          ? `Cannot connect to backend at ${this.baseURL}. 

🔧 Start the backend server:
cd tickit-backend && npm run start:dev

Then verify it's running on http://localhost:5000/api/v1`
          : `Network error: ${errorMessage}`;

      // Log error to file
      logger.error(
        "API Network Error",
        JSON.stringify(
          {
            url,
            method: options.method || "GET",
            message: detailedMessage,
            error: errorMessage,
          },
          null,
          2,
        ),
        "API_NETWORK_ERROR",
      );

      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        console.error("❌ API Request Failed:", detailedMessage);
        console.error("Request URL:", url);
      }

      throw {
        message: detailedMessage,
        statusCode: 0,
        error: "NETWORK_ERROR",
      } as ApiError;
    }

    // If unauthorized and we have a refresh token, try to refresh
    if (
      response.status === 401 &&
      this.refreshToken &&
      responseType !== "blob"
    ) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed && this.accessToken) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    }

    // Handle blob responses (e.g., PDF downloads)
    if (responseType === "blob") {
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          success: false,
          message: "Failed to download file",
          statusCode: response.status,
        }));
        throw errorData;
      }
      return response.blob() as Promise<T>;
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        message: "An error occurred",
        statusCode: response.status,
      }));

      // Don't log expected 401 errors for auth check endpoints
      // These are normal when users are not logged in
      const isExpected401 =
        response.status === 401 &&
        (endpoint === "/users/me" || endpoint.includes("/users/me"));

      // Don't log expected 404 errors for event endpoints
      // These are normal when events don't exist and will trigger notFound()
      const isExpected404 =
        response.status === 404 &&
        (endpoint.includes("/events/") || url.includes("/events/"));

      if (!isExpected401 && !isExpected404) {
        // Log API error to file
        logger.error(
          "API Error Response",
          JSON.stringify(
            {
              url,
              method: options.method || "GET",
              status: response.status,
              error: errorData,
            },
            null,
            2,
          ),
          "API_ERROR",
        );
      }

      throw errorData;
    }

    const responseData = await response.json();

    // Handle standardized response format
    // If response has success: true and data field, extract data
    // For paginated responses, preserve pagination info
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData
    ) {
      if (responseData.success === true) {
        // If it's a paginated response, return both data and pagination
        if ("pagination" in responseData && responseData.data !== undefined) {
          return {
            data: responseData.data,
            total: responseData.pagination.total,
            page: responseData.pagination.page,
            limit: responseData.pagination.limit,
            totalPages: responseData.pagination.totalPages,
          } as T;
        }
        // Otherwise, just return the data
        return responseData.data !== undefined
          ? responseData.data
          : responseData;
      } else {
        // Error response
        throw responseData as ApiError;
      }
    }

    return responseData;
  }

  async get<T>(
    endpoint: string,
    params?: any,
    options?: RequestInit & { responseType?: "json" | "blob" },
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += (endpoint.includes("?") ? "&" : "?") + queryString;
      }
    }
    return this.request<T>(url, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & { responseType?: "json" | "blob" },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & { responseType?: "json" | "blob" },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & { responseType?: "json" | "blob" },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit & { responseType?: "json" | "blob" },
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }
}

export const apiClient = new ApiClient();
