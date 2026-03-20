#!/bin/bash

echo "🩸 DROPLIFE Setup Script"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 14+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env file with your credentials${NC}"
fi

npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from .env.example${NC}"
    cp .env.example .env
fi

npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Update backend/.env with your MongoDB URI and other credentials"
echo "2. Update frontend/.env with your API URL"
echo "3. Run 'npm run dev' in backend directory"
echo "4. Run 'npm start' in frontend directory"
echo ""
echo "🩸 Happy coding with DROPLIFE!"