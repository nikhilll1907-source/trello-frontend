# Trellis frontend

React + Vite frontend for the Trellis project-management workspace.

## Configure the backend

Copy `.env.example` to `.env.local` and set one backend origin:

```bash
VITE_API_URL=https://your-backend.onrender.com
```

The frontend adds `/api` automatically when needed. The WebSocket endpoint is derived from the same origin (`https` → `wss`, `http` → `ws`). Set `VITE_WS_URL` only when the WebSocket server lives at a different URL.

## Run locally

```bash
npm install
npm run dev
```

The backend must allow the frontend origin through `FRONTEND_URL` and must have credentials enabled for the HTTP-only refresh-token cookie.

## Source layout

```text
src/
  features/       auth, boards, comments, memberships, organizations
    */api         feature API contracts
    */components  feature UI
    */pages       route-level feature screens
  ui/             shared controls, modals, loaders, and feedback
  hooks/          shared React hooks
  context/        shared application state
  api/            Axios client and token refresh behavior
  layouts/        authenticated and public shells
  routes/         application route definitions
```
