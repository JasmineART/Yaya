/**
 * Yaya Site - Quick Console Test
 * 
 * Copy and paste this into your browser console (F12) 
 * when viewing any page on the Yaya site.
 * 
 * This will test all major functionality and report results.
 */

console.clear();
console.log('%c🧪 Yaya Site - Quick Functionality Test', 'font-size: 20px; font-weight: bold; color: #9C27B0;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0;');

const results = {
    passed: [],
    failed: [],
    warnings: []
};

function pass(msg) {
    results.passed.push(msg);
    console.log('%c✅ PASS:', 'color: #4CAF50; font-weight: bold;', msg);
}

function fail(msg) {
    results.failed.push(msg);
    console.log('%c❌ FAIL:', 'color: #F44336; font-weight: bold;', msg);
}

function warn(msg) {
    results.warnings.push(msg);
    console.log('%c⚠️ WARN:', 'color: #FF9800; font-weight: bold;', msg);
}

console.log('\n%c📄 Structure Tests', 'font-size: 16px; font-weight: bold; color: #2196F3;');
console.log('─────────────────────');

// Test header
const headers = document.querySelectorAll('.site-header');
if (headers.length === 1) {
    pass('Single header element found');
} else if (headers.length === 0) {
    fail('No header found');
} else {
    fail(`Multiple headers found (${headers.length})`);
}

// Test nav
const navs = document.querySelectorAll('.nav');
if (navs.length >= 1) {
    pass('Navigation found');
} else {
    fail('No navigation found');
}

// Test footer
const footers = document.querySelectorAll('.site-footer');
if (footers.length === 1) {
    pass('Single footer element found');
} else if (footers.length === 0) {
    warn('No footer found');
} else {
    fail(`Multiple footers found (${footers.length})`);
}

console.log('\n%c✨ Sparkle System Tests', 'font-size: 16px; font-weight: bold; color: #9C27B0;');
console.log('──────────────────────────');

// Test sparkle function
if (typeof createMagicalSparkles === 'function') {
    pass('createMagicalSparkles() function exists');
} else {
    fail('createMagicalSparkles() function not found');
}

// Test style injection function
if (typeof injectSparkleStyles === 'function') {
    pass('injectSparkleStyles() function exists');
} else {
    fail('injectSparkleStyles() function not found');
}

// Test if styles were injected
const sparkleStyles = document.getElementById('sparkle-animation-styles');
if (sparkleStyles) {
    pass('Sparkle animation styles injected');
    if (sparkleStyles.textContent.includes('floatSparkle')) {
        pass('floatSparkle keyframes defined');
    } else {
        fail('floatSparkle keyframes not found');
    }
} else {
    fail('Sparkle animation styles not injected');
}

// Count current sparkles
const sparkles = document.querySelectorAll('.sparkle');
if (sparkles.length > 0) {
    pass(`${sparkles.length} sparkles currently in DOM`);
} else {
    warn('No sparkles in DOM yet (they may be generating)');
}

console.log('\n%c🎬 Scroll Reveal Tests', 'font-size: 16px; font-weight: bold; color: #673AB7;');
console.log('───────────────────────');

// Test reveal function
if (typeof revealOnScroll === 'function') {
    pass('revealOnScroll() function exists');
} else {
    fail('revealOnScroll() function not found');
}

// Test reveal elements
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
if (reveals.length > 0) {
    pass(`${reveals.length} reveal elements found`);
    
    const active = document.querySelectorAll('.reveal.active, .reveal-left.active, .reveal-right.active, .reveal-scale.active');
    if (active.length > 0) {
        pass(`${active.length} reveal elements already activated`);
    } else {
        warn('No reveal elements activated yet (scroll to trigger)');
    }
} else {
    warn('No reveal elements on this page');
}

console.log('\n%c🛒 Cart System Tests', 'font-size: 16px; font-weight: bold; color: #FF5722;');
console.log('──────────────────────');

// Test cart functions
const cartFunctions = ['getCart', 'saveCart', 'addToCart', 'updateCartCount', 'renderCartContents'];
cartFunctions.forEach(fn => {
    if (typeof window[fn] === 'function') {
        pass(`${fn}() function exists`);
    } else {
        warn(`${fn}() function not found`);
    }
});

// Test discount codes
if (typeof DISCOUNTS !== 'undefined') {
    pass('DISCOUNTS object defined');
    if (DISCOUNTS.SUN10 && DISCOUNTS.FAIRY5 && DISCOUNTS.MAGIC15) {
        pass('All discount codes defined (SUN10, FAIRY5, MAGIC15)');
    } else {
        warn('Some discount codes missing');
    }
} else {
    warn('DISCOUNTS object not found (might be in closure)');
}

console.log('\n%c📦 Product System Tests', 'font-size: 16px; font-weight: bold; color: #795548;');
console.log('────────────────────────');

if (typeof window.PRODUCTS !== 'undefined') {
    pass(`PRODUCTS array defined (${window.PRODUCTS.length} products)`);
} else {
    warn('PRODUCTS array not found on window (might not be loaded)');
}

console.log('\n%c🔍 Summary', 'font-size: 18px; font-weight: bold; color: #9C27B0;');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`\n%c✅ Passed: ${results.passed.length}`, 'color: #4CAF50; font-weight: bold; font-size: 14px;');
console.log(`%c❌ Failed: ${results.failed.length}`, 'color: #F44336; font-weight: bold; font-size: 14px;');
console.log(`%c⚠️ Warnings: ${results.warnings.length}`, 'color: #FF9800; font-weight: bold; font-size: 14px;');

if (results.failed.length === 0) {
    console.log('\n%c🎉 ALL TESTS PASSED! Site is working correctly. ✨', 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
} else {
    console.log('\n%c⚠️ Some tests failed. Check the details above.', 'background: #F44336; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
}

console.log('\n%c💡 Tips:', 'font-size: 14px; font-weight: bold; color: #2196F3;');
console.log('• To manually create a sparkle: Run testSparkle() in console');
console.log('• To see sparkle count: Run document.querySelectorAll(".sparkle").length');
console.log('• To trigger reveals: Scroll down the page');
console.log('• Full test suite: /test-functionality.html');
console.log('• Debug sparkles: /debug-sparkles.html');

// Helper function to test sparkles
window.testSparkle = function() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = '50%';
    sparkle.style.width = '6px';
    sparkle.style.height = '6px';
    sparkle.style.setProperty('--drift', '50px');
    sparkle.style.animation = 'floatSparkle 4s ease-in-out';
    document.body.appendChild(sparkle);
    console.log('%c✨ Test sparkle created! Watch for it floating upward.', 'color: #9C27B0; font-weight: bold;');
    setTimeout(() => sparkle.remove(), 4000);
};

console.log('\n%cRun testSparkle() to create a test sparkle now! ✨', 'background: #9C27B0; color: white; padding: 8px; font-size: 14px;');
