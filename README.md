# ADU Construction Progress Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)

A React + TypeScript dashboard for tracking ADU construction progress, expenses, and milestones.

**Live:** [adu-dashboard.vercel.app](https://adu-dashboard.vercel.app) · **API:** [adu.danhle.net](https://adu.danhle.net)

---

## Features

- 📊 Multi-phase budget tracking with real-time backend persistence
- 📈 Animated progress visualization across construction phases
- 🔐 Email-based whitelist — whitelisted users see full budget + Data Manager
- 📱 Fully responsive mobile design
- ⚡ FastAPI backend with automatic HEAD/GET health checks

---

## Local Development

**Backend (FastAPI):**
```bash
pip install -r requirements.txt
python3 server.py
# Runs at http://localhost:8888
# Swagger UI at http://localhost:8888/docs
```

**Frontend (React/Vite):**
```bash
npm install
npm run dev
# Runs at http://localhost:5173
```

**Environment variables** — copy `.env.example` to `.env`:
```
VITE_API_URL=http://localhost:8888
VITE_GOOGLE_CLIENT_ID=<your-client-id>
VITE_ENV=development
VITE_WHITELISTED_EMAILS=you@example.com
```

---

## Architecture

| Layer | Tech | Hosting |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Vercel (auto-deploy from `master`) |
| Backend | Python FastAPI + uvicorn | Hetzner VPS (`HETZNER_IP_REDACTED`) |
| Reverse proxy | Caddy | Hetzner (auto TLS via Let's Encrypt) |
| DNS / CDN | Cloudflare | SSL mode: Full |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET/HEAD` | `/health` | Health check (used by UptimeRobot) |
| `GET` | `/api/data` | All expense phases with line items |
| `POST` | `/api/data` | Save updated expense data |
| `GET` | `/api/sheets-link?email=` | Check whitelist + return Sheets URL |
| `GET` | `/api/expenses-signoff` | Expense sign-off status |
| `GET` | `/docs` | Swagger UI |

---

## Deployment

### Frontend — Vercel
Automatically deploys on push to `master`. Environment variables set in Vercel dashboard:
- `VITE_API_URL=https://adu.danhle.net`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_ENV=production`

### Backend — Hetzner (Docker + Caddy)
GitHub Actions auto-deploys on push to `master` when `server.py`, `Dockerfile`, or `requirements.txt` change (see [`.github/workflows/deploy-backend.yml`](.github/workflows/deploy-backend.yml)).

Manual deploy:
```bash
scp server.py Dockerfile requirements.txt root@HETZNER_IP_REDACTED:/opt/adu-dashboard/
ssh root@HETZNER_IP_REDACTED "cd /opt/adu-dashboard && \
  docker build -t adu-backend . && \
  docker stop adu-backend && docker rm adu-backend && \
  docker run -d --name adu-backend --restart unless-stopped \
    -p 127.0.0.1:8888:8080 adu-backend"
```

---

## Project Structure

```
/
├── server.py           # FastAPI backend
├── Dockerfile          # Docker image (python:3.11-slim + uvicorn)
├── requirements.txt    # fastapi, uvicorn, python-dotenv
├── index.html          # React entry point
├── src/                # React components, hooks, styles, types
├── tests/              # Jest unit + Playwright E2E tests
├── docs/               # Documentation
│   └── archive/        # Archived / historical docs
└── .github/workflows/  # CI: tests + Hetzner deploy
```

---

## Email Whitelist

Whitelisted users see the full budget, all phases, and the Data Manager admin panel. Configure via env var (comma-separated):

```
VITE_WHITELISTED_EMAILS=user1@example.com,user2@example.com
```

The value is read at **request time**, so changes take effect immediately without restart.

---

## Monitoring

[UptimeRobot](https://uptimerobot.com) monitors:
- `https://adu.danhle.net/health` — backend API
- `https://lumen.danhle.net/api/ping` — Lumen API
- `https://lumen.danhle.net` — Lumen frontend

---

## Docs

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Admin Setup](./docs/ADMIN_SETUP.md)
- [Quick Reference](./docs/QUICK_REFERENCE.md)
- [Changelog](./docs/CHANGELOG.md)
- [Contributing](./docs/CONTRIBUTING.md)
