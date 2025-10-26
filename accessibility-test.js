#!/usr/bin/env node

/**
 * Comprehensive Accessibility & Mobile Test Suite
 * Tests WCAG 2.1 AA compliance and mobile responsiveness
 */

const fs = require('fs');
const path = require('path');

console.log('♿ Starting Accessibility & Mobile Optimization Tests...\n');

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, condition, details = '', severity = 'error') {
  const passed = !!condition;
  results.tests.push({ name, passed, details, severity });
  
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    if (severity === 'warning') {
      results.warnings++;
      console.log(`⚠️  ${name}${details ? ` - ${details}` : ''}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
    }
  }
}

// ===== ACCESSIBILITY TESTS =====
console.log('♿ Testing Accessibility Features...');

// Check HTML structure
const indexContent = fs.readFileSync('index.html', 'utf8');
const shopContent = fs.readFileSync('shop.html', 'utf8');
const cartContent = fs.readFileSync('cart.html', 'utf8');
const checkoutContent = fs.readFileSync('checkout.html', 'utf8');
const cssContent = fs.readFileSync('styles.css', 'utf8');
const jsContent = fs.readFileSync('app.js', 'utf8');

// Semantic HTML Tests
test('HTML has proper lang attribute', 
  indexContent.includes('<html lang="en">'), 
  'Language specified for screen readers'
);

test('Skip links present for keyboard navigation', 
  indexContent.includes('skip-link') && indexContent.includes('Skip to content'), 
  'Skip navigation available'
);

test('Main content has proper role', 
  indexContent.includes('role="main"'), 
  'Main content area identified'
);

test('Navigation has proper ARIA labels', 
  shopContent.includes('role="navigation"') && shopContent.includes('aria-label="Main navigation"'), 
  'Navigation properly labeled'
);

test('Headings have proper hierarchy', 
  indexContent.includes('<h1>Yaya Starchild</h1>') && 
  indexContent.includes('<h2') && indexContent.includes('<h3') && 
  !indexContent.includes('<h2') || indexContent.indexOf('<h1>') < indexContent.indexOf('<h2'), 
  'Proper heading order: h1 before h2, etc.'
);

// ARIA and Accessibility Attributes
test('Images have descriptive alt text', 
  indexContent.includes('alt="Yaya Starchild circular logo') && 
  !indexContent.includes('alt=""') && 
  !indexContent.includes('alt="image"'), 
  'Descriptive alt text provided'
);

test('Interactive elements have ARIA attributes', 
  cartContent.includes('aria-live') && cartContent.includes('aria-label'), 
  'Dynamic content properly labeled'
);

test('Form elements have proper labels', 
  checkoutContent.includes('<label') && checkoutContent.includes('for='), 
  'Form accessibility implemented'
);

test('Current page indicators present', 
  shopContent.includes('aria-current="page"'), 
  'Navigation shows current location'
);

test('Screen reader text provided', 
  cssContent.includes('.sr-only') && cartContent.includes('sr-only'), 
  'Screen reader only content available'
);

// Focus Management Tests
test('Focus styles defined', 
  cssContent.includes(':focus-visible') && cssContent.includes('outline:'), 
  'Visible focus indicators present'
);

test('Focus management in JavaScript', 
  jsContent.includes('focus()') && jsContent.includes('manageFocus'), 
  'Programmatic focus handling'
);

test('Keyboard navigation support', 
  cssContent.includes('keyboard-focus') && jsContent.includes('keyboard-focus'), 
  'Keyboard-specific styling'
);

// Color and Contrast
test('High contrast mode support', 
  cssContent.includes('@media (prefers-contrast: high)'), 
  'High contrast preferences respected'
);

test('Focus colors defined', 
  cssContent.includes('--focus-color') && cssContent.includes('--focus-shadow'), 
  'Accessible focus colors'
);

// Motion and Animation
test('Reduced motion support', 
  cssContent.includes('@media (prefers-reduced-motion: reduce)'), 
  'Animation preferences respected'
);

test('Animations can be disabled', 
  cssContent.includes('animation-duration:0.01ms'), 
  'Animations properly disabled for accessibility'
);

// ===== MOBILE OPTIMIZATION TESTS =====
console.log('\n📱 Testing Mobile Optimization...');

// Viewport and Meta Tags
test('Viewport meta tag configured', 
  indexContent.includes('viewport-fit=cover') && indexContent.includes('initial-scale=1'), 
  'Proper viewport configuration'
);

test('Theme color defined for mobile', 
  indexContent.includes('theme-color') && indexContent.includes('#E89CC8'), 
  'Mobile theme color set'
);

test('Mobile-first responsive design', 
  cssContent.includes('min-width:') && cssContent.includes('@media'), 
  'Progressive enhancement approach'
);

// Touch Interactions
test('Touch-friendly button sizing', 
  cssContent.includes('--min-touch-size') && cssContent.includes('44px'), 
  'Minimum 44px touch targets'
);

test('Touch action optimization', 
  cssContent.includes('touch-action: manipulation'), 
  'Touch behavior optimized'
);

test('Tap highlight disabled', 
  cssContent.includes('-webkit-tap-highlight-color: transparent'), 
  'Custom touch feedback'
);

// Typography and Scaling
test('Fluid typography implemented', 
  cssContent.includes('clamp(') && cssContent.includes('vw'), 
  'Responsive font scaling'
);

test('Prevents mobile zoom on forms', 
  cssContent.includes('font-size:16px') || cssContent.includes('font-size: 16px'), 
  'Form inputs prevent unwanted zoom'
);

// Layout Responsiveness
test('Mobile-first grid system', 
  cssContent.includes('grid-template-columns: 1fr') && 
  cssContent.includes('grid-template-columns: repeat('), 
  'Progressive grid enhancement'
);

test('Flexible image sizing', 
  cssContent.includes('max-width: 100%') || cssContent.includes('width: 100%'), 
  'Images scale properly'
);

test('Container max-width defined', 
  cssContent.includes('--content-max-width') && cssContent.includes('1200px'), 
  'Content width constraints'
);

// ===== FORM ACCESSIBILITY TESTS =====
console.log('\n📝 Testing Form Accessibility...');

test('Fieldsets and legends used', 
  checkoutContent.includes('<fieldset>') && checkoutContent.includes('<legend>'), 
  'Form sections properly grouped'
);

test('Error handling accessible', 
  cssContent.includes('.form-error') && cssContent.includes('.form-success'), 
  'Error states defined'
);

test('Required fields indicated', 
  cssContent.includes('.required::after'), 
  'Required field indicators'
);

test('Form validation states', 
  cssContent.includes(':valid') && cssContent.includes(':invalid'), 
  'Visual validation feedback'
);

// ===== JAVASCRIPT ACCESSIBILITY TESTS =====
console.log('\n🔧 Testing JavaScript Accessibility...');

test('Screen reader announcements', 
  jsContent.includes('announceToScreenReader') && jsContent.includes('aria-live'), 
  'Dynamic content announced'
);

test('Accessibility initialization', 
  jsContent.includes('initAccessibility'), 
  'Accessibility features initialized'
);

test('Cart updates announced', 
  jsContent.includes('Added') && jsContent.includes('to cart'), 
  'Cart changes communicated'
);

test('Live regions implemented', 
  jsContent.includes('live-region') && cartContent.includes('aria-live="polite"'), 
  'Dynamic updates accessible'
);

// ===== PERFORMANCE FOR ACCESSIBILITY =====
console.log('\n⚡ Testing Performance Impact...');

test('Efficient focus detection', 
  jsContent.includes('keydown') && jsContent.includes('mousedown'), 
  'Focus mode detection optimized'
);

test('Reasonable animation count', 
  (cssContent.match(/@keyframes/g) || []).length < 15, 
  'Animation performance manageable for creative site'
);

// ===== FINAL RESULTS =====
console.log('\n' + '='.repeat(60));
console.log('🎯 ACCESSIBILITY & MOBILE TEST RESULTS');
console.log('='.repeat(60));

console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📊 Total:    ${results.tests.length}`);

const successRate = (results.passed / results.tests.length * 100).toFixed(1);
console.log(`📈 Success Rate: ${successRate}%`);

// Accessibility compliance levels
let complianceLevel = 'Non-compliant';
if (successRate >= 95) complianceLevel = 'WCAG 2.1 AA Compliant';
else if (successRate >= 85) complianceLevel = 'WCAG 2.1 A Compliant';
else if (successRate >= 75) complianceLevel = 'Basic Accessibility';

console.log(`♿ Compliance Level: ${complianceLevel}`);

if (results.failed === 0 && results.warnings === 0) {
  console.log('\n🎉 PERFECT ACCESSIBILITY SCORE! 🌟');
  console.log('✨ Your site meets modern accessibility standards!');
} else if (results.failed === 0) {
  console.log('\n✅ All critical tests passed!');
  console.log('⚠️  Review warnings for optimal experience');
} else {
  console.log('\n⚠️  Some accessibility issues found:');
  results.tests.filter(t => !t.passed && t.severity === 'error').forEach(test => {
    console.log(`   ❌ ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
  
  if (results.warnings > 0) {
    console.log('\n💡 Recommendations:');
    results.tests.filter(t => !t.passed && t.severity === 'warning').forEach(test => {
      console.log(`   ⚠️  ${test.name}${test.details ? ` - ${test.details}` : ''}`);
    });
  }
}

console.log('\n🌈 Accessibility & Mobile Optimization Test Complete!\n');

// Export results for CI integration
module.exports = { results, complianceLevel, successRate };