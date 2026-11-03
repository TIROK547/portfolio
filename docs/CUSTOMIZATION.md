# Customization

## Site content (bio, stack, contacts, projects)

Almost nothing is hardcoded. Log in to `admin.tirok.ir` and go to **Settings** to update:

- Name, alias, role, location, birth date
- Bio (short and long versions)
- Contact links (email, Telegram, GitHub, etc.)
- Availability status
- Tech stack lists
- Skills and interests

Projects are managed from the **Projects** section of the editor — you can create, edit, reorder, and delete them there.

---

## Profile picture

Replace `public/images/profile.jpg` with your own image. Recommended: square, 400×400 px or larger.

## Resume

Replace `public/resume.pdf` with your own. The download is triggered from the About page and saves as `ALIREZA-GHOTBI-Resume.pdf` — update the filename in `app/[lang]/about/page.tsx` if needed.

---

## Color scheme

Colors are defined as Tailwind tokens in `tailwind.config.ts`. The site uses an Everforest-inspired terminal palette:

```ts
colors: {
  terminal: {
    bg: {
      dark: '#1e2326',   // main background
    },
    text: {
      dark: '#d3c6aa',   // main text
    },
    accent: {
      red:     '#e67e80',
      orange:  '#e69875',
      yellow:  '#dbbc7f',
      green:   '#a7c080',
      cyan:    '#83c092',
      blue:    '#7fbbb3',
      purple:  '#d699b6',
    }
  }
}
```

Change these values to retheme the entire site.

## Font

The site uses **JetBrains Mono** (loaded from Google Fonts). To change it, update the font import in `app/layout.tsx` and the `fontFamily` in `tailwind.config.ts`.

---

## Visitor counter

The footer counter starts at 547 and increments once per browser session. To change the starting value:

```ts
// components/Footer.tsx
const [visitorCount, setVisitorCount] = useState<number>(547);
```

The count is stored in localStorage (`visitorCount` key). It's entirely client-side — there's no server-side tracking.

---

## Adding a new page

1. Create `app/[lang]/<your-page>/page.tsx`
2. Add it to the navigation in `components/Header.tsx`
3. Add a `cd ..` back-link at the top (see any existing page for the pattern)

## Adding a language

1. Add the locale to the `[lang]` segment's `generateStaticParams` (in `app/[lang]/layout.tsx`)
2. Add translated strings — currently strings are inline; extract them to a locale file as needed
