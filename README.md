# 🌿 BloomBook

> A field guide to keeping 12 houseplants alive — with watering reminders that actually nag you.

BloomBook is a personal plant-care tracker for Keyur's collection of 12 indoor plants. It answers the three questions every plant owner forgets: **which plant is this, when did I last water it, and what's it trying to tell me?**

It ships in two flavors:

| | What it is | Best for | Hosted on |
|---|---|---|---|
| 📄 **Dashboard** | A single, self-contained `index.html` | A quick, zero-setup reference you can bookmark | GitHub Pages |
| 📱 **App** | A React PWA with watering tracking + push notifications | Installing on your phone and getting daily reminders | Vercel |

---

## ✨ Features

- **12 plant profiles** — photo, scientific name, watering frequency, light needs, difficulty rating, and a fun fact for each.
- **Quick watering schedule** — an at-a-glance table so you water only the plants that need it.
- **"Read the plant" signals** — what under- vs. over-watering looks like for each species, so you can course-correct early.
- **Reference cards & survival rules** — step-by-step playbooks for common problems and 7 beginner rules (Rule #1: *when in doubt, don't water*).
- **Watering tracker** (app) — tap "Watered" and the app remembers, then flags plants as **due** or **overdue**.
- **Daily push notifications** (app) — a Vercel cron job checks every morning at 8am and pings you about thirsty plants.
- **Installable & offline-ready** (app) — it's a PWA, so it lives on your home screen and works without a connection.

---

## 🪴 The collection

🌳 Ginseng Ficus (Bonsai) · 🦚 Calathea Makoyana · ❤️ Anthurium · 🌿 Golden Pothos · 🍃 Red Aglaonema · 🐍 Snake Plant ×2 · ⚡ Neon Pothos · 🌱 Dieffenbachia · 🕊️ Peace Lily · 🌸 Aphelandra · 🐣 Sempervivum

The Peace Lily is the designated alarm clock — she droops first, and when she does it's time to check the drama queens (Calathea, Dieffenbachia, Aphelandra).

---

## 📄 The Dashboard (GitHub Pages)

The root `index.html` is a completely self-contained dashboard — all HTML, CSS, and plant data in one file, no build step, no dependencies. Just open it.

**Live:** https://keyurhindocha.github.io/bloombook/

To run it locally, open the file directly or serve the folder:

```bash
# Option A: just open it
open index.html

# Option B: serve the folder (so relative image paths resolve cleanly)
python3 -m http.server 8000
# then visit http://localhost:8000
```

See [Deploying to GitHub Pages](#-deploying-the-dashboard-to-github-pages) below.

---

## 📱 The App (React PWA)

A [Vite](https://vitejs.dev/) + React 19 progressive web app that turns the dashboard into an installable, notification-capable phone app.

### Tech stack

- **React 19** + **Vite 8** — UI and build tooling
- **vite-plugin-pwa** (Workbox) — service worker, offline caching, install prompt
- **web-push** — VAPID-signed Web Push notifications
- **Upstash Redis** — stores push subscriptions + watering history (serverless-friendly)
- **Vercel** — hosting, serverless API routes, and cron scheduling

### Run it locally

```bash
cd app
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build to app/dist
npm run preview   # preview the production build
npm run lint      # eslint
```

### Environment variables

Copy `app/.env.example` to `app/.env.local` and fill it in. When deploying, add the same values to your Vercel project's environment variables.

| Variable | What it's for | How to generate |
|---|---|---|
| `VITE_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push signing keys | `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | Contact `mailto:` for push | e.g. `mailto:you@example.com` |
| `VITE_APP_SECRET` / `APP_SECRET` | Shared secret between the frontend and API routes (same value) | `openssl rand -hex 32` |
| `CRON_SECRET` | Authorizes the daily cron request | `openssl rand -hex 20` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis connection | Vercel → Integrations → Upstash |

> ⚠️ `VITE_`-prefixed values are bundled into the client. Never put a truly secret value (like `VAPID_PRIVATE_KEY`) behind a `VITE_` name.

### How notifications work

1. You allow notifications in the app → the browser creates a push subscription → it's stored in Redis (`sub:*`).
2. Every time you tap **Watered**, the date is saved to Redis (`watering-history`).
3. A Vercel cron job (`app/vercel.json`) hits `/api/cron/notify` daily at **8:00 AM**.
4. That handler checks each plant's watering frequency against its last-watered date, and sends a push notification listing anything that's due. Dead subscriptions (HTTP 410) get cleaned up automatically.

### Deploy the app to Vercel

```bash
cd app
npx vercel          # first deploy / link project
npx vercel --prod   # production deploy
```

Then, in the Vercel dashboard, add every environment variable from the table above. The cron schedule in `vercel.json` is picked up automatically on deploy.

---

## 🗂️ Project structure

```
bloombook/
├── index.html            # 📄 Self-contained dashboard (GitHub Pages)
├── plants/               # Public plant photos used by the dashboard
│   └── private/          # Personal progress photos — gitignored, never pushed
├── app/                  # 📱 React PWA
│   ├── api/              # Vercel serverless functions
│   │   ├── subscribe.js  #   save a push subscription
│   │   ├── unsubscribe.js#   remove a push subscription
│   │   ├── water.js      #   record a watering
│   │   └── cron/notify.js#   daily "your plants are thirsty" job
│   ├── src/
│   │   ├── data/plants.js      # single source of truth for all plant info
│   │   ├── components/         # PlantCard, WateringTable, banners, etc.
│   │   ├── hooks/              # push subscription + watering history
│   │   ├── utils/             # schedule parsing, due-date logic
│   │   └── sw.js              # service worker
│   ├── public/          # icons, favicon, plant photos
│   ├── vite.config.js
│   └── vercel.json      # cron schedule
└── .gitignore           # keeps plants/private/ and all secrets out of git
```

---

## 🔒 Privacy

Personal progress photos live in `plants/private/` and are **gitignored** — they never leave your machine. Only the generic, public-facing plant photos in `plants/` are committed. `.env*` files and build output are ignored too.

---

## 🙏 Credits

Plant reference photos courtesy of [Wikimedia Commons](https://commons.wikimedia.org/). Built with 🌱 for Keyur.
