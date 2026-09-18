-- Kittrack Bücherplattform — Initial-Schema
-- Legt Bücher, Bestellungen, Bestellpositionen und Einstellungen an.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- books
-- ---------------------------------------------------------------------------
create type book_category as enum (
  'Deen',
  'Persönlichkeitsentwicklung',
  'Finanzen',
  'Wirtschaft',
  'Geschichte',
  'Gesundheit',
  'Biografie',
  'Sonstiges'
);

create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  author text not null check (char_length(trim(author)) > 0),
  category book_category not null default 'Sonstiges',
  description text,
  condition text,
  image_url text,
  stock_total integer not null default 1 check (stock_total >= 0),
  stock_available integer not null default 1 check (stock_available >= 0),
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_available_not_over_total check (stock_available <= stock_total)
);

create index books_active_idx on books (active);
create index books_category_idx on books (category);

-- ---------------------------------------------------------------------------
-- settings (Singleton-Zeile)
-- ---------------------------------------------------------------------------
create table settings (
  id boolean primary key default true constraint settings_singleton check (id),
  shipping_price numeric(10, 2) not null default 4.99 check (shipping_price >= 0),
  payment_url text,
  reservation_duration_hours integer not null default 24 check (reservation_duration_hours > 0),
  updated_at timestamptz not null default now()
);

insert into settings (id) values (true);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create type delivery_type as enum ('pickup', 'shipping');

create type payment_status as enum ('not_required', 'pending', 'paid');

create type order_status as enum (
  'reserved',
  'awaiting_payment',
  'paid',
  'packing',
  'shipped',
  'ready_for_pickup',
  'completed',
  'cancelled',
  'expired'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  public_order_number text not null unique,
  delivery_type delivery_type not null,
  first_name text not null check (char_length(trim(first_name)) > 0),
  last_name text not null check (char_length(trim(last_name)) > 0),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  social_handle text,
  street text,
  house_number text,
  postal_code text,
  city text,
  country text default 'Deutschland',
  shipping_price numeric(10, 2) not null default 0 check (shipping_price >= 0),
  payment_status payment_status not null default 'not_required',
  order_status order_status not null default 'reserved',
  reservation_expires_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipping_address_required check (
    delivery_type = 'pickup'
    or (
      street is not null
      and house_number is not null
      and postal_code is not null
      and city is not null
      and country is not null
    )
  )
);

create index orders_status_idx on orders (order_status);
create index orders_payment_status_idx on orders (payment_status);
create index orders_created_at_idx on orders (created_at desc);
create index orders_email_idx on orders (email);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  book_id uuid references books (id) on delete set null,
  book_title_snapshot text not null,
  book_author_snapshot text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);
create index order_items_book_id_idx on order_items (book_id);

-- ---------------------------------------------------------------------------
-- updated_at Trigger
-- ---------------------------------------------------------------------------
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_set_updated_at
  before update on books
  for each row execute function set_updated_at();

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create trigger settings_set_updated_at
  before update on settings
  for each row execute function set_updated_at();
