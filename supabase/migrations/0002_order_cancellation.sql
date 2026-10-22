-- Zrušenie objednávky zákazníkom (odkaz v potvrdzovacom emaile alebo v účte).
-- V DB sa ukladá len SHA-256 odtlačok tokenu, nie samotný token.
alter table public.orders
  add column if not exists cancel_token_hash text unique,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_via text check (cancelled_via in ('email', 'account', 'admin'));
