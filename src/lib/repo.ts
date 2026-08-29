import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type {
  Settings,
  Category,
  Service,
  Staff,
  Customer,
  Appointment,
  AppointmentWithRelations,
} from "@/lib/types";

// ---------- Settings ----------

export function getSettings(): Settings {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get() as {
    salon_name: string;
    address: string;
    phone: string;
    email: string;
    opening_hours: string;
    slot_minutes: number;
  };
  return {
    salon_name: row.salon_name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    opening_hours: JSON.parse(row.opening_hours),
    slot_minutes: row.slot_minutes,
  };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const current = getSettings();
  const next: Settings = { ...current, ...patch };
  db.prepare(
    `UPDATE settings SET salon_name = ?, address = ?, phone = ?, email = ?, opening_hours = ?, slot_minutes = ? WHERE id = 1`
  ).run(
    next.salon_name,
    next.address,
    next.phone,
    next.email,
    JSON.stringify(next.opening_hours),
    next.slot_minutes
  );
  return next;
}

// ---------- Categories ----------

export function listCategories(): Category[] {
  return db.prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC").all() as Category[];
}

export function createCategory(name: string): Category {
  const maxOrder = (db.prepare("SELECT MAX(sort_order) as m FROM categories").get() as { m: number | null }).m ?? -1;
  const category: Category = { id: randomUUID(), name, sort_order: maxOrder + 1 };
  db.prepare("INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)").run(
    category.id,
    category.name,
    category.sort_order
  );
  return category;
}

export function updateCategory(id: string, patch: Partial<Pick<Category, "name" | "sort_order">>): void {
  const current = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
  if (!current) throw new Error("Kategorie nicht gefunden");
  const next = { ...current, ...patch };
  db.prepare("UPDATE categories SET name = ?, sort_order = ? WHERE id = ?").run(next.name, next.sort_order, id);
}

