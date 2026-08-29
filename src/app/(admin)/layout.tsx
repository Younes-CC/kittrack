import AdminShell from "@/components/AdminShell";
import { getSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  return <AdminShell salonName={settings.salon_name}>{children}</AdminShell>;
}
