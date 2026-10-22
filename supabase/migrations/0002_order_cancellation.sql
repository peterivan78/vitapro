-- Zrušenie objednávky zákazníkom (odkaz v potvrdzovacom emaile alebo v účte).
-- V DB sa ukladá len SHA-256 odtlačok tokenu, nie samotný token.
alter table public.orders
  add column if not exists cancel_token_hash text unique,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_via text check (cancelled_via in ('email', 'account', 'admin'));

-- Lehota na zrušenie v minútach od odoslania (0 = zrušenie vypnuté).
-- Po nej už objednávka mohla byť spracovaná v internom systéme.
alter table public.settings
  add column if not exists cancel_window_minutes integer not null default 120
    check (cancel_window_minutes between 0 and 10080);
