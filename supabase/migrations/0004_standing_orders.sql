-- Trvalé (pravidelné) objednávky. Web ich pošle obchodu RAZ, dodávky potom
-- plánuje interný systém ActiWhere. Zmena = nová trvalá objednávka, ktorá
-- nahrádza pôvodnú; ukončenie = standing_ended_at.
alter table public.orders
  add column if not exists recurrence text check (recurrence in ('weekly', 'biweekly', 'monthly')),
  add column if not exists replaces_order_id uuid references public.orders (id) on delete set null,
  add column if not exists standing_ended_at timestamptz;

create index if not exists orders_standing_idx on public.orders (profile_id)
  where recurrence is not null and standing_ended_at is null;

-- Rozšírená verzia create_order (pôvodná ostáva kvôli kompatibilite).
create or replace function public.create_order(
  p_profile_id uuid,
  p_customer jsonb,
  p_delivery jsonb,
  p_requested_date date,
  p_note text,
  p_crate_size integer,
  p_items jsonb,
  p_recurrence text,
  p_replaces_order_id uuid
)
returns table (order_id uuid, order_number text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_number text;
  v_created timestamptz;
  v_units integer;
begin
  select coalesce(sum((i ->> 'quantity')::integer), 0) into v_units
  from jsonb_array_elements(p_items) i;

  if v_units <= 0 or v_units % p_crate_size <> 0 then
    raise exception 'Počet kusov musí byť násobkom %', p_crate_size;
  end if;

  if p_replaces_order_id is not null and not exists (
    select 1 from public.orders o
    where o.id = p_replaces_order_id and o.profile_id = p_profile_id
      and o.recurrence is not null and o.standing_ended_at is null and o.status <> 'cancelled'
  ) then
    raise exception 'Pôvodná pravidelná dodávka už neplatí';
  end if;

  v_number := 'OBJ-' || to_char(now() at time zone 'Europe/Bratislava', 'YYYY') || '-'
    || lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, profile_id, customer, delivery_address, requested_delivery_date,
    note, total_units, crates, crate_size, recurrence, replaces_order_id
  ) values (
    v_number, p_profile_id, p_customer, p_delivery, p_requested_date,
    coalesce(p_note, ''), v_units, v_units / p_crate_size, p_crate_size, p_recurrence, p_replaces_order_id
  )
  returning id, orders.created_at into v_id, v_created;

  insert into public.order_items (order_id, product_id, line_no, sku, name, quantity)
  select v_id, (e.i ->> 'product_id')::uuid, e.n::integer,
         e.i ->> 'sku', e.i ->> 'name', (e.i ->> 'quantity')::integer
  from jsonb_array_elements(p_items) with ordinality as e(i, n);

  if p_replaces_order_id is not null then
    update public.orders set standing_ended_at = now() where id = p_replaces_order_id;
  end if;

  return query select v_id, v_number, v_created;
end;
$$;

revoke all on function public.create_order(uuid, jsonb, jsonb, date, text, integer, jsonb, text, uuid) from public, anon, authenticated;
grant execute on function public.create_order(uuid, jsonb, jsonb, date, text, integer, jsonb, text, uuid) to service_role;
