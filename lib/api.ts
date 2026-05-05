// All API calls go through the Next.js proxy at /backend/* → backend server
// next.config.ts rewrites /backend/:path* → BACKEND_URL/:path*  (server-side, no CORS)
const BASE_URL = "/backend";

// ─── Auth storage (client-side only) ──────────────────────────────────────────

const safe = (fn: () => void) => {
  if (typeof window !== "undefined") fn();
};

export const authStore = {
  getToken: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("appstripe_jwt") : null,
  getRole: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("appstripe_role") : null,
  getMerchantId: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("appstripe_merchant_id") : null,
  save: (res: { token: string; role: string; merchantId?: string | null }) => {
    safe(() => {
      localStorage.setItem("appstripe_jwt", res.token);
      localStorage.setItem("appstripe_role", res.role);
      if (res.merchantId) localStorage.setItem("appstripe_merchant_id", res.merchantId);
    });
  },
  clear: () => {
    safe(() => {
      localStorage.removeItem("appstripe_jwt");
      localStorage.removeItem("appstripe_role");
      localStorage.removeItem("appstripe_merchant_id");
    });
  },
  isAdmin: (): boolean =>
    typeof window !== "undefined" &&
    (localStorage.getItem("appstripe_role") ?? "").includes("ADMIN"),
  isMerchant: (): boolean =>
    typeof window !== "undefined" &&
    (localStorage.getItem("appstripe_role") ?? "").includes("MERCHANT"),
};

// Legacy alias for backward compat
export const tokenStore = {
  get: authStore.getToken,
  set: (token: string) => safe(() => localStorage.setItem("appstripe_jwt", token)),
  clear: authStore.clear,
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

export interface MerchantProfileResponse {
  id: string;
  businessName: string;
  businessId: string;
  email: string;
  businessType: string;
  status: "INACTIVE" | "VERIFIED" | "SUSPENDED";
  permission: string;
}

export interface UpdateProfileRequest {
  businessName: string;
  email: string;
  businessType: string;
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

export interface CreateTransactionWithCreds extends CreateTransactionRequest {
  publicId: string;
  secretKey: string;
}

export interface AccountStatus {
  email: string;
  role: string;
  merchantId: string | null;
  accountActivated: boolean;
  invitationToken: string | null;
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
    const token = authStore.getToken();
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
    request<Transaction[]>("/api/v1/transactions", {}, true),
  create: ({ publicId, secretKey, ...body }: CreateTransactionWithCreds) =>
    request<Transaction>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "X-Public-Id": publicId,
        "X-Api-Secret": secretKey,
      },
    }),
  getById: (id: string) =>
    request<Transaction>(`/api/v1/transactions/${id}`, {}, true),
};

// ─── Admin — Accounts (/api/v1/admin/accounts) ───────────────────────────────

export const accountApi = {
  list: () =>
    request<AccountStatus[]>("/api/v1/admin/accounts", {}, true),
  activate: (merchantId: string, newPassword: string) =>
    request<{ token: string; role: string; merchantId: string | null }>(
      `/api/v1/admin/accounts/${merchantId}/activate`,
      { method: "POST", body: JSON.stringify({ newPassword }) },
      true
    ),
};

// ─── Merchant Portal (/api/v1/merchant-portal) — solo ROLE_MERCHANT ───────────

export const merchantPortalApi = {
  getProfile: () =>
    request<MerchantProfileResponse>("/api/v1/merchant-portal/profile", {}, true),

  updateProfile: (data: UpdateProfileRequest) =>
    request<MerchantProfileResponse>("/api/v1/merchant-portal/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),

  getCredentials: () =>
    request<CredentialItem[]>("/api/v1/merchant-portal/credentials", {}, true),

  getTransactions: () =>
    request<Transaction[]>("/api/v1/merchant-portal/transactions", {}, true),
};
