/* App-wide JS: cart, newsletter, comments, checkout simulation, sparkle animations */
const STORAGE_KEY = 'yaya_cart_v1';
const DISCOUNT_STORAGE_KEY = 'yaya_discount_v1';

// Discount codes: percentage discounts, flat dollar amounts, and BOGO deals
const DISCOUNTS = { 
  'PASTEL': { type: 'bogo_half', description: 'Buy one, get 2nd item 50% off' },
  'SUNCATCHER': { type: 'percentage', value: 0.15, description: '15% off entire cart' },
  'WHIMSY': { type: 'percentage', value: 0.25, description: '25% off entire cart' }
};

// Email functions will be available globally from simple-email.js script

// ===== ACCESSIBILITY ENHANCEMENTS =====

// Initialize accessibility features
function initAccessibility() {
  // Add keyboard navigation detection
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-focus');
    }
  });

  // Remove keyboard focus class on mouse interaction
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-focus');
  });

  // Create live region for announcements
  if (!document.querySelector('.live-region')) {
    const liveRegion = document.createElement('div');
    liveRegion.className = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.id = 'announcements';
    document.body.appendChild(liveRegion);
  }

  console.log('♿ Accessibility features initialized');
}

// Announce messages to screen readers
function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.getElementById('announcements') || document.querySelector('.live-region');
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
  console.log(`📢 Announced: ${message}`);
}

// Enhanced focus management
function manageFocus(element) {
  if (element && typeof element.focus === 'function') {
    element.focus();

    // Scroll into view if needed
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

// DISCLAIMER MODAL: displays a professional site-wide notice on entry and before checkout
function createDisclaimerModal() {
  if (document.getElementById('site-disclaimer-overlay')) return; // already created

  const overlay = document.createElement('div');
  overlay.id = 'site-disclaimer-overlay';
  overlay.className = 'site-disclaimer-overlay';
  overlay.innerHTML = `
    <div class="site-disclaimer-modal" role="dialog" aria-modal="true" aria-labelledby="site-disclaimer-title">
      <header>
        <h2 id="site-disclaimer-title" class="site-disclaimer-title">Notice</h2>
      </header>
      <div class="site-disclaimer-body">
        <p>The site is currently experiencing technical difficulties. Some or most features may be unavailable. Please check back soon.</p>
      </div>
      <div class="site-disclaimer-actions">
        <button class="site-disclaimer-btn site-disclaimer-confirm">I understand — continue</button>
        <button class="site-disclaimer-btn site-disclaimer-cancel">Continue anyway</button>
      </div>
    </div>
  `;

  // Append and hide initially
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  // Accessibility: focus management
  const confirmBtn = overlay.querySelector('.site-disclaimer-confirm');
  const cancelBtn = overlay.querySelector('.site-disclaimer-cancel');

  // Close handlers
  confirmBtn.addEventListener('click', () => {
    sessionStorage.setItem('siteDisclaimerAccepted', 'true');
    hideDisclaimer();
  });
  cancelBtn.addEventListener('click', () => {
    // keep not accepted but still close — user opted to continue without acknowledging
    hideDisclaimer();
  });

  // Escape key closes
  overlay.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      hideDisclaimer();
    }
  });

  function hideDisclaimer() {
    overlay.style.display = 'none';
    // restore scrolling
    document.body.style.overflow = '';
    // return focus to main content
    const main = document.querySelector('main') || document.body;
    try { main.focus(); } catch (e) {}
  }

  function showDisclaimer() {
    overlay.style.display = 'flex';
    // prevent background scrolling while modal open
    document.body.style.overflow = 'hidden';
    // focus the confirm button for accessibility
    try { confirmBtn.focus(); } catch (e) {}
  }

  // expose methods
  window.__showSiteDisclaimer = showDisclaimer;
  window.__hideSiteDisclaimer = hideDisclaimer;
}

// Ensure the disclaimer has been accepted or show it; resolves true if accepted or after user confirms
function ensureDisclaimerConfirmed() {
  return new Promise((resolve) => {
    try {
      if (sessionStorage.getItem('siteDisclaimerAccepted') === 'true') return resolve(true);
    } catch (e) {}

    createDisclaimerModal();
    const overlay = document.getElementById('site-disclaimer-overlay');
    if (!overlay) return resolve(true);

    // show modal
    window.__showSiteDisclaimer();

    const confirmBtn = overlay.querySelector('.site-disclaimer-confirm');
    const cancelBtn = overlay.querySelector('.site-disclaimer-cancel');

    function cleanupAndResolve(val) {
      // remove listeners
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('keydown', onKey);
      resolve(val);
    }

    function onConfirm() { cleanupAndResolve(true); }
    function onCancel() { cleanupAndResolve(false); }
    function onKey(e) { if (e.key === 'Escape') cleanupAndResolve(false); }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('keydown', onKey);
  });
}

