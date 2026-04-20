# Deploy TalentScout AI on Vercel

Two Vercel projects (same pattern as your other MERN apps): **API** (`server/`) and **web** (`client/`).

## 0. Push code to GitHub

You must deploy from a branch GitHub can read. **Push** with an account that has **Write** access to `ihamidch/talentscout-ai` (repo owner PAT, or SSH as that user). If you see **403 Permission denied**, fix Git credentials or add your GitHub user as a **Collaborator** on the repo — Vercel cannot deploy fixes that were never pushed.

## 1. Deploy the API (Express)

1. Import [ihamidch/talentscout-ai](https://github.com/ihamidch/talentscout-ai) in Vercel.
2. Set **Root Directory** to `server`.
3. Add environment variables:

| Variable | Notes |
|----------|--------|
| `MONGO_URI` | MongoDB Atlas connection string (**required** — without it, register/login return 503) |
| `JWT_SECRET` | Strong random string for JWT (**required** for login — set a long random value) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail app password for mailer (optional in dev) |
| `AI_ENGINE_URL` | URL of your FastAPI service if deployed (e.g. Railway/Render). Omit to use fallback scoring when the AI bridge fails. |
| `AI_REQUEST_TIMEOUT_MS` | Optional. Default **8000** on Vercel so the serverless function stays under the **~10s** execution cap (AI call + DB). Override only if you know your plan’s limits. |
| `EXPOSE_APPLY_ERRORS` | Optional. Set to `1` temporarily so Apply **500** responses include `detail` (debugging). Remove after fixing. |

4. Deploy and copy the production URL (e.g. `https://talentscout-ai-api.vercel.app`).

5. Check `GET /api/health` returns `{ "status": "ok" }`.

## 2. Deploy the client (Vite + React)

1. Create a **second** Vercel project from the same repo.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Add:

```env
VITE_API_URL=https://YOUR-API-PROJECT.vercel.app
```

(no trailing slash; must match the server deployment from step 1 — example: `https://talentscout-ai-api.vercel.app`)

5. Redeploy after changing env vars.

## 3. Python AI engine (`ai-engine/`)

The Node server calls `AI_ENGINE_URL` + `/analyze-resume`. For production you can deploy `ai-engine` separately (e.g. Railway, Render, Fly.io) and set `AI_ENGINE_URL` on the Vercel API project. If unset or unreachable, the API still saves applications with fallback AI metrics.

## Local development

- Terminal 1: `cd server && npm install && node index.js` (set `MONGO_URI` in `server/.env`).
- Terminal 2: `cd client && npm install && npm run dev` — uses Vite proxy so `VITE_API_URL` is not required; `/api` → `http://localhost:5000`.

## Troubleshooting Apply (500)

1. Confirm **both** projects redeployed after `git push` (latest `main`).
2. **Web** env `VITE_API_URL` must be the **API** URL exactly (HTTPS, no trailing slash).
3. Log in again so the **JWT** is valid; test `GET /api/health` on the API.
4. If errors persist, set **`EXPOSE_APPLY_ERRORS=1`** on the API project, redeploy, try Apply once, read the `detail` field — then remove the variable.
