#!/bin/bash

echo "🔍 Running Bug Check & Validation..."
echo ""

# Check if error-monitor.js exists
if [ -f "error-monitor.js" ]; then
  echo "✅ error-monitor.js exists"
else
  echo "❌ error-monitor.js missing"
fi

# Check if manifest links are commented
echo ""
echo "Checking manifest links..."
MANIFEST_COUNT=$(grep -c '<link rel="manifest"' *.html 2>/dev/null || echo "0")
COMMENTED_COUNT=$(grep -c '<!-- <link rel="manifest"' *.html 2>/dev/null || echo "0")

echo "   Active manifest links: $MANIFEST_COUNT"
echo "   Commented manifest links: $COMMENTED_COUNT"

if [ "$COMMENTED_COUNT" -gt 0 ]; then
  echo "✅ Manifest links properly commented for dev"
else
  echo "⚠️  No commented manifest links found"
fi

# Check if error-monitor is loaded in HTML files
echo ""
echo "Checking error-monitor.js integration..."
for file in index.html shop.html about.html product.html checkout.html cart.html; do
  if [ -f "$file" ]; then
    if grep -q "error-monitor.js" "$file"; then
      echo "   ✅ $file includes error-monitor.js"
    else
      echo "   ❌ $file missing error-monitor.js"
    fi
  fi
done

# Validate JavaScript syntax
echo ""
echo "Validating JavaScript files..."
for file in app.js products.js error-monitor.js; do
  if [ -f "$file" ]; then
    if node -c "$file" 2>/dev/null; then
      echo "   ✅ $file syntax valid"
    else
      echo "   ❌ $file has syntax errors"
      node -c "$file"
    fi
  fi
done

# Check file sizes
echo ""
echo "File sizes:"
for file in index.html shop.html app.js products.js error-monitor.js; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file")
    echo "   $file: $SIZE bytes"
  fi
done

echo ""
echo "🎉 Validation complete!"
echo ""
echo "To test in browser:"
echo "1. Start a local server: python3 -m http.server 8000"
echo "2. Open http://localhost:8000/index.html"
echo "3. Open browser console"
echo "4. Type: ErrorMonitor.getSummary()"
echo ""
