import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar />
      {/* pt-14 compensates for fixed mobile top bar on small screens */}
      <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
