# ADY Marketplace — Frontend

React (Vite) + Tailwind CSS single-page app for the ADY Marketplace student marketplace.

## Pages
`Home`, `Login`, `Register`, `ForgotPassword`, `ResetPassword`, `Sell`, `MyListings`, `ListingDetail`, `Messages`, `Profile`, `Admin` — matching the page set of the original build.

## Setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, proxies /api and /uploads to http://localhost:4000
```

Make sure the backend is running first (see `../backend/README.md`) — the dev server proxies API calls to `http://localhost:4000`.

## Notes
- Auth token is stored in `localStorage` (`aksmp_token`) and attached automatically by `src/api/client.js`.
- `src/context/AuthContext.jsx` holds the logged-in user and exposes `login`, `register`, `logout`.
- No component library is used — everything is plain Tailwind utility classes, so there's nothing extra to install.
- Colors/type live in `tailwind.config.js` under the `brand` and `ink` palettes — change them there to re-theme the whole app.

## Building for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity check it
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, or served by the backend itself). Set the real API URL via a reverse proxy or by changing `BASE_URL` in `src/api/client.js` if the frontend and backend aren't on the same domain.
