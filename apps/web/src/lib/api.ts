import type { ApiResponse } from '@taskflow/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'REQUEST_FAILED',
          message: 'Erro na requisição',
        },
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Erro de conexão',
      },
    };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (name: string, email: string, password: string) =>
    apiClient('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    }),

  me: (token: string) =>
    apiClient('/api/auth/me', { token }),
};

// Tasks API
export const tasksApi = {
  list: (token: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return apiClient(`/api/tasks?${params}`, { token });
  },

  today: (token: string) =>
    apiClient('/api/tasks/today', { token }),

  upcoming: (token: string) =>
    apiClient('/api/tasks/upcoming', { token }),

  create: (token: string, data: unknown) =>
    apiClient('/api/tasks', { method: 'POST', body: data, token }),

  update: (token: string, id: string, data: unknown) =>
    apiClient(`/api/tasks/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: string) =>
    apiClient(`/api/tasks/${id}`, { method: 'DELETE', token }),
};

// Projects API
export const projectsApi = {
  list: (token: string) =>
    apiClient('/api/projects', { token }),

  get: (token: string, id: string) =>
    apiClient(`/api/projects/${id}`, { token }),

  create: (token: string, data: unknown) =>
    apiClient('/api/projects', { method: 'POST', body: data, token }),

  update: (token: string, id: string, data: unknown) =>
    apiClient(`/api/projects/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: string) =>
    apiClient(`/api/projects/${id}`, { method: 'DELETE', token }),
};

// Labels API
export const labelsApi = {
  list: (token: string) =>
    apiClient('/api/labels', { token }),

  create: (token: string, data: unknown) =>
    apiClient('/api/labels', { method: 'POST', body: data, token }),

  update: (token: string, id: string, data: unknown) =>
    apiClient(`/api/labels/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: string) =>
    apiClient(`/api/labels/${id}`, { method: 'DELETE', token }),
};
