# Le Club — Restaurant Directory

A full-stack restaurant directory built as a technical exercise. It features a REST API, a web-based admin panel, and a mobile app for end users.

---

## Overview

Le Club lets administrators manage a curated list of restaurants (create, edit, delete, upload photos) while mobile users can browse the directory in read-only mode. Authentication is role-based: `admin` users have full write access; `user` accounts can only read.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | NestJS · TypeScript · TypeORM · PostgreSQL      |
| Admin    | React 18 · TypeScript · Vite · React Router v6  |
| Mobile   | React Native · Expo SDK 54 · TypeScript         |
| Database | PostgreSQL 16                                   |
| Storage  | AWS S3 (image uploads)                          |
| Auth     | JWT · bcrypt                                    |
| Deploy   | Docker · docker-compose · AWS EC2               |

---

## Repository Structure

```
le-club-exercise/
├── backend/          # NestJS API
├── admin/            # React + Vite admin panel
├── mobile/           # Expo React Native app
├── docker-compose.yml
└── README.md
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally
- An AWS account with an S3 bucket (for photo uploads)
- Expo Go installed on your phone (for mobile)

### 1. Database

Create the database before starting the backend:

```bash
psql -U postgres -c "CREATE DATABASE le_club_exercise;"
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=le_club_exercise
JWT_SECRET=your-secret-key-change-in-production
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=eu-west-3
PORT=3001
```

Start the dev server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`. The schema is auto-synced by TypeORM on first run.

### 3. Admin Panel

```bash
cd admin
npm install
```

Create `admin/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Mobile App

```bash
cd mobile
npm install
```

Open `mobile/src/api/client.ts` and set the `API_URL` fallback to your **local network IP** (not `localhost` — the phone cannot reach your machine via localhost):

```typescript
const API_URL = process.env.API_URL ?? 'http://192.168.x.x:3001'
```

Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. Both devices must be on the same Wi-Fi network.

---

## Test Credentials

An admin account is required to log in to the admin panel and create/edit restaurants.

Register one via the API or use these after seeding manually:

| Field    | Value             |
|----------|-------------------|
| Email    | admin@test.com    |
| Password | password123       |
| Role     | admin             |

To create an admin account directly via the API:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123","role":"admin"}'
```

> The mobile app uses the same credentials (role `user` is sufficient for read-only access).

---

## AWS S3 Setup

Photos uploaded via the admin panel are stored in S3. To enable this:

1. Create an S3 bucket (e.g. `le-club-uploads-yourname`)
2. In **Permissions** → **Block public access** → disable "Block all public access"
3. Add a **Bucket Policy** to allow public reads:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Create an IAM user with `AmazonS3FullAccess`, generate access keys, and add them to `backend/.env`.

Only `admin` users can upload photos. The upload endpoint (`POST /upload/image`) accepts JPEG, PNG, and WebP files up to 5 MB.

---

## Docker Compose

The backend and admin panel can be run together using Docker Compose. The database is **not** included — it should run on a separate service (AWS RDS, Supabase, or a local PostgreSQL instance).

Create a `.env` file at the project root:

```env
# Database (external — RDS or local)
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=le_club_exercise

# Auth
JWT_SECRET=your-secret-key

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=eu-west-3

# Admin build-time config
VITE_API_URL=http://your-ec2-ip:3001
```

Then build and start:

```bash
docker compose up --build
```

| Service | Port | URL                    |
|---------|------|------------------------|
| Backend | 3001 | http://localhost:3001  |
| Admin   | 80   | http://localhost       |

> **Note:** `VITE_API_URL` is baked into the admin bundle at build time by Vite. If you change the API URL after building, you must rebuild the admin image.

---

## API Reference

### Auth

| Method | Endpoint          | Auth     | Description              |
|--------|-------------------|----------|--------------------------|
| POST   | /auth/register    | Public   | Create a new account     |
| POST   | /auth/login       | Public   | Get a JWT token          |
| GET    | /auth/me          | JWT      | Get current user profile |

### Restaurants

| Method | Endpoint              | Auth        | Description           |
|--------|-----------------------|-------------|-----------------------|
| GET    | /restaurants          | JWT         | List all restaurants  |
| GET    | /restaurants/:id      | JWT         | Get one restaurant    |
| POST   | /restaurants          | JWT + Admin | Create a restaurant   |
| PATCH  | /restaurants/:id      | JWT + Admin | Update a restaurant   |
| DELETE | /restaurants/:id      | JWT + Admin | Delete a restaurant   |

### Upload

| Method | Endpoint        | Auth        | Description                   |
|--------|-----------------|-------------|-------------------------------|
| POST   | /upload/image   | JWT + Admin | Upload photo to S3, get URL   |

---

## Mobile App Notes

- The mobile app is **read-only** — users can browse and view restaurants but cannot create or edit them.
- It communicates directly with the backend API using JWT stored in `AsyncStorage`.
- It is **not deployed** — it runs locally via Expo Go during development.
- For the app to reach the backend on a physical device, both must be on the same Wi-Fi network and the API URL must point to the host machine's local IP (e.g. `192.168.x.x:3001`), not `localhost`.