// Magical sparkle stream animation - optimized for performance
function createMagicalSparkles() {
  // Skip sparkles on mobile devices for better performance
  if (window.innerWidth < 768) {
    console.log('✨ Sparkles disabled on mobile for performance');
    return;
  }
  
  // Reduce sparkle count for better performance
  const screenWidthInches = window.innerWidth / 96;
  const targetSparkleCount = Math.floor(screenWidthInches * 50); // Reduced from 200
  
  // Lower max for better performance
  const maxSparkles = 75; // Further reduced for optimal performance
  const totalSparkles = Math.min(targetSparkleCount, maxSparkles);
  
  console.log('✨ Sparkle system starting...', {
    screenWidth: window.innerWidth,
    targetSparkles: totalSparkles
  });
  
  // Use DocumentFragment for batch DOM insertion (performance optimization)
  function createSparklesBatch() {
    const batchSize = Math.min(10, Math.ceil(totalSparkles / 10)); // Smaller batches
    const fragment = document.createDocumentFragment();
    
    for(let i = 0; i < batchSize; i++) {
      fragment.appendChild(createSingleSparkle());
    }
    
    document.body.appendChild(fragment);
  }
  
  function createSingleSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    const posX = Math.random() * 100;
    sparkle.style.left = posX + '%';
    
    const startY = Math.random() * 120;
    sparkle.style.bottom = -startY + '%';
    
    const size = Math.random() * 3 + 1.5;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    const duration = Math.random() * 8 + 10;
    const delay = Math.random() * 2;
    const drift = (Math.random() - 0.5) * 80;
    
    sparkle.style.animation = `floatSparkle ${duration}s ease-in-out ${delay}s infinite`;
    sparkle.style.setProperty('--drift', drift + 'px');
    
    return sparkle;
  }
  
  // Initial population - use requestAnimationFrame for smoother creation
  const initialBatches = Math.ceil(totalSparkles / 10);
  let batchIndex = 0;
  
  function createNextBatch() {
    if (batchIndex < initialBatches) {
      createSparklesBatch();
      batchIndex++;
      requestAnimationFrame(createNextBatch);
    }
  }
  
  requestAnimationFrame(createNextBatch);
  
  // Maintain sparkle count - less frequent checks for better performance
  setInterval(() => {
    const currentSparkles = document.querySelectorAll('.sparkle').length;
    if (currentSparkles < totalSparkles * 0.7) {
      const fragment = document.createDocumentFragment();
      const toAdd = Math.min(totalSparkles - currentSparkles, 5);
      for(let i = 0; i < toAdd; i++) {
        fragment.appendChild(createSingleSparkle());
      }
      document.body.appendChild(fragment);
    }
  }, 10000); // Check every 10 seconds for better performance
  
  console.log('✨ Sparkle generation optimized');
}

