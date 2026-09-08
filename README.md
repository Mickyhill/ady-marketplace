# AKSMarketPlace

A student marketplace for AKSU campus — buy, sell, and message other students about furniture, electronics, books, and more. This is a full-stack rebuild you own outright: a React frontend and a Node/Express + Prisma backend, no third-party platform lock-in.

```
aksmarketplace/
├── backend/     Node.js + Express + Prisma REST API
└── frontend/    React (Vite) + Tailwind CSS single-page app
```

## Quick start (two terminals)

**Terminal 1 — backend**
```bash
cd backend
npm install
cp .env.example .env      # edit JWT_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev                # http://localhost:4000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`. Register a normal account to try buyer/seller flows, or log in as the seeded admin (`admin@aksmarketplace.test` / `ChangeMe123!` — change this password immediately) to see the Admin dashboard.

Full details, API reference, and deployment notes are in `backend/README.md` and `frontend/README.md`.

## What's built
- **Auth**: register, login, forgot/reset password (JWT-based)
- **Listings**: create with up to 6 photos, browse with search/category/price/condition filters, sort, mark sold, edit, delete
- **Messaging**: per-listing conversations between buyer and seller
- **Reports**: buyers can report a listing; admins review and resolve
- **Admin dashboard**: stats overview, verify/reject student accounts, moderate/feature/remove listings, resolve reports
- **Profile**: edit your own info and avatar; view another user's public profile

## A note on how this was verified
I ran `npm install` and a full production build for the frontend (it builds clean), and syntax-checked every backend file. I could **not** run the backend's database migration in this sandbox — Prisma downloads its query-engine binary from `binaries.prisma.sh` at migrate/install time, and that domain isn't reachable from this environment's network. That's a restriction of my sandbox, not a problem with the code; `npx prisma migrate dev` will work normally on your own machine with regular internet access. If you hit anything unexpected when you run it for the first time, paste the error back to me and I'll fix it.

## Honest scope notes
This is a fresh, working MVP built to match the page structure and feature set visible in your screenshots (Home, Login, Register, Forgot/Reset Password, Sell, My Listings, Listing Detail, Messages, Profile, Admin) — it is **not** a byte-for-byte export of your Base44 code, since Base44 doesn't expose that on your current plan. A few things are stubbed for you to wire up when ready (see "What's intentionally left as a next step" in `backend/README.md`):
- Password reset emails currently just log to the console instead of sending a real email.
- Images are stored on local disk rather than S3/Cloudinary.
- There's no automatic school-email/matric-number verification yet — it's manual via the Admin tab.
