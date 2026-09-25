'use client'

import { useState } from 'react'
import { groupsToText, linesToList, textToGroups, type SiteSettings } from '@/lib/settings'

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-terminal-text-dark/20 p-4 space-y-4">
      <legend className="px-2 text-sm text-terminal-accent-green">{title}</legend>
      {hint && <p className="text-xs text-terminal-text-dark/50 -mt-1">{hint}</p>}
      {children}
    </fieldset>
  )
}

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [profile, setProfile] = useState(initial.profile)
  const [contact, setContact] = useState(initial.contact)
  const [stack, setStack] = useState(groupsToText(initial.stack))
  const [skills, setSkills] = useState(groupsToText(initial.skills))
  const [interests, setInterests] = useState(initial.interests.join('\n'))
  const [resumeUpdated, setResumeUpdated] = useState(initial.resumeUpdated)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const setP = (k: keyof SiteSettings['profile']) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [k]: e.target.value })
    setSaved(false)
  }
  const setC = (k: keyof SiteSettings['contact']) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact({ ...contact, [k]: e.target.value })
    setSaved(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        contact,
        stack: textToGroups(stack),
        skills: textToGroups(skills),
        interests: linesToList(interests),
        resumeUpdated,
      }),
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (res?.ok) setSaved(true)
    else setError(data.error ?? 'could not reach the server')
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Section title="profile">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="adm-label" htmlFor="s-name">full name</label>
            <input id="s-name" className="adm-input" value={profile.name} onChange={setP('name')} required maxLength={60} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-alias">alias (also the name on your replies)</label>
            <input id="s-alias" className="adm-input" value={profile.alias} onChange={setP('alias')} required maxLength={30} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-role">role</label>
            <input id="s-role" className="adm-input" value={profile.role} onChange={setP('role')} required maxLength={80} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-loc">location</label>
            <input id="s-loc" className="adm-input" value={profile.location} onChange={setP('location')} required maxLength={60} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-birth">birth date (age is calculated)</label>
            <input id="s-birth" type="date" className="adm-input" value={profile.birthDate} onChange={setP('birthDate')} required />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor="s-bio">bio</label>
          <textarea id="s-bio" className="adm-input h-56 resize-y" value={profile.bio} onChange={setP('bio')} required maxLength={3000} />
          <p className="text-xs text-terminal-text-dark/50 mt-1">
            Blank line = new paragraph. Write <code>{'{age}'}</code> where the age should appear. The first paragraph is also used on the home page and in the info card.
          </p>
        </div>
      </Section>

      <Section title="contact">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="adm-label" htmlFor="s-email">email</label>
            <input id="s-email" type="email" className="adm-input" value={contact.email} onChange={setC('email')} required maxLength={120} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-tg">telegram (handle only)</label>
            <input id="s-tg" className="adm-input" value={contact.telegram} onChange={setC('telegram')} placeholder="xyaes" maxLength={40} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-gh">github (username only)</label>
            <input id="s-gh" className="adm-input" value={contact.github} onChange={setC('github')} placeholder="tirok547" maxLength={60} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-li">linkedin (full https URL, empty = "coming soon")</label>
            <input id="s-li" className="adm-input" value={contact.linkedin} onChange={setC('linkedin')} placeholder="https://linkedin.com/in/…" maxLength={200} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-status">availability status</label>
            <input id="s-status" className="adm-input" value={contact.status} onChange={setC('status')} required maxLength={100} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-resp">response time</label>
            <input id="s-resp" className="adm-input" value={contact.responseTime} onChange={setC('responseTime')} required maxLength={100} />
          </div>
          <div>
            <label className="adm-label" htmlFor="s-tz">timezone</label>
            <input id="s-tz" className="adm-input" value={contact.timezone} onChange={setC('timezone')} required maxLength={60} />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor="s-intro">intro text on the contact page</label>
          <textarea id="s-intro" className="adm-input h-24 resize-y" value={contact.intro} onChange={setC('intro')} required maxLength={600} />
        </div>
      </Section>

      <Section title="tech stack" hint="Home page. One group per line as  name: item, item, item  (the hero shows the first 3 groups, 4 items each).">
        <textarea className="adm-input h-40 resize-y font-mono" value={stack} onChange={(e) => { setStack(e.target.value); setSaved(false) }} aria-label="tech stack" />
      </Section>

      <Section title="skills" hint="About page. Same format: one group per line.">
        <textarea className="adm-input h-32 resize-y font-mono" value={skills} onChange={(e) => { setSkills(e.target.value); setSaved(false) }} aria-label="skills" />
      </Section>

      <Section title="interests" hint="About page. One per line.">
        <textarea className="adm-input h-32 resize-y" value={interests} onChange={(e) => { setInterests(e.target.value); setSaved(false) }} aria-label="interests" />
      </Section>

      <Section title="resume" hint="The PDF itself is still /public/resume.pdf in the repo; this is just the “last updated” text.">
        <input className="adm-input sm:max-w-xs" value={resumeUpdated} onChange={(e) => { setResumeUpdated(e.target.value); setSaved(false) }} maxLength={40} aria-label="resume last updated" />
      </Section>

      {error && <p role="alert" className="text-sm text-terminal-accent-red">{error}</p>}
      {saved && <p role="status" className="text-sm text-terminal-accent-green">saved.</p>}
      <button className="adm-btn adm-btn-primary" disabled={busy}>{busy ? 'saving…' : 'save settings'}</button>
    </form>
  )
}
