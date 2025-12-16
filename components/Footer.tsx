'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState<number>(547);

  useEffect(() => {
    // Get visitor count from localStorage
    const storedCount = localStorage.getItem('visitorCount');

    if (storedCount) {
      setVisitorCount(parseInt(storedCount));
    } else {
      // First visit, set to 547
      localStorage.setItem('visitorCount', '547');
      setVisitorCount(547);
    }

    // Increment count on each visit
    const incrementCount = () => {
      const currentCount = parseInt(localStorage.getItem('visitorCount') || '547');
      const newCount = currentCount + 1;
      localStorage.setItem('visitorCount', newCount.toString());
      setVisitorCount(newCount);
    };

    // Only increment once per session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      incrementCount();
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <footer className="border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-terminal-bg-light dark:bg-terminal-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60 font-mono flex flex-wrap gap-3">
          <span>
            <span className="text-terminal-accent-red">$</span> system status: online | last updated: 2025
          </span>
          <span className="text-terminal-accent-cyan">
            | visitors: <span className="text-terminal-accent-yellow">{visitorCount.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