export function deleteCategory(id: string): void {
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// ---------- Services ----------

export function listServices(): Service[] {
  return db.prepare("SELECT * FROM services ORDER BY sort_order ASC, name ASC").all() as Service[];
}

export function createService(input: Omit<Service, "id" | "active" | "sort_order"> & { active?: boolean }): Service {
  const maxOrder =
    (db
      .prepare("SELECT MAX(sort_order) as m FROM services WHERE category_id = ?")
      .get(input.category_id) as { m: number | null }).m ?? -1;
  const service: Service = {
    id: randomUUID(),
    category_id: input.category_id,
    name: input.name,
    description: input.description ?? "",
    duration_minutes: input.duration_minutes,
    price_cents: input.price_cents,
    active: input.active === false ? 0 : 1,
    sort_order: maxOrder + 1,
  };
  db.prepare(
    `INSERT INTO services (id, category_id, name, description, duration_minutes, price_cents, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    service.id,
    service.category_id,
    service.name,
    service.description,
    service.duration_minutes,
    service.price_cents,
    service.active,
    service.sort_order
  );
  return service;
}

export function updateService(id: string, patch: Partial<Omit<Service, "id">>): void {
  const current = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as Service | undefined;
  if (!current) throw new Error("Leistung nicht gefunden");
  const next = { ...current, ...patch };
  db.prepare(
    `UPDATE services SET category_id = ?, name = ?, description = ?, duration_minutes = ?, price_cents = ?, active = ?, sort_order = ?
     WHERE id = ?`
  ).run(
    next.category_id,
    next.name,
    next.description,
    next.duration_minutes,
    next.price_cents,
    next.active,
    next.sort_order,
    id
  );
}

export function deleteService(id: string): void {
  db.prepare("DELETE FROM services WHERE id = ?").run(id);
}

// ---------- Staff ----------

export function listStaff(): Staff[] {
  return db.prepare("SELECT * FROM staff ORDER BY sort_order ASC, name ASC").all() as Staff[];
}

export function createStaff(input: { name: string; role?: string; color?: string }): Staff {
  const maxOrder = (db.prepare("SELECT MAX(sort_order) as m FROM staff").get() as { m: number | null }).m ?? -1;
  const staff: Staff = {
    id: randomUUID(),
    name: input.name,
    role: input.role ?? "",
    color: input.color ?? "#B45141",
    active: 1,
    sort_order: maxOrder + 1,
  };
  db.prepare(
    "INSERT INTO staff (id, name, role, color, active, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(staff.id, staff.name, staff.role, staff.color, staff.active, staff.sort_order);
  return staff;
}

export function updateStaff(id: string, patch: Partial<Omit<Staff, "id">>): void {
  const current = db.prepare("SELECT * FROM staff WHERE id = ?").get(id) as Staff | undefined;
  if (!current) throw new Error("Mitarbeiter nicht gefunden");
  const next = { ...current, ...patch };
  db.prepare("UPDATE staff SET name = ?, role = ?, color = ?, active = ?, sort_order = ? WHERE id = ?").run(
    next.name,
    next.role,
    next.color,
    next.active,
    next.sort_order,
    id
  );
}

export function deleteStaff(id: string): void {
  db.prepare("DELETE FROM staff WHERE id = ?").run(id);
}

// ---------- Customers ----------

export function listCustomers(): Customer[] {
  return db.prepare("SELECT * FROM customers ORDER BY name ASC").all() as Customer[];
}

export function getCustomer(id: string): Customer | undefined {
  return db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as Customer | undefined;
}

export function findCustomerByPhone(phone: string): Customer | undefined {
  return db.prepare("SELECT * FROM customers WHERE phone = ? AND phone != ''").get(phone) as
    | Customer
    | undefined;
}

export function createCustomer(input: { name: string; phone?: string; email?: string; notes?: string }): Customer {
  const customer: Customer = {
    id: randomUUID(),
    name: input.name,
    phone: input.phone ?? "",
    email: input.email ?? "",
    notes: input.notes ?? "",
    created_at: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO customers (id, name, phone, email, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(customer.id, customer.name, customer.phone, customer.email, customer.notes, customer.created_at);
  return customer;
}

export function updateCustomer(id: string, patch: Partial<Omit<Customer, "id" | "created_at">>): void {
  const current = getCustomer(id);
  if (!current) throw new Error("Kunde nicht gefunden");
  const next = { ...current, ...patch };
  db.prepare("UPDATE customers SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?").run(
    next.name,
    next.phone,
    next.email,
    next.notes,
    id
  );
}

export function deleteCustomer(id: string): void {
  db.prepare("DELETE FROM customers WHERE id = ?").run(id);
}

// ---------- Appointments ----------

const APPT_SELECT = `
  SELECT a.*, s.name as staff_name, s.color as staff_color,
         sv.name as service_name, sv.price_cents as service_price_cents, sv.duration_minutes as service_duration_minutes
  FROM appointments a
  JOIN staff s ON s.id = a.staff_id
  JOIN services sv ON sv.id = a.service_id
`;

export function listAppointmentsByDate(date: string): AppointmentWithRelations[] {
  return db
    .prepare(`${APPT_SELECT} WHERE a.date = ? ORDER BY a.start_time ASC`)
    .all(date) as AppointmentWithRelations[];
}

export function listAppointmentsByRange(from: string, to: string): AppointmentWithRelations[] {
  return db
    .prepare(`${APPT_SELECT} WHERE a.date BETWEEN ? AND ? ORDER BY a.date ASC, a.start_time ASC`)
    .all(from, to) as AppointmentWithRelations[];
}

export function listAppointmentsByCustomer(customerId: string): AppointmentWithRelations[] {
  return db
    .prepare(`${APPT_SELECT} WHERE a.customer_id = ? ORDER BY a.date DESC, a.start_time DESC`)
    .all(customerId) as AppointmentWithRelations[];
}

export function getAppointment(id: string): AppointmentWithRelations | undefined {
  return db.prepare(`${APPT_SELECT} WHERE a.id = ?`).get(id) as AppointmentWithRelations | undefined;
}

export function hasOverlap(params: {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  excludeId?: string;
}): boolean {
  const { staffId, date, startTime, endTime, excludeId } = params;
  const rows = db
    .prepare(
      `SELECT id, start_time, end_time FROM appointments
       WHERE staff_id = ? AND date = ? AND status != 'storniert' ${excludeId ? "AND id != ?" : ""}`
    )
    .all(...(excludeId ? [staffId, date, excludeId] : [staffId, date])) as {
    id: string;
    start_time: string;
    end_time: string;
  }[];
  return rows.some((r) => startTime < r.end_time && endTime > r.start_time);
}

export function createAppointment(input: Omit<Appointment, "id" | "created_at">): Appointment {
  const appt: Appointment = { ...input, id: randomUUID(), created_at: new Date().toISOString() };
  db.prepare(
    `INSERT INTO appointments
      (id, customer_id, customer_name, customer_phone, staff_id, service_id, date, start_time, end_time, status, notes, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    appt.id,
    appt.customer_id,
    appt.customer_name,
    appt.customer_phone,
    appt.staff_id,
    appt.service_id,
    appt.date,
    appt.start_time,
    appt.end_time,
    appt.status,
    appt.notes,
    appt.source,
    appt.created_at
  );
  return appt;
}

export function updateAppointment(id: string, patch: Partial<Omit<Appointment, "id" | "created_at">>): void {
  const current = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id) as Appointment | undefined;
  if (!current) throw new Error("Termin nicht gefunden");
  const next = { ...current, ...patch };
  db.prepare(
    `UPDATE appointments SET customer_id = ?, customer_name = ?, customer_phone = ?, staff_id = ?, service_id = ?,
       date = ?, start_time = ?, end_time = ?, status = ?, notes = ?, source = ? WHERE id = ?`
  ).run(
    next.customer_id,
    next.customer_name,
    next.customer_phone,
    next.staff_id,
    next.service_id,
    next.date,
    next.start_time,
    next.end_time,
    next.status,
    next.notes,
    next.source,
    id
  );
}

export function deleteAppointment(id: string): void {
  db.prepare("DELETE FROM appointments WHERE id = ?").run(id);
}