// Neon castle outline in background
function createNeonCastle() {
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
  
  if (!isHomePage) return; // Only on home page
  
  console.log('🏰 Creating neon castle...');
  
  const castle = document.createElement('div');
  castle.className = 'neon-castle';
  castle.innerHTML = `
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Center tower (tallest) -->
      <path class="neon-line" d="M 340 150 L 340 450 L 460 450 L 460 150 L 450 150 L 450 130 L 460 130 L 460 110 L 450 110 L 450 150 L 410 150 L 410 110 L 400 110 L 400 130 L 410 130 L 410 150 L 350 150 L 350 110 L 340 110 L 340 150 Z"/>
      
      <!-- Left tower -->
      <path class="neon-line" d="M 220 220 L 220 450 L 320 450 L 320 220 L 310 220 L 310 200 L 320 200 L 320 180 L 310 180 L 310 220 L 280 220 L 280 180 L 270 180 L 270 200 L 280 200 L 280 220 L 230 220 L 230 180 L 220 180 L 220 220 Z"/>
      
      <!-- Right tower -->
      <path class="neon-line" d="M 480 220 L 480 450 L 580 450 L 580 220 L 570 220 L 570 200 L 580 200 L 580 180 L 570 180 L 570 220 L 540 220 L 540 180 L 530 180 L 530 200 L 540 200 L 540 220 L 490 220 L 490 180 L 480 180 L 480 220 Z"/>
      
      <!-- Base wall -->
      <path class="neon-line" d="M 200 450 L 200 400 L 600 400 L 600 450 Z"/>
      
      <!-- Main gate -->
      <path class="neon-line" d="M 360 450 L 360 380 Q 360 360 380 360 L 420 360 Q 440 360 440 380 L 440 450"/>
      
      <!-- Windows on center tower -->
      <circle class="neon-dot" cx="400" cy="250" r="3"/>
      <circle class="neon-dot" cx="400" cy="300" r="3"/>
      <circle class="neon-dot" cx="400" cy="350" r="3"/>
      
      <!-- Windows on left tower -->
      <circle class="neon-dot" cx="270" cy="300" r="2.5"/>
      <circle class="neon-dot" cx="270" cy="350" r="2.5"/>
      
      <!-- Windows on right tower -->
      <circle class="neon-dot" cx="530" cy="300" r="2.5"/>
      <circle class="neon-dot" cx="530" cy="350" r="2.5"/>
      
      <!-- Decorative stars/sparkles around castle -->
      <path class="neon-star" d="M 180 160 l 3 6 l 6 0 l -5 4 l 2 6 l -6 -3 l -6 3 l 2 -6 l -5 -4 l 6 0 Z"/>
      <path class="neon-star" d="M 620 180 l 2.5 5 l 5 0 l -4 3.5 l 1.5 5 l -5 -2.5 l -5 2.5 l 1.5 -5 l -4 -3.5 l 5 0 Z"/>
      <path class="neon-star" d="M 160 320 l 2 4 l 4 0 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 0 Z"/>
      <path class="neon-star" d="M 640 280 l 2 4 l 4 0 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 0 Z"/>
    </svg>
  `;
  
  document.body.appendChild(castle);
  console.log('🏰 Neon castle created');
}

// Spotlight effect from bottom of page
function createSpotlights() {
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
  
  if (!isHomePage) return; // Only on home page
  
  console.log('💡 Creating spotlights...');
  
  const spotlightCount = 4; // Number of spotlights
  
  for(let i = 0; i < spotlightCount; i++) {
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    
    // Distribute across bottom
    spotlight.style.left = ((i / (spotlightCount - 1)) * 100) + '%';
    
    // Random animation delay for variety
    spotlight.style.animationDelay = (i * 0.5) + 's';
    
    document.body.appendChild(spotlight);
  }
  
  console.log('💡 Spotlights created');
}

// Scroll-triggered reveal animations - trigger immediately on load
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  reveals.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;
    
    // Reveal when element is in viewport OR on initial load
    if (elementTop < windowHeight * 0.85 && elementBottom > 0) {
      element.classList.add('active');
    }
  });
}

// Make all content visible immediately on page load
function showAllContent() {
  // Remove any loading/hidden states
  const allElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  allElements.forEach(el => el.classList.add('active'));
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - initializing...');
    
    // Show all content FIRST - no delays
    showAllContent();
    revealOnScroll();
    
    // Then add visual enhancements
    injectSparkleStyles();
    createMagicalSparkles();
    createNeonCastle();
    createSpotlights();
    
    console.log('✅ All systems initialized');
  });
  
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  
  // Handle window resize for sparkle recalculation - debounced
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Limit sparkle recreation frequency
      const oldSparkles = document.querySelectorAll('.sparkle');
      if (oldSparkles.length > 500) { // Only recreate if too many
        oldSparkles.forEach(s => s.remove());
        createMagicalSparkles();
        console.log('✨ Sparkles recalculated for new screen size');
      }
    }, 1000); // Increased debounce time
  });
}

function getCart(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch(e){return []}
}

