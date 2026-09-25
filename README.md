# Portfolio Website - Alireza Ghotbi (tirok)

A retro terminal-inspired portfolio website with modern GUI structure, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✍️ **Blog & private editor**: Markdown posts, tags, categories, images and comments, managed from admin.tirok.ir
- 🛠️ **Editable site info**: contact details, bio, stack and skills are stored in SQLite and edited from the admin panel
- 📱 **Fully Responsive**: Mobile-optimized design with touch detection
- 🎨 **Neofetch-Style Hero**: Custom ASCII art with system info display
- 👥 **Visitor Counter**: Track total visitors (starts at 547)
- 📄 **Resume Download**: One-click resume download in PDF format
- 🚀 **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS
- ⚡ **Fast Performance**: Static generation, optimized assets

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React 18

### Styling
- Custom Everforest-inspired terminal color scheme
- JetBrains Mono font
- Responsive design with Tailwind breakpoints

## Getting Started

### Prerequisites
- Node.js 18+ or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/tirok547/portfolio.git
cd portfolio

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
│   ├── [lang]/              # Route structure (currently English only)
│   │   ├── about/           # About page with bio, skills, resume
│   │   ├── projects/        # Projects showcase
│   │   ├── contact/         # Contact information
│   │   ├── layout.tsx       # Page layout wrapper
│   │   └── page.tsx         # Home page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── not-found.tsx        # 404 page
├── components/
│   ├── AsciiArt.tsx         # Terminal ASCII art
│   ├── BackLink.tsx         # "cd .." back link
│   ├── Footer.tsx           # Footer with visitor counter
│   ├── Header.tsx           # Header with navigation & info card
│   ├── Hero.tsx             # Neofetch-style hero section
│   ├── ProjectCard.tsx      # Project display component
│   ├── StackDisplay.tsx     # Tech stack overview
│   └── TechIcon.tsx         # Technology icons
├── lib/
│   └── i18n.ts              # i18n configuration (legacy)
├── public/
│   ├── images/
│   │   └── profile.jpg      # Profile picture
│   └── resume.pdf           # Downloadable resume
└── tailwind.config.ts       # Tailwind configuration
```

## Customization

### Adding Projects

Edit `app/[lang]/projects/page.tsx` and add new entries to the `projects` array:

```typescript
{
  name: 'Project Name',
  description: 'Detailed project description with technologies used',
  stack: ['Next.js', 'Django', 'PostgreSQL', 'Docker'],
  github: 'https://github.com/username/repo',
  status: 'active' // Options: 'active', 'wip', 'archived'
}
```

### Updating Profile Picture

Replace `public/images/profile.jpg` with your own image. Recommended size: 400x400px or larger, square aspect ratio.

### Updating Resume

Replace `public/resume.pdf` with your own resume. The download is triggered from the About page.

### Customizing Personal Information

Update the following files with your information:

**Hero Section** (`components/Hero.tsx`):
```typescript
const systemInfo = [
  { label: 'user', value: 'your@email' },
  { label: 'alias', value: 'your-alias' },
  { label: 'role', value: 'Your Role' },
  { label: 'location', value: 'Your Location' },
  // ...
];
```

**Header Info Card** (`components/Header.tsx`):
```typescript
// Update name, age, role, etc. in the InfoCard modal
```

**Contact Page** (`app/[lang]/contact/page.tsx`):
```typescript
const contacts = [
  { label: 'email', value: 'your@email.com', href: 'mailto:your@email.com' },
  // ...
];
```

### Changing Color Scheme

Update the terminal colors in `tailwind.config.ts`:

```typescript
colors: {
  terminal: {
    bg: {
      dark: '#1e2326',  // Background (Everforest)
    },
    text: {
      dark: '#d3c6aa',  // Text
    },
    accent: {
      red: '#e67e80',
      orange: '#e69875',
      yellow: '#dbbc7f',
      green: '#a7c080',
      cyan: '#83c092',
      blue: '#7fbbb3',
      purple: '#d699b6',
      magenta: '#d699b6',
      pink: '#d699b6',
      amber: '#e69875',
    }
  }
}
```

### Visitor Counter

The visitor counter in the footer:
- Starts at 547
- Increments once per browser session
- Stored in localStorage (client-side only)
- Can be reset by clearing browser storage
- Customize starting value in `components/Footer.tsx`:

```typescript
const [visitorCount, setVisitorCount] = useState<number>(547); // Change 547 to your desired starting number
```

## Pages

- **Home** (`/en`): Hero section, about preview, tech stack, featured projects, contact preview
- **About** (`/en/about`): Full bio, technical skills, interests, resume download
- **Projects** (`/en/projects`): Portfolio projects with detailed descriptions and tech stacks
- **Contact** (`/en/contact`): Contact methods, availability status, timezone

## Features Explained

### Info Card
Click the `[INFO]` button in the header to see a quick profile card with your picture, name, role, and bio. On mobile, this appears as `[i]`.

### Navigation Menu
Click `[MENU]` (or `[≡]` on mobile) to access all pages. The current page is highlighted with `[ACTIVE]` indicator and cyan accent color.

### Visitor Counter
Displayed in the footer, tracks total unique sessions. Increments once per browser session using sessionStorage, with persistent count in localStorage.

### Resume Download
Available on the About page. Downloads the resume as `ALIREZA-GHOTBI-Resume.pdf` when clicked.

### Back link
Every page has a `cd ..` link at the top (except the home page) that returns to the previous page, or to a sensible parent if the page was opened directly.

## Browser Support

- ✅ Chrome 90+ (desktop & mobile)
- ✅ Firefox 88+ (desktop & mobile)
- ✅ Safari 14+ (desktop & mobile)
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile / Android

## Performance

- **Static Generation**: All pages pre-rendered at build time
- **Optimized Images**: Next.js Image component for automatic optimization
- **Minimal JavaScript**: ~150KB total bundle size
- **CSS-in-JS**: Tailwind CSS for minimal runtime overhead
- **Fast Load Times**: First Contentful Paint < 1.5s on 3G
- **Lighthouse Score**: 95+ on all metrics

## Accessibility

- ✅ Semantic HTML5 structure
- ✅ Full keyboard navigation support
- ✅ `prefers-reduced-motion` support (disables animations)
- ✅ ARIA labels on interactive elements
- ✅ High contrast ratios (WCAG AA compliant)
- ✅ Screen reader friendly
- ✅ Mobile touch target sizes (48x48px minimum)

## Mobile Optimizations

- Responsive typography (scales from xs to md)
- Touch-friendly tap targets
- Optimized spacing for smaller screens
- Scrollable modals with max-height
- Hamburger menu for mobile navigation
- Flexible grid layouts

## Deployment

> The blog/editor stores data in SQLite on disk, so deploy on something with a persistent disk (your VPS + Docker). Vercel/Netlify serverless hosting won't keep the database or uploads. See "Blog, editor and backend" below.

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

The blog backend needs `SESSION_SECRET`, `ADMIN_USER` and `ADMIN_PASSWORD_HASH` (see `.env.example`). Other optional variables, e.g. analytics, go in `.env.local`:

```bash
# Example
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Roadmap

