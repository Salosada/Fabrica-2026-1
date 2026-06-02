"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function ActivatePage() {
  const router = useRouter();
  const [invitationToken, setInvitationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.activateMerchant({
        invitationToken: invitationToken.trim(),
        newPassword,
      });
      authStore.save(response);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md shadow-xl border border-slate-200 bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            Activar cuenta de comercio
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Usa el token de invitación generado al registrar tu comercio en{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">POST /api/v1/admin/merchants</code>.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="token">Token de invitación</Label>
              <Input
                id="token"
                placeholder="UUID del token"
                value={invitationToken}
                onChange={(e) => setInvitationToken(e.target.value)}
                required
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Activando…" : "Activar y entrar"}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
