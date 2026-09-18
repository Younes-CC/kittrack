-- Row Level Security
--
-- Modell: Jeder authentifizierte Supabase-User gilt als Admin (Single-Tier
-- Trust). Admin-Accounts werden manuell im Supabase Dashboard angelegt,
-- siehe README. Öffentliche Nutzer greifen ausschließlich anonym (anon) zu.

alter table books enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ---------------------------------------------------------------------------
-- books
-- ---------------------------------------------------------------------------
create policy "books_public_select_active"
  on books for select
  to anon
  using (active = true);

create policy "books_admin_select_all"
  on books for select
  to authenticated
  using (true);

create policy "books_admin_insert"
  on books for insert
  to authenticated
  with check (true);

create policy "books_admin_update"
  on books for update
  to authenticated
  using (true)
  with check (true);

create policy "books_admin_delete"
  on books for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- settings — enthält keine sensiblen Daten (nur Versandpreis, Zahlungslink,
-- Reservierungsdauer), daher öffentlich lesbar. Schreiben nur als Admin.
-- ---------------------------------------------------------------------------
create policy "settings_public_select"
  on settings for select
  to anon, authenticated
  using (true);

create policy "settings_admin_update"
  on settings for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- orders / order_items — enthalten personenbezogene Daten.
-- Öffentliche Nutzer haben KEINEN direkten Lese- oder Schreibzugriff.
-- Anlage & Statusabfrage laufen ausschließlich über serverseitige
-- API-Routen mit dem Service-Role-Key (umgeht RLS) bzw. die
-- SECURITY DEFINER Funktion `create_reservation`.
-- ---------------------------------------------------------------------------
create policy "orders_admin_select"
  on orders for select
  to authenticated
  using (true);

create policy "orders_admin_update"
  on orders for update
  to authenticated
  using (true)
  with check (true);

create policy "order_items_admin_select"
  on order_items for select
  to authenticated
  using (true);
