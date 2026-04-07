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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/pagination";
import { credentialApi, type CredentialResponse } from "@/lib/api";

const PAGE_SIZE = 4;

interface StoredCredential {
  publicId: string;
  merchantId: string;
  active: true;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<StoredCredential[]>(() => {
    try {
      const saved = sessionStorage.getItem("credentials");
      return saved ? (JSON.parse(saved) as StoredCredential[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem("credentials", JSON.stringify(credentials));
  }, [credentials]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<CredentialResponse | null>(null);

  const totalPages = Math.ceil(credentials.length / PAGE_SIZE);
  const paged = credentials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await credentialApi.generate(merchantId.trim());
      setCredentials((prev) => [
        { publicId: response.publicId, merchantId: merchantId.trim(), active: true },
        ...prev,
      ]);
      setNewSecret(response);
      setMerchantId("");
      setShowForm(false);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar credencial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Credenciales API</h1>
        <p className="text-violet-100 text-sm mt-1">
          Llaves de acceso generadas para los comerciantes verificados.
        </p>
      </div>

      {/* Summary chips + action */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {credentials.length} Activas
          </span>
        </div>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => { setShowForm((f) => !f); setError(null); }}
        >
          {showForm ? "Cancelar" : "+ Generar credencial"}
        </Button>
      </div>

      {/* One-time secret alert */}
      {newSecret && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-900">
              ⚠️ Guarda este secreto ahora — no se mostrará de nuevo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-xs font-medium text-amber-700">PUBLIC ID</span>
              <p className="font-mono text-sm text-amber-900 break-all">{newSecret.publicId}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-amber-700">SECRET KEY</span>
              <p className="font-mono text-sm text-amber-900 break-all bg-amber-100 rounded px-2 py-1.5 mt-1">
                {newSecret.secret}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-800 hover:bg-amber-100"
              onClick={() => setNewSecret(null)}
            >
              Confirmar que lo guardé
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generate form */}
      {showForm && (
        <Card className="border-violet-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-violet-800">Generar nueva credencial</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="merchantId">ID del comerciante</Label>
                <Input
                  id="merchantId"
                  placeholder="mch_..."
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {loading ? "Generando…" : "Generar"}
              </Button>
            </form>
            {error && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="border-violet-200 bg-violet-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-violet-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            ¿Cómo funciona?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-violet-800 text-sm">
            Cada comerciante en estado <strong>VERIFIED</strong> puede generar hasta{" "}
            <strong>3 credenciales activas</strong>. El{" "}
            <code className="bg-violet-100 px-1 rounded text-xs">secret</code>{" "}
            se muestra <strong>una sola vez</strong> al momento de la creación — almacénalo de forma segura.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Credenciales registradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          {credentials.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">
              No hay credenciales generadas aún. Usa el botón para generar una.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-600">Public ID</TableHead>
                      <TableHead className="font-semibold text-slate-600">Comerciante</TableHead>
                      <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((c) => (
                      <TableRow key={c.publicId} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">{c.publicId}</TableCell>
                        <TableCell className="text-slate-600">{c.merchantId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Activa
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
