#!/bin/bash

echo "🚀 Starting TaskTrackApp Development Environment"
echo "================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Choice: Docker or Development mode
echo "Choose deployment mode:"
echo "1. Development (Vite dev server on port 5093)"
echo "2. Production (Docker containers)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Development mode
    echo "🛑 Stopping Docker frontend service..."
    docker compose stop frontservice 2>/dev/null || echo "Frontend service not running"
    
    # Start backend services
    echo "📦 Starting backend services..."
    docker compose up mainservice workerservice -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 5
    
    # Test backend connection
    echo "🧪 Testing backend connection..."
    if curl -s http://localhost:5091/api/auth/login >/dev/null; then
        echo "✅ Backend is ready!"
    else
        echo "❌ Backend is not responding. Check the logs with: docker compose logs mainservice"
        exit 1
    fi
    
    # Start frontend
    echo "🎨 Starting frontend development server..."
    cd FrontService
    npm install
    npm run dev &
    FRONTEND_PID=$!
else
    # Production mode
    echo "📦 Starting all services with Docker..."
    docker compose up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "🧪 Testing services..."
    if curl -s http://localhost:5093/ >/dev/null && curl -s http://localhost:5091/api/auth/login >/dev/null; then
        echo "✅ All services are ready!"
    else
        echo "❌ Services are not responding. Check the logs with: docker compose logs"
        exit 1
    fi
    FRONTEND_PID=""
fi

echo ""
echo "🎉 Development environment is ready!"
echo "================================================="
echo "📱 Frontend: http://localhost:5093"
echo "🔧 Backend API: http://localhost:5091/api"
echo "📊 Swagger UI: http://localhost:5091/swagger"
echo ""
echo "💡 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🛑 To stop all services:"
echo "   Frontend: Press Ctrl+C in the terminal running this script"
echo "   Backend: docker compose down"

# Keep the script running to maintain the frontend (development mode only)
if [ "$FRONTEND_PID" != "" ]; then
    wait $FRONTEND_PID
else
    echo "🎉 All services are running in Docker!"
    echo "Use 'docker compose logs -f' to view logs"
    echo "Use 'docker compose down' to stop all services"
fi 