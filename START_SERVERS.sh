#!/bin/bash

# 🚀 Quick Start Script for Quai Social Features
# This script starts all necessary services for local development

echo "🚀 Starting Quai Social Features..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Check API port
if check_port 4000; then
    echo -e "${YELLOW}⚠️  Port 4000 already in use (API might be running)${NC}"
    read -p "Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:4000 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed process on port 4000${NC}"
    fi
fi

# Check Frontend port
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 already in use (Frontend might be running)${NC}"
    read -p "Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed process on port 3000${NC}"
    fi
fi

echo ""
echo "📝 Checking environment files..."

# Check API .env
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}❌ apps/api/.env not found${NC}"
    echo "Creating from ENV_EXAMPLE..."
    cp apps/api/ENV_EXAMPLE apps/api/.env
    echo -e "${YELLOW}⚠️  Please update apps/api/.env with your credentials${NC}"
    exit 1
else
    echo -e "${GREEN}✅ apps/api/.env found${NC}"
fi

# Check Frontend .env.local
if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${RED}❌ apps/web/.env.local not found${NC}"
    echo "Creating from ENV_EXAMPLE..."
    cp apps/web/ENV_EXAMPLE apps/web/.env.local
    echo -e "${GREEN}✅ apps/web/.env.local created${NC}"
else
    echo -e "${GREEN}✅ apps/web/.env.local found${NC}"
fi

echo ""
echo "🔍 Testing database connection..."
cd apps/api
node test-db-connection.js
DB_TEST_EXIT=$?
cd ../..

if [ $DB_TEST_EXIT -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo -e "${YELLOW}Please check SUPABASE_CONNECTION_HELP.md for troubleshooting${NC}"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Create log directory
mkdir -p logs

# Start API server
echo -e "${GREEN}📡 Starting API server on port 4000...${NC}"
cd apps/api
pnpm run dev > ../../logs/api.log 2>&1 &
API_PID=$!
cd ../..
echo -e "   PID: $API_PID"
echo -e "   Logs: logs/api.log"

# Wait a bit for API to start
sleep 3

# Check if API started successfully
if ! check_port 4000; then
    echo -e "${RED}❌ API failed to start${NC}"
    echo "Check logs/api.log for details"
    exit 1
fi

# Start Frontend
echo ""
echo -e "${GREEN}🌐 Starting Frontend on port 3000...${NC}"
cd apps/web
pnpm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..
echo -e "   PID: $FRONTEND_PID"
echo -e "   Logs: logs/frontend.log"

# Wait for frontend
sleep 3

if ! check_port 3000; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Check logs/frontend.log for details"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Quai Social Features are running!"
echo ""
echo "📍 API Server:     http://localhost:4000"
echo "📍 Frontend:       http://localhost:3000"
echo "📍 GraphQL:        http://localhost:4000/graphql"
echo ""
echo "📊 Health Check:   http://localhost:4000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Process IDs:"
echo "   API:      $API_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   API:      tail -f logs/api.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $API_PID $FRONTEND_PID"
echo "   or press Ctrl+C and then run:"
echo "   lsof -ti:4000,3000 | xargs kill -9"
echo ""
echo -e "${GREEN}🚀 Ready to test social features!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Connect your Pelagus wallet"
echo "3. Go to /dashboard/social"
echo "4. Try creating a post!"
echo ""

# Save PIDs to file for easy cleanup
echo "$API_PID" > .pids
echo "$FRONTEND_PID" >> .pids

# Keep script running and show logs
echo "Press Ctrl+C to view logs menu..."
trap ctrl_c INT

function ctrl_c() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 What would you like to do?"
    echo ""
    echo "1) View API logs"
    echo "2) View Frontend logs"
    echo "3) Stop all services"
    echo "4) Restart services"
    echo "5) Continue running"
    echo ""
    read -p "Choose (1-5): " choice
    
    case $choice in
        1) tail -f logs/api.log ;;
        2) tail -f logs/frontend.log ;;
        3) 
            echo "Stopping all services..."
            kill $API_PID $FRONTEND_PID 2>/dev/null
            rm .pids 2>/dev/null
            echo -e "${GREEN}✅ All services stopped${NC}"
            exit 0
            ;;
        4)
            echo "Restarting services..."
            kill $API_PID $FRONTEND_PID 2>/dev/null
            exec "$0"
            ;;
        5) echo "Continuing..." ;;
        *) echo "Invalid choice" ;;
    esac
}

# Keep running
while true; do
    sleep 1
done

