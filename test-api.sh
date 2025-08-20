#!/bin/bash

API_BASE="http://localhost:5091/api"
USERNAME="admin"
PASSWORD="admin123"

echo "🧪 Testing TaskTrackApp API Endpoints"
echo "====================================="

# Test authentication
echo "🔐 Testing authentication..."
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"userName\":\"$USERNAME\",\"userPassword\":\"$PASSWORD\"}")

if [[ $TOKEN =~ ^eyJ ]]; then
    echo "✅ Authentication successful"
    echo "🎟️  Token: ${TOKEN:0:50}..."
else
    echo "❌ Authentication failed: $TOKEN"
    exit 1
fi

# Test get users (admin only)
echo ""
echo "👥 Testing get users..."
USERS=$(curl -s -X GET "$API_BASE/user/get" \
    -H "Authorization: Bearer $TOKEN")

if [[ $USERS == *"userId"* ]]; then
    echo "✅ Get users successful"
    echo "👤 Users found: $(echo $USERS | grep -o 'userId' | wc -l)"
else
    echo "❌ Get users failed: $USERS"
fi

# Test get tasks
echo ""
echo "📋 Testing get tasks..."
TASKS=$(curl -s -X GET "$API_BASE/task/get" \
    -H "Authorization: Bearer $TOKEN")

if [[ $TASKS == *"taskId"* ]] || [[ $TASKS == *"no tasks"* ]]; then
    echo "✅ Get tasks successful"
    if [[ $TASKS == *"taskId"* ]]; then
        echo "📝 Tasks found: $(echo $TASKS | grep -o 'taskId' | wc -l)"
    else
        echo "📝 No tasks found (empty database)"
    fi
else
    echo "❌ Get tasks failed: $TASKS"
fi

# Test create task
echo ""
echo "📝 Testing create task..."
CREATE_RESULT=$(curl -s -X POST "$API_BASE/task/create" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "taskName": "Test Task from API",
        "taskDescription": "This is a test task created via API",
        "taskPriority": 2,
        "isTaskCompleted": false,
        "userId": 1
    }')

if [[ $CREATE_RESULT == *"created successfully"* ]]; then
    echo "✅ Create task successful: $CREATE_RESULT"
else
    echo "❌ Create task failed: $CREATE_RESULT"
fi

echo ""
echo "🎉 API testing completed!"
echo "========================="
echo ""
echo "🌐 You can now test the frontend at: http://localhost:5093"
echo "📚 View API documentation at: http://localhost:5091/swagger" 