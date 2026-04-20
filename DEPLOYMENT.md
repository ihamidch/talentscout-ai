# Deploy TalentScout AI on Vercel

Two Vercel projects (same pattern as your other MERN apps): **API** (`server/`) and **web** (`client/`).

## 1. Deploy the API (Express)

1. Import [ihamidch/talentscout-ai](https://github.com/ihamidch/talentscout-ai) in Vercel.
2. Set **Root Directory** to `server`.
3. Add environment variables:

| Variable | Notes |
|----------|--------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string for JWT |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail app password for mailer (optional in dev) |
| `AI_ENGINE_URL` | URL of your FastAPI service if deployed (e.g. Railway/Render). Omit to use fallback scoring when the AI bridge fails. |

4. Deploy and copy the production URL (e.g. `https://talentscout-api.vercel.app`).

5. Check `GET /api/health` returns `{ "status": "ok" }`.

## 2. Deploy the client (Vite + React)

1. Create a **second** Vercel project from the same repo.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Add:

```env
VITE_API_URL=https://YOUR-API-PROJECT.vercel.app
```

(no trailing slash; must match the server deployment from step 1)

5. Redeploy after changing env vars.

## 3. Python AI engine (`ai-engine/`)

The Node server calls `AI_ENGINE_URL` + `/analyze-resume`. For production you can deploy `ai-engine` separately (e.g. Railway, Render, Fly.io) and set `AI_ENGINE_URL` on the Vercel API project. If unset or unreachable, the API still saves applications with fallback AI metrics.

## Local development

- Terminal 1: `cd server && npm install && node index.js` (set `MONGO_URI` in `server/.env`).
- Terminal 2: `cd client && npm install && npm run dev` — uses Vite proxy so `VITE_API_URL` is not required; `/api` → `http://localhost:5000`.
