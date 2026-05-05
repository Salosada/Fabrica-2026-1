// All API calls go through the Next.js proxy at /backend/* → backend server
// next.config.ts rewrites /backend/:path* → BACKEND_URL/:path*  (server-side, no CORS)
const BASE_URL = "/backend";

// ─── Token storage (client-side only) ─────────────────────────────────────────

const TOKEN_KEY = "appstripe_jwt";

export const tokenStore = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: number;
}

export interface LoginResponse {
  token: string;
  role: string;
  merchantId: string | null;
}

export interface ActivateAccountRequest {
  invitationToken: string;
  newPassword: string;
}

export interface RegisterMerchantRequest {
  businessName: string;
  businessId: string;
  email: string;
  businessType: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  businessId: string;
  email: string;
  businessType: string;
  status: "INACTIVE" | "VERIFIED" | "SUSPENDED";
}

export interface CredentialItem {
  publicId: string;
  merchantId: string;
  active: boolean;
}

export interface CredentialResponse {
  publicId: string;
  secret: string;
}

export interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  status: "CREATED" | "PROCESSING" | "APPROVED" | "REJECTED" | "FAILED";
}

export interface CreateTransactionRequest {
  merchantId: string;
  amount: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (body: LoginRequest) =>
    request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  activateMerchant: (body: ActivateAccountRequest) =>
    request<LoginResponse>("/api/v1/auth/merchant/activate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Admin — Merchants (/api/v1/admin/merchants) ──────────────────────────────

export const merchantApi = {
  list: () =>
    request<Merchant[]>("/api/v1/admin/merchants", {}, true),
  create: (data: RegisterMerchantRequest) =>
    request<Merchant>("/api/v1/admin/merchants", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),
};

// ─── Admin — Credentials (/api/v1/admin/credentials) ─────────────────────────

export const credentialApi = {
  list: () =>
    request<CredentialItem[]>("/api/v1/admin/credentials", {}, true),
  generate: (merchantId: string) =>
    request<CredentialResponse>("/api/v1/admin/credentials/generate", {
      method: "POST",
      body: JSON.stringify({ merchantId }),
    }, true),
  revoke: (publicId: string) =>
    request<CredentialItem>(`/api/v1/admin/credentials/${publicId}/revoke`, {
      method: "PATCH",
    }, true),
};

// ─── Transactions (/api/v1/transactions) ──────────────────────────────────────

export const transactionApi = {
  list: () =>
    request<Transaction[]>("/api/v1/transactions"),
  create: (data: CreateTransactionRequest) =>
    request<Transaction>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (id: string) =>
    request<Transaction>(`/api/v1/transactions/${id}`),
};
