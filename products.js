// Simple product dataset and render helpers
const PRODUCTS = [
  {
    id:1,
    title:'Suncatcher Spirit (Signed Edition)',
    price:18.99,
    description:"A collection of luminous poems by Yaya Starchild. Signed limited edition.",
    images:['assets/suncatcher-1.jpg','assets/suncatcher-2.jpg','assets/suncatcher-3.jpg','assets/suncatcher-4.jpg','assets/suncatcher-5.jpg']
  },
  {
    id:2,
    title:'Suncatcher Spirit (Paperback)',
    price:12.99,
    description:'Softcover paperback — perfect for bedside reading.',
    images:['assets/book-pb-1.jpg']
  },
  {id:3,title:'Suncatcher Sticker Pack',price:6.50,description:'A set of 6 pastel stickers.',images:['assets/sticker.jpg']},
  {id:4,title:'Suncatcher Tote',price:22.00,description:'Organic cotton tote printed with small poem excerpt.',images:['assets/tote.jpg']},
  {id:5,title:'Signed Poem Print',price:15.00,description:'8x10 signed poem print on textured paper.',images:['assets/print.jpg']}
];

function formatPrice(v){return '$'+v.toFixed(2)}

function renderProductsGrid(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p=>`
    <article class="product-card">
      <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.title} cover" /></a>
      <h4>${p.title}</h4>
      <div class="meta"><strong>${formatPrice(p.price)}</strong><a href="product.html?id=${p.id}">View</a></div>
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
  if(!p){el.innerHTML='<p>Product not found</p>';return}
  const thumbs = p.images.map((src,i)=>`<img src="${src}" alt="${p.title} image ${i+1}" class="thumb" data-src="${src}" style="width:72px;border-radius:8px;cursor:pointer;margin-right:6px"/>`).join('');
  el.innerHTML = `
    <div class="product-detail-left">
      <img id="main-image" src="${p.images[0]}" alt="${p.title} main image" />
      <div style="margin-top:8px">${thumbs}</div>
    </div>
    <div>
      <h2>${p.title}</h2>
      <p class="lead">${p.description}</p>
      <p><strong>${formatPrice(p.price)}</strong></p>
      <div class="cta-row">
        <button class="btn primary" id="add-to-cart">Add to cart</button>
        <a class="btn ghost" href="shop.html">Back to shop</a>
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
    alert('Added to cart!');
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
