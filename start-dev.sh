#!/bin/bash

# TaskFlow Development Startup Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting TaskFlow Development Environment${NC}"
echo ""

# Export environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"
export JWT_SECRET="dev-secret-taskflow-2024"
export JWT_EXPIRES_IN="7d"
export API_PORT=3001
export NODE_ENV=development
export NEXT_PUBLIC_API_URL="http://localhost:3001"

# Check if Docker containers are running
if ! docker ps | grep -q taskflow-db; then
    echo -e "${YELLOW}⚠️  PostgreSQL container not running. Starting...${NC}"
    docker-compose up -d postgres redis
    sleep 3
fi

echo -e "${GREEN}✓ Database is running${NC}"

# Start API in background
echo -e "${BLUE}📡 Starting API server...${NC}"
cd apps/api
npx tsx src/index.ts &
API_PID=$!
cd ../..

# Wait for API to be ready
sleep 2

# Start Web
echo -e "${BLUE}🌐 Starting Web server...${NC}"
cd apps/web
npx next dev &
WEB_PID=$!
cd ../..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ TaskFlow is running!${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "  ${BLUE}API:${NC}      http://localhost:3001"
echo -e "  ${BLUE}Health:${NC}   http://localhost:3001/health"
echo ""
echo -e "  ${YELLOW}Demo Login:${NC}"
echo -e "    Email:    demo@taskflow.app"
echo -e "    Password: Demo@123"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Press ${RED}Ctrl+C${NC} to stop all servers"

# Handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo -e "${GREEN}✓ All servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