// Alias function for Stripe integration compatibility
function getCartItems() {
  const cartItems = getCart();
  
  // Convert cart items to format expected by Stripe
  return cartItems.map(item => {
    const product = window.PRODUCTS ? window.PRODUCTS.find(p => p.id === item.id) : null;
    
    if (!product) {
      console.warn('Product not found for cart item:', item);
      return null;
    }
    
    let productName = product.title || product.name || `Product ${item.id}`;
    let productPrice = product.price || 0;
    let productImage = product.images && product.images[0] ? product.images[0] : null;
    
    // Handle variant items (like stickers with specific designs)
    if (item.metadata && item.metadata.variantName) {
      productName = `${productName} - ${item.metadata.variantName}`;
    }
    
    // Use variant-specific image if available
    if (item.metadata && item.metadata.variantId && product.variants) {
      const variant = product.variants.find(v => v.id === item.metadata.variantId);
      if (variant && variant.image) {
        productImage = variant.image;
      }
    }
    
    return {
      id: item.uniqueKey || item.id,
      name: productName,
      price: productPrice,
      quantity: item.qty,
      description: product.description || '',
      image: productImage,
      metadata: item.metadata || {}
    };
  }).filter(item => item !== null); // Remove any null items
}

function saveCart(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}

function removeFromCart(uniqueKey) {
  const items = getCart();
  const filteredItems = items.filter(item => (item.uniqueKey || item.id) !== uniqueKey);
  saveCart(filteredItems);
  updateCartCount();
  renderCartContents();
  renderOrderSummary();
  announceToScreenReader('Item removed from cart');
}

function addToCart(productId, qty=1, metadata={}){
  const items = getCart();
  // For items with variants, create unique cart entries
  const uniqueKey = metadata.variantId ? `${productId}-${metadata.variantId}` : productId;
  const found = items.find(i=>i.uniqueKey===uniqueKey || (!i.uniqueKey && i.id===productId && !metadata.variantId));
  
  const product = window.products?.find(p => p.id === productId);
  const productName = product?.name || 'Item';
  
  if(found) {
    found.qty += qty;
    announceToScreenReader(`Updated ${productName} quantity to ${found.qty} in cart`);
  } else {
    items.push({id:productId, qty, uniqueKey, metadata});
    announceToScreenReader(`Added ${productName} to cart`);
  }
  saveCart(items);
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('nav-cart-count');
  if(el) el.textContent = count;
}

function renderCartContents(){
  const node = document.getElementById('cart-contents');
  if(!node) return;
  if(!window.PRODUCTS || window.PRODUCTS.length === 0) {
    // Products not loaded yet, wait and retry
    setTimeout(renderCartContents, 100);
    return;
  }
  
  let items = getCart();
  
  // Clean up cart - remove items for products that no longer exist
  const validItems = items.filter(item => {
    const product = window.PRODUCTS.find(p => p.id === item.id);
    return product !== undefined;
  });
  
  // Save cleaned cart if items were removed
  if (validItems.length !== items.length) {
    saveCart(validItems);
    items = validItems;
  }
  
  if(items.length===0){
    node.innerHTML='<p>Your enchanted cart is empty. ✨</p>';
    clearAppliedDiscount(); // Clear any applied discounts
    return;
  }
  
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    if(!p) return ''; // Skip if product not found (shouldn't happen after cleanup)
    
    const variantLabel = it.metadata && it.metadata.variantName ? ` - ${it.metadata.variantName}` : '';
    const productTitle = p.title || p.name || `Product ${p.id}`;
    
    // Get the correct image - use variant image if available, otherwise use product's first image
    let itemImage = p.images && p.images[0] ? p.images[0] : 'assets/logo-new.jpg';
    if (it.metadata && it.metadata.variantId && p.variants) {
      const variant = p.variants.find(v => v.id === it.metadata.variantId);
      if (variant && variant.image) {
        itemImage = variant.image;
      }
    }
    
    return `
      <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 1rem;">
        <img src="${itemImage}" alt="${productTitle}${variantLabel}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"/>
        <div style="flex: 1;">
          <strong>${productTitle}${variantLabel}</strong>
          <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">${it.qty} × ${formatPrice(p.price)}</div>
        </div>
        <div style="font-weight: 600; font-size: 1.1rem;">${formatPrice(p.price*it.qty)}</div>
        <button onclick="removeFromCart('${it.uniqueKey || it.id}')" style="background: rgba(255,100,100,0.7); border: none; border-radius: 50%; width: 30px; height: 30px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Remove item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
  
  const subtotal = items.reduce((s,it)=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return p ? s + (p.price * it.qty) : s;
  },0);
  
  // Check for applied discount
  const appliedDiscount = getAppliedDiscount();
  let discountHTML = '';
  let total = subtotal;
  
  if (appliedDiscount && appliedDiscount.code) {
    const discountResult = calculateDiscount(subtotal, appliedDiscount.code, items);
    if (discountResult.valid) {
      total = subtotal - discountResult.amount;
      discountHTML = `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 1rem; background: rgba(102, 126, 234, 0.2); border-radius: 8px; margin: 1rem 0;">
          <span>Discount (${appliedDiscount.code}): ${discountResult.description}</span>
          <span>-${formatPrice(discountResult.amount)}</span>
          <button onclick="removeDiscount()" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; margin-left: 1rem;" title="Remove discount">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    } else {
      // Discount no longer valid, clear it
      clearAppliedDiscount();
    }
  }
  
  node.innerHTML = rows + discountHTML + `
    <div style="text-align: right; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 12px; margin-top: 1rem;">
      <div style="font-size: 0.9rem; margin-bottom: 0.5rem;">Subtotal: ${formatPrice(subtotal)}</div>
      ${appliedDiscount ? `<div style="font-size: 1.2rem; font-weight: 700; color: #4CAF50;">Total: ${formatPrice(total)}</div>` : `<div style="font-size: 1.2rem; font-weight: 700;">Total: ${formatPrice(total)}</div>`}
    </div>
  `;
}

