import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Comerciantes activos",
    value: "—",
    description: "Próximo sprint",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Transacciones hoy",
    value: "—",
    description: "Próximo sprint",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      </svg>
    ),
  },
  {
    title: "Monto total procesado",
    value: "—",
    description: "Próximo sprint",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Credenciales activas",
    value: "—",
    description: "Próximo sprint",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
      </svg>
    ),
  },
];

const sprintItems = [
  { label: "Autenticación 2FA (POST /2fa/verify)", done: true },
  { label: "Registro de comerciantes", done: false },
  { label: "Generación de credenciales API", done: false },
  { label: "Creación de transacciones", done: false },
  { label: "Gestión de estado de transacciones", done: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-blue-700 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-blue-100 text-sm mt-1">
          Bienvenido a AppStripe — resumen general del sistema de pagos B2B.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
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
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint status */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </span>
            <CardTitle className="text-base">Estado del proyecto — Sprint 1</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3 text-sm">
            {sprintItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                {item.done ? (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={item.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {item.label}
                </span>
                {item.done && (
                  <span className="ml-auto flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Disponible
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
