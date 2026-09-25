// Editable site info. Client-safe (no server imports): used by pages, the DB layer and the editor form.

export interface StackGroup {
  category: string
  items: string[]
}

export interface SiteSettings {
  profile: {
    name: string
    alias: string
    role: string
    location: string
    birthDate: string // YYYY-MM-DD, age is computed from it
    bio: string // paragraphs separated by a blank line; "{age}" is replaced by the current age
  }
  contact: {
    email: string
    telegram: string // handle, no @
    github: string // username
    linkedin: string // full https URL, or empty
    intro: string
    status: string
    responseTime: string
    timezone: string
  }
  stack: StackGroup[] // hero + "stack overview" on the home page
  skills: StackGroup[] // about page
  interests: string[]
  resumeUpdated: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  profile: {
    name: 'Alireza Ghotbi',
    alias: 'tirok',
    role: 'Junior Full Stack Web Developer',
    location: 'Tehran, Iran',
    birthDate: '2006-11-14',
    bio:
      "I'm Alireza Ghotbi, a {age}-year-old full-stack developer from Iran. I build web applications with a focus on clean architecture and modern technologies. My journey in programming started with curiosity and evolved into a passion for creating efficient, scalable solutions.\n\n" +
      "I specialize in backend development with Django and frontend with Next.js, but I enjoy working across the entire stack. When I'm not coding, I'm probably exploring new technologies or optimizing my Arch Linux setup.",
  },
  contact: {
    email: 'dev@tirok.ir',
    telegram: 'xyaes',
    github: 'tirok547',
    linkedin: '',
    intro:
      "Thanks for checking out my portfolio! I'm always interested in discussing new projects, collaborations, or just chatting about technology.",
    status: 'Available for freelance work',
    responseTime: 'Usually within 24 hours',
    timezone: 'GMT+3:30 (Iran)',
  },
  stack: [
    { category: 'frontend', items: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React'] },
    {
      category: 'backend',
      items: ['Django', 'Django REST Framework', 'JWT Auth', 'PostgreSQL', 'Celery', 'Redis', 'RabbitMQ', 'Channels'],
    },
    { category: 'devops', items: ['Docker', 'Nginx', 'Cloudflared', 'systemd', 'Arch Linux'] },
    { category: 'extras', items: ['Telegram Bots', 'WebSocket'] },
  ],
  skills: [
    { category: 'languages', items: ['JavaScript', 'TypeScript', 'Python', 'Bash'] },
    { category: 'frameworks', items: ['Next.js', 'React', 'Django', 'Django REST Framework'] },
    { category: 'databases', items: ['PostgreSQL', 'Redis', 'RabbitMQ'] },
    { category: 'tools', items: ['Docker', 'Git', 'Nginx', 'Linux'] },
  ],
  interests: [
    'Backend Architecture',
    'System Design',
    'Performance Optimization',
    'Open Source',
    'Linux & CLI Tools',
    'Automation',
  ],
  resumeUpdated: 'July 2026',
}

/** Fill any missing section/field from the defaults, so settings saved by an older version keep working. */
export function mergeSettings(stored: unknown): SiteSettings {
  const s = (stored && typeof stored === 'object' ? stored : {}) as Partial<SiteSettings>
  const groups = (v: unknown, fallback: StackGroup[]) => (Array.isArray(v) ? (v as StackGroup[]) : fallback)
  return {
    profile: { ...DEFAULT_SETTINGS.profile, ...(s.profile ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact ?? {}) },
    stack: groups(s.stack, DEFAULT_SETTINGS.stack),
    skills: groups(s.skills, DEFAULT_SETTINGS.skills),
    interests: Array.isArray(s.interests) ? s.interests : DEFAULT_SETTINGS.interests,
    resumeUpdated: typeof s.resumeUpdated === 'string' ? s.resumeUpdated : DEFAULT_SETTINGS.resumeUpdated,
  }
}

export function ageFrom(birthDate: string, now = new Date()): number {
  const b = new Date(`${birthDate}T00:00:00Z`)
  if (Number.isNaN(b.getTime())) return 0
  let age = now.getUTCFullYear() - b.getUTCFullYear()
  const hadBirthday =
    now.getUTCMonth() > b.getUTCMonth() ||
    (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() >= b.getUTCDate())
  if (!hadBirthday) age--
  return Math.max(age, 0)
}

export function bioParagraphs(bio: string, age: number): string[] {
  return bio
    .replace(/\{age\}/g, String(age))
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** "frontend: Next.js, React" per line  <->  StackGroup[] (used by the editor form). */
export function groupsToText(groups: StackGroup[]): string {
  return groups.map((g) => `${g.category}: ${g.items.join(', ')}`).join('\n')
}
export function textToGroups(text: string): StackGroup[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':')
      const category = (i === -1 ? line : line.slice(0, i)).trim()
      const items = (i === -1 ? '' : line.slice(i + 1)).split(',').map((s) => s.trim()).filter(Boolean)
      return { category, items }
    })
}
export const linesToList = (text: string): string[] =>
  text.split('\n').map((l) => l.trim()).filter(Boolean)
