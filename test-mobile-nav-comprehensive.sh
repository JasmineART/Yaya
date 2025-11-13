#!/bin/bash
# Mobile Navigation Comprehensive Test Script

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔍 MOBILE NAVIGATION COMPREHENSIVE CHECK                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Test 1: JavaScript Syntax
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: JavaScript Syntax Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if node -c app.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} app.js syntax is valid"
else
    echo -e "${RED}✗${NC} app.js has syntax errors"
    ((ERRORS++))
fi
echo ""

# Test 2: HTML Files Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Hamburger Button in Main Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MAIN_PAGES=("index.html" "shop.html" "about.html" "cart.html" "checkout.html" "product.html" "policies.html")

for page in "${MAIN_PAGES[@]}"; do
    if [ -f "$page" ]; then
        if grep -q 'class="hamburger"' "$page"; then
            echo -e "${GREEN}✓${NC} $page has hamburger button"
        else
            echo -e "${RED}✗${NC} $page missing hamburger button"
            ((ERRORS++))
        fi
        
        # Check for nav element
        if grep -q 'id="main-nav"' "$page"; then
            echo -e "  ${GREEN}✓${NC} Has nav with id='main-nav'"
        else
            echo -e "  ${RED}✗${NC} Missing nav with id='main-nav'"
            ((ERRORS++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} $page not found"
        ((WARNINGS++))
    fi
done
echo ""

# Test 3: CSS Definitions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: CSS Hamburger Definitions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check base definition
if grep -q "^\.hamburger {" styles.css; then
    echo -e "${GREEN}✓${NC} Base .hamburger definition found"
    
    # Check if it has display: none
    if grep -A 5 "^\.hamburger {" styles.css | grep -q "display: none"; then
        echo -e "  ${GREEN}✓${NC} Set to display: none by default"
    else
        echo -e "  ${RED}✗${NC} Not hidden by default"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Base .hamburger definition missing"
    ((ERRORS++))
fi

# Check mobile media query
if grep -q "@media (max-width: 47.9375rem)" styles.css; then
    echo -e "${GREEN}✓${NC} Mobile media query found"
    
    # Check if hamburger is shown on mobile
    if grep -A 20 "@media (max-width: 47.9375rem)" styles.css | grep -A 2 "\.hamburger" | grep -q "display: flex"; then
        echo -e "  ${GREEN}✓${NC} Hamburger shown on mobile (display: flex)"
    else
        echo -e "  ${YELLOW}⚠${NC} Hamburger display not set to flex on mobile"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} Mobile media query missing"
    ((ERRORS++))
fi

# Check desktop media query
if grep -q "@media (min-width: 48rem)" styles.css; then
    echo -e "${GREEN}✓${NC} Desktop media query found"
    
    # Check if hamburger is hidden on desktop
    if grep -A 20 "@media (min-width: 48rem)" styles.css | grep -A 2 "\.hamburger" | grep -q "display: none !important"; then
        echo -e "  ${GREEN}✓${NC} Hamburger hidden on desktop (display: none !important)"
    else
        echo -e "  ${RED}✗${NC} Hamburger not properly hidden on desktop"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Desktop media query missing"
    ((ERRORS++))
fi
echo ""

# Test 4: JavaScript Functions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: JavaScript Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "function initMobileNavigation()" app.js; then
    echo -e "${GREEN}✓${NC} initMobileNavigation function defined"
    
    # Check initialization call
    if grep -q "initMobileNavigation();" app.js; then
        echo -e "  ${GREEN}✓${NC} Function is called on initialization"
    else
        echo -e "  ${RED}✗${NC} Function not called"
        ((ERRORS++))
    fi
    
    # Check for event listeners
    if grep -A 100 "function initMobileNavigation()" app.js | grep -q "addEventListener.*click"; then
        echo -e "  ${GREEN}✓${NC} Click event listeners added"
    else
        echo -e "  ${RED}✗${NC} Click event listeners missing"
        ((ERRORS++))
    fi
    
    # Check for keyboard support
    if grep -A 100 "function initMobileNavigation()" app.js | grep -q "Escape"; then
        echo -e "  ${GREEN}✓${NC} Escape key support added"
    else
        echo -e "  ${RED}✗${NC} Escape key support missing"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} initMobileNavigation function not found"
    ((ERRORS++))
fi
echo ""

# Test 5: ARIA Attributes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Accessibility (ARIA) Attributes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for page in "${MAIN_PAGES[@]}"; do
    if [ -f "$page" ]; then
        COUNT=0
        
        if grep -q 'aria-label="Toggle navigation menu"' "$page"; then
            ((COUNT++))
        fi
        if grep -q 'aria-expanded=' "$page"; then
            ((COUNT++))
        fi
        if grep -q 'aria-controls="main-nav"' "$page"; then
            ((COUNT++))
        fi
        
        if [ $COUNT -eq 3 ]; then
            echo -e "${GREEN}✓${NC} $page has all ARIA attributes"
        else
            echo -e "${YELLOW}⚠${NC} $page missing some ARIA attributes ($COUNT/3)"
            ((WARNINGS++))
        fi
    fi
done
echo ""

# Test 6: CSS Animation Definitions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Hamburger Animation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "\.hamburger\.active" styles.css; then
    echo -e "${GREEN}✓${NC} Hamburger animation states defined"
    
    # Check for all 3 line animations
    ANIM_COUNT=$(grep -c "\.hamburger\.active.*nth-child" styles.css)
    if [ $ANIM_COUNT -ge 6 ]; then  # Each line appears twice in grep output
        echo -e "  ${GREEN}✓${NC} All 3 hamburger lines have animations"
    else
        echo -e "  ${YELLOW}⚠${NC} Only $((ANIM_COUNT/2)) line animations found (expected 3)"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} Hamburger animation states missing"
    ((ERRORS++))
fi
echo ""

# Test 7: Mobile Navigation Overlay
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Mobile Menu Overlay"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "\.nav-overlay" styles.css; then
    echo -e "${GREEN}✓${NC} Overlay CSS defined"
else
    echo -e "${YELLOW}⚠${NC} Overlay CSS not found (created dynamically by JS)"
    ((WARNINGS++))
fi

if grep -q "nav-overlay" app.js; then
    echo -e "${GREEN}✓${NC} Overlay created in JavaScript"
else
    echo -e "${RED}✗${NC} Overlay creation code missing"
    ((ERRORS++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED! Mobile navigation is properly configured.${NC}"
    echo ""
    echo "Mobile Navigation Status: READY FOR PRODUCTION"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ TESTS PASSED with $WARNINGS warnings${NC}"
    echo ""
    echo "Mobile Navigation Status: FUNCTIONAL (minor issues)"
else
    echo -e "${RED}❌ TESTS FAILED: $ERRORS errors, $WARNINGS warnings${NC}"
    echo ""
    echo "Mobile Navigation Status: NEEDS FIXES"
fi
echo ""

# Deployment check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deployment Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking GitHub Actions..."
gh run list --limit 1 --json status,conclusion,displayTitle 2>/dev/null | jq -r '.[] | "Status: \(.status)\nConclusion: \(.conclusion)\nTitle: \(.displayTitle)"' || echo "Unable to check deployment status (gh cli not configured)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
