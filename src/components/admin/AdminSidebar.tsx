"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, BookOpen, ClipboardList, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Übersicht", icon: LayoutDashboard },
  { href: "/admin/bestellungen", label: "Bestellungen", icon: ClipboardList },
  { href: "/admin/buecher", label: "Bücher", icon: BookOpen },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between bg-sidebar px-5 py-8 text-sidebar-soft">
      <div>
        <p className="font-display text-lg text-white">Admin</p>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Abmelden
      </button>
    </aside>
  );
}
