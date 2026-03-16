# TaskFlow

Modern task management SaaS inspired by Todoist. Built with Next.js 14, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (email/password)
- **Monorepo**: Turborepo

## Project Structure

```
taskflow/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── shared/       # Shared types & validations
│   ├── database/     # Prisma schema & client
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configs
└── scripts/          # Build & perf scripts
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run build` | Build all apps |
| `npm run build:measure` | Build with performance metrics |
| `npm run start` | Start production servers |
| `npm run start:measure` | Start with cold-start metrics |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Lint all packages |
| `npm run type-check` | TypeScript check |

## Performance Metrics

Build and cold-start times are measured using:

```bash
# Measure build time
npm run build:measure

# Measure cold-start time
npm run start:measure
```

Results are saved to `perf-metrics.json`.

## Docker

```bash
# Development
docker-compose up -d

# Production build
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiration (e.g., "7d") | No |
| `API_PORT` | Backend port (default: 3001) | No |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | Yes |

## Features

- [x] User authentication (signup/login)
- [x] Create, edit, delete tasks
- [x] Task scheduling (date/time)
- [x] Priority levels (P1-P4)
- [x] Labels/Tags
- [x] Projects/Lists
- [x] Filters (Today, Upcoming, Completed)
- [x] Full-text search
- [x] Responsive design

## License

MIT
