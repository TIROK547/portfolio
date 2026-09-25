import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'
import AdminBackLink from '@/components/admin/AdminBackLink'
import { requireAdminPage } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage()
  const siteUrl = process.env.SITE_URL ?? 'https://portfolio.tirok.ir'

  return (
    <>
      <header className="border-b border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between text-sm">
          <Link href="/" className="font-bold">
            <span className="text-terminal-accent-pink">$</span> admin
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/" className="hover:text-terminal-accent-cyan transition-colors">posts</Link>
            <Link href="/projects" className="hover:text-terminal-accent-cyan transition-colors">projects</Link>
            <Link href="/comments" className="hover:text-terminal-accent-cyan transition-colors">comments</Link>
            <Link href="/settings" className="hover:text-terminal-accent-cyan transition-colors">settings</Link>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terminal-accent-cyan transition-colors">
              site
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AdminBackLink />
        {children}
      </main>
    </>
  )
}
