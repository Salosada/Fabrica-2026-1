"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
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

type Step = "username" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Ingresa tu nombre de usuario.");
      return;
    }
    setError(null);
    setStep("code");
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(code, 10);
    if (isNaN(parsed)) {
      setError("El código debe ser numérico.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const valid = await authApi.verify2fa({ username, code: parsed });
      if (valid) {
        router.push("/dashboard");
      } else {
        setError("Código incorrecto o expirado. Intenta de nuevo.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con el servidor."
      );
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
            A
          </div>
          <span className="text-xl font-bold tracking-tight">AppStripe</span>
        </div>
        <div className="space-y-5">
          <h2 className="text-3xl font-bold leading-snug">
            Plataforma de pagos B2B para el negocio moderno
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gestiona comerciantes, transacciones y credenciales API desde un solo lugar con seguridad y trazabilidad completa.
          </p>
          <div className="flex flex-col gap-2.5 pt-1 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Autenticación de dos factores
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Gestión de comerciantes y transacciones
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Credenciales API seguras
            </span>
          </div>
        </div>
        <p className="text-slate-600 text-xs">© 2026 AppStripe — Code Factory</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white text-sm font-bold">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">AppStripe</span>
        </div>

      <Card className="w-full max-w-sm shadow-xl border border-slate-200 bg-white">
        {/* ── Header ── */}
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-xl font-bold text-slate-900">
            {step === "username" ? "Iniciar sesión" : "Verificación 2FA"}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            {step === "username"
              ? "Ingresa tu nombre de usuario para continuar."
              : `Código de Google Authenticator para "${username}".`}
          </CardDescription>
        </CardHeader>

        {/* Step indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold transition-colors ${step === "code" ? "bg-emerald-500" : "bg-blue-600"}`}
            >
              {step === "code" ? "✓" : "1"}
            </div>
            <div className={`h-0.5 flex-1 rounded transition-colors ${step === "code" ? "bg-blue-500" : "bg-slate-200"}`} />
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === "code" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">Usuario</span>
            <span className="text-xs text-slate-500">Código 2FA</span>
          </div>
        </div>

        {/* ── Username step ── */}
        {step === "username" && (
          <form onSubmit={handleUsernameSubmit}>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium text-sm">Usuario</Label>
                <Input
                  id="username"
                  placeholder="admin@appstripe.com"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full font-semibold" type="submit">
                Continuar →
              </Button>
            </CardFooter>
          </form>
        )}

        {/* ── 2FA Code step ── */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4 pt-0">
              <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                <span className="text-slate-500">Usuario: </span>
                <span className="font-medium text-slate-800">{username}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-700 font-medium text-sm">Código de autenticación</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-xl tracking-[0.5em] font-mono border-slate-300"
                />
                <p className="text-xs text-slate-500 text-center">Abre Google Authenticator y copia el código de 6 dígitos</p>
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              <Button className="w-full font-semibold" type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar código"}
              </Button>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors py-1"
                onClick={() => {
                  setStep("username");
                  setCode("");
                  setError(null);
                }}
              >
                ← Volver
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
      </div>
    </div>
  );
}
