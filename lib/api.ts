// All API calls go through the Next.js proxy at /backend/* → backend server
// This avoids CORS issues when frontend and backend are on different domains.
const BASE_URL = "/backend";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeRequest {
  username: string;
  code: number;
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
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Some endpoints return plain boolean / empty body
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

// ─── Security ─────────────────────────────────────────────────────────────────

export const authApi = {
  verify2fa: (body: CodeRequest) =>
    request<boolean>("/2fa/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Merchants ────────────────────────────────────────────────────────────────

export const merchantApi = {
  create: (data: RegisterMerchantRequest) =>
    request<Merchant>("/api/v1/merchants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Credentials ─────────────────────────────────────────────────────────────

export const credentialApi = {
  generate: (merchantId: string) =>
    request<CredentialResponse>("/api/v1/credentials/generate", {
      method: "POST",
      body: JSON.stringify({ merchantId }),
    }),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionApi = {
  create: (data: CreateTransactionRequest) =>
    request<Transaction>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (id: string) =>
    request<Transaction>(`/api/v1/transactions/${id}`),
};
