"use client";

import { useState } from "react";
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
import { transactionApi, type Transaction, type CreateTransactionRequest } from "@/lib/api";

const PAGE_SIZE = 5;

const statusStyleMap: Record<Transaction["status"], string> = {
  APPROVED:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-sky-100     text-sky-700     border-sky-200",
  REJECTED:   "bg-red-100     text-red-700     border-red-200",
  FAILED:     "bg-orange-100  text-orange-700  border-orange-200",
  CREATED:    "bg-slate-100   text-slate-600   border-slate-200",
};

const statusLabelMap: Record<Transaction["status"], string> = {
  APPROVED:   "Aprobada",
  PROCESSING: "En proceso",
  REJECTED:   "Rechazada",
  FAILED:     "Fallida",
  CREATED:    "Creada",
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTransactionRequest>({ merchantId: "", amount: 0 });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Search by ID
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Transaction | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await transactionApi.create(createForm);
      setTransactions((prev) => [created, ...prev]);
      setCreateForm({ merchantId: "", amount: 0 });
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
      const result = await transactionApi.getById(searchId.trim());
      setSearchResult(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Transacción no encontrada");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
        <p className="text-amber-100 text-sm mt-1">
          Historial de transacciones procesadas por la plataforma.
        </p>
      </div>

      {/* Summary chips + action */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {transactions.filter((t) => t.status === "APPROVED").length} Aprobadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            {transactions.filter((t) => t.status === "PROCESSING").length} En proceso
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {transactions.filter((t) => t.status === "REJECTED" || t.status === "FAILED").length} Rechazadas/Fallidas
          </span>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => { setShowCreate((f) => !f); setCreateError(null); }}
        >
          {showCreate ? "Cancelar" : "+ Nueva transacción"}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-800">Crear nueva transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="txMerchantId">ID del comerciante</Label>
                <Input
                  id="txMerchantId"
                  placeholder="mch_..."
                  value={createForm.merchantId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, merchantId: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txAmount">Monto (COP)</Label>
                <Input
                  id="txAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="150000"
                  value={createForm.amount || ""}
                  onChange={(e) => setCreateForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
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

      {/* Search by ID */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-700">Buscar por ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="searchId">ID de transacción</Label>
              <Input
                id="searchId"
                placeholder="UUID de la transacción"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                required
              />
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
              <p><span className="font-medium text-slate-600">ID:</span> <span className="font-mono text-xs">{searchResult.id}</span></p>
              <p><span className="font-medium text-slate-600">Comerciante:</span> {searchResult.merchantId}</p>
              <p><span className="font-medium text-slate-600">Monto:</span> {formatCOP(searchResult.amount)}</p>
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

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Transacciones creadas en esta sesión</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          {transactions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">
              No hay transacciones en esta sesión. Usa el botón para crear una.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-600">ID</TableHead>
                      <TableHead className="font-semibold text-slate-600">Comerciante</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Monto</TableHead>
                      <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">{t.id}</TableCell>
                        <TableCell className="text-slate-600">{t.merchantId}</TableCell>
                        <TableCell className="text-right font-semibold text-slate-800">
                          {formatCOP(t.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyleMap[t.status]}>
                            {statusLabelMap[t.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
