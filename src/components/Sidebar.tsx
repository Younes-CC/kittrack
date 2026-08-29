"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  UserRound,
  Settings,
  Globe,
  Scissors,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/termine", label: "Termine", icon: CalendarDays },
  { href: "/kunden", label: "Kunden", icon: Users },
  { href: "/leistungen", label: "Leistungen & Preise", icon: Sparkles },
  { href: "/mitarbeiter", label: "Mitarbeiter", icon: UserRound },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export default function Sidebar({ salonName }: { salonName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-soft">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
          <Scissors size={17} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-medium text-white">{salonName}</p>
          <p className="text-[11px] uppercase tracking-wide text-sidebar-soft/70">Salonverwaltung</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-sidebar-soft hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.25 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Link
          href="/buchen"
          target="_blank"
          className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-sidebar-soft transition-colors hover:bg-white/5 hover:text-white"
        >
          <Globe size={17} strokeWidth={1.75} />
          Online-Buchung ansehen
        </Link>
      </div>
    </aside>
  );
}
