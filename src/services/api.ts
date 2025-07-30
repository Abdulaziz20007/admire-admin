import { toast } from "sonner";
import axios, { AxiosError, AxiosRequestConfig, AxiosHeaders } from "axios";
import { useAuthStore } from "@/stores/authStore";

// Define base types
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

interface ErrorWithMessage {
  message: string | { message?: string };
}

// Get token from storage
const getToken = (): string | null => useAuthStore.getState().token;

// Set token in storage
const setToken = (token: string): void => {
  useAuthStore.getState().setToken(token);
};

// Clear access token from Zustand
const clearToken = (): void => {
  useAuthStore.getState().clearToken();
};

// Remove every local credential (token in store, local/session storage, helper cookie)
const clearAllCredentials = (): void => {
  clearToken();
  if (typeof document !== "undefined") {
    document.cookie = "access_token=; path=/; max-age=0";
  }
  try {
    localStorage.removeItem("access_token");
  } catch {}
  try {
    sessionStorage.removeItem("access_token");
  } catch {}
};

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

// ---------------------------------------------
// Axios instance
// ---------------------------------------------
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach Authorization header from store
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // Create headers object if it doesn't exist
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    // Set Authorization header
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Handle 401 responses globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const refreshed = await refreshToken();
      if (refreshed) {
        const token = getToken();
        if (token && originalRequest.headers) {
          // Use set method for AxiosHeaders
          (originalRequest.headers as AxiosHeaders).set(
            "Authorization",
            `Bearer ${token}`
          );
        }
        return axiosInstance(originalRequest);
      }

      clearAllCredentials();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

//** helper to convert axios error to ApiResponse **//
const handleAxiosError = (error: unknown): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    let message = "An error occurred";
    const data = error.response?.data as ErrorWithMessage | undefined;
    if (data?.message) {
      message =
        typeof data.message === "string"
          ? data.message
          : data.message.message || message;
    }
    return { status, error: message };
  }
  return { status: 0, error: "Network error. Please check your connection." };
};

// Extended AxiosRequestConfig to include body
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  body?: unknown;
}

/**
 * Axios wrapper with token handling and error management
 */
