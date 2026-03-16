#!/bin/bash

# TaskFlow API Startup Script

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"
export JWT_SECRET="dev-secret-taskflow-2024"
export JWT_EXPIRES_IN="7d"
export API_PORT=3001
export NODE_ENV=development
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

cd "$(dirname "$0")/apps/api"

echo "Starting TaskFlow API..."
exec npx tsx src/index.ts
