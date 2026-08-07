import type {
  AuthResponse,
  CategoryNode,
  Deal,
  DealDetail,
  Page,
  PosterCard,
  StatsResponse,
  UserProfile,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const TOKEN_KEY = "dealhub_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token === null) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  signup: (data: {
    handle: string;
    email: string;
    password: string;
    displayName: string;
    isPoster: boolean;
  }) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (handleOrEmail: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ handleOrEmail, password }),
    }),

  categories: () => request<CategoryNode[]>("/categories"),

  feed: (params: {
    mode: "trending" | "following";
    category?: number;
    page?: number;
  }) => {
    const q = new URLSearchParams({ mode: params.mode });
    if (params.category) q.set("category", String(params.category));
    if (params.page) q.set("page", String(params.page));
    return request<Page<Deal>>(`/feed?${q}`);
  },

  search: (params: {
    q?: string;
    category?: number;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.category) q.set("category", String(params.category));
    if (params.minPrice) q.set("min_price", params.minPrice);
    if (params.maxPrice) q.set("max_price", params.maxPrice);
    if (params.sort) q.set("sort", params.sort);
    if (params.page) q.set("page", String(params.page));
    return request<Page<Deal>>(`/search?${q}`);
  },

  deal: (id: number) => request<DealDetail>(`/deals/${id}`),

  createDeal: (data: {
    title: string;
    description?: string;
    categoryId: number;
    price?: number;
    originalPrice?: number;
    imageUrl?: string;
    retailer: string;
    affiliateUrl: string;
    expiresAt?: string;
  }) =>
    request<Deal>("/deals", { method: "POST", body: JSON.stringify(data) }),

  user: (id: number) => request<UserProfile>(`/users/${id}`),

  posters: () => request<PosterCard[]>("/posters"),

  updateProfile: (data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }) =>
    request<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  userDeals: (id: number, page = 0) =>
    request<Page<Deal>>(`/users/${id}/deals?page=${page}`),

  follow: (id: number) =>
    request<void>(`/users/${id}/follow`, { method: "POST" }),

  unfollow: (id: number) =>
    request<void>(`/users/${id}/follow`, { method: "DELETE" }),

  saveDeal: (id: number) =>
    request<void>(`/deals/${id}/save`, { method: "POST" }),

  unsaveDeal: (id: number) =>
    request<void>(`/deals/${id}/save`, { method: "DELETE" }),

  stats: (id: number) => request<StatsResponse>(`/users/${id}/stats`),
};

/** The click-through URL — deal cards link here, never to the retailer. */
export function clickThroughUrl(dealId: number): string {
  return `${API_URL}/d/${dealId}`;
}
