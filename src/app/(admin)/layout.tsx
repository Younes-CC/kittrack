import Sidebar from "@/components/Sidebar";
import { getSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar salonName={settings.salon_name} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
