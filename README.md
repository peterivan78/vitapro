# VITAPRO – objednávkový systém

B2B objednávky 100% prírodných štiav VITAPRO pre klientov **AQUA PRO EUROPE, a.s.** (bez cien).

- Jednostránkový web s ponukou 9 štiav, registrácia firiem, schvaľovanie klientov.
- Objednávka len pre **schválených** klientov, vždy v **násobkoch 12 ks** (celé prepravky, chute sa dajú miešať).
- Viac dodacích adries na klienta, história objednávok, „objednať znova“.
- Po objednávke: potvrdenie klientovi + **štruktúrovaný email** obchodu (text + JSON v tele aj ako príloha) pre internú AI.
- Admin (s dvojstupňovým overením): objednávky, klienti, produkty (aktívny / dočasne nedostupný / vyradený), zoznam IČO, nastavenia.

Technológie: Next.js 16, Supabase (databáza, prihlasovanie, súbory), Resend (emaily), Vercel (hosting).

## Podklady

Zdrojové podklady od klienta sú v [`podklady/`](podklady/) – logá, ilustrácie, fotky, texty, právne dokumenty.
Optimalizované verzie pre web sú v `public/`.

## Formát objednávky pre internú AI

Každá objednávka príde na adresu z nastavení (predvolene `objednavky@vita-pro.sk`):

- **Predmet:** `[OBJEDNÁVKA] OBJ-2026-00042 | Firma s.r.o. | IČO 12345678 | 36 ks`
- **Telo:** čitateľný súhrn + JSON medzi riadkami `----- BEGIN VITAPRO ORDER JSON -----` a `----- END VITAPRO ORDER JSON -----`
- **Príloha:** `objednavka-OBJ-2026-00042.json` (rovnaký obsah)

Schéma `vitapro.order.v1` je definovaná v [`src/lib/orders/orderPayload.ts`](src/lib/orders/orderPayload.ts).
Pri zmene štruktúry treba zvýšiť verziu, aby sa interná AI nepomýlila.

## Spustenie (prvé nasadenie)

1. **Supabase** – vytvoriť projekt (región EU, napr. Frankfurt).
   - SQL Editor → spustiť `supabase/migrations/0001_initial_schema.sql`, potom `supabase/seed.sql`.
   - Authentication → URL Configuration: *Site URL* = adresa webu, *Redirect URLs* = `https://<web>/auth/confirm`.
   - Authentication → Email Templates – v šablónach **Confirm signup** a **Reset password** nahradiť odkaz za:
     - potvrdenie: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ucet`
     - heslo: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/nove-heslo`
   - Authentication → Multi-Factor: zapnúť **TOTP**.
   - Authentication → SMTP: nastaviť Resend SMTP, aby aj systémové emaily chodili z `vita-pro.sk`.
2. **Resend** – pridať doménu `vita-pro.sk`, nastaviť DNS záznamy u správcu domény, vytvoriť API kľúč.
3. **Vercel** – importovať tento repozitár, doplniť premenné z `.env.example`, nasadiť.
4. **Prvý admin** – zaregistrovať sa na webe, potvrdiť email a v Supabase SQL Editore spustiť:
   ```sql
   update public.profiles set role = 'admin', status = 'approved' where email = 'vas@email.sk';
   ```
   Pri prvom vstupe do `/admin` web vyzve na nastavenie overovacej aplikácie (Google/Microsoft Authenticator).
5. V admine doplniť kontakt na obchodné oddelenie. ID a názvy produktov sú podľa ActiWhere (`podklady/produkty/Items_VITAPRO.xlsx`, migrácia 0003).

## Vývoj

```bash
npm install
cp .env.example .env.local   # doplniť hodnoty
npm run dev                  # http://localhost:3000
npm test                     # testy
npm run lint
```

Bez Supabase premenných beží web v režime náhľadu – zobrazí ponuku, ale prihlásenie a objednávky nefungujú.

## Bezpečnosť

- Všetky zápisy idú cez serverové akcie, ktoré samy overujú prihlásenie a oprávnenia (`src/lib/auth.ts`).
- V databáze je zapnuté RLS – prehliadač smie čítať len katalóg a vlastné záznamy.
- Rola a stav účtu sa pri registrácii nikdy nepreberajú z formulára.
- Admin vyžaduje dvojstupňové overenie (TOTP).
- Pravidlo „násobok 12 ks“ sa overuje v prehliadači, na serveri aj v databáze.
