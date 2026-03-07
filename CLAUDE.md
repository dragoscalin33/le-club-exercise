# Le Club Exercise — Mini Restaurant Directory

## Project Overview
Technical exercise: a mini restaurant directory with backend API, web admin panel, and mobile app.
Duration: 2-3 days. Everything must work locally first, then deployed on AWS EC2.

## Repo Structure
```
le-club-exercise/
├── backend/          # NestJS + TypeScript API
├── admin/            # React + TypeScript (Vite) admin panel
├── mobile/           # React Native (Expo) + TypeScript
├── docker-compose.yml
├── .github/workflows/deploy.yml
└── CLAUDE.md
```

## Tech Stack
- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Admin**: React + TypeScript + Vite
- **Mobile**: React Native (Expo) + TypeScript
- **Database**: PostgreSQL (locally installed, NOT dockerized)
- **Deployment**: Docker (backend + admin only) → EC2 via GitHub Actions
- **File Storage**: AWS S3 for image uploads
- **Auth**: JWT with bcrypt password hashing

## Features to Build

### Backend (NestJS)
1. **Auth**: register + login with JWT, password hashing, two roles (`admin`, `user`), guards on protected routes
2. **Restaurants**: full CRUD (name, address, description, photoUrl, createdBy)
3. **Upload**: endpoint that receives an image, uploads to S3, returns public URL

### Admin (React + Vite)
1. Login page
2. Restaurant list (table view)
3. Create / edit form with photo upload
4. Delete a restaurant

### Mobile (React Native Expo)
1. Login / register screens
2. Restaurant list (photo + name + address)
3. Restaurant detail screen
4. **Read-only** (no creation from mobile)

### Deployment
1. Dockerize backend and admin (one Dockerfile each)
2. docker-compose.yml that runs both services
3. PostgreSQL on separate AWS service (RDS or Supabase) — NOT on EC2, NOT in Docker
4. GitHub Actions: on push to `main`, build images, deploy to EC2
5. Sensitive env vars in GitHub Secrets

## Commit Strategy
One clean commit per completed feature. No giant commits.

Suggested order:
1. `chore: project scaffolding and initial setup`
2. `feat(backend): auth module with JWT, roles and guards`
3. `feat(backend): restaurant CRUD endpoints`
4. `feat(backend): S3 image upload endpoint`
5. `feat(admin): login page and auth flow`
6. `feat(admin): restaurant list, create, edit, delete with photo upload`
7. `feat(mobile): login and register screens`
8. `feat(mobile): restaurant list and detail screens`
9. `feat(deploy): dockerfiles and docker-compose`
10. `feat(deploy): github actions CI/CD pipeline`

## Code Conventions
- TypeScript strict mode everywhere
- No `any` types
- NestJS pattern: Module → Controller → Service → DTOs
- Use class-validator for DTO validation
- Use Guards for route protection
- React: functional components + hooks only
- Consistent error handling with meaningful messages

## Database Schema
```sql
-- users table
id: SERIAL PRIMARY KEY
email: VARCHAR(255) UNIQUE NOT NULL
password: VARCHAR(255) NOT NULL  -- bcrypt hashed
role: VARCHAR(50) NOT NULL DEFAULT 'user'  -- 'admin' or 'user'
createdAt: TIMESTAMP DEFAULT NOW()
updatedAt: TIMESTAMP DEFAULT NOW()

-- restaurants table
id: SERIAL PRIMARY KEY
name: VARCHAR(255) NOT NULL
address: TEXT NOT NULL
description: TEXT
photoUrl: TEXT
createdBy: INTEGER REFERENCES users(id)
createdAt: TIMESTAMP DEFAULT NOW()
updatedAt: TIMESTAMP DEFAULT NOW()
```

## Environment Variables

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=le_club_exercise
JWT_SECRET=your-secret-key-change-in-production
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=le-club-exercise-uploads
AWS_REGION=eu-west-3
PORT=3000
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3000
```

### Mobile (.env)
```
API_URL=http://localhost:3000
```

## AWS Setup Requirements
- **Billing Alert**: $5/month budget with email notifications at 80% and 100%
- **S3**: Bucket for image uploads
- **RDS or Supabase**: PostgreSQL database (separate from EC2)
- **EC2**: For running Docker containers (backend + admin)

## Commands

### Backend
```bash
cd backend
npm install
npm run start:dev    # Development
npm run build        # Production build
npm run test         # Tests
```

### Admin
```bash
cd admin
npm install
npm run dev          # Development (Vite)
npm run build        # Production build
```

### Mobile
```bash
cd mobile
npm install
npx expo start      # Development
```

## Important Rules
- Everything must work locally BEFORE deployment
- PostgreSQL runs locally for dev, on separate AWS service for prod
- Docker is only for backend + admin (NOT for database, NOT for mobile)
- Mobile is NOT deployed (runs via Expo only)
- Clean commits, one per feature
