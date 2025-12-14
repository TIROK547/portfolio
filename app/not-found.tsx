import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-terminal-bg-dark text-terminal-text-dark min-h-screen flex items-center justify-center font-mono">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-terminal-accent-pink">404</span>
          </h1>
          <p className="text-xl mb-8">
            <span className="text-terminal-accent-cyan">$</span> command not found
          </p>
          <Link
            href="/en"
            className="inline-block px-6 py-2 border border-terminal-text-dark hover:border-terminal-accent-amber hover:text-terminal-accent-cyan transition-colors"
          >
            <span className="text-terminal-accent-pink">→</span> return home
          </Link>
        </div>
      </body>
    </html>
  );
}
