# JobTracker Frontend

React + Vite + Tailwind frontend for JobTracker, wired to the Spring Boot backend in `../backend`.

## Features
- Auth (login/register), protected routes, automatic JWT refresh on 401
- Dashboard: live stats, search (debounced), status filter tabs, pagination
- Create/edit jobs with tags, notes, source, follow-up date, job URL
- Attachments: upload/download/delete resume, cover letter, other files per job
- Kanban board with drag-and-drop status changes (`@hello-pangea/dnd`)
- Analytics page: status breakdown, applications over time, source & location breakdowns (`recharts`)
- CSV export

## Setup
```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if your backend isn't on localhost:8080
npm run dev
```

The app expects the backend from `../backend` running at the URL in `VITE_API_BASE_URL` (default `http://localhost:8080/api/v1`).

## Build
```bash
npm run build
```
Outputs a static build to `dist/`, deployable to any static host (Vercel, Netlify, S3+CloudFront, nginx, etc). Since this is a pure SPA, configure your host to rewrite unknown routes to `index.html` (client-side routing).

## Notes
- Access tokens are stored in `localStorage`; the axios client in `src/api/client.js` automatically refreshes them using the refresh token on a 401 and retries the original request.
- Tailwind v4 is wired in via `@tailwindcss/vite` — no separate Tailwind config file needed.