function formatPrice(v){return '$'+v.toFixed(2)}

// Discount management
function getAppliedDiscount() {
  try {
    return JSON.parse(localStorage.getItem(DISCOUNT_STORAGE_KEY)) || null;
  } catch(e) {
    return null;
  }
}

function saveAppliedDiscount(discountData) {
  localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discountData));
}

function clearAppliedDiscount() {
  localStorage.removeItem(DISCOUNT_STORAGE_KEY);
}

function calculateDiscount(subtotal, discountCode, cartItems = null) {
  const discount = DISCOUNTS[discountCode];
  if (!discount) return { valid: false, amount: 0, message: 'Invalid discount code' };
  
  // Check minimum order requirement
  if (discount.minOrder && subtotal < discount.minOrder) {
    return { 
      valid: false, 
      amount: 0, 
      message: `Minimum order of $${discount.minOrder.toFixed(2)} required for this discount` 
    };
  }
  
  let discountAmount = 0;

  // helper to safely read quantity and price from cart item
  const expandItems = (items) => {
    const all = [];
    (items || []).forEach(item => {
      const qty = Number(item.qty || item.quantity || 1);
      const product = window.PRODUCTS ? window.PRODUCTS.find(p => p.id === item.id) : null;
      const price = Number(item.price ?? (product ? product.price : 0)) || 0;
      for (let i = 0; i < qty; i++) all.push(price);
    });
    return all;
  };

  if (discount.type === 'percentage') {
    discountAmount = subtotal * discount.value;
  } else if (discount.type === 'flat') {
    discountAmount = Math.min(discount.value, subtotal); // Don't exceed subtotal
  } else if (discount.type === 'bogo_half') {
    // PASTEL: Buy one, get second item at 50% off (applies to lower-priced item)
    if (!cartItems) {
      return {
        valid: false,
        amount: 0,
        message: 'Add at least 2 items to cart to use this discount'
      };
    }
    // Expand cart items into individual prices (respect qty and item.price if present)
    const allItems = expandItems(cartItems);

    if (allItems.length < 2) {
      return {
        valid: false,
        amount: 0,
        message: 'Add at least 2 items to cart to use this discount'
      };
    }
    
    // Sort prices descending (highest first)
    allItems.sort((a, b) => b - a);
    
    // Apply 50% off to every second item (2nd, 4th, 6th, etc.)
    // These are the lower-priced items in each pair
    for (let i = 1; i < allItems.length; i += 2) {
      discountAmount += allItems[i] * 0.5;
    }
  }
  
  // Round discount to cents
  discountAmount = Math.round((discountAmount + Number.EPSILON) * 100) / 100;

  return { 
    valid: true, 
    amount: discountAmount, 
    description: discount.description,
    code: discountCode
  };
}

// Newsletter and comments - try Supabase (free tier) then fallback to Formspree
const CONFIG = window.YAYA_CONFIG || {};

async function postToSupabase(path, body){
  try{
    if(!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) throw new Error('supabase not configured');
    const url = CONFIG.supabaseUrl + path;
    const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':CONFIG.supabaseAnonKey,'Authorization':'Bearer '+CONFIG.supabaseAnonKey},body:JSON.stringify(body)});
    return res.ok ? await res.json() : null;
  }catch(e){return null}
}

