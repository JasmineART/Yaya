// Magical product dataset and render helpers
let PRODUCTS = [];

// Load products from JSON immediately
(function loadProducts() {
  // Inline data for immediate rendering (no fetch delay)
  PRODUCTS = [
  {
    "id": 999,
    "title": "Test Poetry Collection",
    "titleIcon": "fas fa-heart",
    "price": 15.99,
    "isbn": "979-8-TEST-001",
    "description": "A test poetry collection to verify admin functionality works perfectly. This is a temporary product for testing purposes.",
    "reviews": [
      {
        "name": "Admin Tester",
        "rating": 5,
        "text": "Perfect for testing the admin system!",
        "date": "2025-11-14"
      }
    ],
    "images": [
      "assets/test-cover.jpg"
    ]
  }
];
})();

function formatPrice(v){return '$'+v.toFixed(2)}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderProductsGrid(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  
  // Render immediately without delays
  grid.innerHTML = PRODUCTS.map(p=>`
    <article class="product-card active" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">
      <img src="${p.images[0]}" alt="${escapeHtml(p.title)} magical treasure" loading="lazy" style="width:100%; height:280px; object-fit:cover; object-position:center;" />
      <h3><i class="${p.titleIcon || 'fas fa-star'}"></i> ${escapeHtml(p.title)}</h3>
      <p style="font-size:0.95rem; margin:0.5rem 0; opacity:0.9; line-height:1.5;">${escapeHtml(p.description.substring(0, 120))}${p.description.length>120 ? '...' : ''}</p>
      <div style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
        ${renderStarsInline(''+(p.reviews && p.reviews.length ? Math.round(p.reviews.reduce((s,r)=>s+r.rating,0)/p.reviews.length) : 4))}
        <small style="opacity:0.9; font-size:0.9rem;">${p.reviews ? p.reviews.length : 0} ${p.reviews && p.reviews.length === 1 ? 'review' : 'reviews'}</small>
      </div>
      <div class="meta">
        <strong class="price">${formatPrice(p.price)}</strong>
        <span class="btn ghost" style="font-size:0.95rem; padding:0.5rem 1rem; pointer-events:none;">View ✨</span>
      </div>
    </article>
  `).join('');
}

function renderStarsInline(n){
  const count = Math.max(0, Math.min(5, parseInt(n,10)||0));
  let out = '';
  for(let i=0;i<5;i++) out += i<count ? '<i class="fas fa-star" style="color:#FFD166"></i>' : '<i class="far fa-star" style="color:rgba(255,255,255,0.5)"></i>';
  return `<span aria-hidden="true">${out}</span>`;
}

function getProductById(id){
  return PRODUCTS.find(p=>p.id===Number(id));
}

// Additional functions would continue here...
