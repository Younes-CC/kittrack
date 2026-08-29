import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "salon.db");

declare global {
  var __salonDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = globalThis.__salonDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalThis.__salonDb = db;

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      salon_name TEXT NOT NULL DEFAULT 'Mein Friseursalon',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      opening_hours TEXT NOT NULL DEFAULT '{}',
      slot_minutes INTEGER NOT NULL DEFAULT 15
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      duration_minutes INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#B45141',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL DEFAULT '',
      customer_phone TEXT NOT NULL DEFAULT '',
      staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'bestaetigt',
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'intern',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_staff_date ON appointments(staff_id, date);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
  `);
}

migrate();

const DEFAULT_HOURS = {
  mon: { closed: false, open: "09:00", close: "19:00" },
  tue: { closed: false, open: "09:00", close: "19:00" },
  wed: { closed: false, open: "09:00", close: "19:00" },
  thu: { closed: false, open: "09:00", close: "20:00" },
  fri: { closed: false, open: "09:00", close: "20:00" },
  sat: { closed: false, open: "09:00", close: "15:00" },
  sun: { closed: true, open: "09:00", close: "15:00" },
};

function seed() {
  const settingsRow = db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!settingsRow) {
    db.prepare(
      `INSERT OR IGNORE INTO settings (id, salon_name, address, phone, email, opening_hours, slot_minutes)
       VALUES (1, ?, ?, ?, ?, ?, ?)`
    ).run(
      "Salon Bellezza",
      "Hauptstraße 24, 50667 Köln",
      "0221 1234567",
      "info@salon-bellezza.de",
      JSON.stringify(DEFAULT_HOURS),
      15
    );
  }

  const categoryCount = (db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }).c;
  if (categoryCount === 0) {
    const insertCategory = db.prepare(
      "INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)"
    );
    const insertService = db.prepare(
      `INSERT OR IGNORE INTO services (id, category_id, name, description, duration_minutes, price_cents, active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    );

    const categories: { id: string; name: string; services: { name: string; desc?: string; duration: number; price: number }[] }[] = [
      {
        id: "cat-damen",
        name: "Damen",
        services: [
          { name: "Waschen, Schneiden, Föhnen", duration: 60, price: 4900 },
          { name: "Waschen, Föhnen, Styling", duration: 30, price: 2900 },
          { name: "Spitzen schneiden", duration: 30, price: 2200 },
          { name: "Hochsteckfrisur", duration: 45, price: 5500 },
        ],
      },
      {
        id: "cat-herren",
        name: "Herren",
        services: [
          { name: "Waschen, Schneiden, Styling", duration: 30, price: 2900 },
          { name: "Bart trimmen", duration: 15, price: 1200 },
          { name: "Schneiden & Bart Komplett", duration: 45, price: 3900 },
        ],
      },
      {
        id: "cat-kinder",
        name: "Kinder",
        services: [{ name: "Kinderhaarschnitt (bis 12 Jahre)", duration: 30, price: 1900 }],
      },
      {
        id: "cat-coloration",
        name: "Coloration & Strähnen",
        services: [
          { name: "Ansatzfarbe", duration: 60, price: 4500 },
          { name: "Vollfärbung", duration: 90, price: 6500 },
          { name: "Balayage", duration: 150, price: 12000 },
          { name: "Strähnen (Folie)", duration: 120, price: 8500 },
        ],
      },
      {
        id: "cat-pflege",
        name: "Pflege & Treatments",
        services: [
          { name: "Intensivpflege / Kur", duration: 20, price: 1800 },
          { name: "Kopfhautbehandlung", duration: 30, price: 2500 },
        ],
      },
    ];

    categories.forEach((cat, ci) => {
      insertCategory.run(cat.id, cat.name, ci);
      cat.services.forEach((s, si) => {
        insertService.run(
          `svc-${cat.id}-${si}`,
          cat.id,
          s.name,
          s.desc ?? "",
          s.duration,
          s.price,
          si
        );
      });
    });
  }

  const staffCount = (db.prepare("SELECT COUNT(*) as c FROM staff").get() as { c: number }).c;
  if (staffCount === 0) {
    const insertStaff = db.prepare(
      "INSERT OR IGNORE INTO staff (id, name, role, color, active, sort_order) VALUES (?, ?, ?, ?, 1, ?)"
    );
    const staffMembers = [
      { id: "staff-1", name: "Mara Keller", role: "Salonleitung / Coloristin", color: "#B45141" },
      { id: "staff-2", name: "Jonas Weber", role: "Stylist", color: "#3E6259" },
      { id: "staff-3", name: "Elif Yildiz", role: "Stylistin / Auszubildende", color: "#8C6A3F" },
    ];
    staffMembers.forEach((s, i) => insertStaff.run(s.id, s.name, s.role, s.color, i));
  }

  const customerCount = (db.prepare("SELECT COUNT(*) as c FROM customers").get() as { c: number }).c;
  if (customerCount === 0) {
    const insertCustomer = db.prepare(
      "INSERT OR IGNORE INTO customers (id, name, phone, email, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const now = new Date().toISOString();
    const customers = [
      { id: "cust-1", name: "Sabine Hoffmann", phone: "0170 1112233", email: "sabine.hoffmann@example.com", notes: "Bevorzugt Balayage, keine Ammoniak-Farben." },
      { id: "cust-2", name: "Tobias Richter", phone: "0171 2223344", email: "t.richter@example.com", notes: "" },
      { id: "cust-3", name: "Petra Lang", phone: "0160 3334455", email: "", notes: "Stammkundin seit 2019." },
      { id: "cust-4", name: "Ali Demir", phone: "0176 4445566", email: "ali.demir@example.com", notes: "" },
    ];
    customers.forEach((c) => insertCustomer.run(c.id, c.name, c.phone, c.email, c.notes, now));

    const todayStr = new Date().toISOString().slice(0, 10);
    const insertAppt = db.prepare(
      `INSERT OR IGNORE INTO appointments (id, customer_id, customer_name, customer_phone, staff_id, service_id, date, start_time, end_time, status, notes, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const appts = [
      { id: "appt-1", customerId: "cust-1", staffId: "staff-1", serviceId: "svc-cat-coloration-2", start: "10:00", end: "12:30" },
      { id: "appt-2", customerId: "cust-2", staffId: "staff-2", serviceId: "svc-cat-herren-0", start: "11:00", end: "11:30" },
      { id: "appt-3", customerId: "cust-3", staffId: "staff-3", serviceId: "svc-cat-damen-0", start: "13:30", end: "14:30" },
      { id: "appt-4", customerId: "cust-4", staffId: "staff-2", serviceId: "svc-cat-herren-2", start: "15:00", end: "15:45" },
    ];
    appts.forEach((a) => {
      const cust = customers.find((c) => c.id === a.customerId)!;
      insertAppt.run(
        a.id,
        a.customerId,
        cust.name,
        cust.phone,
        a.staffId,
        a.serviceId,
        todayStr,
        a.start,
        a.end,
        "bestaetigt",
        "",
        "intern",
        now
      );
    });
  }
}

seed();
