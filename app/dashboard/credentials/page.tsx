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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/pagination";
import type { ApiCredential } from "@/lib/api";

const PAGE_SIZE = 4;

const mockCredentials: ApiCredential[] = [
  { id: "cred-001", publicId: "pk_live_4f8a91b3c2e7d605", merchantId: "1", active: true  },
  { id: "cred-002", publicId: "pk_live_7c3d2a5e1f908b46", merchantId: "1", active: false },
  { id: "cred-003", publicId: "pk_live_9e1b6f4c3d2a8075", merchantId: "2", active: true  },
  { id: "cred-004", publicId: "pk_live_2d7c5a8b1e3f4091", merchantId: "3", active: true  },
  { id: "cred-005", publicId: "pk_live_6b3e9d1a7f2c5084", merchantId: "4", active: false },
  { id: "cred-006", publicId: "pk_live_1a5f8d3c9e0b2476", merchantId: "5", active: true  },
];

export default function CredentialsPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(mockCredentials.length / PAGE_SIZE);
  const paged = mockCredentials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Credenciales API</h1>
        <p className="text-violet-100 text-sm mt-1">
          Llaves de acceso generadas para los comerciantes verificados.
          <span className="ml-2 bg-white/15 rounded px-1.5 py-0.5 text-xs font-medium">
            Datos de muestra — endpoint en desarrollo
          </span>
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {mockCredentials.filter(c => c.active).length} Activas
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {mockCredentials.filter(c => !c.active).length} Inactivas
        </span>
      </div>

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
            <strong>3 credenciales activas</strong>. El secreto{" "}
            <code className="bg-violet-100 px-1 rounded text-xs">plainSecret</code>{" "}
            se muestra <strong>una sola vez</strong> al momento de la creación — almacénalo de forma segura.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Credenciales registradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
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
                  <TableRow key={c.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{c.publicId}</TableCell>
                    <TableCell className="text-slate-600">{c.merchantId}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={c.active
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"}
                      >
                        {c.active ? "Activa" : "Inactiva"}
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
