import Image from 'next/image'
import Link from 'next/link'
import { logoutAction } from '@/app/(auth)/actions'
import type { Viewer } from '@/lib/auth'

export function SiteHeader({ viewer }: { viewer: Viewer | null }) {
  const isAdmin = viewer?.profile?.role === 'admin'
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="VITAPRO – úvod" className="shrink-0">
          <Image src="/logo/vitapro.svg" alt="VITAPRO" width={250} height={46} priority className="h-6 w-auto sm:h-7" />
        </Link>

        <nav aria-label="Hlavná navigácia" className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          <Link href="/#stavy" className="hover:text-ink">Šťavy</Link>
          <Link href="/#ako-objednat" className="hover:text-ink">Ako objednať</Link>
          <Link href="/#kontakt" className="hover:text-ink">Kontakt</Link>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {viewer ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">
                  Admin
                </Link>
              )}
              <Link href="/ucet" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">
                Môj účet
              </Link>
              <form action={logoutAction}>
                <button className="btn btn-ghost !px-4 !py-2 text-sm">Odhlásiť</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/prihlasenie" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">
                Prihlásiť
              </Link>
              <Link href="/registracia" className="btn btn-primary !px-4 !py-2 text-sm">
                Registrácia
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
