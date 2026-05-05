"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  merchantPortalApi,
  type MerchantProfileResponse,
  type UpdateProfileRequest,
} from "@/lib/api";

const statusStyleMap: Record<MerchantProfileResponse["status"], string> = {
  VERIFIED:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE:  "bg-amber-100  text-amber-700  border-amber-200",
  SUSPENDED: "bg-red-100    text-red-700    border-red-200",
};

const statusLabelMap: Record<MerchantProfileResponse["status"], string> = {
  VERIFIED:  "Verificado",
  INACTIVE:  "Inactivo",
  SUSPENDED: "Suspendido",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<MerchantProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({
    businessName: "",
    email: "",
    businessType: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    merchantPortalApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          businessName: data.businessName,
          email: data.email,
          businessType: data.businessType,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar perfil");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await merchantPortalApi.updateProfile(form);
      setProfile(updated);
      setEditing(false);
      setSuccessMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      setForm({
        businessName: profile.businessName,
        email: profile.email,
        businessType: profile.businessType,
      });
    }
    setEditing(false);
    setSaveError(null);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-violet-100 text-sm mt-1">
          Consulta y actualiza los datos de tu comercio.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-300 px-4 py-3 text-sm text-emerald-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 flex-shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMsg}
        </div>
      )}

      {loading && (
        <p className="text-center text-slate-400 text-sm py-12">Cargando perfil…</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {profile && (
        <>
          {/* Read-only info — campos protegidos */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Información del comercio</CardTitle>
                <Badge variant="outline" className={statusStyleMap[profile.status]}>
                  {statusLabelMap[profile.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <InfoRow label="ID interno" value={profile.id} mono />
              <InfoRow label="NIT / ID fiscal" value={profile.businessId} mono />
              <InfoRow label="Permiso" value={profile.permission} />
            </CardContent>
          </Card>

          {/* Editable fields */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Datos actualizables</CardTitle>
                {!editing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="border-violet-300 text-violet-700 hover:bg-violet-50"
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Razón social</Label>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo de contacto</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Tipo de negocio</Label>
                    <Input
                      id="businessType"
                      value={form.businessType}
                      onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
                      required
                    />
                  </div>

                  {saveError && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                      {saveError}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-1">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <InfoRow label="Razón social" value={profile.businessName} />
                  <InfoRow label="Correo de contacto" value={profile.email} />
                  <InfoRow label="Tipo de negocio" value={profile.businessType} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-40 flex-shrink-0">
        {label}
      </span>
      <span className={`text-sm text-slate-800 ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