// Newsletter initializer (exposed) - attaches submit handler for newsletter form
function initNewsletterForm() {
  const nf = document.getElementById('newsletter-form');
  if (!nf) return;

  // Avoid duplicate listeners by replacing the node
  try {
    const clone = nf.cloneNode(true);
    nf.parentNode.replaceChild(clone, nf);
  } catch (e) {
    // ignore
  }

  const form = document.getElementById('newsletter-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : null;
      if (submitBtn) submitBtn.textContent = 'Sending…';

      // Check if sendNewsletterSignup function exists
      if (typeof window.sendNewsletterSignup !== 'function') {
        console.error('❌ sendNewsletterSignup function not found. EmailJS may not be loaded.');
        alert('Subscription system temporarily unavailable. Please try again later.');
        if (submitBtn && originalText) submitBtn.textContent = originalText;
        return;
      }

      const emailResult = await window.sendNewsletterSignup(email, window.location.pathname);

      if (emailResult && emailResult.success) {
        alert('Thanks — you are subscribed! 📧 Notification sent.');
        form.reset();
        if (submitBtn && originalText) submitBtn.textContent = originalText;
        return;
      }

      console.warn('EmailJS newsletter send failed', emailResult);
      alert('Could not send subscription email via EmailJS. Please try again later.');
      if (submitBtn && originalText) submitBtn.textContent = originalText;
    } catch (err) {
      console.error('Newsletter submission error (EmailJS only):', err);
      alert('Subscription system temporarily unavailable. Please try again later.');
      if (submitBtn && originalText) submitBtn.textContent = originalText;
    }
  });
}

// Expose for tests and manual init
window.initNewsletterForm = initNewsletterForm;

