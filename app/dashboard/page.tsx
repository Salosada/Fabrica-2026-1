"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  authStore,
  merchantApi,
  credentialApi,
  adminTransactionApi,
  merchantPortalApi,
  type Transaction,
} from "@/lib/api";

interface Stats {
  merchants: number;
  transactions: number;
  totalAmount: number;
  credentials: number;
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function sumAmount(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const isMerchant = authStore.isMerchant();

  useEffect(() => {
    if (isMerchant) {
      Promise.all([
        merchantPortalApi.getCredentials(),
        merchantPortalApi.getTransactions(),
      ])
        .then(([credentials, transactions]) => {
          setStats({
            merchants: 1,
            credentials: credentials.filter((c) => c.active).length,
            transactions: transactions.length,
            totalAmount: sumAmount(transactions),
          });
        })
        .catch(() => {});
    } else {
      Promise.all([
        merchantApi.list(),
        credentialApi.list(),
        adminTransactionApi.list(),
      ])
        .then(([merchants, credentials, transactions]) => {
          setStats({
            merchants: merchants.length,
            credentials: credentials.filter((c) => c.active).length,
            transactions: transactions.length,
            totalAmount: sumAmount(transactions),
          });
        })
        .catch(() => {});
    }
  }, [isMerchant]);

  const statCards = [
    {
      title: isMerchant ? "Mi comercio" : "Comercios registrados",
      value: stats ? String(stats.merchants) : "…",
      color: "text-emerald-600",
    },
    {
      title: "Transacciones",
      value: stats ? String(stats.transactions) : "…",
      color: "text-amber-600",
    },
    {
      title: "Monto total",
      value: stats ? formatCOP(stats.totalAmount) : "…",
      color: "text-blue-600",
    },
    {
      title: "Credenciales activas",
      value: stats ? String(stats.credentials) : "…",
      color: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-blue-700 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-blue-100 text-sm mt-1">
          {isMerchant
            ? "Resumen de tu comercio en Paycore."
            : "Bienvenido a Paycore — resumen general del sistema de pagos B2B."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
