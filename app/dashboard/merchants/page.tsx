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

const PAGE_SIZE = 2;

// Datos de muestra para mostrar la UI hasta que el backend tenga el endpoint
const mockMerchants: Merchant[] = [
  {
    id: "1",
    businessName: "Tech Solutions S.A.S",
    businessId: "900.123.456-7",
    email: "contacto@techsolutions.co",
    status: "VERIFIED",
  },
  {
    id: "2",
    businessName: "Retail Corp Ltda",
    businessId: "800.987.654-3",
    email: "admin@retailcorp.co",
    status: "INACTIVE",
  },
  {
    id: "3",
    businessName: "Market Plus",
    businessId: "700.555.111-2",
    email: "info@marketplus.co",
    status: "SUSPENDED",
  },
];

const statusVariantMap: Record<
  Merchant["status"],
  "default" | "secondary" | "destructive"
> = {
  VERIFIED: "default",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
};

const statusLabelMap: Record<Merchant["status"], string> = {
  VERIFIED: "Verificado",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
};

export default function MerchantsPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(mockMerchants.length / PAGE_SIZE);
  const paged = mockMerchants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comerciantes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de comerciantes registrados en la plataforma.
          <span className="ml-2 text-amber-500 font-medium">
            [Datos de muestra — endpoint en desarrollo]
          </span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado de comerciantes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razón social</TableHead>
                  <TableHead>NIT / ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.businessName}</TableCell>
                    <TableCell>{m.businessId}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[m.status]}>
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
