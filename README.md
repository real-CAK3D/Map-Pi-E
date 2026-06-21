# Map-Pi-E

Map-Pi-E is CAK3D's Appalachian Trail planner prototype for a Raspberry Pi Zero 2 WH + phone/PWA workflow.

## Current prototype

- Mobile-first AllTrails-inspired dashboard
- Tailscale/Wi-Fi web UI instead of Bluetooth screen casting
- Browser Geolocation button for phone testing
- Mock Appalachian Trail progress, waypoints, weather, altitude, and camp/manual panels
- Future-ready placeholders for GPS module input, Supabase, GitHub, Ollama, and offline public datasets

## Run

```bash
npm install
npm run dev
# http://100.100.4.60:4317/ over Tailscale
```

## Hardware notes

The Raspberry Pi Zero 2 WH should serve lightweight local web UI/data collection. Heavy vision/Ollama work should route to a stronger local-network machine unless a tiny model proves usable.

## Safety note

Plant identification and edible guidance must never be treated as guaranteed. Require uncertainty language and multiple-source/manual confirmation before consumption.

## Vercel hosting

This is a Vite React app. In Vercel use:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Map-Pi-E is local-first and browser-only right now. Public sync, shared routes, Supabase, weather APIs, and any private keys should be added behind Vercel/Supabase server-side boundaries later; do not put secrets in the client bundle.


## Supabase

Do not commit real Supabase secrets. Configure Vercel/local env with:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key only>
```

Apply `supabase/migrations/20260621_map_pi_e_records.sql` in the Supabase SQL editor before expecting cloud saves. Secret/service keys stay server-side only for future Edge Functions.
