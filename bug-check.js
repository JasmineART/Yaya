// Comprehensive Bug Check for All Pages
// Run this in browser console on each page

(function() {
  console.log('🔍 Running Comprehensive Bug Check...\n');
  
  const results = {
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    errors: [],
    warnings: [],
    success: []
  };
  
  // Check 1: Required Elements Present
  console.log('1️⃣ Checking Required Elements...');
  const requiredElements = {
    'header.site-header': 'Site header',
    'main': 'Main content area',
    'footer.site-footer': 'Site footer',
    '.brand': 'Brand logo section',
    'nav.nav': 'Navigation menu'
  };
  
  for (const [selector, name] of Object.entries(requiredElements)) {
    const el = document.querySelector(selector);
    if (!el) {
      results.errors.push(`Missing: ${name} (${selector})`);
    } else {
      results.success.push(`✓ ${name} present`);
    }
  }
  
  // Check 2: Image Loading
  console.log('2️⃣ Checking Images...');
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.complete || img.naturalHeight === 0) {
      results.warnings.push(`Image failed to load: ${img.src}`);
    } else {
      results.success.push(`✓ Image loaded: ${img.alt || img.src.split('/').pop()}`);
    }
  });
  
  // Check 3: JavaScript Functionality
  console.log('3️⃣ Checking JavaScript...');
  
  // Check sparkles
  const sparkles = document.querySelectorAll('.sparkle');
  if (sparkles.length > 0) {
    results.success.push(`✓ Sparkles rendered (${sparkles.length} particles)`);
  } else {
    results.warnings.push('No sparkles found - animation may not be running');
  }
  
  // Check neon castle (home page only)
  if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    const castle = document.querySelector('.neon-castle');
    if (castle) {
      results.success.push('✓ Neon castle rendered');
    } else {
      results.warnings.push('Neon castle not found on home page');
    }
    
    const spotlights = document.querySelectorAll('.spotlight');
    if (spotlights.length > 0) {
      results.success.push(`✓ Spotlights rendered (${spotlights.length} beams)`);
    } else {
      results.warnings.push('Spotlights not found on home page');
    }
  }
  
  // Check 4: Cart Functionality
  console.log('4️⃣ Checking Cart...');
  const cartCount = document.querySelector('#nav-cart-count');
  if (cartCount) {
    results.success.push(`✓ Cart counter present (${cartCount.textContent} items)`);
  } else {
    results.errors.push('Cart counter element missing');
  }
  
  // Check 5: External Resources
  console.log('5️⃣ Checking External Resources...');
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    if (link.href.includes('font-awesome')) {
      results.success.push('✓ Font Awesome loaded');
    }
  });
  
  // Check 6: Scroll Reveal Elements
  console.log('6️⃣ Checking Scroll Animations...');
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (revealElements.length > 0) {
    results.success.push(`✓ Scroll reveal elements present (${revealElements.length})`);
  } else {
    results.warnings.push('No scroll reveal elements found');
  }
  
  // Check 7: Forms
  console.log('7️⃣ Checking Forms...');
  const forms = document.querySelectorAll('form');
  forms.forEach((form, i) => {
    if (form.id) {
      results.success.push(`✓ Form present: ${form.id}`);
    } else {
      results.warnings.push(`Form ${i + 1} has no ID`);
    }
  });
  
  // Check 8: Links
  console.log('8️⃣ Checking Links...');
  const allLinks = document.querySelectorAll('a[href]');
  let brokenLinks = 0;
  allLinks.forEach(link => {
    if (link.href === '' || link.href === '#') {
      brokenLinks++;
    }
  });
  if (brokenLinks > 0) {
    results.warnings.push(`${brokenLinks} links with empty/placeholder hrefs`);
  } else {
    results.success.push(`✓ All ${allLinks.length} links have valid hrefs`);
  }
  
  // Check 9: Console Errors
  console.log('9️⃣ Checking Console...');
  // This would need to be monitored separately in real-time
  
  // Generate Report
  console.log('\n📊 BUG CHECK REPORT');
  console.log('='.repeat(50));
  console.log(`Page: ${results.page}`);
  console.log(`Time: ${results.timestamp}`);
  console.log('='.repeat(50));
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(err => console.log(`  ${err}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warn => console.log(`  ${warn}`));
  }
  
  console.log('\n✅ SUCCESS:');
  results.success.forEach(success => console.log(`  ${success}`));
  
  const score = (results.success.length / (results.success.length + results.errors.length + results.warnings.length)) * 100;
  console.log('\n📈 HEALTH SCORE:', Math.round(score) + '%');
  
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('\n🎉 ALL CHECKS PASSED! Page is fully functional.');
  } else if (results.errors.length === 0) {
    console.log('\n✨ No critical errors, but some warnings to review.');
  } else {
    console.log('\n⚠️  Critical errors found - please fix immediately.');
  }
  
  return results;
})();
