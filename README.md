# FilBrit Christmas Party

Promotional landing page for FilBrit’s Christmas party: live countdown, date-driven ticket release stages, static venue details, and email signup.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Client-side countdown and stage highlighting from [`src/config/event.ts`](src/config/event.ts)
- Email signup via [`/api/subscribe`](src/app/api/subscribe/route.ts) → Formspree when `FORMSPREE_ENDPOINT` is set

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Email signup

1. Create a form at [Formspree](https://formspree.io).
2. Set `FORMSPREE_ENDPOINT=https://formspree.io/f/yourid` in `.env.local` (and in Vercel env vars for production).
3. Without that variable, submissions still succeed locally and are logged to the server console.

### Event content

Edit [`src/config/event.ts`](src/config/event.ts) for venue, dates, stages, prizes, and the external ticket URL, then redeploy.

## Deploy (Vercel)

1. Log in once: `npx vercel login`
2. From this folder: `npx vercel --yes --prod`
3. Copy the production URL from the CLI output.

On Windows, anonymous/local Vercel builds can fail with `EPERM … symlink` unless [Developer Mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) is on, or you deploy while logged in (remote build). Prefer `vercel login` + `vercel --prod`.

Set `FORMSPREE_ENDPOINT` in the Vercel project Environment Variables so production signups are stored.

## QR code

A starter QR is in [`public/qr-code.png`](public/qr-code.png) (encodes `https://filbrit-christmas-party.vercel.app`). After your real deploy URL is known, regenerate:

```bash
$env:NEXT_PUBLIC_SITE_URL = "https://your-actual-url.vercel.app"
npm run qr
```

Then print or share `public/qr-code.png`.
