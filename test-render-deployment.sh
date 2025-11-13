#!/bin/bash

# Script to test the deployed Render server and verify it has the latest code

echo "🔍 Testing Render Server Deployment Status"
echo "=========================================="
echo ""

SERVER_URL="https://yaya-1dc3.onrender.com"

echo "1️⃣  Checking server health..."
HEALTH=$(curl -s "$SERVER_URL/_health")
echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
echo ""

echo "2️⃣  Testing checkout endpoint with shipping/tax..."
echo ""

# Create test payload
PAYLOAD=$(cat <<EOF
{
  "items": [
    {
      "id": "test-book",
      "name": "Test Poetry Book",
      "title": "Test Poetry Book",
      "price": 28.00,
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Debug Test",
    "email": "debug@test.com"
  },
  "discountAmount": 0,
  "discountCode": "",
  "shipping": 9.99,
  "tax": 2.38,
  "taxRate": 0.085,
  "subtotal": 28.00,
  "total": 40.37,
  "successUrl": "https://pastelpoetics.com/success.html",
  "cancelUrl": "https://pastelpoetics.com/cart.html"
}
EOF
)

echo "📤 Sending test checkout request..."
echo ""

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$SERVER_URL/create-stripe-session")

echo "📥 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if we got a checkout URL
if echo "$RESPONSE" | grep -q "url"; then
    echo "✅ SUCCESS: Server returned Stripe checkout URL"
    CHECKOUT_URL=$(echo "$RESPONSE" | jq -r '.url' 2>/dev/null)
    echo "   Checkout URL: $CHECKOUT_URL"
    echo ""
    echo "⚠️  IMPORTANT: Open this URL and verify that Stripe shows:"
    echo "   - Book: \$28.00"
    echo "   - Shipping: \$9.99"
    echo "   - Tax: \$2.38"
    echo "   - Total: \$40.37"
else
    echo "❌ FAILED: No checkout URL returned"
    echo ""
    echo "This might mean:"
    echo "   1. Render server hasn't redeployed with latest code"
    echo "   2. Stripe API error"
    echo "   3. Server configuration issue"
fi

echo ""
echo "3️⃣  Next steps:"
echo "=========================================="
echo ""
echo "If shipping/tax are NOT showing in Stripe:"
echo ""
echo "   A. Check Render logs:"
echo "      https://dashboard.render.com/"
echo "      Look for these log messages:"
echo "      - 📦 Stripe session request received"
echo "      - 🔍 Checking shipping and tax values"
echo "      - ✅ Adding shipping line item"
echo "      - ✅ Adding tax line item"
echo ""
echo "   B. If logs show ❌ NOT added:"
echo "      The values are being received as wrong type"
echo "      (string instead of number, null, undefined)"
echo ""
echo "   C. If logs don't appear at all:"
echo "      Render hasn't redeployed latest server code"
echo "      Go to Render dashboard and click 'Manual Deploy'"
echo ""
echo "   D. Redeploy server manually:"
echo "      1. Go to https://dashboard.render.com/"
echo "      2. Select 'yaya-1dc3' service"
echo "      3. Click 'Manual Deploy' → 'Deploy latest commit'"
echo "      4. Wait 2-3 minutes for deployment"
echo "      5. Re-run this test script"
echo ""
