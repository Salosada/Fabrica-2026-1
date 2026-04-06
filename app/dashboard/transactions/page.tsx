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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/pagination";
import type { Transaction } from "@/lib/api";

const PAGE_SIZE = 5;

const mockTransactions: Transaction[] = [
  { id: "tx-001", merchantId: "1", amount: 150000,  status: "APPROVED"   },
  { id: "tx-002", merchantId: "1", amount: 75500,   status: "PROCESSING" },
  { id: "tx-003", merchantId: "2", amount: 320000,  status: "REJECTED"   },
  { id: "tx-004", merchantId: "3", amount: 10000,   status: "CREATED"    },
  { id: "tx-005", merchantId: "2", amount: 50000,   status: "FAILED"     },
  { id: "tx-006", merchantId: "4", amount: 890000,  status: "APPROVED"   },
  { id: "tx-007", merchantId: "1", amount: 230000,  status: "APPROVED"   },
  { id: "tx-008", merchantId: "5", amount: 45000,   status: "PROCESSING" },
  { id: "tx-009", merchantId: "3", amount: 670000,  status: "REJECTED"   },
  { id: "tx-010", merchantId: "4", amount: 120000,  status: "CREATED"    },
];

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
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(mockTransactions.length / PAGE_SIZE);
  const paged = mockTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
        <p className="text-amber-100 text-sm mt-1">
          Historial de transacciones procesadas por la plataforma.
          <span className="ml-2 bg-white/15 rounded px-1.5 py-0.5 text-xs font-medium">
            Datos de muestra — endpoint en desarrollo
          </span>
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {mockTransactions.filter(t => t.status === "APPROVED").length} Aprobadas
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          {mockTransactions.filter(t => t.status === "PROCESSING").length} En proceso
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {mockTransactions.filter(t => t.status === "REJECTED" || t.status === "FAILED").length} Rechazadas/Fallidas
        </span>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Listado de transacciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
