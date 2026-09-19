-- Atomare Operationen als SECURITY DEFINER Funktionen.
--
-- Diese Funktionen kapseln alles, was Bestand und Bestellungen konsistent
-- halten muss (Race Conditions bei gleichzeitigen Reservierungen,
-- Bestandsrückgabe bei Stornierung). Sie laufen jeweils in einer einzigen
-- Transaktion (Postgres-Funktionsaufruf) und werden NICHT an `anon`
-- vergeben — Aufrufe erfolgen ausschließlich serverseitig
-- (create_reservation über den Service-Role-Key, die admin_* Funktionen
-- über eine authentifizierte Admin-Session).
--
-- ACHTUNG für neue SECURITY DEFINER Funktionen: Supabase vergibt per
-- ALTER DEFAULT PRIVILEGES automatisch EXECUTE an anon/authenticated auf
-- jede neue Funktion im public-Schema — "revoke all ... from public" allein
-- reicht NICHT, um das zu verhindern. Immer zusätzlich explizit
-- "revoke execute on function ... from anon [, authenticated]" setzen und
-- mit dem Security Advisor (mcp__Supabase__get_advisors) verifizieren.
-- Siehe 0006_harden_functions.sql für die Korrektur der ursprünglichen
-- Version dieser Datei.

-- ---------------------------------------------------------------------------
-- Bestellnummer generieren, z. B. MB-7K3F2
-- ---------------------------------------------------------------------------
create or replace function generate_order_number()
returns text
language plpgsql
as $$
declare
  candidate text;
  already_taken boolean;
begin
  loop
    candidate := 'MB-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    select exists(select 1 from orders where public_order_number = candidate) into already_taken;
    exit when not already_taken;
  end loop;
  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reservierung anlegen: prüft & reserviert Bestand atomar, legt Bestellung
-- und Bestellposition an. Wirft BOOK_UNAVAILABLE, wenn kein Bestand frei ist.
-- ---------------------------------------------------------------------------
create or replace function create_reservation(
  p_book_id uuid,
  p_delivery_type delivery_type,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_social_handle text,
  p_street text,
  p_house_number text,
  p_postal_code text,
  p_city text,
  p_country text
)
returns table (
  order_id uuid,
  public_order_number text,
  order_status order_status,
  payment_status payment_status,
  shipping_price numeric,
  reservation_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_book books%rowtype;
  v_settings settings%rowtype;
  v_order_number text;
  v_order_status order_status;
  v_payment_status payment_status;
  v_shipping_price numeric(10, 2);
  v_expires timestamptz;
  v_order_id uuid;
begin
  select * into v_settings from settings where id = true;

  -- Atomares "check & decrement" in einem einzigen UPDATE — kein separates
  -- SELECT ... FOR UPDATE nötig, dadurch keine Überbuchung bei parallelen
  -- Reservierungen.
  update books
    set stock_available = stock_available - 1
  where id = p_book_id
    and active = true
    and stock_available > 0
  returning * into v_book;

  if v_book.id is null then
    raise exception 'BOOK_UNAVAILABLE' using errcode = 'P0001';
  end if;

  v_order_number := generate_order_number();

  if p_delivery_type = 'shipping' then
    v_order_status := 'awaiting_payment';
    v_payment_status := 'pending';
    v_shipping_price := coalesce(v_settings.shipping_price, 0);
    v_expires := now() + make_interval(hours => coalesce(v_settings.reservation_duration_hours, 24));
  else
    v_order_status := 'reserved';
    v_payment_status := 'not_required';
    v_shipping_price := 0;
    -- Abholreservierungen laufen länger, da die Übergabe separat
    -- vereinbart wird und keine Zahlung aussteht.
    v_expires := now() + interval '7 days';
  end if;

  insert into orders (
    public_order_number, delivery_type, first_name, last_name, email,
    social_handle, street, house_number, postal_code, city, country,
    shipping_price, payment_status, order_status, reservation_expires_at
  ) values (
    v_order_number, p_delivery_type, p_first_name, p_last_name, p_email,
    nullif(trim(p_social_handle), ''), p_street, p_house_number, p_postal_code, p_city,
    coalesce(p_country, 'Deutschland'),
    v_shipping_price, v_payment_status, v_order_status, v_expires
  ) returning id into v_order_id;

  insert into order_items (
    order_id, book_id, book_title_snapshot, book_author_snapshot, quantity, unit_price
  ) values (
    v_order_id, v_book.id, v_book.title, v_book.author, 1, 0
  );

  return query
    select v_order_id, v_order_number, v_order_status, v_payment_status, v_shipping_price, v_expires;
end;
$$;

revoke all on function create_reservation from public;
grant execute on function create_reservation to service_role;

-- ---------------------------------------------------------------------------
-- Admin: Bestellstatus ändern. Gibt bei Stornierung/Ablauf den reservierten
-- Bestand automatisch zurück — und zwar nur einmal, auch bei mehrfachem
-- Aufruf.
-- ---------------------------------------------------------------------------
create or replace function admin_update_order_status(p_order_id uuid, p_new_status order_status)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_item order_items%rowtype;
  v_should_restore_stock boolean;
begin
  select * into v_order from orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_should_restore_stock := p_new_status in ('cancelled', 'expired')
    and v_order.order_status not in ('cancelled', 'expired');

  update orders set order_status = p_new_status where id = p_order_id
    returning * into v_order;

  if v_should_restore_stock then
    for v_item in select * from order_items where order_id = p_order_id loop
      if v_item.book_id is not null then
        update books
          set stock_available = least(stock_total, stock_available + v_item.quantity)
        where id = v_item.book_id;
      end if;
    end loop;
  end if;

  return v_order;
end;
$$;

revoke all on function admin_update_order_status from public;
grant execute on function admin_update_order_status to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: Zahlung manuell bestätigen (immer nur payment_status betroffen,
-- eine einzelne Zeile — keine Bestandslogik nötig).
-- ---------------------------------------------------------------------------
create or replace function admin_confirm_payment(p_order_id uuid)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
begin
  update orders
    set payment_status = 'paid',
        order_status = case when order_status = 'awaiting_payment' then 'paid' else order_status end
  where id = p_order_id
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  return v_order;
end;
$$;

revoke all on function admin_confirm_payment from public;
grant execute on function admin_confirm_payment to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: Gesamtbestand eines Buches ändern, ohne bereits reservierten
-- Bestand zu verlieren.
-- ---------------------------------------------------------------------------
create or replace function admin_set_stock_total(p_book_id uuid, p_new_total integer)
returns books
language plpgsql
security definer
set search_path = public
as $$
declare
  v_book books%rowtype;
  v_reserved integer;
begin
  select * into v_book from books where id = p_book_id for update;
  if v_book.id is null then
    raise exception 'BOOK_NOT_FOUND' using errcode = 'P0003';
  end if;

  v_reserved := v_book.stock_total - v_book.stock_available;

  if p_new_total < v_reserved then
    raise exception 'STOCK_TOTAL_BELOW_RESERVED' using errcode = 'P0004';
  end if;

  update books
    set stock_total = p_new_total,
        stock_available = p_new_total - v_reserved
  where id = p_book_id
  returning * into v_book;

  return v_book;
end;
$$;

revoke all on function admin_set_stock_total from public;
grant execute on function admin_set_stock_total to authenticated;