- [x] Blog section (Markdown, SQLite, private editor)
- [x] Projects managed from the editor (SQLite)
- [ ] Project detail pages with screenshots
- [ ] Contact form with backend integration
- [ ] Analytics integration
- [ ] RSS feed
- [ ] PWA support

## Troubleshooting

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

## License

Personal portfolio - All rights reserved.

Feel free to use this as inspiration for your own portfolio, but please don't directly copy the content.

## Contact

- **Email**: dev@tirok.ir
- **Telegram**: [@xyaes](https://t.me/xyaes)
- **GitHub**: [tirok547](https://github.com/tirok547)

---

Built with ❤️ and ⌨️ by tirok

**Tech Stack**: Next.js 15 • TypeScript • Tailwind CSS • React 18

## Blog, editor and backend

One Next.js app serves two hostnames and stores everything in a single SQLite file.

| Host | What it is |
| --- | --- |
| `portfolio.tirok.ir` | public site: `/en/blog`, `/en/blog/<slug>` (with comments), latest posts on the home page, projects and site info from the DB |
| `admin.tirok.ir` | private editor (login required): posts, drafts, categories, `#tags`, image upload, projects, comments, site settings |

- Data: `DATA_DIR/site.db` (posts, categories, tags, projects, comments, settings) and `DATA_DIR/uploads/` (images). Back up both.
- Posts are Markdown (headers, lists, code, tables, images). Raw HTML is sanitized.
- Projects are seeded once from `lib/seed-projects.ts`; after that they're edited from the editor.
- Auth: single admin, scrypt password hash, signed httpOnly cookie, login rate limit, same-origin check on every write.
- Site settings (`/settings` in the editor) hold the info that used to be hard-coded: name, role, location, birth date (age is computed), bio, contact details and availability, the tech stack lists, skills, interests and the resume "last updated" text. Defaults live in `lib/settings.ts`.
- Comments: anyone can comment on a published post with just a username (no login). Guarded by same-origin check, a honeypot field, a per-IP rate limit (5 per 10 minutes), a link limit, and reserved usernames (your alias/name can't be impersonated). You reply to or delete comments from `/comments` in the editor; replies show an `[owner]` tag, and deleting a comment deletes its replies.
- Any host starting with `admin.` is the editor, so locally use `http://admin.localhost:3000`.

### Setup

```bash
npm install
node scripts/hash-password.mjs      # prints SESSION_SECRET + ADMIN_PASSWORD_HASH
cp .env.example .env                # paste them in, set ADMIN_USER
# dev over http: add INSECURE_COOKIES=1 to .env
npm run dev                         # http://localhost:3000 and http://admin.localhost:3000
```

Production with Docker: `docker compose up -d --build`. The app listens on `127.0.0.1:3000`.

### Reverse proxy

Both hostnames go to the same upstream. Keep the `Host` header and pass the client IP (used for the login and comment rate limits):

```nginx
server {
    server_name portfolio.tirok.ir admin.tirok.ir;
    client_max_body_size 10m;              # image uploads are capped at 8 MB
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

(TLS via certbot as usual. With Cloudflare Tunnel, point both hostnames at `http://localhost:3000`; the original Host is preserved.)
