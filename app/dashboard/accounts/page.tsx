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
import { accountApi, type AccountStatus } from "@/lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activate modal state
  const [activating, setActivating] = useState<AccountStatus | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null);

  // Copy token feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  function loadAccounts() {
    setLoading(true);
    accountApi
      .list()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!activating?.merchantId) return;
    setActivateLoading(true);
    setActivateError(null);
    setActivateSuccess(null);
    try {
      await accountApi.activate(activating.merchantId, newPassword);
      setActivateSuccess(
        `Cuenta de ${activating.email} activada. Ya puede iniciar sesión.`
      );
      setNewPassword("");
      setActivating(null);
      loadAccounts();
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : "Error al activar");
    } finally {
      setActivateLoading(false);
    }
  }

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      /* ignore */
    }
  }

  const pending = accounts.filter((a) => !a.accountActivated);
  const active  = accounts.filter((a) => a.accountActivated);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Cuentas</h1>
        <p className="text-violet-200 text-sm mt-1">
          Activa cuentas pendientes y gestiona usuarios de la plataforma.
        </p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {active.length} Activadas
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {pending.length} Pendientes de activación
        </span>
      </div>

      {activateSuccess && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {activateSuccess}
        </div>
      )}

      {/* Pending accounts */}
      {pending.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3 border-b border-amber-100">
            <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Cuentas pendientes de activación
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              El comercio aún no ha establecido su contraseña. Puedes activarla
              directamente o compartir el token de invitación.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50 hover:bg-amber-50">
                    <TableHead className="font-semibold text-slate-600">Email</TableHead>
                    <TableHead className="font-semibold text-slate-600">ID Comercio</TableHead>
                    <TableHead className="font-semibold text-slate-600">Token de invitación</TableHead>
                    <TableHead className="font-semibold text-slate-600">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((acc) => (
                    <TableRow key={acc.email} className="hover:bg-amber-50/50">
                      <TableCell className="text-slate-700">{acc.email}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {acc.merchantId ?? "—"}
                      </TableCell>
                      <TableCell>
                        {acc.invitationToken ? (
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 max-w-[180px] truncate">
                              {acc.invitationToken}
                            </code>
                            <button
                              onClick={() => copyToken(acc.invitationToken!)}
                              className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Copiar token"
                            >
                              {copiedToken === acc.invitationToken ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                          onClick={() => {
                            setActivating(acc);
                            setNewPassword("");
                            setActivateError(null);
                          }}
                          disabled={!acc.merchantId}
                        >
                          Activar cuenta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activate modal */}
      {activating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Activar cuenta</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Establece una contraseña para <strong>{activating.email}</strong>
              </p>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleActivate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                {activateError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                    {activateError}
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActivating(null)}
                    disabled={activateLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={activateLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {activateLoading ? "Activando…" : "Confirmar activación"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All accounts table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Todos los usuarios</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          {loading ? (
            <p className="text-center text-slate-400 text-sm py-12">Cargando…</p>
          ) : error ? (
            <p className="text-center text-red-400 text-sm py-12">{error}</p>
          ) : accounts.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">
              No hay usuarios registrados aún.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-600">Email</TableHead>
                    <TableHead className="font-semibold text-slate-600">Rol</TableHead>
                    <TableHead className="font-semibold text-slate-600">ID Comercio</TableHead>
                    <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => (
                    <TableRow key={acc.email} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-slate-700">{acc.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            acc.role === "ROLE_ADMIN"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-violet-50 text-violet-700 border-violet-200"
                          }
                        >
                          {acc.role === "ROLE_ADMIN" ? "Admin" : "Comercio"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {acc.merchantId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            acc.accountActivated
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {acc.accountActivated ? "Activa" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
