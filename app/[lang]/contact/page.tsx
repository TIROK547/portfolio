import BackLink from '@/components/BackLink';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { contact: c } = getSettings();

  const contacts = [
    { label: 'email', value: c.email, href: `mailto:${c.email}`, icon: '📧' },
    ...(c.telegram ? [{ label: 'telegram', value: `@${c.telegram}`, href: `https://t.me/${c.telegram}`, icon: '✈' }] : []),
    ...(c.github ? [{ label: 'github', value: c.github, href: `https://github.com/${c.github}`, icon: '🔗' }] : []),
    { label: 'linkedin', value: c.linkedin ? c.linkedin.replace(/^https:\/\/(www\.)?/, '') : 'Coming soon...', href: c.linkedin || '#', icon: '💼' },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink fallback={`/${lang}`} className="inline-block mb-6" />
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-4">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">cat</span> <span className="text-terminal-accent-blue">contact.conf</span>
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20" />
        </div>

        {/* Intro */}
        <div className="mb-8 sm:mb-12">
          <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 sm:p-6 terminal-window">
            <div className="absolute top-0 left-0 right-0 h-6 border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20 flex items-center px-2 gap-2">
              <span className="text-xs text-terminal-accent-pink">●</span>
              <span className="text-xs text-terminal-accent-cyan">●</span>
              <span className="text-xs text-terminal-text-dark">●</span>
              <span className="text-xs ml-2">greeting.txt</span>
            </div>
            <div className="mt-4 text-terminal-text-light/80 dark:text-terminal-text-dark/80">
              <p className="mb-4">
                {c.intro}
              </p>
              <p className="text-sm">
                Feel free to reach out through any of the channels below:
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 hover:border-terminal-accent-amber dark:hover:border-terminal-accent-amber transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{contact.icon}</span>
                <div className="flex-1">
                  <div className="text-terminal-accent-cyan text-sm mb-1">
                    {contact.label}:
                  </div>
                  {contact.href === '#' ? (
                    <span className="text-terminal-text-light/60 dark:text-terminal-text-dark/60">
                      {contact.value}
                    </span>
                  ) : (
                    <a
                      href={contact.href}
                      target={contact.href.startsWith('http') ? '_blank' : undefined}
                      rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-terminal-accent-yellow hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors group-hover:underline"
                    >
                      {contact.value}
                    </a>
                  )}
                </div>
                {contact.href !== '#' && (
                  <span className="text-terminal-accent-pink opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-terminal-text-dark animate-pulse">●</span>
              <span className="text-terminal-accent-cyan">status:</span>
              <span className="text-terminal-accent-yellow">
                {c.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-terminal-text-dark animate-pulse">●</span>
              <span className="text-terminal-accent-cyan">response_time:</span>
              <span className="text-terminal-accent-yellow">
                {c.responseTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-terminal-text-dark animate-pulse">●</span>
              <span className="text-terminal-accent-cyan">timezone:</span>
              <span className="text-terminal-accent-yellow">
                {c.timezone}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 pt-6">
          <p className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            <span className="text-terminal-accent-red">$</span> Looking forward to hearing from you!
          </p>
        </div>
      </div>
    </div>
  );
}
