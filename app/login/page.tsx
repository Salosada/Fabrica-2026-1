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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        {/* ── Header ── */}
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">
              A
            </div>
            <span className="text-xl font-bold tracking-tight">AppStripe</span>
          </div>
          <CardTitle className="text-2xl">
            {step === "username" ? "Iniciar sesión" : "Verificación 2FA"}
          </CardTitle>
          <CardDescription>
            {step === "username"
              ? "Ingresa tu nombre de usuario para continuar."
              : `Ingresa el código de 6 dígitos de tu Google Authenticator para "${username}".`}
          </CardDescription>
        </CardHeader>

        {/* ── Username step ── */}
        {step === "username" && (
          <form onSubmit={handleUsernameSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="admin@appstripe.com"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">
                Continuar
              </Button>
            </CardFooter>
          </form>
        )}

        {/* ── 2FA Code step ── */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de autenticación</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="w-full text-sm"
                onClick={() => {
                  setStep("username");
                  setCode("");
                  setError(null);
                }}
              >
                Cambiar usuario
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
