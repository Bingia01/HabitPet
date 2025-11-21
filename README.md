# Forki Landing Page 🍴

A beautiful, modern landing page for Forki - a nutrition tracking app with a virtual pet companion.

## Overview

This is a Next.js 15 landing page showcasing Forki's features, benefits, and call-to-action. The page is optimized for conversion and includes animated sections, responsive design, and SEO optimization.

**Live URL:** https://forki.app/landing

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: shadcn/ui

## Project Structure

```
src/
├── app/
│   ├── landing/          # Landing page route
│   │   ├── page.tsx      # Main landing page
│   │   └── metadata.ts   # SEO metadata
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Redirects to /landing
├── components/
│   ├── landing/          # Landing page sections
│   │   ├── HeroSectionV2.tsx
│   │   ├── ProblemSolutionStrip.tsx
│   │   ├── AppShowcase.tsx
│   │   ├── MascotFeature.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── SocialProof.tsx
│   │   ├── FinalCTA.tsx
│   │   └── Footer.tsx
│   └── ui/               # shadcn/ui components
└── lib/
    └── utils.ts          # Utility functions
```

## Getting Started

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000/landing](http://localhost:3000/landing) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

The landing page is deployed on **Vercel** and automatically updates when changes are pushed to the `feature/food-logging-supabase` branch.

## Editing the Landing Page

### Main Landing Page
Edit `src/app/landing/page.tsx` to add, remove, or reorder sections.

### Hero Section
Edit `src/components/landing/HeroSectionV2.tsx` to update:
- Headline and tagline
- Call-to-action buttons
- Stats and trust signals

### Other Sections
Each section is a separate component in `src/components/landing/`:
- `ProblemSolutionStrip.tsx` - Problem/solution messaging
- `AppShowcase.tsx` - App screenshots/features
- `MascotFeature.tsx` - Mascot highlight
- `FeaturesGrid.tsx` - Feature cards grid
- `HowItWorks.tsx` - Step-by-step process
- `SocialProof.tsx` - Testimonials/social proof
- `FinalCTA.tsx` - Final call-to-action
- `Footer.tsx` - Footer with links

### SEO Metadata
Edit `src/app/landing/metadata.ts` to update:
- Page title and description
- Open Graph tags
- Twitter card metadata

## Features

- ✅ Fully responsive design
- ✅ Smooth animations with Framer Motion
- ✅ SEO optimized
- ✅ Fast loading with Next.js 15
- ✅ Accessible UI components
- ✅ Modern gradient designs
- ✅ Interactive mascot animations

## License

MIT License
