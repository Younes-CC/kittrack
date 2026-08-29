export type OpeningHoursDay = {
  closed: boolean;
  open: string;
  close: string;
};

export type OpeningHours = {
  mon: OpeningHoursDay;
  tue: OpeningHoursDay;
  wed: OpeningHoursDay;
  thu: OpeningHoursDay;
  fri: OpeningHoursDay;
  sat: OpeningHoursDay;
  sun: OpeningHoursDay;
};

export const WEEKDAY_KEYS: (keyof OpeningHours)[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const WEEKDAY_LABELS: Record<keyof OpeningHours, string> = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag",
};

export type Settings = {
  salon_name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: OpeningHours;
  slot_minutes: number;
};

export type Category = {
  id: string;
  name: string;
  sort_order: number;
};

export type Service = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  active: number;
  sort_order: number;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  color: string;
  active: number;
  sort_order: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
};

export type AppointmentStatus = "bestaetigt" | "angefragt" | "storniert" | "erledigt";

export type Appointment = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  staff_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string;
  source: "intern" | "online";
  created_at: string;
};

export type AppointmentWithRelations = Appointment & {
  staff_name: string;
  staff_color: string;
  service_name: string;
  service_price_cents: number;
  service_duration_minutes: number;
};
