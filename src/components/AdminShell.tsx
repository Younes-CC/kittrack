"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AdminShell({
  salonName,
  children,
}: {
  salonName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar salonName={salonName} />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Menü schließen"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 h-full w-64 shadow-xl">
            <Sidebar salonName={salonName} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink transition-colors hover:bg-cream"
            aria-label="Menü öffnen"
          >
            <Menu size={20} />
          </button>
          <span className="truncate font-display text-base font-medium text-ink">{salonName}</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
