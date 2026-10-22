import { requireAdminPage } from '@/lib/auth'
import { removeWhitelistAction } from '@/app/admin/actions'
import { AdminTitle, Empty } from '@/components/admin/ui'
import { createServiceClient } from '@/lib/supabase/server'
import { WhitelistForm } from './WhitelistForm'

export const metadata = { title: 'Zoznam IČO' }

export default async function AdminWhitelistPage() {
  await requireAdminPage()
  const { data: rows } = await createServiceClient().from('client_whitelist').select('*').order('company_name').order('ico')
  return (
    <>
      <AdminTitle title="Zoznam IČO existujúcich klientov" />
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Registrácia s IČO z tohto zoznamu sa v admine označí ako <em>známy klient</em>. Ak je v nastaveniach zapnuté
        automatické schválenie, účet sa schváli hneď. Inak ho stále treba schváliť ručne.
      </p>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <WhitelistForm />
        {(rows ?? []).length === 0 ? (
          <Empty>Zoznam je prázdny.</Empty>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line text-sm">
            {(rows ?? []).map((r) => (
              <li key={r.ico} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span>
                  <span className="font-mono">{r.ico}</span>
                  {r.company_name && <span className="ml-3 text-ink-soft">{r.company_name}</span>}
                </span>
                <form action={removeWhitelistAction}>
                  <input type="hidden" name="ico" value={r.ico} />
                  <button className="text-xs text-danger underline underline-offset-4">Odstrániť</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
