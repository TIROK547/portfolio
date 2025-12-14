interface FooterProps {
  translations: any;
}

export default function Footer({ translations }: FooterProps) {
  return (
    <footer className="border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-terminal-bg-light dark:bg-terminal-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60 font-mono">
          <span className="text-terminal-accent-red">$</span> {translations.footer.text}
        </div>
      </div>
    </footer>
  );
}
