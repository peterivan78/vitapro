'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  ['/admin', 'Objednávky'],
  ['/admin/klienti', 'Klienti'],
  ['/admin/produkty', 'Produkty'],
  ['/admin/ico', 'Zoznam IČO'],
  ['/admin/nastavenia', 'Nastavenia'],
] as const

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Administrácia" className="-mb-px flex gap-6 overflow-x-auto text-sm">
      {LINKS.map(([href, label]) => {
        const active = href === '/admin' ? pathname === '/admin' || pathname.startsWith('/admin/objednavky') : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 py-4 ${active ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-soft hover:text-ink'}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
