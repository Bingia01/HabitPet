# Forki

A nutrition tracking web application with a virtual pet companion. Log meals, build streaks, and watch your Forki grow.

**Live:** [forki.app/landing](https://forki.app/landing)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Overview

Forki gamifies nutrition tracking by pairing a 15-second meal logging flow with a virtual pet that reacts to your eating habits. The pet has three states — **Starving**, **Strong**, and **Overfull** — creating an emotional feedback loop that keeps users engaged.

### Core Features

| Feature | Description |
|---------|-------------|
| **1-Tap Logging** | Log meals in under 15 seconds with no typing required |
| **AI Camera** | Snap a photo for LiDAR-enhanced portion detection |
| **Pet States** | Forki reacts visually (video) to your nutrition behavior |
| **Streak System** | Visual streak counters with motivational nudges |
| **Weekly Insights** | Recaps and actionable nutrition recommendations |
| **Pet Customization** | Unlockable skins, seasonal effects, and cosmetics |

### Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/landing` |
| `/landing` | Marketing landing page with feature showcase |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) (App Router) | 15.5.4 |
| Language | TypeScript | 5.x |
| UI | React | 19.1.0 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | v4 |
| Components | [shadcn/ui](https://ui.shadcn.com/) (new-york style) | — |
| Animation | [Framer Motion](https://www.framer.com/motion/) | 12.x |
| Icons | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/) | — |
| Backend | [Supabase](https://supabase.com/) (auth + database) | 2.58.0 |
| Monitoring | [Sentry](https://sentry.io/) | 10.15.0 |
| Analytics | Google Analytics 4 | — |
| Deployment | [Vercel](https://vercel.com/) | — |

---

## Architecture

```
Browser
  |
  v
Next.js App Router (SSR / Static)
  |
  ├── /landing ............ Marketing landing page (client-rendered)
  ├── /privacy ............ Static legal page (server-rendered)
  ├── /terms .............. Static legal page (server-rendered)
  |
  ├── Supabase ............ Auth + Postgres database
  ├── Sentry .............. Error tracking
  └── Google Analytics .... Usage analytics
```

The app uses **Next.js App Router** with the `src/` directory convention. Landing page components are client-rendered (`'use client'`) for Framer Motion animations. Legal pages are server-rendered for SEO.

### Key Architectural Decisions

- **Dark-first theme** — The app defaults to a midnight/navy gamified theme. Light/dark CSS variables are defined but both map to the dark palette.
- **shadcn/ui components** — UI primitives (Button, Card, Input, Avatar, Switch) live in `src/components/ui/` and follow the shadcn/ui pattern with Radix UI + CVA.
- **CSS variables for theming** — All colors are HSL values defined in `globals.css` and consumed via Tailwind config, making theme changes a single-file operation.
- **PWA-ready** — Includes `manifest.json` and a service worker (`public/sw.js`) for offline support and push notifications.

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10

### Install

```bash
git clone https://github.com/Bingia01/HabitPet.git
cd HabitPet
npm install
```

### Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) for details.

### Development

```bash
npm run dev
```

Open [http://localhost:3000/landing](http://localhost:3000/landing).

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, metadata, analytics)
│   ├── page.tsx                    # Root redirect -> /landing
│   ├── globals.css                 # Tailwind imports + CSS variable theme
│   ├── landing/
│   │   ├── page.tsx                # Landing page composition
│   │   └── metadata.ts            # SEO metadata (Open Graph, Twitter)
│   ├── privacy/
│   │   └── page.tsx                # Privacy Policy
│   └── terms/
│       └── page.tsx                # Terms of Service
│
├── components/
│   ├── landing/                    # Landing page sections (top to bottom)
│   │   ├── HeroSectionV2.tsx       # Hero with mascot video + CTAs
│   │   ├── ProblemSolutionStrip.tsx # 3-card value prop strip
│   │   ├── AppShowcase.tsx         # "Tracking Made Effortless" section
│   │   ├── MascotFeature.tsx       # Interactive Forki state showcase
│   │   ├── FeaturesGrid.tsx        # 6-feature card grid
│   │   ├── HowItWorks.tsx          # 5-step process walkthrough
│   │   ├── SocialProof.tsx         # Stats + testimonials
│   │   ├── FinalCTA.tsx            # Final call-to-action
│   │   └── Footer.tsx              # Footer with social links + newsletter
│   ├── ui/                         # shadcn/ui primitives
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── switch.tsx
│   └── GoogleAnalytics.tsx         # GA4 script injection
│
├── lib/
│   └── utils.ts                    # cn() helper (clsx + tailwind-merge)
│
public/
├── mascots/                        # Forki video assets (MP4) + images (PNG)
├── icons/                          # PWA icons (192x192, 512x512)
├── manifest.json                   # PWA manifest
└── sw.js                           # Service worker
```

---

## Design System

### Color Palette

All colors are defined as HSL values in `src/app/globals.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0A1128` | Deep midnight blue — page background |
| `--foreground` | `#E8E8F0` | Light text |
| `--primary` | `#8DD4D1` | Mint cyan — CTAs, links, rings |
| `--secondary` | `#1A2332` | Card surfaces |
| `--accent` | `#F5C9E0` | Pink — secondary actions |
| `--border` | `#7B68C4` | Purple — borders, dividers |
| `--muted` | `#2A3441` | Subdued surfaces |
| `--muted-foreground` | `#B8B8C8` | Muted text |
| `--destructive` | `hsl(0 84% 42%)` | Error / destructive actions |

### Typography

| Font | Variable | Usage |
|------|----------|-------|
| Geist Sans | `--font-geist-sans` | Body text |
| Geist Mono | `--font-geist-mono` | Code / monospace |
| Fredoka | `--font-playful` | Headlines, brand elements (weights 400–700) |

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add a new component:

```bash
npx shadcn@latest add <component-name>
```

Components are generated into `src/components/ui/`.

---

## Deployment

The app is deployed on **Vercel** with automatic deploys on push to `main`.

| Setting | Value |
|---------|-------|
| Platform | Vercel |
| Framework | Next.js |
| Build command | `next build` |
| Install command | `npm install` |
| Auto-deploy branches | `main` |

### Vercel Configuration

See `vercel.json` for deployment settings.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anonymous/public key |
| `SENTRY_ORG` | No | Sentry organization slug |
| `SENTRY_PROJECT` | No | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | No | Sentry auth token for source maps |

*Required when backend features (auth, food logging) are active.

---

## Contributing

This is a collaborative project between [@Bingia01](https://github.com/Bingia01) and [@janicesc](https://github.com/janicesc).

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run build` to verify
4. Open a pull request against `main`

### Code Conventions

- **Components**: PascalCase filenames (e.g., `HeroSectionV2.tsx`)
- **Styling**: Use Tailwind utility classes; extend the theme in `globals.css` for new design tokens
- **Imports**: Use the `@/` path alias (maps to `src/`)
- **UI primitives**: Use existing shadcn/ui components from `src/components/ui/` before creating custom ones

---

## License

MIT
