# ADY Marketplace — Backend API

Node.js + Express + Prisma REST API for the ADY Marketplace student marketplace.

## Stack
- Express (HTTP server & routing)
- Prisma ORM — ships configured for **SQLite** (zero setup). Swap to Postgres for production (see `.env.example`).
- JWT (`jsonwebtoken`) for auth, `bcryptjs` for password hashing
- `multer` for image uploads (stored locally under `/uploads`; swap for Cloudinary/S3 later — see comment in `src/middleware/upload.js`)

## Setup

```bash
cd backend
npm install
cp .env.example .env        # then edit JWT_SECRET at minimum
npx prisma migrate dev --name init
npm run seed                 # creates the 8 categories + a default admin account
npm run dev                   # starts on http://localhost:4000
```

Default seeded admin login (change the password immediately after first login):
- email: `admin@adymarketplace.test`
- password: `ChangeMe123!`

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Users | `GET /api/users/:id`, `PATCH /api/users/me/update` (multipart, `avatar` field) |
| Categories | `GET /api/categories` |
| Listings | `GET /api/listings` (filters: `q, category, minPrice, maxPrice, condition, location, sort, featured, page, pageSize`), `GET /api/listings/:id`, `POST /api/listings` (multipart, `images[]`, up to 6), `GET /api/listings/mine/all`, `PATCH /api/listings/:id`, `PATCH /api/listings/:id/sold`, `DELETE /api/listings/:id` |
| Messages | `GET /api/messages/conversations`, `GET /api/messages/thread/:listingId/:otherUserId`, `POST /api/messages` |
| Reports | `POST /api/reports` |
| Admin (requires admin JWT) | `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/verify`, `GET /api/admin/listings`, `PATCH /api/admin/listings/:id/status`, `PATCH /api/admin/listings/:id/feature`, `GET /api/admin/reports`, `PATCH /api/admin/reports/:id/resolve` |

All protected routes expect `Authorization: Bearer <token>`.

## What's intentionally left as a next step
- **Email delivery**: password reset currently logs the reset link to the console / returns it in the dev response instead of emailing it. Wire up Resend/SendGrid/Postmark before going live.
- **Image storage**: files are saved to local disk. Fine for a single-server deploy; move to S3/Cloudinary if you outgrow that.
- **School email / matric verification**: registration just flags accounts with a matric number as "pending" for manual admin review. If you want automatic verification, check the email domain (e.g. must end in `@aksu.edu.ng`) in `auth.routes.js`.
- **Ratings**: the `Review` model exists in the schema but there's no route yet for submitting a review after a sale completes — add a `POST /api/reviews` endpoint and recompute the seller's `rating`/`ratingCount` when you're ready for that flow.

## Deploying
Any Node host works (Render, Railway, Fly.io, a VPS). Steps:
1. Set `DATABASE_URL` to a real Postgres database (switch the `provider` in `prisma/schema.prisma` to `"postgresql"`).
2. Set `JWT_SECRET` to a strong random value and `FRONTEND_URL` to your deployed frontend's URL.
3. Run `npx prisma migrate deploy` on first deploy.
4. `npm start`.
