#!/bin/bash

# QUAI Social DApp - Database Setup Script
# This script helps you set up your database for development or production

set -e

echo "🚀 QUAI Social DApp - Database Setup"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  This script is optimized for macOS. Some commands may need adjustment for other OS.${NC}"
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
service_running() {
    if [[ "$1" == "postgresql" ]]; then
        brew services list | grep postgresql | grep started >/dev/null 2>&1
    elif [[ "$1" == "redis" ]]; then
        brew services list | grep redis | grep started >/dev/null 2>&1
    fi
}

echo "📋 Checking prerequisites..."
echo ""

# Check for Homebrew
if ! command_exists brew; then
    echo -e "${RED}❌ Homebrew not found. Please install it first:${NC}"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
else
    echo -e "${GREEN}✅ Homebrew installed${NC}"
fi

# Check for pnpm
if ! command_exists pnpm; then
    echo -e "${RED}❌ pnpm not found. Installing...${NC}"
    npm install -g pnpm
else
    echo -e "${GREEN}✅ pnpm installed${NC}"
fi

echo ""
echo "🗄️  Database Setup Options:"
echo "1) SQLite (Development - Already configured)"
echo "2) PostgreSQL + Redis (Local Production)"
echo "3) Docker (PostgreSQL + Redis)"
echo "4) Skip database setup (I'll configure manually)"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}✅ Using SQLite (current setup)${NC}"
        echo "Database file: apps/api/prisma/dev.db"
        echo ""
        echo "Running Prisma migrations..."
        cd apps/api
        pnpm install
        pnpm prisma:generate
        pnpm prisma:migrate
        echo ""
        echo -e "${GREEN}✅ SQLite setup complete!${NC}"
        echo "Start the API with: cd apps/api && pnpm dev"
        ;;
    
    2)
        echo ""
        echo "📦 Installing PostgreSQL and Redis..."
        
        # Install PostgreSQL
        if ! command_exists psql; then
            echo "Installing PostgreSQL..."
            brew install postgresql@15
        else
            echo -e "${GREEN}✅ PostgreSQL already installed${NC}"
        fi
        
        # Install Redis
        if ! command_exists redis-cli; then
            echo "Installing Redis..."
            brew install redis
        else
            echo -e "${GREEN}✅ Redis already installed${NC}"
        fi
        
        # Start services
        echo ""
        echo "🚀 Starting services..."
        brew services start postgresql@15
        brew services start redis
        
        sleep 2
        
        # Create database
        echo ""
        echo "📊 Creating database..."
        read -p "Enter database name (default: quai_social): " dbname
        dbname=${dbname:-quai_social}
        
        read -p "Enter database user (default: postgres): " dbuser
        dbuser=${dbuser:-postgres}
        
        read -sp "Enter database password (default: postgres): " dbpass
        echo ""
        dbpass=${dbpass:-postgres}
        
        # Create database
        createdb "$dbname" 2>/dev/null || echo "Database already exists"
        
        # Update .env
        echo ""
        echo "📝 Updating .env file..."
        cd apps/api
        
        if [ ! -f .env ]; then
            cp ENV_EXAMPLE .env
        fi
        
        # Update DATABASE_URL
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$dbuser:$dbpass@localhost:5432/$dbname|" .env
        sed -i.bak "s|REDIS_URL=.*|REDIS_URL=redis://localhost:6379|" .env
        rm .env.bak
        
        # Run migrations
        echo ""
        echo "🔄 Running Prisma migrations..."
        pnpm install
        pnpm prisma:generate
        pnpm prisma:migrate
        
        echo ""
        echo -e "${GREEN}✅ PostgreSQL + Redis setup complete!${NC}"
        echo ""
        echo "Database Details:"
        echo "  - Host: localhost"
        echo "  - Port: 5432"
        echo "  - Database: $dbname"
        echo "  - User: $dbuser"
        echo ""
        echo "Redis:"
        echo "  - Host: localhost"
        echo "  - Port: 6379"
        echo ""
        echo "Start the API with: cd apps/api && pnpm dev"
        ;;
    
    3)
        echo ""
        echo "🐳 Setting up Docker containers..."
        
        if ! command_exists docker; then
            echo -e "${RED}❌ Docker not found. Please install Docker Desktop first.${NC}"
            exit 1
        fi
        
        # Start Docker containers
        echo "Starting PostgreSQL and Redis containers..."
        docker-compose up -d postgres redis
        
        echo "Waiting for services to be ready..."
        sleep 5
        
        # Update .env
        echo ""
        echo "📝 Updating .env file..."
        cd apps/api
        
        if [ ! -f .env ]; then
            cp ENV_EXAMPLE .env
        fi
        
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai|" .env
        sed -i.bak "s|REDIS_URL=.*|REDIS_URL=redis://localhost:6379|" .env
        rm .env.bak
        
        # Run migrations
        echo ""
        echo "🔄 Running Prisma migrations..."
        pnpm install
        pnpm prisma:generate
        pnpm prisma:migrate
        
        echo ""
        echo -e "${GREEN}✅ Docker setup complete!${NC}"
        echo ""
        echo "Services running:"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - Redis: localhost:6379"
        echo ""
        echo "Manage containers:"
        echo "  - Stop: docker-compose down"
        echo "  - Restart: docker-compose restart"
        echo "  - Logs: docker-compose logs -f"
        echo ""
        echo "Start the API with: cd apps/api && pnpm dev"
        ;;
    
    4)
        echo ""
        echo -e "${YELLOW}⚠️  Skipping database setup${NC}"
        echo "Please configure your database manually in apps/api/.env"
        echo "See DATABASE_SETUP_GUIDE.md for instructions"
        ;;
    
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "📚 Next Steps:"
echo "1. Review DATABASE_SETUP_GUIDE.md for detailed information"
echo "2. Start the API: cd apps/api && pnpm dev"
echo "3. Start the frontend: cd apps/web && pnpm dev"
echo "4. Open Prisma Studio: cd apps/api && pnpm prisma studio"
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
