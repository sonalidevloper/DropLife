#!/bin/bash

echo "🩸 Starting DROPLIFE..."
echo ""

# Start backend in background
echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Development Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ DROPLIFE is running!"
echo ""
echo "📍 Backend:  http://localhost:5000"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait