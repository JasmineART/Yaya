/* App-wide JS: cart, newsletter, comments, checkout simulation, sparkle animations */
const STORAGE_KEY = 'yaya_cart_v1';
const DISCOUNTS = { 'SUN10':0.10, 'FAIRY5':0.05, 'MAGIC15':0.15 };

// Add custom animation with drift - do this first
function injectSparkleStyles() {
  // Check if already injected
  if (document.getElementById('sparkle-animation-styles')) {
    console.log('✨ Sparkle styles already injected');
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'sparkle-animation-styles';
  style.textContent = `
    @keyframes floatSparkle {
      0% { 
        transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
        opacity: 0;
      }
      5% {
        opacity: 0.6;
      }
      50% {
        transform: translateY(-50vh) translateX(var(--drift, 0)) scale(1) rotate(180deg);
        opacity: 0.8;
      }
      95% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-100vh) translateX(calc(var(--drift, 0) * 1.5)) scale(0.3) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  console.log('✨ Sparkle animation styles injected');
}

// Magical sparkle stream animation - optimized for performance
function createMagicalSparkles() {
  // Reduce sparkle count for better performance
  const screenWidthInches = window.innerWidth / 96;
  const targetSparkleCount = Math.floor(screenWidthInches * 50); // Reduced from 200
  
  // Lower max for better performance
  const maxSparkles = 300; // Reduced from 1000
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
  
  // Maintain sparkle count - less frequent checks
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
  }, 5000); // Check every 5 seconds instead of 3
  
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
function saveCart(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}

function addToCart(productId, qty=1){
  const items = getCart();
  const found = items.find(i=>i.id===productId);
  if(found) found.qty += qty; else items.push({id:productId,qty});
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
  const items = getCart();
  if(items.length===0){node.innerHTML='<p>Your enchanted cart is empty. ✨</p>';return}
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return `
      <div class="cart-item">
        <img src="${p.images[0]}" alt="${p.title}"/>
        <div>
          <strong>${p.title}</strong>
          <div>${it.qty} × ${formatPrice(p.price)}</div>
        </div>
        <div style="margin-left:auto">${formatPrice(p.price*it.qty)}</div>
      </div>
    `;
  }).join('');
  const total = items.reduce((s,it)=>s + (window.PRODUCTS.find(x=>x.id===it.id).price * it.qty),0);
  node.innerHTML = rows + `<p style="text-align:right"><strong>Total: ${formatPrice(total)}</strong></p>`;
}

function formatPrice(v){return '$'+v.toFixed(2)}

// discounts
function applyDiscount(code){
  const c = (code||'').toUpperCase().trim();
  return DISCOUNTS[c]||0;
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

document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  renderCartContents();

  // newsletter
  const nf = document.getElementById('newsletter-form');
  if(nf){
    nf.addEventListener('submit',async e=>{
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value;
      // If server configured, post to server endpoint
      if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
        try{
          const resp = await fetch(window.YAYA_CONFIG.serverUrl + '/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
          const data = await resp.json();
          if(data && data.ok) { alert('Thanks — you are subscribed!'); nf.reset(); return; }
        }catch(e){console.warn('server subscribe failed',e)}
      }
      // Fallback to Supabase direct or Formspree
      const saved = await postToSupabase('/rest/v1/newsletter', {email, created_at: new Date().toISOString()});
      if(saved){alert('Thanks — you are subscribed!'); nf.reset(); return}
      fetch('https://formspree.io/f/maypznwl',{method:'POST',body:JSON.stringify({email}),headers:{'Content-Type':'application/json'}}).then(()=>{alert('Thanks — you are subscribed!');nf.reset()}).catch(()=>alert('Subscription failed'))
    });
  }

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
    const code = document.getElementById('discount-code').value;
    const pct = applyDiscount(code);
    if(!pct) alert('Invalid code'); else alert('Discount applied: '+(pct*100)+'%');
  })}

  // checkout
  const checkout = document.getElementById('checkout-form');
  if(checkout){
    checkout.addEventListener('submit',async e=>{
      e.preventDefault();
      const pay = document.querySelector('input[name="pay"]:checked').value;
      const name = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const items = getCart().map(it=>{
        const p = window.PRODUCTS.find(x=>x.id===it.id);
        return {id: it.id, title: p.title, price: p.price, qty: it.qty};
      });

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

      // Call server to create payment session
      try{
        if(pay==='stripe'){
          const resp = await fetch((window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl ? window.YAYA_CONFIG.serverUrl : '') + '/create-stripe-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,successUrl:location.origin + '/index.html',cancelUrl:location.origin + '/cart.html'})});
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

function renderOrderSummary(){
  const aside = document.getElementById('order-summary');
  if(!aside) return;
  const items = getCart();
  if(items.length===0){aside.innerHTML='<p>No items</p>';return}
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return `<div>${p.title} × ${it.qty} — ${formatPrice(p.price*it.qty)}</div>`;
  }).join('');
  const total = items.reduce((s,it)=>s + (window.PRODUCTS.find(x=>x.id===it.id).price * it.qty),0);
  aside.innerHTML = `<h4>Order summary</h4>${rows}<p><strong>Total: ${formatPrice(total)}</strong></p>`;
}

// utilities used by products.js
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
