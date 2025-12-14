# Portfolio Website - Alireza Ghotbi (tirok)

A retro terminal-inspired portfolio website with modern GUI structure, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🖥️ **Retro Terminal Aesthetic**: CRT effects, scanlines, and monospace fonts
- 🌓 **Dark/Light Theme**: Persistent theme switching with localStorage
- 🌍 **Bilingual Support**: English and Farsi (URL-based routing)
- 📱 **Fully Responsive**: Mobile-first design
- ⌨️ **Typing Sound Effects**: Subtle typing sounds on hero section
- 🎨 **Neofetch-Style Hero**: Custom ASCII art with system info display
- 🚀 **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React

### Styling
- Custom terminal color scheme
- CRT/scanline effects
- JetBrains Mono font
- Responsive design with Tailwind

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The site will be available at `http://localhost:3000` (or next available port).

## Project Structure

```
portfolio/
├── app/
│   ├── [lang]/              # Localized routes
│   │   ├── about/           # About page
│   │   ├── projects/        # Projects page
│   │   ├── contact/         # Contact page
│   │   ├── layout.tsx       # Language-specific layout
│   │   └── page.tsx         # Home page
│   ├── globals.css          # Global styles & CRT effects
│   ├── layout.tsx           # Root layout
│   └── not-found.tsx        # 404 page
├── components/
│   ├── AsciiArt.tsx         # ASCII art component
│   ├── Footer.tsx           # Footer component
│   ├── Header.tsx           # Header with navigation
│   ├── Hero.tsx             # Neofetch-style hero section
│   ├── ProjectCard.tsx      # Project display card
│   ├── StackDisplay.tsx     # Tech stack display
│   ├── ThemeProvider.tsx    # Theme context provider
│   └── TypingSound.tsx      # Typing sound effect hook
├── lib/
│   └── i18n.ts              # Internationalization config
└── public/
    ├── images/
    │   └── profile.jpg      # Profile picture
    └── sounds/              # Sound effects (if needed)
```

## Customization

### Adding Projects

Edit `app/[lang]/projects/page.tsx` and add new entries to the `projects` array:

```typescript
{
  name: 'Project Name',
  description: 'Project description',
  stack: ['Tech1', 'Tech2', 'Tech3'],
  github: 'https://github.com/username/repo',
  status: 'active' // 'active', 'wip', or 'archived'
}
```

### Updating Profile Picture

Replace `public/images/profile.jpg` with your own image.

### Modifying Translations

Edit `lib/i18n.ts` to update English and Farsi translations.

### Changing Color Scheme

Update the terminal colors in `tailwind.config.ts`:

```typescript
colors: {
  terminal: {
    bg: {
      dark: '#0a0a0a',  // Dark background
      light: '#f5f5f5', // Light background
    },
    text: {
      dark: '#00ff41',  // Terminal green
      light: '#0a3d0a', // Dark green
    },
    accent: {
      amber: '#ffb000', // Amber accent
      red: '#ff0000',   // Red accent
    }
  }
}
```

### Adjusting CRT Effects

Modify the CRT effects in `app/globals.css`:
- `.crt::before` - Scanline effect
- `.crt::after` - Flicker effect

To disable effects, comment out or remove these pseudo-elements.

## Pages

- **Home** (`/en` or `/fa`): Hero, about preview, stack, projects, contact
- **About** (`/en/about`): Full bio, skills, interests
- **Projects** (`/en/projects`): Portfolio projects with descriptions
- **Contact** (`/en/contact`): Contact information and availability

## Features Explained

### Theme Toggle
Click the theme button in the header to switch between dark and light modes. Preference is saved in localStorage.

### Language Toggle
Click the language button to switch between English (EN) and Farsi (FA). Uses URL-based routing (`/en/*` and `/fa/*`).

### Info Card
Click the [INFO] button in the header to see a quick profile card with picture and bio.

### Navigation
Click [MENU] to access all pages. Current page is highlighted with `[ACTIVE]` indicator.

### Typing Sounds
The hero section plays subtle typing sounds during the reveal animation. Respects `prefers-reduced-motion` setting.

### CRT Effects
Always-on scanline and flicker effects create an authentic retro terminal feel. Respects `prefers-reduced-motion` setting.

## Browser Support

- Modern browsers with ES2017+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Static generation for all pages
- Optimized images
- Minimal JavaScript bundle
- No external dependencies (except Next.js core)

## Accessibility

- Semantic HTML
- Keyboard navigation support
- `prefers-reduced-motion` support
- ARIA labels on interactive elements

## License

Personal portfolio - All rights reserved.

## Contact

- Email: dev@tirok.ir
- Telegram: @xyaes
- GitHub: tirok547

---

Built with ❤️ and ⌨️ by tirok
