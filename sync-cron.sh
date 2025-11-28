#!/bin/bash
# Sync script for esimaccess packages
# Runs every Sunday at 4 AM

LOG_FILE="/root/sync-esimaccess.log"
SYNC_URL="http://localhost:1337/api/sync/esimAccess"

echo "=== Sync started at $(date) ===" >> "$LOG_FILE"

# Call the sync endpoint
response=$(curl -s -X POST "$SYNC_URL" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" = "200" ]; then
    echo "✅ Sync successful: $body" >> "$LOG_FILE"
else
    echo "❌ Sync failed (HTTP $http_status): $body" >> "$LOG_FILE"
fi

echo "=== Sync finished at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