async function fetchWithAuth<T>(
  endpoint: string,
  options: Partial<ExtendedAxiosRequestConfig> = {}
): Promise<ApiResponse<T>> {
  try {
    const isStringBody = Boolean(
      options.body && typeof options.body === "string"
    );

    const response = await axiosInstance.request({
      url: endpoint,
      method: options.method || "GET",
      data: options.body ?? options.data,
      headers: {
        ...(isStringBody ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      params: options.params,
    });

    return { status: response.status, data: response.data as T };
  } catch (error) {
    return handleAxiosError(error) as ApiResponse<T>;
  }
}

/**
 * Handle form data submission with files
 */
async function fetchWithFormData<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST"
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.request({
      url: endpoint,
      method,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { status: response.status, data: response.data as T };
  } catch (error) {
    return handleAxiosError(error) as ApiResponse<T>;
  }
}

/**
 * Refresh access token using refresh token cookie
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );

    if (response.status === 201 && response.data?.access_token) {
      setToken(response.data.access_token);
      // Also store token in cookie for middleware to read (non-HttpOnly)
      if (typeof window !== "undefined") {
        // Expires in 7 days (adjust as needed)
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${maxAge}`;
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Authentication API
const authApi = {
  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      if (![200, 201].includes(response.status)) {
        return { status: response.status, error: "Login failed" };
      }

      const data = response.data;

      if (data.access_token) {
        setToken(data.access_token);
        // Also store token in cookie for middleware to read (non-HttpOnly)
        if (typeof window !== "undefined") {
          // Expires in 7 days (adjust as needed)
          const maxAge = 7 * 24 * 60 * 60;
          document.cookie = `access_token=${data.access_token}; path=/; max-age=${maxAge}`;
        }
      }

      return { status: response.status, data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAllCredentials();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// Admin API
const adminApi = {
  /**
   * Create a new admin
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/admin", formData);
  },

  /**
   * Get all admins
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/admin");
  },

  /**
   * Get admin by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/${id}`);
  },

  /**
   * Update an admin
   */
  update: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResponse> => {
    return fetchWithFormData(`/admin/${id}`, formData, "PATCH");
  },

  /**
   * Change admin password
   */
  changePassword: async (data: {
    admin_id: number;
    old_password: string;
    new_password: string;
  }): Promise<ApiResponse> => {
    return fetchWithAuth("/admin/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an admin
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/${id}`, { method: "DELETE" });
  },
};

// Icons API
const iconApi = {
  /**
   * Create a new icon
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/icon", formData);
  },

  /**
   * Get all icons
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/icon");
  },

  /**
   * Get icon by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/icon/${id}`);
  },

  /**
   * Update an icon
   */
  update: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResponse> => {
    return fetchWithFormData(`/icon/${id}`, formData, "PATCH");
  },

  /**
   * Delete an icon
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/icon/${id}`, { method: "DELETE" });
  },
};

// Media API
const mediaApi = {
  /**
   * Create a new media
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/media", formData);
  },

  /**
   * Get all media
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/media");
  },

  /**
   * Get media by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/media/${id}`);
  },

  /**
   * Update a media
   */
  update: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResponse> => {
    return fetchWithFormData(`/media/${id}`, formData, "PATCH");
  },

  /**
   * Delete a media
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/media/${id}`, { method: "DELETE" });
  },
};

interface MessageUpdateData {
  checked?: boolean;
  [key: string]: unknown;
}

// Messages API
const messageApi = {
  /**
   * Get all messages
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/message");
  },

  /**
   * Get message by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/message/${id}`);
  },

  /**
   * Update a message (mark as checked, etc)
   */
  update: async (
    id: number | string,
    data: MessageUpdateData
  ): Promise<ApiResponse> => {
    return fetchWithAuth(`/message/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a message
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/message/${id}`, { method: "DELETE" });
  },
};

// Phone API
const phoneApi = {
  /**
   * Create a new phone
   */
  create: async (data: { phone: string }): Promise<ApiResponse> => {
    return fetchWithAuth("/phone", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all phones
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/phone");
  },

  /**
   * Get phone by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/phone/${id}`);
  },

  /**
   * Update a phone
   */
  update: async (
    id: number | string,
    data: { phone: string }
  ): Promise<ApiResponse> => {
    return fetchWithAuth(`/phone/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a phone
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/phone/${id}`, { method: "DELETE" });
  },
};

// Social API
const socialApi = {
  /**
   * Create a new social
   */
  create: async (data: {
    name: string;
    url: string;
    icon_id: number;
  }): Promise<ApiResponse> => {
    return fetchWithAuth("/social", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all socials
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/social");
  },

  /**
   * Get social by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/social/${id}`);
  },

  /**
   * Update a social
   */
  update: async (
    id: number | string,
    data: { name?: string; url?: string; icon_id?: number }
  ): Promise<ApiResponse> => {
    return fetchWithAuth(`/social/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a social
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/social/${id}`, { method: "DELETE" });
  },
};

// Student API
const studentApi = {
  /**
   * Create a new student
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/student", formData);
  },

  /**
   * Get all students
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/student");
  },

  /**
   * Get student by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/student/${id}`);
  },

  /**
   * Update a student
   */
  update: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResponse> => {
    return fetchWithFormData(`/student/${id}`, formData, "PATCH");
  },

  /**
   * Delete a student
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/student/${id}`, { method: "DELETE" });
  },
};

// Teacher API
const teacherApi = {
  /**
   * Create a new teacher
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/teacher", formData);
  },

  /**
   * Get all teachers
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/teacher");
  },

  /**
   * Get teacher by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/teacher/${id}`);
  },

  /**
   * Update a teacher
   */
  update: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResponse> => {
    return fetchWithFormData(`/teacher/${id}`, formData, "PATCH");
  },

  /**
   * Delete a teacher
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/teacher/${id}`, { method: "DELETE" });
  },
};

interface WebUpdateData {
  [key: string]: unknown;
}

// Web API
const webApi = {
  /**
   * Create new web record
   */
  create: async (formData: FormData): Promise<ApiResponse> => {
    return fetchWithFormData("/web", formData);
  },

  /**
   * Get all web records
   */
  getAll: async (): Promise<ApiResponse> => {
    return fetchWithAuth("/web");
  },

  /**
   * Get web by ID
   */
  getById: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/web/${id}`);
  },

  /**
   * Update a web record
   */
  update: async (
    id: number | string,
    data: WebUpdateData | FormData
  ): Promise<ApiResponse> => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      return fetchWithFormData(`/web/${id}`, data, "PATCH");
    }
    return fetchWithAuth(`/web/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Activate a web version (deactivates all others)
   */
  setActive: async (id: number | string): Promise<ApiResponse> => {
    return fetchWithAuth(`/web/active/${id}`, { method: "POST" });
  },
};

// Export all API services
export const api = {
  auth: authApi,
  admin: adminApi,
  icon: iconApi,
  media: mediaApi,
  message: messageApi,
  phone: phoneApi,
  social: socialApi,
  student: studentApi,
  teacher: teacherApi,
  web: webApi,
};

// Helper for handling API errors consistently
export const handleApiError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  )
    return error.error;
  return "An unexpected error occurred";
};

// Toast wrapper for API responses
export const toastApiResponse = (
  response: ApiResponse,
  successMessage: string
): boolean => {
  if (response.error) {
    toast.error(response.error);
    return false;
  }

  toast.success(successMessage);
  return true;
};
