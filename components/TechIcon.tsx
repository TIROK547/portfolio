interface TechIconProps {
  name: string;
  size?: number;
}

export default function TechIcon({ name, size = 16 }: TechIconProps) {
  const icons: Record<string, string> = {
    // Frontend
    'Next.js': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="12" height="12" fill="%231e2326" stroke="%23d3c6aa" stroke-width="0.5"/><text x="8" y="11" font-family="monospace" font-size="8" fill="%23d3c6aa" text-anchor="middle" font-weight="bold">N</text></svg>`,
    'React': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><ellipse cx="8" cy="8" rx="6" ry="3" fill="none" stroke="%2383c092" stroke-width="1"/><ellipse cx="8" cy="8" rx="6" ry="3" fill="none" stroke="%2383c092" stroke-width="1" transform="rotate(60 8 8)"/><ellipse cx="8" cy="8" rx="6" ry="3" fill="none" stroke="%2383c092" stroke-width="1" transform="rotate(120 8 8)"/><circle cx="8" cy="8" r="1.5" fill="%2383c092"/></svg>`,
    'TypeScript': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="12" height="12" fill="%237fbbb3"/><text x="8" y="11" font-family="monospace" font-size="8" fill="%231e2326" text-anchor="middle" font-weight="bold">TS</text></svg>`,
    'Tailwind CSS': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4,6 Q8,4 12,6 M4,10 Q8,8 12,10" fill="none" stroke="%237fbbb3" stroke-width="1.5"/></svg>`,
    'Tailwind': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4,6 Q8,4 12,6 M4,10 Q8,8 12,10" fill="none" stroke="%237fbbb3" stroke-width="1.5"/></svg>`,

    // Backend
    'Django': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="2" width="3" height="12" fill="%23a7c080"/><rect x="7" y="2" width="3" height="12" fill="%23a7c080"/><rect x="11" y="2" width="2" height="12" fill="%23a7c080"/></svg>`,
    'Django REST Framework': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="2" width="2" height="10" fill="%23a7c080"/><rect x="7" y="2" width="2" height="10" fill="%23a7c080"/><rect x="11" y="2" width="2" height="10" fill="%23a7c080"/><text x="8" y="15" font-family="monospace" font-size="4" fill="%23a7c080" text-anchor="middle">API</text></svg>`,
    'PostgreSQL': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><ellipse cx="8" cy="8" rx="5" ry="6" fill="none" stroke="%237fbbb3" stroke-width="1.5"/><path d="M8,2 L8,14 M3,8 L13,8" stroke="%237fbbb3" stroke-width="1"/></svg>`,
    'Redis': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="10" height="6" fill="none" stroke="%23e67e80" stroke-width="1"/><path d="M3,8 L13,8 M6,5 L6,11 M10,5 L10,11" stroke="%23e67e80" stroke-width="1"/></svg>`,
    'Celery': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8,3 L8,13 M5,5 L11,5 M5,8 L11,8 M5,11 L11,11" stroke="%23a7c080" stroke-width="1.5" stroke-linecap="square"/></svg>`,
    'RabbitMQ': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="8" height="6" fill="none" stroke="%23e69875" stroke-width="1"/><circle cx="6.5" cy="7.5" r="0.8" fill="%23e69875"/><circle cx="9.5" cy="7.5" r="0.8" fill="%23e69875"/><path d="M5,10 L7,10 M9,10 L11,10" stroke="%23e69875" stroke-width="1"/></svg>`,
    'Channels': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3,8 L6,8 M10,8 L13,8" stroke="%23a7c080" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="none" stroke="%23a7c080" stroke-width="1"/></svg>`,
    'WebSocket': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3,8 L6,8 M10,8 L13,8" stroke="%237fbbb3" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="none" stroke="%237fbbb3" stroke-width="1"/><path d="M6,6 L10,10 M10,6 L6,10" stroke="%237fbbb3" stroke-width="1"/></svg>`,
    'JWT Auth': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="8" height="5" fill="none" stroke="%23dbbc7f" stroke-width="1"/><rect x="7" y="4" width="2" height="2" fill="%23dbbc7f"/><circle cx="8" cy="8.5" r="1" fill="%23dbbc7f"/></svg>`,

    // DevOps
    'Docker': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="2.5" height="2.5" fill="%237fbbb3"/><rect x="5" y="7" width="2.5" height="2.5" fill="%237fbbb3"/><rect x="8" y="7" width="2.5" height="2.5" fill="%237fbbb3"/><rect x="11" y="7" width="2.5" height="2.5" fill="%237fbbb3"/><rect x="5" y="4" width="2.5" height="2.5" fill="%237fbbb3"/><path d="M2,10 L14,10 Q14,12 12,13 L4,13 Q2,12 2,10" fill="none" stroke="%237fbbb3" stroke-width="1"/></svg>`,
    'Nginx': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4,12 L4,4 L8,8 L8,4 L12,12 L12,4" fill="none" stroke="%23a7c080" stroke-width="1.5" stroke-linejoin="bevel"/></svg>`,
    'Arch Linux': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8,2 L4,14 M8,2 L12,14 M6,9 L10,9" stroke="%237fbbb3" stroke-width="1.5" stroke-linecap="square"/></svg>`,
    'Cloudflared': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3,10 Q5,8 8,8 Q11,8 13,10" fill="none" stroke="%23e69875" stroke-width="1.5"/><path d="M4,7 Q6,5.5 8,5.5 Q10,5.5 12,7" fill="none" stroke="%23e69875" stroke-width="1"/></svg>`,
    'systemd': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="5" fill="none" stroke="%23d3c6aa" stroke-width="1.5"/><path d="M8,5 L8,8 L10.5,10.5" stroke="%23d3c6aa" stroke-width="1.5" stroke-linecap="square"/></svg>`,

    // Languages
    'JavaScript': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="12" height="12" fill="%23dbbc7f"/><text x="8" y="11" font-family="monospace" font-size="8" fill="%231e2326" text-anchor="middle" font-weight="bold">JS</text></svg>`,
    'Python': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="4" fill="none" stroke="%237fbbb3" stroke-width="1"/><circle cx="10" cy="10" r="4" fill="none" stroke="%23dbbc7f" stroke-width="1"/><circle cx="6" cy="5" r="0.8" fill="%237fbbb3"/><circle cx="10" cy="11" r="0.8" fill="%23dbbc7f"/></svg>`,
    'Bash': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><text x="8" y="11" font-family="monospace" font-size="8" fill="%23a7c080" text-anchor="middle" font-weight="bold">$</text></svg>`,

    // Extras
    'Telegram Bots': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" fill="none" stroke="%237fbbb3" stroke-width="1"/><path d="M5,9 L11,5 L7,11 L7,8 L5,9" fill="%237fbbb3"/></svg>`,

    // Tools
    'Git': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="8" r="2" fill="none" stroke="%23e67e80" stroke-width="1"/><circle cx="12" cy="8" r="2" fill="none" stroke="%23e67e80" stroke-width="1"/><line x1="6" y1="8" x2="10" y2="8" stroke="%23e67e80" stroke-width="1"/></svg>`,
    'Linux': `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="6" r="2.5" fill="none" stroke="%23dbbc7f" stroke-width="1"/><path d="M6,8.5 Q6,12 4,14 M10,8.5 Q10,12 12,14 M6,14 L10,14" stroke="%23dbbc7f" stroke-width="1" fill="none"/></svg>`,
  };

  const icon = icons[name] || icons['React']; // fallback to React icon
  const encodedIcon = `data:image/svg+xml,${icon}`;

  return (
    <img
      src={encodedIcon}
      alt={name}
      width={size}
      height={size}
      className="inline-block"
      style={{
        imageRendering: 'pixelated',
        imageRendering: '-moz-crisp-edges' as any,
        imageRendering: 'crisp-edges' as any,
      }}
    />
  );
}
