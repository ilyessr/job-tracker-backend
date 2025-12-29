# Job Tracker Backend API

Job Tracker is a backend REST API that helps users track job applications and analyze job search activity. This project demonstrates authentication, database design, modular architecture, and testing.

## Features

- JWT authentication
- CRUD for job applications
- Application status tracking (Applied, Interview, Rejected, Accepted)
- Personal statistics: applications by month, by status, and average per month
- Data isolation per user
- Prisma seed for demo data
- End-to-end tests

## Tech Stack

- NestJS
- PostgreSQL
- Prisma
- JWT
- Jest and Supertest

## Project Structure

```
src/
  auth/
  users/
  job-applications/
  stats/
  prisma/
  app.module.ts
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file at the project root

```env
DATABASE_URL=postgresql://username@localhost:5432/job_tracker
JWT_SECRET=your_secret_key
```

3. Run database migrations and seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

4. Start the server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Demo Account (Seeded)

Email: `demo@jobtracker.dev`
Password: `password123`

## API Notes

- `GET /stats` returns stats for the authenticated user.
- Protected routes require `Authorization: Bearer <JWT>`.

## Tests

Run end-to-end tests:

```bash
npm run test:e2e
```

## Architecture Principles

- Controllers handle HTTP concerns only.
- Services contain business logic.
- User identity comes from JWT, never from client input.
- Statistics are computed on the backend.
