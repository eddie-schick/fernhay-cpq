# Fernhay CPQ — Vercel Deployment Guide

## Overview

This is a **self-contained frontend demo** — no backend, no database, no CMS, no required environment variables. Everything runs from static JSON files and localStorage.

## Quick Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **"New Project"**
3. Import the GitHub repository
4. Set the **Root Directory** to `frontend`
5. Vercel auto-detects Vite + pnpm from `vercel.json` and `pnpm-lock.yaml`
6. Click **Deploy** — no env vars needed

## What Happens at Build Time

- `pnpm install` installs dependencies
- `vite build` compiles the app to `dist/`
- Static JSON data in `public/data/` is copied to `dist/data/`
- Vehicle configs in `src/data/` are bundled at build time via dynamic imports
- `vercel.json` configures SPA fallback routing (`/*` -> `/index.html`)

## Architecture (No Backend Required)

| Feature | How It Works |
|---------|-------------|
| **Authentication** | Fake JWT generated client-side on login (any email works) |
| **Vehicle Data** | Static JSON (`src/data/vehicles.json`, `src/data/body-variants.json`) |
| **Configurator** | Static JSON (`src/data/vehicle-configs/*.json`) |
| **Equipment Catalog** | Runtime fetch from `/data/options.json`, `/data/bodies.json`, `/data/chassis.json` |
| **Inventory Overrides** | localStorage (edits persist per browser) |
| **Orders** | Demo orders from `src/data/demo-orders.ts` + user orders in localStorage |
| **Quotes** | Generated client-side, stored in localStorage via Redux Persist |
| **PDF Generation** | Client-side via `@react-pdf/renderer` |
| **Email** | Stubbed (simulates success) |
| **Analytics** | Datadog/HubSpot disabled when env vars are empty |

## Environment Variables

All env vars are **optional**. The app works with zero configuration. If you want to enable specific integrations, set them in the Vercel dashboard:

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_APP_NAME` | App name in UI | `Fernhay` |
| `VITE_MUI_DATAGRID_PRO_LICENSE_KEY` | MUI DataGrid Pro license | (empty, community mode) |
| `VITE_HUBSPOT_ID` | HubSpot tracking | (disabled) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps autocomplete | (disabled) |

## Local Development

```bash
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:5173 — enter any email to log in.

## Data Persistence

- All user changes (orders, inventory edits, quotes) are saved to **localStorage**
- Clearing browser data resets everything to demo defaults
- A data versioning mechanism (`CURRENT_DATA_VERSION` in `order-service.ts`) automatically clears stale data when the schema changes
