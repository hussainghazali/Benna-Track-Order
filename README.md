# Benna — Track Order (standalone)

Standalone duplicate of Benna's public **Track Order** page: dark hero, order-ID
lookup (`BENNA-ORD-…` / `BENNA-SUB-…`), live status, line items, totals —
with masked public view vs full owner view when signed in.

## Stack

- **Frontend** — Vite + React 18 + TS, Tailwind + shadcn/ui
- **Backend** — Express + MongoDB + JWT auth; `optionalAuth` upgrades the
  tracking response to the owner view when a Bearer token matches

## Run locally

```bash
cd backend && npm install && cp .env.example .env   # set JWT_SECRET
npm run seed:orders                               # demo BENNA-ORD order
npm run dev                                       # :1944

cd .. && npm install && npm run dev               # :5173+
```

Open http://localhost:5173/track-order and track `BENNA-ORD-20251011-000001`
(or `?orderId=…` auto-tracks). Sub-order: `BENNA-SUB-20251011-000001-A`.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/users/website/track/:orderId?parentOrder=true` | Public. `statusOnly=true` → statuses only. Anonymous → masked/limited view; matching guest-id or owner JWT → full view + `orderProofs` |
| POST | `/api/users/auth/customer/{login,registration}` | JWT auth |
| GET | `/api/users/auth/customer/me` | Session |

ID rules: contains `-` → human ID; `BENNA-SUB-*` → sub-order path; else must be
a Mongo ObjectId, else `400 Invalid orderId format`.

## Trims

No PayTabs/SADAD/NSBH/Gopay branches, no Redis cache, no mailers, no vendor
proof-upload endpoints — read-path only. Cart/wishlist contexts are stubs so
the shared Header compiles.
