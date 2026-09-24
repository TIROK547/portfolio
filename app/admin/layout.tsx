import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'blog admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-screen bg-terminal-bg-dark text-terminal-text-dark">{children}</div>
  )
}
