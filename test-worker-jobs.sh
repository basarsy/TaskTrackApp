#!/bin/bash

echo "🔧 TaskTrack Worker Service Job Testing"
echo "========================================="

WORKER_URL="http://localhost:5092"

echo ""
echo "📊 Checking WorkerService status..."
curl -s "$WORKER_URL/api/jobs/status" | jq '.' || echo "❌ WorkerService not responding. Make sure it's running on port 5092"

echo ""
echo "🧹 Triggering manual cleanup jobs..."

echo ""
echo "1. Triggering completed tasks cleanup (30 days old)..."
curl -X POST "$WORKER_URL/api/jobs/cleanup/completed?daysOld=30" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Failed to trigger cleanup"

echo ""
echo "2. Triggering orphaned tasks cleanup..."
curl -X POST "$WORKER_URL/api/jobs/cleanup/orphaned" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Failed to trigger orphaned cleanup"

echo ""
echo "3. Triggering task report generation..."
curl -X POST "$WORKER_URL/api/jobs/reports/generate" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Failed to trigger report generation"

echo ""
echo "📅 Setting up scheduled jobs..."

echo ""
echo "4. Scheduling daily cleanup (2 AM)..."
curl -X POST "$WORKER_URL/api/jobs/schedule/daily-cleanup?daysOld=30&cronExpression=0%202%20*%20*%20*" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Failed to schedule daily cleanup"

echo ""
echo "5. Scheduling daily reports (8 AM)..."
curl -X POST "$WORKER_URL/api/jobs/schedule/daily-reports?cronExpression=0%208%20*%20*%20*" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Failed to schedule daily reports"

echo ""
echo "✅ Job testing completed!"
echo ""
echo "📖 Available endpoints:"
echo "  • Worker Service API: $WORKER_URL/swagger"
echo "  • Hangfire Dashboard: $WORKER_URL/hangfire (admin/admin123)"
echo "  • Job Status: $WORKER_URL/api/jobs/status"
echo ""
echo "📋 Manual job triggers:"
echo "  • POST $WORKER_URL/api/jobs/cleanup/completed?daysOld=30"
echo "  • POST $WORKER_URL/api/jobs/cleanup/orphaned"
echo "  • POST $WORKER_URL/api/jobs/reports/generate"
echo ""
echo "⏰ Scheduled jobs:"
echo "  • Daily cleanup: 2:00 AM (removes tasks older than 30 days)"
echo "  • Daily reports: 8:00 AM (sends task statistics)"
echo "  • Log monitoring: Every 5 minutes (checks for errors)"
echo ""
echo "📁 Log files:"
echo "  • MainService logs: /app/logs/mainservice-*.log"
echo "  • WorkerService logs: /app/logs/workerservice-*.log"
echo ""
echo "🔍 The LogMonitoringService is running in the background and will:"
echo "  • Monitor MainService logs for errors every 5 minutes"
echo "  • Send email notifications when errors are detected"
echo "  • Track incomplete tasks and send reports" 