"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Check, Clock, MapPin, Phone, Scissors, Sparkles } from "lucide-react";
import { formatDateLong, formatDuration, formatPrice, initials, todayISO } from "@/lib/format";
import type { Category, Service, Settings, Staff } from "@/lib/types";

type Step = "service" | "staff" | "datetime" | "contact" | "done";

const NO_PREFERENCE = "egal";

export default function BuchenPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ serviceName: string; staffName: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ])
      .then(([s, c, sv, st]) => {
        setSettings(s);
        setCategories(c);
        setServices(sv.filter((x: Service) => x.active));
        setStaff(st.filter((x: Staff) => x.active));
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);
  const selectedStaff = useMemo(
    () => staff.find((s) => s.id === (assignedStaffId ?? staffId)),
    [staff, staffId, assignedStaffId]
  );

  const groupedServices = useMemo(
    () => categories.map((cat) => ({ category: cat, services: services.filter((s) => s.category_id === cat.id) })),
    [categories, services]
  );

  useEffect(() => {
    if (step !== "datetime" || !serviceId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch slots when date/service/staff selection changes
    setLoadingSlots(true);
    setTime(null);
    const params = new URLSearchParams({ date, serviceId });
    if (staffId && staffId !== NO_PREFERENCE) params.set("staffId", staffId);
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then(setAvailability)
      .finally(() => setLoadingSlots(false));
  }, [step, serviceId, staffId, date]);

  const timeOptions = useMemo(() => {
    const set = new Set<string>();
    Object.values(availability).forEach((slots) => slots.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [availability]);

  function pickTime(t: string) {
    setTime(t);
    if (staffId && staffId !== NO_PREFERENCE) {
      setAssignedStaffId(staffId);
    } else {
      const staffWithSlot = Object.entries(availability).find(([, slots]) => slots.includes(t));
      setAssignedStaffId(staffWithSlot?.[0] ?? null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !serviceId || !time || !assignedStaffId) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          staffId: assignedStaffId,
          date,
          startTime: time,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Buchung fehlgeschlagen.");
      setConfirmation({ serviceName: data.serviceName, staffName: data.staffName });
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Leistung" },
    { key: "staff", label: "Mitarbeiter" },
    { key: "datetime", label: "Termin" },
    { key: "contact", label: "Kontakt" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-soft">Lädt…</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
            <Scissors size={18} />
          </div>
          <div>
            <h1 className="font-display text-xl font-medium text-ink">{settings?.salon_name}</h1>
            {settings?.address && (
              <p className="flex items-center gap-1 text-xs text-ink-soft">
                <MapPin size={11} /> {settings.address}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {step !== "done" && (
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    i <= stepIndex ? "bg-accent text-white" : "bg-border text-ink-soft"
                  }`}
                >
                  {i < stepIndex ? <Check size={13} /> : i + 1}
                </div>
                <span className={`hidden text-xs sm:inline ${i <= stepIndex ? "text-ink" : "text-ink-soft"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <div className={`h-px flex-1 ${i < stepIndex ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        {step === "service" && (
          <div>
            <h2 className="mb-1 font-display text-2xl font-medium text-ink">Leistung wählen</h2>
            <p className="mb-5 text-sm text-ink-soft">Unsere Preisliste — wähle die gewünschte Behandlung.</p>
            <div className="space-y-6">
              {groupedServices.map(
                ({ category, services: catServices }) =>
                  catServices.length > 0 && (
                    <div key={category.id}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {catServices.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setServiceId(s.id);
                              setStep("staff");
                            }}
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-left transition-all hover:border-accent hover:shadow-sm"
                          >
                            <div>
                              <p className="text-sm font-medium text-ink">{s.name}</p>
                              <p className="text-xs text-ink-soft">{formatDuration(s.duration_minutes)}</p>
                            </div>
                            <span className="font-display text-base font-medium text-accent-dark">
                              {formatPrice(s.price_cents)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {step === "staff" && (
          <div>
            <button onClick={() => setStep("service")} className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
              <ArrowLeft size={15} /> Zurück
            </button>
            <h2 className="mb-1 font-display text-2xl font-medium text-ink">Mitarbeiter wählen</h2>
            <p className="mb-5 text-sm text-ink-soft">Für: {selectedService?.name}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setStaffId(NO_PREFERENCE);
                  setStep("datetime");
                }}
                className="flex w-full items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-3.5 text-left transition-all hover:border-accent hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                  <Sparkles size={17} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Keine Präferenz</p>
                  <p className="text-xs text-ink-soft">Wir wählen den nächsten verfügbaren Termin</p>
                </div>
              </button>
              {staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStaffId(s.id);
                    setStep("datetime");
                  }}
                  className="flex w-full items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-3.5 text-left transition-all hover:border-accent hover:shadow-sm"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {initials(s.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-ink-soft">{s.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "datetime" && (
          <div>
            <button onClick={() => setStep("staff")} className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
              <ArrowLeft size={15} /> Zurück
            </button>
            <h2 className="mb-1 font-display text-2xl font-medium text-ink">Termin wählen</h2>
            <p className="mb-5 text-sm text-ink-soft">
              {selectedService?.name} · {formatDuration(selectedService?.duration_minutes ?? 0)}
            </p>

            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <Calendar size={16} className="text-ink-soft" /> Datum
            </label>
            <input
              type="date"
              className="mb-5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="mb-3 text-sm font-medium text-ink">{formatDateLong(date)}</p>

            {loadingSlots ? (
              <p className="py-8 text-center text-sm text-ink-soft">Lade verfügbare Zeiten…</p>
            ) : timeOptions.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface py-8 text-center text-sm text-ink-soft">
                Keine freien Termine an diesem Tag. Bitte ein anderes Datum wählen.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => pickTime(t)}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                      time === t
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface text-ink hover:border-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {time && (
              <button onClick={() => setStep("contact")} className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
                Weiter zu Kontaktdaten
              </button>
            )}
          </div>
        )}

        {step === "contact" && (
          <div>
            <button onClick={() => setStep("datetime")} className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
              <ArrowLeft size={15} /> Zurück
            </button>
            <h2 className="mb-1 font-display text-2xl font-medium text-ink">Fast geschafft</h2>
            <div className="mb-5 rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="font-medium text-ink">{selectedService?.name}</p>
              <p className="text-ink-soft">
                {formatDateLong(date)} um {time} Uhr · {selectedStaff?.name}
              </p>
              <p className="mt-1 font-semibold text-accent-dark">{formatPrice(selectedService?.price_cents ?? 0)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">Name</label>
                <input
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">Telefon</label>
                <input
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
                  E-Mail (optional)
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-accent-dark">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
              >
                {submitting ? "Wird gebucht…" : "Termin verbindlich buchen"}
              </button>
            </form>
          </div>
        )}

        {step === "done" && confirmation && (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={26} />
            </div>
            <h2 className="mb-2 font-display text-2xl font-medium text-ink">Termin bestätigt!</h2>
            <p className="mb-6 text-sm text-ink-soft">
              Wir freuen uns auf dich, {name.split(" ")[0]}.
            </p>
            <div className="mx-auto mb-6 max-w-sm space-y-2 rounded-xl bg-cream p-4 text-left text-sm">
              <p className="flex items-center gap-2 text-ink">
                <Sparkles size={15} className="text-accent" /> {confirmation.serviceName}
              </p>
              <p className="flex items-center gap-2 text-ink">
                <Clock size={15} className="text-accent" /> {formatDateLong(date)} um {time} Uhr
              </p>
              <p className="flex items-center gap-2 text-ink">
                <Scissors size={15} className="text-accent" /> {confirmation.staffName}
              </p>
              {settings?.phone && (
                <p className="flex items-center gap-2 text-ink">
                  <Phone size={15} className="text-accent" /> {settings.phone}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setStep("service");
                setServiceId(null);
                setStaffId(null);
                setTime(null);
                setAssignedStaffId(null);
                setName("");
                setPhone("");
                setEmail("");
                setConfirmation(null);
              }}
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              Weiteren Termin buchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
