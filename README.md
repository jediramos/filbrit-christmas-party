# Stevenage FilBrit Christmas Party 2026

A single-page promotional site for the **Stevenage FilBrit Community Christmas Party** on **Sunday 6 December 2026** in Stevenage.

Live site: [filbrit-christmas-party.vercel.app](https://filbrit-christmas-party.vercel.app)

## What the page shows

- **Hero:** the FilBrit logo and branding, a live countdown to the event (days, hours, minutes and seconds), an event description, a contact email for ticket enquiries, and links to Instagram and Facebook.
- **When & Where:** the event date, time (TBC) and venue. The full address is only shared once tickets are confirmed.
- **Ticket Releases:** a timeline of release stages (Early Bird, General Release, Final Release), each with a price and date range. The current stage is highlighted automatically based on today's date. Upcoming stages can hide their details until they open.
- **Stay in the Loop:** tickets are sold by email, so this section points visitors to the contact address.
- **Footer:** organisation name, social links and copyright.

The design uses a Filipino-inspired theme: deep green and gold colours, a Philippine sun and parol (Christmas star lantern) watermark pattern in the background, and flag-coloured accents.

## Tech stack

| Area | Tool |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 + custom CSS in `globals.css` |
| Fonts | Cormorant Garamond (headings) and Outfit (body), via `next/font` |
| Analytics | [Vercel Web Analytics](https://vercel.com/docs/analytics) |
| QR code | [`qrcode`](https://www.npmjs.com/package/qrcode) npm package |
| Hosting | [Vercel](https://vercel.com) |

## Project structure

```text
src/
  app/
    layout.tsx            Root layout, fonts, metadata, Vercel Analytics
    page.tsx              The landing page
    globals.css           Theme colours, watermarks, animations
    api/subscribe/        Optional email signup endpoint (Formspree)
  components/
    CountdownTimer.tsx    Live countdown to the event
    StagesTimeline.tsx    Ticket release stages with past/current/upcoming states
    PageAtmosphere.tsx    Background sun/parol watermark layer
    EmailSignup.tsx       Optional signup form (not currently used on the page)
  config/
    event.ts              All event content: dates, prices, stages, contact, socials
  lib/
    countdown.ts          Countdown maths
public/
  filbrit-logo.png        Community logo (transparent PNG)
  ph-sun.svg, parol-*.png Background artwork
  qr-code.png             QR code linking to the live site
scripts/
  generate-qr.js          Builds public/qr-code.png
```

## Getting started

You'll need [Node.js](https://nodejs.org) 20 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run qr` | Regenerate `public/qr-code.png` (see [QR code](#qr-code)) |

### Environment variables

Both are optional. See [`.env.example`](.env.example).

| Variable | Purpose |
| --- | --- |
| `FORMSPREE_ENDPOINT` | Formspree form URL for the optional `/api/subscribe` endpoint. Without it, submissions are only logged to the server console. |
| `NEXT_PUBLIC_SITE_URL` | The live site URL encoded into the QR code by `npm run qr`. |

## Updating event content

All event content lives in [`src/config/event.ts`](src/config/event.ts). Edit it and redeploy. No other files need to change for routine updates.

- **Event details:** `eventStart` (drives the countdown), `eventTime`, `venue`, `address`, `contactEmail`, `socials`, and the blurbs for each section.
- **Ticket stages:** each entry in `stages` has a name, price, `startsAt`/`endsAt` dates (ISO 8601 with a UK offset, e.g. `+01:00` in BST, `+00:00` in GMT), a display `dateLabel` and a description.
- **Hiding upcoming stages:** set `hideDetailsUntilStart: true` on a stage to keep its price and dates hidden until it opens. This only applies while `enforceUpcomingStageLocks` is `true`. Set that to `false` to preview every stage while testing.

## Deploying to Vercel

1. Log in once: `npx vercel login`
2. From the project folder: `npx vercel --prod`
3. Copy the production URL from the CLI output.

If the project is connected to a Git repository in Vercel, pushing to the production branch deploys it automatically.

On Windows, local Vercel builds can fail with `EPERM … symlink` unless [Developer Mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) is turned on. Deploying while logged in (which builds remotely) avoids this.

Add any environment variables you use under **Project → Settings → Environment Variables** in the Vercel dashboard.

## Analytics

Vercel Web Analytics is included through the `<Analytics />` component in [`src/app/layout.tsx`](src/app/layout.tsx). To see visitor data:

1. Open the project in the [Vercel dashboard](https://vercel.com/dashboard) and enable **Analytics**.
2. Redeploy. Only deploys made after enabling it are tracked.
3. View page views, visitors, referrers, countries and devices in the **Analytics** tab.

Only the deployed site is tracked; local development sends nothing. Ad blockers can cause some visits to go uncounted.

## QR code

[`public/qr-code.png`](public/qr-code.png) is a 512×512 PNG in the site's green and cream colours that opens `https://filbrit-christmas-party.vercel.app` when scanned with a phone camera. It's also served at `/qr-code.png` on the live site.

Use it on posters, flyers, table cards and social media posts. When printing, keep it at least 3–4 cm wide.

If the site URL changes, regenerate it:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://your-actual-url.vercel.app"
npm run qr
```

On macOS or Linux:

```bash
NEXT_PUBLIC_SITE_URL=https://your-actual-url.vercel.app npm run qr
```

## Contact

Stevenage FilBrit Community: [stevenagefilbritc@gmail.com](mailto:stevenagefilbritc@gmail.com) · [Instagram](https://www.instagram.com/stevenagefilbrit/) · [Facebook](https://www.facebook.com/stevenagefilbritcommunity)
