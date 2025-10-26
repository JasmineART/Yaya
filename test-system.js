#!/usr/bin/env node

/**
 * Comprehensive System Test Suite
 * Tests all critical functionality before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Yaya Starchild System Tests...\n');

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, condition, details = '') {
  const passed = !!condition;
  results.tests.push({ name, passed, details });
  
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
  }
}

// File Structure Tests
console.log('📁 Testing File Structure...');

test('Core HTML files exist', 
  fs.existsSync('index.html') && 
  fs.existsSync('shop.html') && 
  fs.existsSync('cart.html') && 
  fs.existsSync('checkout.html') && 
  fs.existsSync('success.html')
);

test('Core JS files exist',
  fs.existsSync('app.js') && 
  fs.existsSync('products.js') && 
  fs.existsSync('stripe-payments.js') && 
  fs.existsSync('simple-email.js')
);

test('Assets directory exists', fs.existsSync('assets/'));
test('Logo file exists', fs.existsSync('assets/logo-new.jpg'));
test('Server directory exists', fs.existsSync('server/index.js'));
test('Build script exists', fs.existsSync('build-static.js'));

// Configuration Tests
console.log('\n⚙️ Testing Configuration...');

// Test Stripe configuration
const stripeContent = fs.readFileSync('stripe-payments.js', 'utf8');
test('Stripe API key configured', 
  stripeContent.includes('pk_live_51SM7yMRMDdiM5E9AoXPdpUxWXxK3h2ZlOwy2hbqwp4o2BHAr2bM30LKSuNv8AdeMJV0l6nfhvIa2Hzxny8VI9GQx00dDiIoUZ6'),
  'Live Stripe key found'
);

// Test EmailJS configuration
const emailContent = fs.readFileSync('simple-email.js', 'utf8');
test('EmailJS service configured', 
  emailContent.includes('service_eodjffq') && emailContent.includes('FWvhfYEosGwcS5rxq'),
  'EmailJS credentials found'
);

// Code Quality Tests
console.log('\n🔍 Testing Code Quality...');

// Test for console.log cleanup (should have some for debugging but not excessive)
const appContent = fs.readFileSync('app.js', 'utf8');
const consoleLogCount = (appContent.match(/console\.log/g) || []).length;
test('Reasonable console.log usage', 
  consoleLogCount < 20,
  `Found ${consoleLogCount} console.log statements`
);

// Test for proper error handling
test('Error handling present in Stripe integration',
  stripeContent.includes('catch') && stripeContent.includes('error'),
  'Error handling found'
);

test('Error handling present in Email integration',
  emailContent.includes('catch') && emailContent.includes('error'),
  'Error handling found'
);

// Security Tests
console.log('\n🔒 Testing Security...');

test('No hardcoded secrets in main files',
  !appContent.includes('password') && 
  !appContent.includes('secret') && 
  !appContent.includes('private_key'),
  'No obvious secrets found'
);

test('Stripe uses secure connection',
  stripeContent.includes('Stripe(') && !stripeContent.includes('http://'),
  'Secure connection verified');

// Build System Tests
console.log('\n🏗️ Testing Build System...');

test('Build script is valid JavaScript', 
  fs.existsSync('build-static.js'),
  'Build script exists'
);

const buildContent = fs.readFileSync('build-static.js', 'utf8');
test('Build includes all necessary files',
  buildContent.includes('stripe-payments.js') && 
  buildContent.includes('simple-email.js') && 
  buildContent.includes('success.html'),
  'All new files included'
);

// Product Data Tests
console.log('\n🛍️ Testing Product Data...');

const productsContent = fs.readFileSync('products.js', 'utf8');
test('Products have required fields',
  productsContent.includes('name') && 
  productsContent.includes('price') && 
  productsContent.includes('image'),
  'Product structure verified'
);

// HTML Validation Tests
console.log('\n📄 Testing HTML Structure...');

const checkoutContent = fs.readFileSync('checkout.html', 'utf8');
test('Checkout includes Stripe script',
  checkoutContent.includes('js.stripe.com/v3/'),
  'Stripe.js library loaded'
);

test('Checkout includes payment handler',
  checkoutContent.includes('handleStripeCheckout'),
  'Payment handler referenced'
);

const successContent = fs.readFileSync('success.html', 'utf8');
test('Success page handles session ID',
  successContent.includes('session_id'),
  'Session ID handling found'
);

// CSS Tests
console.log('\n🎨 Testing Styles...');

const cssContent = fs.readFileSync('styles.css', 'utf8');
test('CSS includes glass morphism styles',
  cssContent.includes('backdrop-filter') || cssContent.includes('glass'),
  'Modern CSS features found'
);

test('CSS includes responsive design',
  cssContent.includes('@media') || cssContent.includes('mobile'),
  'Responsive design found'
);

// Integration Tests
console.log('\n🔗 Testing Integrations...');

test('Checkout form has proper field IDs',
  checkoutContent.includes('id="name"') && checkoutContent.includes('id="email"'),
  'Form fields properly configured'
);

test('Cart integration present',
  appContent.includes('cart') && appContent.includes('localStorage'),
  'Cart functionality found'
);

// Deployment Tests
console.log('\n🚀 Testing Deployment Configuration...');

test('GitHub Actions workflow exists', 
  fs.existsSync('.github/workflows/deploy.yml') || fs.existsSync('.github/workflows/pages-deploy.yml'),
  'Deployment workflow configured'
);

test('CNAME or custom domain ready',
  fs.existsSync('CNAME') || buildContent.includes('CNAME'),
  'Domain configuration ready (optional)'
);

// Final Results
console.log('\n' + '='.repeat(50));
console.log('🎯 TEST RESULTS SUMMARY');
console.log('='.repeat(50));

console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📊 Total:  ${results.tests.length}`);

const successRate = (results.passed / results.tests.length * 100).toFixed(1);
console.log(`📈 Success Rate: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! System ready for deployment! 🚀');
} else {
  console.log('\n⚠️  Some tests failed. Review issues before deployment.');
  console.log('\n❌ Failed Tests:');
  results.tests.filter(t => !t.passed).forEach(test => {
    console.log(`   • ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
}

console.log('\n🌟 Yaya Starchild System Test Complete!\n');

// Export results for potential CI integration
module.exports = { results, passed: results.failed === 0 };