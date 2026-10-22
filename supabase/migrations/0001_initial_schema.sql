-- VITAPRO objednávkový systém – počiatočná schéma.
--
-- Bezpečnostný model:
--   * Všetky zápisy idú cez serverové akcie Next.js so service-role kľúčom,
--     ktoré si samy overia prihláseného používateľa a jeho oprávnenia.
--   * RLS je zapnuté na všetkých tabuľkách. Prehliadač (anon / authenticated)
--     smie len čítať: aktívny katalóg a vlastné záznamy. Nič viac.

create extension if not exists pgcrypto;

create type public.product_status as enum ('active', 'unavailable', 'archived');
create type public.profile_status as enum ('pending', 'approved', 'blocked');
create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('new', 'processing', 'completed', 'cancelled');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Produkty
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  composition text not null default '',
  nutrition text not null default '',
  volume text not null default '0,33 l',
  accent_color text not null default '#1d1b1a',
  illustration_url text,
  photo_url text,
  status public.product_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_accent_color_hex check (accent_color ~ '^#[0-9a-fA-F]{6}$')
);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Nastavenia (jediný riadok)
-- ---------------------------------------------------------------------------
create table public.settings (
  id integer primary key default 1 check (id = 1),
  order_email text not null default 'objednavky@vita-pro.sk',
  registration_notify_email text not null default 'objednavky@vita-pro.sk',
  sales_name text not null default 'Obchodné oddelenie',
  sales_email text not null default 'objednavky@vita-pro.sk',
  sales_phone text not null default '',
  auto_approve_known_ico boolean not null default false,
  crate_size integer not null default 12 check (crate_size between 1 and 100),
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Zoznam IČO existujúcich klientov
-- ---------------------------------------------------------------------------
create table public.client_whitelist (
  ico text primary key check (ico ~ '^[0-9]{6,10}$'),
  company_name text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profily zákazníkov / administrátorov
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  company_name text not null default '',
  ico text not null default '',
  dic text not null default '',
  ic_dph text not null default '',
  contact_name text not null default '',
  phone text not null default '',
  billing_street text not null default '',
  billing_city text not null default '',
  billing_zip text not null default '',
  billing_country text not null default 'Slovensko',
  status public.profile_status not null default 'pending',
  role public.user_role not null default 'customer',
  ico_known boolean not null default false,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_status_idx on public.profiles (status);
create index profiles_ico_idx on public.profiles (ico);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profil sa vytvorí automaticky pri registrácii z údajov formulára
-- (raw_user_meta_data). Rola a stav sa z metadát NIKDY nepreberajú –
-- registráciu cez API mimo formulára teda nejde použiť na získanie práv.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_ico text := regexp_replace(coalesce(meta ->> 'ico', ''), '\s', '', 'g');
  v_known boolean;
  v_auto boolean;
begin
  select exists (select 1 from public.client_whitelist w where w.ico = v_ico) into v_known;
  select auto_approve_known_ico into v_auto from public.settings where id = 1;

  insert into public.profiles (
    id, email, company_name, ico, dic, ic_dph, contact_name, phone,
    billing_street, billing_city, billing_zip, billing_country,
    ico_known, status, approved_at, terms_accepted_at, privacy_accepted_at
  ) values (
    new.id,
    new.email,
    left(coalesce(meta ->> 'company_name', ''), 200),
    left(v_ico, 10),
    left(coalesce(meta ->> 'dic', ''), 20),
    left(coalesce(meta ->> 'ic_dph', ''), 20),
    left(coalesce(meta ->> 'contact_name', ''), 120),
    left(coalesce(meta ->> 'phone', ''), 40),
    left(coalesce(meta ->> 'billing_street', ''), 200),
    left(coalesce(meta ->> 'billing_city', ''), 120),
    left(coalesce(meta ->> 'billing_zip', ''), 12),
    left(coalesce(nullif(meta ->> 'billing_country', ''), 'Slovensko'), 60),
    v_known,
    case when v_known and coalesce(v_auto, false) then 'approved'::public.profile_status else 'pending'::public.profile_status end,
    case when v_known and coalesce(v_auto, false) then now() else null end,
    case when (meta ->> 'terms_accepted') = 'true' then now() else null end,
    case when (meta ->> 'privacy_accepted') = 'true' then now() else null end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Dodacie adresy
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default '',
  company text not null default '',
  street text not null,
  city text not null,
  zip text not null,
  country text not null default 'Slovensko',
  contact_name text not null default '',
  contact_phone text not null default '',
  note text not null default '',
  is_default boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_profile_idx on public.addresses (profile_id);

-- ---------------------------------------------------------------------------
-- Objednávky
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid references public.profiles (id) on delete set null,
  status public.order_status not null default 'new',
  customer jsonb not null,
  delivery_address jsonb not null,
  requested_delivery_date date,
  note text not null default '',
  total_units integer not null check (total_units > 0),
  crates integer not null check (crates > 0),
  crate_size integer not null,
  customer_email_sent_at timestamptz,
  internal_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_profile_idx on public.orders (profile_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  line_no integer not null,
  sku text not null,
  name text not null,
  quantity integer not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- Atomické vytvorenie objednávky + položiek s číslom OBJ-RRRR-NNNNN.
-- Volá ju výhradne server (service role) po overení všetkých pravidiel.
create or replace function public.create_order(
  p_profile_id uuid,
  p_customer jsonb,
  p_delivery jsonb,
  p_requested_date date,
  p_note text,
  p_crate_size integer,
  p_items jsonb
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

  v_number := 'OBJ-' || to_char(now() at time zone 'Europe/Bratislava', 'YYYY') || '-'
    || lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, profile_id, customer, delivery_address, requested_delivery_date,
    note, total_units, crates, crate_size
  ) values (
    v_number, p_profile_id, p_customer, p_delivery, p_requested_date,
    coalesce(p_note, ''), v_units, v_units / p_crate_size, p_crate_size
  )
  returning id, orders.created_at into v_id, v_created;

  insert into public.order_items (order_id, product_id, line_no, sku, name, quantity)
  select v_id, (e.i ->> 'product_id')::uuid, e.n::integer,
         e.i ->> 'sku', e.i ->> 'name', (e.i ->> 'quantity')::integer
  from jsonb_array_elements(p_items) with ordinality as e(i, n);

  return query select v_id, v_number, v_created;
end;
$$;

revoke all on function public.create_order(uuid, jsonb, jsonb, date, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(uuid, jsonb, jsonb, date, text, integer, jsonb) to service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Oprávnenia rolí (projekt má vypnuté „Automatically expose new tables“)
--   service_role – server (Next.js serverové akcie): plný prístup, obchádza RLS
--   authenticated – prihlásený používateľ: len čítanie, ďalej obmedzené RLS
--   anon – návštevník: len čítanie katalógu
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select on public.products to anon, authenticated;
grant select on public.profiles, public.addresses, public.orders, public.order_items to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.client_whitelist enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Katalóg je verejný (bez vyradených)" on public.products
  for select to anon, authenticated using (status <> 'archived');

create policy "Vlastný profil" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "Vlastné adresy" on public.addresses
  for select to authenticated using (profile_id = auth.uid());

create policy "Vlastné objednávky" on public.orders
  for select to authenticated using (profile_id = auth.uid());

create policy "Položky vlastných objednávok" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid())
  );

-- settings a client_whitelist: žiadne politiky => dostupné len pre server.

-- ---------------------------------------------------------------------------
-- Úložisko obrázkov produktov (verejné čítanie, zápis len server)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
