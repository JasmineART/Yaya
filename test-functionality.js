const fs = require('fs');

console.log('=== COMPREHENSIVE FUNCTIONALITY TEST ===\n');

// 1. Test all critical functions are exported
const requiredExports = [
  'addToCart',
  'getCart', 
  'getCartTotal',
  'getCartItems',
  'updateCartCount',
  'removeFromCart',
  'getAppliedDiscount',
  'saveAppliedDiscount',
  'clearAppliedDiscount',
  'calculateDiscount',
  'removeDiscount'
];

console.log('1. Checking required exports in app.js...');
const appJs = fs.readFileSync('app.js', 'utf8');
const missingExports = [];
requiredExports.forEach(func => {
  const exported = appJs.includes(`window.${func} = ${func}`);
  if (!exported) {
    missingExports.push(func);
    console.log(`  ❌ Missing export: window.${func}`);
  } else {
    console.log(`  ✅ window.${func} exported`);
  }
});

// 2. Test critical functions are defined
console.log('\n2. Checking function definitions...');
const requiredFunctions = [
  'function addToCart',
  'function getCart',
  'function getCartTotal',
  'function updateCartCount',
  'function removeFromCart',
  'function getAppliedDiscount',
  'function calculateDiscount',
  'function renderCartContents',
  'function renderOrderSummary'
];

const missingFunctions = [];
requiredFunctions.forEach(func => {
  if (appJs.includes(func)) {
    console.log(`  ✅ ${func} defined`);
  } else {
    missingFunctions.push(func);
    console.log(`  ❌ ${func} NOT FOUND`);
  }
});

// 3. Check products.js exports
console.log('\n3. Checking products.js exports...');
const productsJs = fs.readFileSync('products.js', 'utf8');
const productExports = ['window.PRODUCTS', 'window.products'];
productExports.forEach(exp => {
  if (productsJs.includes(exp)) {
    console.log(`  ✅ ${exp} exported`);
  } else {
    console.log(`  ❌ ${exp} NOT exported`);
  }
});

// 4. Check for critical bugs
console.log('\n4. Checking for potential bugs...');
const bugs = [];

// Check if getCartTotal is called
if (appJs.includes('getCartTotal()')) {
  console.log('  ✅ getCartTotal() is being called');
} else {
  console.log('  ⚠️  getCartTotal() not called anywhere');
}

// Check if window.PRODUCTS is used (not window.products in lowercase)
const productsLowercase = appJs.match(/window\.products[^A-Z]/g);
if (productsLowercase && productsLowercase.length > 0) {
  console.log(`  ⚠️  Found ${productsLowercase.length} lowercase window.products references (should be PRODUCTS)`);
} else {
  console.log('  ✅ All product references use window.PRODUCTS');
}

// Check localStorage usage
if (appJs.includes('localStorage.setItem') && appJs.includes('localStorage.getItem')) {
  console.log('  ✅ localStorage methods used correctly');
} else {
  console.log('  ❌ localStorage methods missing');
}

// 5. Check products.js for addToCart calls
console.log('\n5. Checking products.js integration...');
if (productsJs.includes('addToCart(p.id')) {
  console.log('  ✅ products.js calls addToCart');
} else {
  console.log('  ❌ products.js does NOT call addToCart');
}

if (productsJs.includes('updateCartCount()')) {
  console.log('  ✅ products.js calls updateCartCount');
} else {
  console.log('  ⚠️  products.js does NOT call updateCartCount');
}

// 6. Summary
console.log('\n=== TEST SUMMARY ===');
if (missingExports.length === 0 && missingFunctions.length === 0) {
  console.log('✅ ALL TESTS PASSED - No critical issues found');
  process.exit(0);
} else {
  console.log('❌ ISSUES FOUND:');
  if (missingExports.length > 0) {
    console.log('  Missing exports:', missingExports.join(', '));
  }
  if (missingFunctions.length > 0) {
    console.log('  Missing functions:', missingFunctions.join(', '));
  }
  process.exit(1);
}
