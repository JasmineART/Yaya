#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Run this locally before pushing to ensure deployment will succeed
 * 
 * Usage: node validate-deploy.js
 */

const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error('❌ ERROR:', msg);
  errors++;
}

function warn(msg) {
  console.warn('⚠️  WARNING:', msg);
  warnings++;
}

function success(msg) {
  console.log('✅', msg);
}

console.log('\n🔍 Running pre-deployment validation...\n');

// ========== HTML Validation ==========
console.log('📄 Validating HTML files...');
const htmlFiles = fs.readdirSync('.').filter(f => 
  f.endsWith('.html') && !f.startsWith('test-') && !f.startsWith('diagnostic-')
);

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (!content.match(/<!doctype html>/i)) {
    error(`${file} - Missing DOCTYPE`);
  }
  
  if (!content.includes('</html>')) {
    error(`${file} - Missing closing </html> tag`);
  }
  
  if (!content.includes('<title>')) {
    error(`${file} - Missing <title> tag`);
  }
  
  if (!content.includes('viewport')) {
    warn(`${file} - Missing viewport meta tag (not mobile-friendly)`);
  }
});

success(`${htmlFiles.length} HTML files validated`);

// ========== JavaScript Validation ==========
console.log('\n💻 Validating JavaScript files...');
const jsFiles = ['app.js', 'products.js', 'stripe-payments.js', 'simple-email.js'];

jsFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    error(`${file} - File missing`);
    return;
  }
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    new Function(content); // Basic syntax check
    
    // Check for console.log
    const logCount = (content.match(/console\.log/g) || []).length;
    if (logCount > 5) {
      warn(`${file} - Contains ${logCount} console.log statements`);
    }
    
  } catch (e) {
    error(`${file} - Syntax error: ${e.message.split('\n')[0]}`);
  }
});

success(`${jsFiles.length} JavaScript files validated`);

// ========== Products Data Validation ==========
console.log('\n🛍️  Validating product data...');
const productsContent = fs.readFileSync('products.js', 'utf8');

if (!productsContent.includes('PRODUCTS = [')) {
  error('products.js - PRODUCTS array not found');
}

const requiredFunctions = ['formatPrice', 'renderProductsGrid', 'getProductById'];
requiredFunctions.forEach(fn => {
  if (!productsContent.includes(fn)) {
    error(`products.js - Function ${fn} not found`);
  }
});

success('Product data structure valid');

// ========== File Size Check ==========
console.log('\n📊 Checking file sizes...');
const sizeChecks = {
  'app.js': 50 * 1024,
  'styles.css': 60 * 1024,
  'products.js': 30 * 1024
};

Object.entries(sizeChecks).forEach(([file, maxSize]) => {
  const stats = fs.statSync(file);
  const sizeKB = (stats.size / 1024).toFixed(1);
  const maxKB = (maxSize / 1024).toFixed(0);
  
  if (stats.size > maxSize) {
    warn(`${file} - ${sizeKB}KB exceeds recommended ${maxKB}KB`);
  } else {
    success(`${file} - ${sizeKB}KB / ${maxKB}KB`);
  }
});

// ========== Critical Files Check ==========
console.log('\n📁 Verifying critical files...');
const criticalFiles = [
  'index.html',
  'shop.html',
  'cart.html',
  'checkout.html',
  'product.html',
  'about.html',
  'success.html',
  'app.js',
  'products.js',
  'styles.css',
  'firebase-config.js',
  'simple-email.js',
  'assets/logo-new.jpg',
  'assets/suncatcher-cover.jpg'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    error(`Critical file missing: ${file}`);
  }
});

success(`All ${criticalFiles.length} critical files present`);

// ========== Sensitive Data Check ==========
console.log('\n🔒 Checking for sensitive data...');
const checkFiles = fs.readdirSync('.').filter(f => 
  (f.endsWith('.js') || f.endsWith('.html')) && 
  !f.includes('node_modules') &&
  !f.startsWith('test-') &&
  !f.startsWith('validate-') &&
  !f.endsWith('-test.js')
);

const sensitivePatterns = [
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/, name: 'Stripe secret key', severity: 'error' },
  { pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/, name: 'Hardcoded password', severity: 'error' }
];

checkFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  sensitivePatterns.forEach(({ pattern, name, severity }) => {
    if (pattern.test(content)) {
      if (severity === 'error') {
        error(`${file} - Contains ${name}`);
      } else {
        warn(`${file} - Contains ${name}`);
      }
    }
  });
});

success('No sensitive data detected');

// ========== Test Files Check ==========
console.log('\n🧹 Checking for test files that should be excluded...');
const testPatterns = ['test-', 'diagnostic-', 'debug-'];
const testFiles = fs.readdirSync('.').filter(f => 
  testPatterns.some(pattern => f.startsWith(pattern))
);

if (testFiles.length > 0) {
  warn(`Found ${testFiles.length} test file(s) - will be removed during deployment:`);
  testFiles.forEach(f => console.log('   •', f));
} else {
  success('No test files in root (already cleaned)');
}

// ========== Final Summary ==========
console.log('\n╔════════════════════════════════════════╗');
console.log('║         VALIDATION SUMMARY             ║');
console.log('╚════════════════════════════════════════╝\n');

console.log(`Errors:   ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  console.log('\n❌ VALIDATION FAILED - Fix errors before deploying!\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS\n');
  console.log('Consider fixing warnings for optimal deployment.\n');
  process.exit(0);
} else {
  console.log('\n✅ VALIDATION SUCCESSFUL - Safe to deploy! 🎉\n');
  process.exit(0);
}