document.addEventListener('DOMContentLoaded',()=>{
  // Initialize accessibility features first
  initAccessibility();
  
  updateCartCount();
  renderCartContents();

  // newsletter
  initNewsletterForm();

  // Show site disclaimer to visitors on entry (non-blocking reminder)
  try {
    createDisclaimerModal();
    if (sessionStorage.getItem('siteDisclaimerAccepted') !== 'true') {
      // show the modal but do not block initialization
      window.__showSiteDisclaimer();
    }
  } catch (e) { /* ignore if modal cannot be created */ }

  // comments
  const cf = document.getElementById('comment-form');
  if(cf){
    cf.addEventListener('submit',async e=>{
      e.preventDefault();
      const name = document.getElementById('comment-name').value;
      const text = document.getElementById('comment-text').value;
      // Prefer server endpoint if available
      if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
        try{
          const r = await fetch(window.YAYA_CONFIG.serverUrl + '/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,text})});
          const j = await r.json();
          if(j && j.ok){appendComment({name,text});cf.reset();return}
        }catch(e){console.warn('server comment failed',e)}
      }
      const saved = await postToSupabase('/rest/v1/comments',{name,text,created_at:new Date().toISOString()});
      if(saved){appendComment({name,text});cf.reset()}else{alert('Could not save comment.');}
    });
    loadComments();
  }

  // discount apply
  const discBtn = document.getElementById('apply-discount');
  if(discBtn){discBtn.addEventListener('click',()=>{
    const codeInput = document.getElementById('discount-code');
    const statusDiv = document.getElementById('discount-status');
    const code = (codeInput.value || '').toUpperCase().trim();
    
    if (!code) {
      statusDiv.innerHTML = '<div style="color: #ff6b6b; padding: 0.5rem;">Please enter a discount code</div>';
      return;
    }
    
    const items = getCart();
    if (items.length === 0) {
      statusDiv.innerHTML = '<div style="color: #ff6b6b; padding: 0.5rem;">Add items to cart before applying discount</div>';
      return;
    }
    
    const subtotal = items.reduce((s,it)=>{
      const p = window.PRODUCTS.find(x=>x.id===it.id);
      return p ? s + (p.price * it.qty) : s;
    },0);
    
    const discountResult = calculateDiscount(subtotal, code, items);
    
    if (discountResult.valid) {
      saveAppliedDiscount({ code: code, appliedAt: Date.now() });
      statusDiv.innerHTML = `<div style="color: #4CAF50; padding: 0.5rem;">✨ Discount applied: ${discountResult.description} (saves ${formatPrice(discountResult.amount)})</div>`;
      codeInput.value = '';
      renderCartContents();
      renderOrderSummary();
      announceToScreenReader(`Discount applied: ${discountResult.description}`);
    } else {
      statusDiv.innerHTML = `<div style="color: #ff6b6b; padding: 0.5rem;">${discountResult.message}</div>`;
    }
    
    // Clear status after 5 seconds
    setTimeout(() => {
      if (statusDiv) statusDiv.innerHTML = '';
    }, 5000);
  })}

  // checkout
  const checkout = document.getElementById('checkout-form');
  if(checkout){
    checkout.addEventListener('submit',async e=>{
      e.preventDefault();
      try{ createDisclaimerModal(); if(window.__showSiteDisclaimer) window.__showSiteDisclaimer(); }catch(err){}
      
      if(!window.PRODUCTS || window.PRODUCTS.length === 0) {
        alert('Products not loaded yet. Please wait a moment and try again.');
        return;
      }
      
      const pay = document.querySelector('input[name="pay"]:checked').value;
      const name = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const items = getCart().map(it=>{
        const p = window.PRODUCTS.find(x=>x.id===it.id);
        if(!p) return null;
        return {id: it.id, title: p.title, price: p.price, qty: it.qty, name: p.title, quantity: it.qty, image: p.images && p.images[0]};
      }).filter(Boolean); // Remove null entries

      // Calculate order totals
      const subtotal = items.reduce((s,it)=>{
        const p = window.PRODUCTS.find(x=>x.id===it.id);
        return p ? s + (p.price * it.qty) : s;
      },0);
      
      const appliedDiscount = getAppliedDiscount();
      let discountAmount = 0;
      let discountCode = '';
      let discountedSubtotal = subtotal;
      
      if (appliedDiscount && appliedDiscount.code) {
        const discountResult = calculateDiscount(subtotal, appliedDiscount.code, items);
        if (discountResult.valid) {
          discountAmount = discountResult.amount;
          discountCode = appliedDiscount.code;
          discountedSubtotal = subtotal - discountAmount;
        }
      }
      
      const shipping = 9.99;
      const taxRate = 0.085;
      const tax = discountedSubtotal * taxRate;
      const total = discountedSubtotal + shipping + tax;

      // Save order attempt to Supabase if available
      const orderRecord = {name,email,items,created_at:new Date().toISOString()};
      try{ await postToSupabase('/rest/v1/orders',orderRecord); }catch(e){}

      // Also notify the server (if configured) so it can persist to Firebase/DB and send email to the company
      try{
        if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
          fetch(window.YAYA_CONFIG.serverUrl + '/submit-order', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(Object.assign({}, orderRecord, {address: document.getElementById('address') ? document.getElementById('address').value : '', city: document.getElementById('city') ? document.getElementById('city').value : '', giftWrap: !!document.getElementById('gift-wrap') && document.getElementById('gift-wrap').checked}))}).then(async r=>{
            if(r.ok){ const j = await r.json(); console.log('server submit-order response', j); }
          }).catch(err=>{console.warn('submit-order to server failed',err)});
        }
      }catch(e){console.warn('notify server failed',e)}

      // Call server to create payment session with calculated totals
      try{
        if(pay==='stripe'){
          const resp = await fetch((window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl ? window.YAYA_CONFIG.serverUrl : '') + '/create-stripe-session',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              items,
              customer: {name, email},
              discountAmount,
              discountCode,
              shipping,
              tax,
              taxRate,
              subtotal,
              total,
              successUrl:location.origin + '/success.html?session_id={CHECKOUT_SESSION_ID}',
              cancelUrl:location.origin + '/cart.html'
            })
          });
          const data = await resp.json();
          if(data.url) window.location.href = data.url; else throw new Error(data.error || 'No url');
        }else if(pay==='paypal'){
          const resp = await fetch((window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl ? window.YAYA_CONFIG.serverUrl : '') + '/create-paypal-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,returnUrl:location.origin + '/index.html',cancelUrl:location.origin + '/cart.html'})});
          const data = await resp.json();
          // PayPal returns links — find approval link
          const approve = data && data.links && data.links.find(l=>l.rel==='approve');
          if(approve) window.location.href = approve.href; else throw new Error('Could not create PayPal order');
        }
      }catch(err){
        console.error(err);
        alert('Payment failed to start: '+err.message);
      }
    });
    renderOrderSummary();
  }
});

