#!/bin/bash

echo "🚀 Starting RecipeShare MERN Application"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (for local setup)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running locally."
    echo "   Make sure MongoDB is started or use MongoDB Atlas."
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Backend dependencies already installed ✅"
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed ✅"
fi

cd ..

echo ""
echo "🎉 Setup complete! Now run these commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "cd frontend && npm start"
echo ""
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "Happy coding! 🍳👨‍🍳"
