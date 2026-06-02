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
      if (res.merchantId) {
        localStorage.setItem("appstripe_merchant_id", res.merchantId);
      } else {
        localStorage.removeItem("appstripe_merchant_id");
      }
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

export interface RegisterMerchantResponse extends Merchant {
  invitationToken?: string;
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

export type TransactionStatus =
  | "CREATED"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "COMPLETED";

export interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  status: TransactionStatus;
  result?: string | null;
  refundedAmount?: number;
  availableForRefund?: number;
}

export interface ApiCredentialHeaders {
  publicId: string;
  secret: string;
  merchantId: string;
}

export interface CreateTransactionWithCreds extends ApiCredentialHeaders {
  amount: number;
}

export interface PaginatedTransactions {
  content: Transaction[];
  page: number;
  size: number;
  totalElements: number;
}

export interface AccountStatus {
  email: string;
  role: string;
  merchantId: string | null;
  accountActivated: boolean;
  invitationToken: string | null;
}

interface ApiErrorBody {
  message?: string;
  errorCode?: string;
  details?: string[];
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function parseApiError(text: string, status: number): string {
  try {
    const body = JSON.parse(text) as ApiErrorBody;
    if (body.message) return body.message;
    if (body.details?.length) return body.details.join(". ");
    if (body.errorCode) return body.errorCode;
  } catch {
    /* plain text */
  }
  return text || `HTTP ${status}`;
}

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
    throw new Error(parseApiError(text, res.status));
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

function credentialHeaders(creds: ApiCredentialHeaders): Record<string, string> {
  return {
    "X-Public-Id": creds.publicId,
    "X-Secret": creds.secret,
    "X-Merchant-Id": creds.merchantId,
  };
}

export function normalizeTransaction(raw: Transaction): Transaction {
  return {
    ...raw,
    amount: typeof raw.amount === "number" ? raw.amount : Number(raw.amount),
    refundedAmount:
      raw.refundedAmount != null ? Number(raw.refundedAmount) : undefined,
    availableForRefund:
      raw.availableForRefund != null ? Number(raw.availableForRefund) : undefined,
  };
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

// ─── Admin — Merchants ────────────────────────────────────────────────────────

export const merchantApi = {
  list: () => request<Merchant[]>("/api/v1/admin/merchants", {}, true),
  create: (data: RegisterMerchantRequest) =>
    request<RegisterMerchantResponse>(
      "/api/v1/admin/merchants",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
};

// ─── Admin — Credentials ──────────────────────────────────────────────────────

export const credentialApi = {
  list: () => request<CredentialItem[]>("/api/v1/admin/credentials", {}, true),
  generate: (merchantId: string) =>
    request<CredentialResponse>(
      "/api/v1/admin/credentials/generate",
      { method: "POST", body: JSON.stringify({ merchantId }) },
      true
    ),
  revoke: (publicId: string) =>
    request<CredentialItem>(
      `/api/v1/admin/credentials/${publicId}/revoke`,
      { method: "PATCH" },
      true
    ),
};

// ─── Admin — Transactions ─────────────────────────────────────────────────────

export const adminTransactionApi = {
  list: () =>
    request<Transaction[]>("/api/v1/admin/transactions", {}, true).then((items) =>
      items.map(normalizeTransaction)
    ),
};

// ─── Admin — Accounts ─────────────────────────────────────────────────────────

export const accountApi = {
  list: () => request<AccountStatus[]>("/api/v1/admin/accounts", {}, true),
};

// ─── Transactions (API credentials) ───────────────────────────────────────────

export interface CompleteTransactionRequest {
  result: "APPROVED" | "REJECTED";
  authorizationCode?: string;
  rejectionReason?: string;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

export interface PaymentStatusDistribution {
  from: string;
  to: string;
  totalFinalized: number;
  approvalRate: number;
  distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface TransactionVolumeReport {
  from: string;
  to: string;
  groupBy: string;
  items: {
    period: string;
    transactionCount: number;
    totalAmount: number;
    approvedCount: number;
    rejectedCount: number;
    failedCount: number;
  }[];
}

export const transactionApi = {
  create: ({ publicId, secret, merchantId, amount }: CreateTransactionWithCreds) =>
    request<Transaction>(
      "/api/v1/transactions",
      {
        method: "POST",
        body: JSON.stringify({ merchantId, amount }),
        headers: credentialHeaders({ publicId, secret, merchantId }),
      }
    ).then(normalizeTransaction),

  getById: (id: string, creds: ApiCredentialHeaders) =>
    request<Transaction>(`/api/v1/transactions/${id}`, {
      headers: credentialHeaders(creds),
    }).then(normalizeTransaction),

  complete: (
    id: string,
    creds: ApiCredentialHeaders,
    body: CompleteTransactionRequest
  ) =>
    request<Transaction>(`/api/v1/transactions/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: credentialHeaders(creds),
    }).then(normalizeTransaction),

  refundFull: (id: string, creds: ApiCredentialHeaders, reason?: string) =>
    request<Transaction>(`/api/v1/transactions/${id}/refund-full`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "" }),
      headers: credentialHeaders(creds),
    }).then(normalizeTransaction),

  refundPartial: (
    id: string,
    creds: ApiCredentialHeaders,
    amount: number,
    reason?: string
  ) =>
    request<Transaction>(`/api/v1/transactions/${id}/refund-partial`, {
      method: "POST",
      body: JSON.stringify({ amount, reason: reason ?? "" }),
      headers: credentialHeaders(creds),
    }).then(normalizeTransaction),
};

// ─── Merchant Portal ──────────────────────────────────────────────────────────

export const merchantPortalApi = {
  getProfile: () =>
    request<MerchantProfileResponse>("/api/v1/merchant-portal/profile", {}, true),

  updateProfile: (data: UpdateProfileRequest) =>
    request<MerchantProfileResponse>(
      "/api/v1/merchant-portal/update-profile",
      { method: "PUT", body: JSON.stringify(data) },
      true
    ),

  getCredentials: () =>
    request<CredentialItem[]>("/api/v1/merchant-portal/credentials", {}, true),

  getTransactions: () =>
    request<Transaction[]>("/api/v1/merchant-portal/transactions", {}, true).then(
      (items) => items.map(normalizeTransaction)
    ),

  getPaymentStatusDistribution: (from: string, to: string) =>
    request<PaymentStatusDistribution>(
      `/api/v1/merchant-portal/dashboard/payment-status-distribution?from=${from}&to=${to}`,
      {},
      true
    ).then((data) => ({
      ...data,
      approvalRate: Number(data.approvalRate),
      distribution: data.distribution.map((d) => ({
        ...d,
        percentage: Number(d.percentage),
      })),
    })),

  getTransactionVolumeReport: (from: string, to: string, groupBy = "DAY") =>
    request<TransactionVolumeReport>(
      `/api/v1/merchant-portal/reports/transaction-volume?from=${from}&to=${to}&groupBy=${groupBy}`,
      {},
      true
    ).then((data) => ({
      ...data,
      items: data.items.map((item) => ({
        ...item,
        totalAmount: Number(item.totalAmount),
      })),
    })),
};
