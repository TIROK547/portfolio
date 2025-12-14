import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alireza Ghotbi (tirok) - Full Stack Developer',
  description: 'Portfolio of Alireza Ghotbi, a Junior Full Stack Web Developer specializing in Next.js, Django, and modern web technologies.',
  keywords: ['web developer', 'full stack', 'next.js', 'django', 'react', 'typescript'],
  authors: [{ name: 'Alireza Ghotbi', url: 'https://github.com/tirok547' }],
  openGraph: {
    title: 'Alireza Ghotbi (tirok) - Full Stack Developer',
    description: 'Portfolio of Alireza Ghotbi, a Junior Full Stack Web Developer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                // Default to dark mode
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="bg-terminal-bg-light dark:bg-terminal-bg-dark text-terminal-text-light dark:text-terminal-text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
