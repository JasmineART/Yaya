// Magical product dataset and render helpers
const PRODUCTS = [
  {
    id:1,
    title:'<i class="fas fa-crown"></i> Suncatcher Spirit (Signed Edition)',
    price:19.99,
    description:"The debut poetry collection by Yaya Starchild — 64 pages of luminous verses exploring love, loss, resilience, and present-moment magic. This signed limited edition includes a handwritten blessing and arrives wrapped in tissue paper. Each copy numbered and touched by magic. ISBN: 979-8-9999322-0-4 | Published by Pastel Poetics | October 25, 2025",
    images:['assets/suncatcher-cover.jpg']
  },
  {
    id:2,
    title:'<i class="fas fa-book"></i> Suncatcher Spirit (Paperback)',
    price:19.99,
    description:'Softcover paperback edition — 64 pages of poetry perfect for bedside reading, carrying in your bag, or gifting to a friend who needs reminding of their light. Printed on cream-colored pages that feel gentle in your hands. ISBN: 979-8-9999322-0-4',
    images:['assets/suncatcher-cover.jpg']
  },
  {
    id:3,
    title:'<i class="fas fa-sparkles"></i> Suncatcher Sticker Pack',
    price:6.50,
    description:'A set of 6 waterproof pastel stickers featuring line art from the book — moons, stars, and tiny spells. Perfect for laptops, journals, water bottles, or anywhere you want to leave a trail of magic.',
    images:['assets/sticker.jpg']
  },
  {
    id:4,
    title:'<i class="fas fa-bag-shopping"></i> Enchanted Tote Bag',
    price:22.00,
    description:'Organic cotton tote printed with a poem excerpt in ethereal script. Spacious enough for books, groceries, or all your small treasures. Each bag is hand-pressed with eco-friendly ink and comes with a surprise bookmark tucked inside.',
    images:['assets/tote.jpg']
  },
  {
    id:5,
    title:'<i class="fas fa-image"></i> Signed Poem Print',
    price:15.00,
    description:"8x10 inch signed poem print on thick, textured paper. Each print features a different poem from Suncatcher Spirit, hand-signed by Yaya. Frame it, gift it, or tuck it somewhere you'll see it every morning. Available in 3 designs (randomly selected with love).",
    images:['assets/print.jpg']
  }
];

function formatPrice(v){return '$'+v.toFixed(2)}

function renderProductsGrid(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p=>`
    <article class="product-card reveal">
      <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.title} magical treasure" /></a>
      <h3>${p.title}</h3>
      <p style="font-size:0.95rem; margin:0.5rem 0; opacity:0.9; line-height:1.5;">${p.description.substring(0, 80)}...</p>
      <div class="meta">
        <strong class="price">${formatPrice(p.price)}</strong>
        <a href="product.html?id=${p.id}" class="btn ghost" style="font-size:0.95rem; padding:0.5rem 1rem;">View ✨</a>
      </div>
    </article>
  `).join('');
}

function getProductById(id){
  return PRODUCTS.find(p=>p.id===Number(id));
}

function renderProductDetail(){
  const el = document.getElementById('product-detail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id')||'1';
  const p = getProductById(id);
  if(!p){el.innerHTML='<p>✨ Product not found — perhaps it vanished into the ether?</p>';return}
  const thumbs = p.images.map((src,i)=>`<img src="${src}" alt="${p.title} view ${i+1}" class="thumb" data-src="${src}" style="width:90px; height:90px; object-fit:cover; border-radius:12px; cursor:pointer; margin-right:10px; border:2px solid rgba(255,255,255,0.3); transition:all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='rgba(255,255,255,0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.3)';"/>`).join('');
  el.innerHTML = `
    <div class="product-detail-left reveal-left" style="background:var(--glass); backdrop-filter:blur(20px); padding:2rem; border-radius:var(--radius); border:1px solid rgba(255,255,255,0.25);">
      <img id="main-image" src="${p.images[0]}" alt="${p.title} main view" style="width:100%; border-radius:15px; box-shadow:0 15px 50px rgba(0,0,0,0.2);"/>
      <div style="margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:10px;">${thumbs}</div>
    </div>
    <div class="reveal-right" style="background:var(--glass); backdrop-filter:blur(20px); padding:2rem; border-radius:var(--radius); border:1px solid rgba(255,255,255,0.25);">
      <h2>${p.title}</h2>
      <p class="lead" style="line-height:1.8; margin:1rem 0 1.5rem 0;">${p.description}</p>
      <p style="font-size:2rem; font-weight:600; margin:1.5rem 0;"><strong>${formatPrice(p.price)}</strong></p>
      <p style="font-size:0.95rem; opacity:0.9; margin-bottom:1.5rem;">✨ Free bookmark included | 🎁 Gift wrapping available at checkout | 📦 Ships within 2-3 business days</p>
      <div class="cta-row">
        <button class="btn primary" id="add-to-cart" style="font-size:1.2rem;">✨ Add to Cart</button>
        <a class="btn ghost" href="shop.html">← Back to Shop</a>
      </div>
    </div>
  `;
  // thumbnail click to swap
  document.querySelectorAll('.thumb').forEach(t=>t.addEventListener('click',e=>{
    const src = e.currentTarget.dataset.src;
    document.getElementById('main-image').src = src;
  }));
  document.getElementById('add-to-cart').addEventListener('click',()=>{
    addToCart(p.id);
    // Create a magical notification instead of alert
    const notification = document.createElement('div');
    notification.textContent = '✨ Added to your enchanted cart!';
    notification.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.95); color:#8b7a86; padding:1rem 1.5rem; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.2); z-index:9999; animation:slideIn 0.3s ease; font-weight:600;';
    document.body.appendChild(notification);
    setTimeout(()=>notification.remove(), 3000);
    updateCartCount();
  });

  // If product is the book (id 1), fill JSON-LD
  const jsonLdEl = document.getElementById('product-jsonld');
  if(jsonLdEl && p.id===1){
    const ld = {
      "@context":"https://schema.org",
      "@type":"Book",
      "name":"Suncatcher Spirit",
      "author": {"@type":"Person","name":"Yaya Starchild"},
      "datePublished":"2025-10-25",
      "description": p.description,
      "image": location.origin + '/' + p.images[0]
    };
    jsonLdEl.textContent = JSON.stringify(ld);
  }
}

// safety exports for other scripts
window.PRODUCTS = PRODUCTS;
window.renderProductsGrid = renderProductsGrid;
window.renderProductDetail = renderProductDetail;

// auto-run if shop or product pages
document.addEventListener('DOMContentLoaded',()=>{
  renderProductsGrid();
  renderProductDetail();
});
