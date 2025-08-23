#!/bin/bash

echo "🔍 Testing /api/stores endpoint..."
echo "URL: https://pashahomeapps.up.railway.app/api/stores"
echo ""

# Test the API endpoint
curl -s -H "Accept: application/json" \
     -H "Authorization: Bearer test-token" \
     "https://pashahomeapps.up.railway.app/api/stores" | \
     jq '.data[0] | {kurum_adi, store_type}'

echo ""
echo "✅ Test completed"
