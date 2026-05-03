# Zealthy EMR

This directory now contains two independent projects with no monorepo workspace and no shared package:

- `frontend/`: Next.js 15 patient portal and admin EMR UI
- `backend/`: NestJS API, Prisma, and PostgreSQL integration

Each project owns its own config, scripts, env file, and local contracts.

## Frontend

Run from [frontend/package.json](/Users/tharni/Desktop/zealthy-emr/frontend/package.json):

```bash
cd frontend
npm install
npm run dev
```

Frontend env file:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Backend

Run from [backend/package.json](/Users/tharni/Desktop/zealthy-emr/backend/package.json):

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Backend env file:

```env
DATABASE_URL="postgresql://localhost:5432/zealthy_emr?schema=public"
AUTH_SECRET="replace-with-a-long-random-string-at-least-32-characters"
FRONTEND_ORIGINS="http://localhost:3000"
BACKEND_PORT="4000"
```

## Auth

- Backend auth is now JWT bearer-token based
- `POST /auth/login` returns `{ data: { accessToken, user } }`
- `GET /auth/me` reads `Authorization: Bearer <token>`
- Frontend stores the access token on its own domain and forwards it to the backend

## Demo Credentials

- `mark@some-email-provider.net` / `Password123!`
- `lisa@some-email-provider.net` / `Password123!`
