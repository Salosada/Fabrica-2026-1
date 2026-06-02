"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, authStore } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showTotp, setShowTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: email.trim(),
        password,
        ...(showTotp && totpCode ? { totpCode: parseInt(totpCode, 10) } : {}),
      };
      const response = await authApi.login(payload);
      authStore.save(response);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el servidor.";
      if (msg.toLowerCase().includes("2fa") || msg.toLowerCase().includes("totp") || msg.toLowerCase().includes("factor")) {
        setShowTotp(true);
        setError("Este usuario requiere código 2FA. Ingresa el código de Google Authenticator.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (desktop) — branding ── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white text-lg font-bold">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">Paycore</span>
        </div>
        <div className="space-y-5">
          <h2 className="text-3xl font-bold leading-snug">
            Plataforma de pagos B2B para el negocio moderno
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gestiona comercios, transacciones y credenciales API desde un solo lugar con seguridad y trazabilidad completa.
          </p>
          <div className="flex flex-col gap-2.5 pt-1 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Autenticación JWT segura
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Gestión de comercios y transacciones
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Credenciales API seguras
            </span>
          </div>
        </div>
        <p className="text-slate-600 text-xs">© 2026 Paycore — Code Factory</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white text-sm font-bold">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Paycore</span>
        </div>

        <Card className="w-full max-w-sm shadow-xl border border-slate-200 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Iniciar sesión</CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Ingresa tus credenciales para acceder al panel.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@paycore.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>

              {showTotp && (
                <div className="space-y-2">
                  <Label htmlFor="totp" className="text-slate-700 font-medium text-sm">
                    Código 2FA (Google Authenticator)
                  </Label>
                  <Input
                    id="totp"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-xl tracking-[0.5em] font-mono border-slate-300"
                    autoFocus
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0">
              <Button className="w-full font-semibold" type="submit" disabled={loading}>
                {loading ? "Verificando…" : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Admin: <span className="font-mono text-slate-500">admin@paycore.com</span> /{" "}
          <span className="font-mono text-slate-500">admin123</span>
          <br />
          <Link href="/activate" className="text-blue-600 hover:underline mt-1 inline-block">
            Activar cuenta de comercio
          </Link>
        </p>
      </div>
    </div>
  );
}
