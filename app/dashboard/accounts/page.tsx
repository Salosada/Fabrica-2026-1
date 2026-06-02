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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accountApi, type AccountStatus } from "@/lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    accountApi
      .list()
      .then(setAccounts)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

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
  const active = accounts.filter((a) => a.accountActivated);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Cuentas</h1>
        <p className="text-violet-200 text-sm mt-1">
          Usuarios de la plataforma y tokens de activación pendientes.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          {active.length} Activadas
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
          {pending.length} Pendientes
        </span>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-5 text-sm text-blue-900">
          Los comercios pendientes deben activar su cuenta en{" "}
          <a href="/activate" className="font-semibold underline">
            /activate
          </a>{" "}
          con el token de invitación.
        </CardContent>
      </Card>

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
            <p className="text-center text-slate-400 text-sm py-12">No hay usuarios.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>ID Comercio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Token invitación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => (
                    <TableRow key={acc.email}>
                      <TableCell>{acc.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {acc.role === "ROLE_ADMIN" ? "Admin" : "Comercio"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {acc.merchantId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            acc.accountActivated
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {acc.accountActivated ? "Activa" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {acc.invitationToken ? (
                          <button
                            type="button"
                            onClick={() => copyToken(acc.invitationToken!)}
                            className="font-mono text-xs text-slate-600 hover:text-violet-700"
                          >
                            {copiedToken === acc.invitationToken
                              ? "Copiado ✓"
                              : `${acc.invitationToken.slice(0, 8)}…`}
                          </button>
                        ) : (
                          "—"
                        )}
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
