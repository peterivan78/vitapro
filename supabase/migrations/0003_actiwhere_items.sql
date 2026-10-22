-- Identifikácia položiek podľa interného systému ActiWhere (Items_VITAPRO.xlsx).
alter table public.products add column if not exists erp_name text not null default '';

-- Prepravka ako samostatná položka v ActiWhere (počet = počet prepraviek v objednávke).
alter table public.settings
  add column if not exists crate_sku text not null default '80000225',
  add column if not exists crate_erp_name text not null default 'VITAPRO prepravka na 12 ks';

update public.products set sku = '80000224', erp_name = 'VITAPRO Áronilka 0,33 l' where slug = 'aronilka';
update public.products set sku = '80000217', erp_name = 'VITAPRO Broskyňka 0,33 l' where slug = 'broskyna';
update public.products set sku = '80000219', erp_name = 'VITAPRO Cvikla 0,33 l' where slug = 'cvikla';
update public.products set sku = '80000223', erp_name = 'VITAPRO Drienočka 0,33 l' where slug = 'drienocka';
update public.products set sku = '80000220', erp_name = 'VITAPRO Dulienka 0,33 l' where slug = 'dulienka';
update public.products set sku = '80000227', erp_name = 'VITAPRO Jabĺčko a ríbezľa 0,33 l' where slug = 'jablko-ribezla';
update public.products set sku = '80000218', erp_name = 'VITAPRO Marhulienka 0,33 l' where slug = 'marhulienka';
update public.products set sku = '80000222', erp_name = 'VITAPRO Mrkvička 0,33 l' where slug = 'mrkvicka';
update public.products set sku = '80000221', erp_name = 'VITAPRO Paradajka 0,33 l' where slug = 'paradajka';
