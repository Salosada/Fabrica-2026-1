"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { merchantPortalApi, type PaymentStatusDistribution, type TransactionVolumeReport } from "@/lib/api";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

const statusReportLabels: Record<string, string> = {
  APPROVED: "Aprobadas (activas, incluye reembolso parcial)",
  REJECTED: "Rechazadas",
  FAILED: "Fallidas",
  REFUNDED: "Reembolsadas (total)",
};

export default function ReportsPage() {
  const [range, setRange] = useState(defaultRange);
  const [groupBy, setGroupBy] = useState<"DAY" | "MONTH">("DAY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<PaymentStatusDistribution | null>(null);
  const [volume, setVolume] = useState<TransactionVolumeReport | null>(null);

  async function loadReports(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [dist, vol] = await Promise.all([
        merchantPortalApi.getPaymentStatusDistribution(range.from, range.to),
        merchantPortalApi.getTransactionVolumeReport(range.from, range.to, groupBy),
      ]);
      setDistribution(dist);
      setVolume(vol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-indigo-100 text-sm mt-1">
          HU019 — Volumen de transacciones · HU020 — Distribución de pagos por estado
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={loadReports} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="from">Desde</Label>
              <Input
                id="from"
                type="date"
                value={range.from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Hasta</Label>
              <Input
                id="to"
                type="date"
                value={range.to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupBy">Agrupar volumen</Label>
              <select
                id="groupBy"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as "DAY" | "MONTH")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="DAY">Por día</option>
                <option value="MONTH">Por mes</option>
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Cargando…" : "Actualizar"}
            </Button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {distribution && (
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">HU020 — Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Pagos finalizados</p>
                <p className="text-2xl font-bold text-slate-800">{distribution.totalFinalized}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Tasa de aprobación</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatPct(distribution.approvalRate)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Pagos exitosos (activas + reembolso total)
                </p>
              </div>
            </div>
            {distribution.distribution.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos en el periodo seleccionado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distribution.distribution
                      .filter((row) => row.count > 0)
                      .map((row) => (
                      <TableRow key={row.status}>
                        <TableCell className="font-medium">
                          {statusReportLabels[row.status] ?? row.status}
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatPct(row.percentage)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {volume && (
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">HU019 — Volumen de transacciones</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {volume.items.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos en el periodo seleccionado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periodo</TableHead>
                      <TableHead className="text-right">Transacciones</TableHead>
                      <TableHead className="text-right">Monto neto</TableHead>
                      <TableHead className="text-right">Aprobadas</TableHead>
                      <TableHead className="text-right">Rechazadas</TableHead>
                      <TableHead className="text-right">Fallidas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volume.items.map((row) => (
                      <TableRow key={row.period}>
                        <TableCell className="font-mono text-xs">{row.period}</TableCell>
                        <TableCell className="text-right">{row.transactionCount}</TableCell>
                        <TableCell className="text-right">{formatCOP(row.totalAmount)}</TableCell>
                        <TableCell className="text-right text-emerald-700">{row.approvedCount}</TableCell>
                        <TableCell className="text-right text-red-700">{row.rejectedCount}</TableCell>
                        <TableCell className="text-right text-orange-700">{row.failedCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