async function loadComments(){
  const list = document.getElementById('comments-list');
  if(!list) return;
  // try supabase fetch
  try{
    if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
      const r = await fetch(window.YAYA_CONFIG.serverUrl + '/comments');
      if(r.ok){ const data = await r.json(); list.innerHTML = data.map(c=>`<div class="comment"><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p></div>`).join(''); return; }
    }
    if(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey){
      const res = await fetch(CONFIG.supabaseUrl + '/rest/v1/comments?select=name,text,created_at', {headers:{'apikey':CONFIG.supabaseAnonKey}});
      if(res.ok){
        const data = await res.json();
        list.innerHTML = data.map(c=>`<div class="comment"><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p></div>`).join('');
        return;
      }
    }
  }catch(e){}
  // fallback: local placeholder
  list.innerHTML = '<p>No comments yet — be the first to leave one.</p>';
}

function appendComment(c){
  const list = document.getElementById('comments-list');
  if(!list) return;
  const node = document.createElement('div'); node.className='comment';
  node.innerHTML = `<strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p>`;
  list.prepend(node);
}

function escapeHtml(s){return (s+'').replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]})}

function removeDiscount() {
  clearAppliedDiscount();
  renderCartContents();
  renderOrderSummary();
  announceToScreenReader('Discount removed');
}

function renderOrderSummary(){
  const aside = document.getElementById('order-summary');
  if(!aside) return;
  const items = getCart();
  if(items.length===0){aside.innerHTML='<h3><i class="fas fa-box"></i> Order Summary</h3><p>No items in cart</p>';return}
  
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    if (!p) return ''; // Skip missing products
    
    const variantLabel = it.metadata && it.metadata.variantName ? ` - ${it.metadata.variantName}` : '';
    const productTitle = p.title || p.name || `Product ${p.id}`;
    
    // Get the correct image - use variant image if available, otherwise use product's first image
    let itemImage = p.images && p.images[0] ? p.images[0] : 'assets/logo-new.jpg';
    if (it.metadata && it.metadata.variantId && p.variants) {
      const variant = p.variants.find(v => v.id === it.metadata.variantId);
      if (variant && variant.image) {
        itemImage = variant.image;
      }
    }
    
    return `<div style="display: flex; align-items: center; gap: 0.75rem; margin: 0.75rem 0; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <img src="${itemImage}" alt="${productTitle}${variantLabel}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; flex-shrink: 0;"/>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 0.95rem; line-height: 1.3; margin-bottom: 0.25rem;">${productTitle}${variantLabel}</div>
        <div style="font-size: 0.85rem; opacity: 0.8;">${it.qty} × ${formatPrice(p.price)}</div>
      </div>
      <div style="font-weight: 600; white-space: nowrap;">${formatPrice(p.price*it.qty)}</div>
    </div>`;
  }).filter(row => row !== '').join('');
  
  const subtotal = items.reduce((s,it)=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return p ? s + (p.price * it.qty) : s;
  },0);
  
  // Check for applied discount
  const appliedDiscount = getAppliedDiscount();
  let discountHTML = '';
  let discountedSubtotal = subtotal;
  
  if (appliedDiscount && appliedDiscount.code) {
    const discountResult = calculateDiscount(subtotal, appliedDiscount.code, items);
    if (discountResult.valid) {
      discountedSubtotal = subtotal - discountResult.amount;
      discountHTML = `
        <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; padding: 0.5rem; background: rgba(102, 126, 234, 0.2); border-radius: 6px; color: #4CAF50;">
          <span>Discount (${appliedDiscount.code})</span>
          <span>-${formatPrice(discountResult.amount)}</span>
        </div>
      `;
    }
  }
  
  // Add shipping ($9.99 standard)
  const shipping = 9.99;
  
  // Calculate tax (8.5% on discounted subtotal)
  const taxRate = 0.085;
  const tax = discountedSubtotal * taxRate;
  
  // Calculate final total
  const total = discountedSubtotal + shipping + tax;
  
  aside.innerHTML = `
    <h3><i class="fas fa-box"></i> Order Summary</h3>
    ${rows}
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 1rem 0;">
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
      <span>Subtotal:</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
    ${discountHTML}
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
      <span>Shipping:</span>
      <span>${formatPrice(shipping)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
      <span>Tax (8.5%):</span>
      <span>${formatPrice(tax)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; font-weight: 700; font-size: 1.1rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
      <span>Total:</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
}

// utilities used by products.js and other scripts
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.getCartItems = getCartItems;
window.getCart = getCart;
window.removeFromCart = removeFromCart;
window.removeDiscount = removeDiscount;
window.getAppliedDiscount = getAppliedDiscount;
window.calculateDiscount = calculateDiscount;
window.saveAppliedDiscount = saveAppliedDiscount;
window.clearAppliedDiscount = clearAppliedDiscount;
