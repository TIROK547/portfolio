import SettingsForm from '@/components/admin/SettingsForm'
import { getSettings } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-xl font-bold mb-2">
        <span className="text-terminal-accent-red">$</span> settings
      </h1>
      <p className="text-sm text-terminal-text-dark/60 mb-6">
        Everything here shows up on the public portfolio (home, about, contact and the info card). Changes are live right after saving.
      </p>
      <SettingsForm initial={getSettings()} />
    </>
  )
}
