"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/pagination";
import {
  authStore,
  adminTransactionApi,
  merchantPortalApi,
  transactionApi,
  type ApiCredentialHeaders,
  type Transaction,
  type TransactionStatus,
} from "@/lib/api";

const PAGE_SIZE = 5;

const statusStyleMap: Record<TransactionStatus, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-sky-100 text-sky-700 border-sky-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  FAILED: "bg-orange-100 text-orange-700 border-orange-200",
  CREATED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PARTIALLY_REFUNDED: "bg-violet-100 text-violet-700 border-violet-200",
  REFUNDED: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const statusLabelMap: Record<TransactionStatus, string> = {
  APPROVED: "Aprobada",
  PROCESSING: "En proceso",
  REJECTED: "Rechazada",
  FAILED: "Fallida",
  CREATED: "Creada",
  COMPLETED: "Completada",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  REFUNDED: "Reembolsada",
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function refundedOf(t: Transaction): number {
  return t.refundedAmount ?? 0;
}

function netAmount(t: Transaction): number {
  return t.amount - refundedOf(t);
}

function isApproved(t: Transaction): boolean {
  if (t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED") return false;
  return (
    t.status === "APPROVED" ||
    t.status === "COMPLETED" ||
    t.result === "APPROVED"
  );
}

function isRefunded(t: Transaction): boolean {
  return t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED";
}

function isRejectedOrFailed(t: Transaction): boolean {
  return (
    t.status === "REJECTED" ||
    t.status === "FAILED" ||
    t.result === "REJECTED"
  );
}

interface CreateForm extends ApiCredentialHeaders {
  amount: number;
}

const emptyCreds: CreateForm = {
  publicId: "",
  secret: "",
  merchantId: "",
  amount: 0,
};

export default function TransactionsPage() {
  const isMerchant = authStore.isMerchant();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({
    ...emptyCreds,
    merchantId: authStore.getMerchantId() ?? "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [searchId, setSearchId] = useState("");
  const [searchCreds, setSearchCreds] = useState<ApiCredentialHeaders>({
    publicId: "",
    secret: "",
    merchantId: authStore.getMerchantId() ?? "",
  });
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Transaction | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [opTxId, setOpTxId] = useState("");
  const [opCreds, setOpCreds] = useState<ApiCredentialHeaders>({
    publicId: "",
    secret: "",
    merchantId: authStore.getMerchantId() ?? "",
  });
  const [completeResult, setCompleteResult] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [authCode, setAuthCode] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [opLoading, setOpLoading] = useState(false);
  const [opMessage, setOpMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function reloadList() {
    if (isMerchant) {
      const items = await merchantPortalApi.getTransactions();
      setTransactions(items);
    } else {
      const items = await adminTransactionApi.list();
      setTransactions(items);
    }
  }

  useEffect(() => {
    if (isMerchant) {
      merchantPortalApi
        .getTransactions()
        .then(setTransactions)
        .catch(() => {})
        .finally(() => setLoadingList(false));
    } else {
      adminTransactionApi
        .list()
        .then(setTransactions)
        .catch(() => {})
        .finally(() => setLoadingList(false));
    }
  }, [isMerchant]);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await transactionApi.create({
        publicId: createForm.publicId.trim(),
        secret: createForm.secret.trim(),
        merchantId: createForm.merchantId.trim(),
        amount: createForm.amount,
      });
      setTransactions((prev) => [created, ...prev]);
      setCreateForm({
        ...emptyCreds,
        merchantId: authStore.getMerchantId() ?? createForm.merchantId,
      });
      setShowCreate(false);
      setPage(1);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear transacción");
    } finally {
      setCreating(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await transactionApi.getById(searchId.trim(), {
        publicId: searchCreds.publicId.trim(),
        secret: searchCreds.secret.trim(),
        merchantId: searchCreds.merchantId.trim(),
      });
      setSearchResult(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Transacción no encontrada");
    } finally {
      setSearching(false);
    }
  }

  function field<K extends keyof CreateForm>(key: K, value: CreateForm[K]) {
    setCreateForm((f) => ({ ...f, [key]: value }));
  }

  function opCredentials(): ApiCredentialHeaders {
    return {
      publicId: opCreds.publicId.trim(),
      secret: opCreds.secret.trim(),
      merchantId: opCreds.merchantId.trim(),
    };
  }

  async function runOperation(action: () => Promise<Transaction>) {
    setOpLoading(true);
    setOpMessage(null);
    try {
      await action();
      await reloadList();
      setOpMessage({ type: "ok", text: "Operación realizada correctamente." });
    } catch (err) {
      setOpMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Error en la operación",
      });
    } finally {
      setOpLoading(false);
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    await runOperation(() =>
      transactionApi.complete(opTxId.trim(), opCredentials(), {
        result: completeResult,
        authorizationCode: authCode || undefined,
        rejectionReason: rejectionReason || undefined,
      })
    );
  }

  async function handleRefundFull(e: React.FormEvent) {
    e.preventDefault();
    await runOperation(() =>
      transactionApi.refundFull(opTxId.trim(), opCredentials(), refundReason)
    );
  }

  async function handleRefundPartial(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(partialAmount);
    if (!amount || amount <= 0) {
      setOpMessage({ type: "err", text: "Ingresa un monto válido para reembolso parcial." });
      return;
    }
    await runOperation(() =>
      transactionApi.refundPartial(opTxId.trim(), opCredentials(), amount, refundReason)
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
        <p className="text-amber-100 text-sm mt-1">
          {isMerchant
            ? "Historial de pagos de tu comercio."
            : "Crea y consulta transacciones con las credenciales API del comercio."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            {transactions.filter(isApproved).length} Aprobadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700">
            {transactions.filter(isRefunded).length} Reembolsadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700">
            {transactions.filter((t) => t.status === "PROCESSING").length} En proceso
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
            {transactions.filter(isRejectedOrFailed).length} Rechazadas/Fallidas
          </span>
        </div>
        {!isMerchant && (
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              setShowCreate((f) => !f);
              setCreateError(null);
            }}
          >
            {showCreate ? "Cancelar" : "+ Nueva transacción"}
          </Button>
        )}
      </div>

      {showCreate && !isMerchant && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-800">Crear nueva transacción</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              El backend valida credenciales en headers antes de procesar la solicitud.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-4">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Credenciales API
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="txPublicId">Public ID (Public Key)</Label>
                    <Input
                      id="txPublicId"
                      value={createForm.publicId}
                      onChange={(e) => field("publicId", e.target.value)}
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="txSecret">Secret Key</Label>
                    <Input
                      id="txSecret"
                      type="password"
                      value={createForm.secret}
                      onChange={(e) => field("secret", e.target.value)}
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="txMerchantId">Merchant ID</Label>
                    <Input
                      id="txMerchantId"
                      value={createForm.merchantId}
                      onChange={(e) => field("merchantId", e.target.value)}
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txAmount">Monto (COP)</Label>
                <Input
                  id="txAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={createForm.amount || ""}
                  onChange={(e) => field("amount", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              {createError && (
                <div className="sm:col-span-2 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                  {createError}
                </div>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {creating ? "Creando…" : "Crear transacción"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isMerchant && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-700">Buscar por ID</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              GET /api/v1/transactions/{"{id}"} también requiere credenciales en headers.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="searchId">ID de transacción</Label>
                  <Input
                    id="searchId"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchPublicId">Public ID (Public Key)</Label>
                  <Input
                    id="searchPublicId"
                    value={searchCreds.publicId}
                    onChange={(e) =>
                      setSearchCreds((c) => ({ ...c, publicId: e.target.value }))
                    }
                    required
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchSecret">Secret Key</Label>
                  <Input
                    id="searchSecret"
                    type="password"
                    value={searchCreds.secret}
                    onChange={(e) =>
                      setSearchCreds((c) => ({ ...c, secret: e.target.value }))
                    }
                    required
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchMerchantId">Merchant ID</Label>
                  <Input
                    id="searchMerchantId"
                    value={searchCreds.merchantId}
                    onChange={(e) =>
                      setSearchCreds((c) => ({ ...c, merchantId: e.target.value }))
                    }
                    required
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <Button type="submit" disabled={searching} variant="outline">
                {searching ? "Buscando…" : "Buscar"}
              </Button>
            </form>
            {searchError && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {searchError}
              </div>
            )}
            {searchResult && (
              <div className="mt-3 rounded-md bg-slate-50 border border-slate-200 px-4 py-3 text-sm space-y-1">
                <p>
                  <span className="font-medium text-slate-600">ID:</span>{" "}
                  <span className="font-mono text-xs">{searchResult.id}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-600">Comerciante:</span>{" "}
                  {searchResult.merchantId}
                </p>
                <p>
                  <span className="font-medium text-slate-600">Monto:</span>{" "}
                  {formatCOP(searchResult.amount)}
                </p>
                <p>
                  <span className="font-medium text-slate-600">Estado: </span>
                  <Badge variant="outline" className={statusStyleMap[searchResult.status]}>
                    {statusLabelMap[searchResult.status]}
                  </Badge>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isMerchant && (
      <Card className="border-violet-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-violet-900">
            Operaciones API — HU012 / HU016 / HU017
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Completar pago (sandbox), reembolso total o parcial. Requiere credenciales en headers.
            Flujo demo: crear → completar como APPROVED → reembolsar.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>ID transacción</Label>
              <Input
                value={opTxId}
                onChange={(e) => setOpTxId(e.target.value)}
                placeholder="UUID"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Public ID (Public Key)</Label>
              <Input
                value={opCreds.publicId}
                onChange={(e) => setOpCreds((c) => ({ ...c, publicId: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input
                type="password"
                value={opCreds.secret}
                onChange={(e) => setOpCreds((c) => ({ ...c, secret: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Merchant ID</Label>
              <Input
                value={opCreds.merchantId}
                onChange={(e) => setOpCreds((c) => ({ ...c, merchantId: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <form onSubmit={handleComplete} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-emerald-800">HU012 — Completar pago</p>
              <select
                value={completeResult}
                onChange={(e) => setCompleteResult(e.target.value as "APPROVED" | "REJECTED")}
                className="flex h-9 w-full rounded-md border px-3 text-sm"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <Input
                placeholder="Código autorización (opcional)"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
              <Input
                placeholder="Motivo rechazo (opcional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={opLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Completar
              </Button>
            </form>

            <form onSubmit={handleRefundFull} className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-800">HU016 — Reembolso total</p>
              <Input
                placeholder="Motivo (opcional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={opLoading} variant="outline" className="w-full">
                Reembolso total
              </Button>
            </form>

            <form onSubmit={handleRefundPartial} className="rounded-lg border border-violet-200 bg-violet-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-violet-800">HU017 — Reembolso parcial</p>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Monto a reembolsar"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
              />
              <Input
                placeholder="Motivo (opcional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={opLoading} variant="outline" className="w-full">
                Reembolso parcial
              </Button>
            </form>
          </div>

          {opMessage && (
            <div
              className={`rounded-md px-4 py-2 text-sm ${
                opMessage.type === "ok"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {opMessage.text}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Historial de transacciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          {transactions.length === 0 && !loadingList ? (
            <p className="text-center text-slate-400 text-sm py-12">
              {isMerchant
                ? "No hay transacciones registradas para tu comercio."
                : "No hay transacciones en esta sesión. Crea una con credenciales API."}
            </p>
          ) : loadingList ? (
            <p className="text-center text-slate-400 text-sm py-12">Cargando…</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-600">ID</TableHead>
                      <TableHead className="font-semibold text-slate-600">Comerciante</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Monto cobrado</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Reembolsado</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Monto neto</TableHead>
                      <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((t) => {
                      const refunded = refundedOf(t);
                      const net = netAmount(t);
                      return (
                      <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">{t.id}</TableCell>
                        <TableCell className="text-slate-600">{t.merchantId}</TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCOP(t.amount)}
                        </TableCell>
                        <TableCell className="text-right text-indigo-700">
                          {refunded > 0 ? formatCOP(refunded) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-800">
                          {formatCOP(net)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyleMap[t.status]}>
                            {statusLabelMap[t.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
