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

const PAGE_SIZE = 3;

const mockTransactions: Transaction[] = [
  { id: "tx-001", merchantId: "1", amount: 150000, status: "APPROVED" },
  { id: "tx-002", merchantId: "1", amount: 75500, status: "PROCESSING" },
  { id: "tx-003", merchantId: "2", amount: 320000, status: "REJECTED" },
  { id: "tx-004", merchantId: "3", amount: 10000, status: "CREATED" },
  { id: "tx-005", merchantId: "2", amount: 50000, status: "FAILED" },
];

const statusVariantMap: Record<
  Transaction["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  APPROVED: "default",
  PROCESSING: "secondary",
  REJECTED: "destructive",
  FAILED: "destructive",
  CREATED: "outline",
};

const statusLabelMap: Record<Transaction["status"], string> = {
  APPROVED: "Aprobada",
  PROCESSING: "En proceso",
  REJECTED: "Rechazada",
  FAILED: "Fallida",
  CREATED: "Creada",
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transacciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historial de transacciones procesadas por la plataforma.
          <span className="ml-2 text-amber-500 font-medium">
            [Datos de muestra — endpoint en desarrollo]
          </span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado de transacciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Comerciante</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.merchantId}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCOP(t.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[t.status]}>
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
