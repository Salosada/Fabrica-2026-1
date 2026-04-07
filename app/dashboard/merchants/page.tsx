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
import { merchantApi, type Merchant, type RegisterMerchantRequest } from "@/lib/api";

const PAGE_SIZE = 5;

const statusStyleMap: Record<Merchant["status"], string> = {
  VERIFIED:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE:  "bg-amber-100  text-amber-700  border-amber-200",
  SUSPENDED: "bg-red-100    text-red-700    border-red-200",
};

const statusLabelMap: Record<Merchant["status"], string> = {
  VERIFIED:  "Verificado",
  INACTIVE:  "Inactivo",
  SUSPENDED: "Suspendido",
};

const emptyForm: RegisterMerchantRequest = {
  businessName: "",
  businessId: "",
  email: "",
  businessType: "",
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    try {
      const saved = sessionStorage.getItem("merchants");
      return saved ? (JSON.parse(saved) as Merchant[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem("merchants", JSON.stringify(merchants));
  }, [merchants]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RegisterMerchantRequest>(emptyForm);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.ceil(merchants.length / PAGE_SIZE);
  const paged = merchants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function field(key: keyof RegisterMerchantRequest, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await merchantApi.create(form);
      setMerchants((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      setPage(1);
      setSuccessMsg(`Comerciante "${created.businessName}" registrado correctamente. ID: ${created.id}`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar comerciante");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Comerciantes</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Gestión de comerciantes registrados en la plataforma.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-300 px-4 py-3 text-sm text-emerald-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-emerald-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary chips + action */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {merchants.filter((m) => m.status === "VERIFIED").length} Verificados
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {merchants.filter((m) => m.status === "INACTIVE").length} Inactivos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {merchants.filter((m) => m.status === "SUSPENDED").length} Suspendidos
          </span>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => { setShowForm((f) => !f); setError(null); }}
        >
          {showForm ? "Cancelar" : "+ Registrar comerciante"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-emerald-800">Registrar nuevo comerciante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Razón social</Label>
                <Input
                  id="businessName"
                  placeholder="Empresa S.A.S"
                  value={form.businessName}
                  onChange={(e) => field("businessName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessId">NIT / ID</Label>
                <Input
                  id="businessId"
                  placeholder="900.123.456-7"
                  value={form.businessId}
                  onChange={(e) => field("businessId", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@empresa.co"
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de negocio</Label>
                <Input
                  id="businessType"
                  placeholder="RETAIL, ECOMMERCE, SERVICES…"
                  value={form.businessType}
                  onChange={(e) => field("businessType", e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="sm:col-span-2 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? "Registrando…" : "Registrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Listado de comerciantes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          {merchants.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">
              No hay comerciantes registrados aún. Usa el botón para registrar uno.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-600">ID Interno</TableHead>
                      <TableHead className="font-semibold text-slate-600">Razón social</TableHead>
                      <TableHead className="font-semibold text-slate-600">NIT / ID</TableHead>
                      <TableHead className="font-semibold text-slate-600">Email</TableHead>
                      <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((m) => (
                      <TableRow key={m.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-400">{m.id.slice(0, 8)}…</span>
                            <button
                              type="button"
                              title="Copiar ID"
                              onClick={() => {
                                navigator.clipboard.writeText(m.id);
                                setCopiedId(m.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="rounded p-0.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              {copiedId === m.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{m.businessName}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{m.businessId}</TableCell>
                        <TableCell className="text-slate-600">{m.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyleMap[m.status]}>
                            {statusLabelMap[m.status]}
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
