"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { merchantApi, credentialApi, transactionApi, type Transaction } from "@/lib/api";

interface Stats {
  merchants: number;
  transactions: number;
  totalAmount: number;
  credentials: number;
}

const sprintItems = [
  { label: "HU007 — Consulta del perfil del comercio autenticado",        hu: "HU007", done: true  },
  { label: "HU008 — Actualización de datos de perfil y configuración",    hu: "HU008", done: true  },
  { label: "HU009 — Autenticación JWT con login email/password",          hu: "HU009", done: true  },
  { label: "HU010 — Revocación de credencial API por administrador",      hu: "HU010", done: true  },
  { label: "HU011 — Portal de transacciones del comercio autenticado",    hu: "HU011", done: false },
  { label: "HU012 — Notificaciones de cambio de estado de transacción",   hu: "HU012", done: false },
];

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      merchantApi.list(),
      credentialApi.list(),
      transactionApi.list(),
    ]).then(([merchants, credentials, transactions]) => {
      setStats({
        merchants: merchants.length,
        credentials: credentials.filter((c) => c.active).length,
        transactions: transactions.length,
        totalAmount: (transactions as Transaction[]).reduce((sum, t) => sum + t.amount, 0),
      });
    }).catch(() => {});
  }, []);

  const statCards = [
    {
      title: "Comercios registrados",
      value: stats ? String(stats.merchants) : "…",
      description: "HU001",
      color: "text-emerald-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      title: "Transacciones creadas",
      value: stats ? String(stats.transactions) : "…",
      description: "HU003 / HU004",
      color: "text-amber-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        </svg>
      ),
    },
    {
      title: "Monto total solicitado",
      value: stats ? formatCOP(stats.totalAmount) : "…",
      description: "Suma de todas las transacciones",
      color: "text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "Credenciales activas",
      value: stats ? String(stats.credentials) : "…",
      description: "HU002",
      color: "text-violet-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-blue-700 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-blue-100 text-sm mt-1">
          Bienvenido a Paycore — resumen general del sistema de pagos B2B.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {s.title}
                </CardTitle>
                <span className="text-muted-foreground/60">{s.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint status */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
            <CardTitle className="text-base">Estado del proyecto — Sprint 2</CardTitle>
          </div>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-700">
              4 / 6 completadas
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3 text-sm">
            {sprintItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                {item.done ? (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 border-2 border-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                )}
                <span className={item.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {item.label}
                </span>
                <span className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {item.done ? "Cerrada" : "En progreso"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

