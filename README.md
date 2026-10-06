# MongoDB User CRUD Demo

## Setup

1. Create a MongoDB Atlas database user and allow the development machine IP in Atlas Network Access.
2. Copy `.env.example` to `.env`.
3. Put a newly rotated MongoDB connection string in `.env`.
4. Never commit `.env` or put `MONGODB_URI` in frontend code.

## Run

```powershell
npm.cmd run dev:server
```

Open <http://localhost:3000>. The page is served by Express and calls the REST API.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Server health check |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create a user |
| GET | `/api/users/:id` | Get one user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

Passwords are hashed with Node `crypto` and are not returned by the API.

## Verification

```powershell
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd run test:unit
npm.cmd run test:integration
```
