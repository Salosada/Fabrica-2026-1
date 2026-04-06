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
import type { Merchant } from "@/lib/api";

const PAGE_SIZE = 5;

const mockMerchants: Merchant[] = [
  { id: "1", businessName: "Tech Solutions S.A.S",   businessId: "900.123.456-7", email: "contacto@techsolutions.co",  status: "VERIFIED"  },
  { id: "2", businessName: "Retail Corp Ltda",        businessId: "800.987.654-3", email: "admin@retailcorp.co",        status: "INACTIVE"  },
  { id: "3", businessName: "Market Plus",             businessId: "700.555.111-2", email: "info@marketplus.co",         status: "SUSPENDED" },
  { id: "4", businessName: "Digital Pay S.A.",        businessId: "830.246.802-5", email: "ops@digitalpay.co",          status: "VERIFIED"  },
  { id: "5", businessName: "FastCommerce Ltda",       businessId: "860.112.933-1", email: "ceo@fastcommerce.co",        status: "VERIFIED"  },
  { id: "6", businessName: "Green Store S.A.S",       businessId: "901.778.220-9", email: "ventas@greenstore.co",       status: "INACTIVE"  },
  { id: "7", businessName: "Nexo Pagos Colombia",     businessId: "890.445.667-3", email: "soporte@nexopagos.co",       status: "VERIFIED"  },
  { id: "8", businessName: "Tienda Central S.A.",     businessId: "820.331.509-6", email: "contacto@tiendacentral.co", status: "SUSPENDED" },
];

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

export default function MerchantsPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(mockMerchants.length / PAGE_SIZE);
  const paged = mockMerchants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Comerciantes</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Gestión de comerciantes registrados en la plataforma.
          <span className="ml-2 bg-white/15 rounded px-1.5 py-0.5 text-xs font-medium">
            Datos de muestra — endpoint en desarrollo
          </span>
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {mockMerchants.filter(m => m.status === "VERIFIED").length} Verificados
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {mockMerchants.filter(m => m.status === "INACTIVE").length} Inactivos
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {mockMerchants.filter(m => m.status === "SUSPENDED").length} Suspendidos
        </span>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Listado de comerciantes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-600">Razón social</TableHead>
                  <TableHead className="font-semibold text-slate-600">NIT / ID</TableHead>
                  <TableHead className="font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50 transition-colors">
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
        </CardContent>
      </Card>
    </div>
  );
}
