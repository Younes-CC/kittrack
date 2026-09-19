-- Härtung: Supabase vergibt standardmäßig EXECUTE auf neue Funktionen im
-- public-Schema an anon/authenticated (ALTER DEFAULT PRIVILEGES), unabhängig
-- vom expliziten "revoke ... from public" in 0003_functions.sql. Dadurch
-- konnten anon-Clients admin_* Funktionen und create_reservation direkt via
-- PostgREST RPC aufrufen (bestätigt über den Supabase Security Advisor).
-- Hier explizit von den konkreten Rollen entziehen.

revoke execute on function create_reservation(
  uuid, delivery_type, text, text, text, text, text, text, text, text, text
) from anon, authenticated;

revoke execute on function admin_confirm_payment(uuid) from anon;
revoke execute on function admin_set_stock_total(uuid, integer) from anon;
revoke execute on function admin_update_order_status(uuid, order_status) from anon;

-- search_path explizit fixieren (fehlte bisher bei diesen beiden
-- Hilfsfunktionen, siehe Security Advisor "function_search_path_mutable").
alter function set_updated_at() set search_path = public;
alter function generate_order_number() set search_path = public;
