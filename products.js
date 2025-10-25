// Magical product dataset and render helpers
let PRODUCTS = [];

// Load products from JSON immediately
(function loadProducts() {
  // Inline data for immediate rendering (no fetch delay)
  PRODUCTS = [
    {
      id:1,
      title:'Suncatcher Spirit (Signed Edition)',
      titleIcon:'fas fa-crown',
      price:24.99,
      isbn: '979-8-9999322-0-4',
      description:"The debut poetry collection by Yaya Starchild — 64 pages of luminous verses exploring love, loss, resilience, and present-moment magic. This signed limited edition includes a handwritten blessing and arrives wrapped in tissue paper. Each copy is numbered and touched by magic. Published by Pastel Poetics — October 25, 2025.",
      reviews: [
        {name:'Moon Sisters Book Club',rating:5,text:"A tender, luminous collection that feels both grounding and uplifting. One of those books you return to again and again.",date:'2025-10-27'},
        {name:'Ingrid',rating:5,text:"Delightful — playful yet deep. Yaya's voice sparkles.",date:'2025-10-29'}
      ],
      images:['assets/suncatcher-cover.jpg']
    },
    {
      id:2,
      title:'Suncatcher Spirit (Paperback)',
      titleIcon:'fas fa-book',
      price:19.99,
      isbn: '979-8-9999322-0-4',
      description:'Softcover paperback edition — 64 pages of poetry perfect for bedside reading, carrying in your bag, or gifting. Printed on cream-colored paper that feels gentle in your hands.',
      reviews:[{name:'Adriana Auch',rating:4,text:'Perfect for quiet mornings in the park — brings calm and wonder.',date:'2025-11-02'}],
      images:['assets/suncatcher-cover.jpg']
    },
    {
      id:3,
      title:'Suncatcher Sticker Pack',
      titleIcon:'fas fa-sparkles',
      price:3.00,
      sku:'STK-SS-001',
      description:'A professionally designed set of 6 waterproof vinyl stickers featuring original artwork from Suncatcher Spirit. Each pack includes moon, star, flower, heart, sparkle, and cloud designs in vibrant pastel colors. Perfect for decorating laptops, water bottles, journals, phone cases, or any smooth surface. Durable, weather-resistant, and fade-proof.',
      reviews:[{name:'StickerFan',rating:5,text:'Stuck these on my laptop and they never peel — gorgeous colors.',date:'2025-11-05'}],
      images:['assets/sticker-pack.svg']
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
      <img src="${p.images[0]}" alt="${escapeHtml(p.title)} magical treasure" loading="eager" style="width:100%; height:280px; object-fit:cover; object-position:center;" />
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

function renderProductDetail(){
  const el = document.getElementById('product-detail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id')||'1';
  const p = getProductById(id);
  if(!p){el.innerHTML='<p>✨ Product not found — perhaps it vanished into the ether?</p>';return}
  
  const thumbs = p.images.map((src,i)=>`<img src="${src}" alt="${escapeHtml(p.title)} view ${i+1}" class="thumb" data-src="${src}" style="width:90px; height:90px; object-fit:cover; border-radius:12px; cursor:pointer; margin-right:10px; border:2px solid rgba(255,255,255,0.3); transition:all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='rgba(255,255,255,0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.3)';"/>`).join('');
  
  // Check if this is a book product (ID 1 or 2) to show preview
  const isBookProduct = (p.id === 1 || p.id === 2);
  
  // Preview button for book products
  const previewButton = isBookProduct ? `
    <button id="view-preview-btn" class="thumb preview-thumb" style="width:90px; height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.3); border-radius:12px; cursor:pointer; transition:all 0.3s ease; margin-right:10px;" onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='rgba(255,255,255,0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.3)';">
      <i class="fas fa-book-open" style="font-size:1.5rem; margin-bottom:0.3rem;"></i>
      <span style="font-size:0.75rem; font-weight:600;">Preview</span>
    </button>
  ` : '';
  
  el.innerHTML = `
    <div class="product-magazine-layout">
      <div class="product-image-column">
        <div id="image-view-container">
          <img id="main-image" src="${p.images[0]}" alt="${escapeHtml(p.title)} main view" loading="eager"/>
          <div id="pdf-preview-container" style="display:none;">
            <div class="pdf-viewer">
              <div class="pdf-controls">
                <h4><i class="fas fa-book-open"></i> Book Preview</h4>
                <button id="close-preview-btn" class="btn ghost"><i class="fas fa-times"></i> Close</button>
              </div>
              <div id="pdf-scroll-container"></div>
            </div>
          </div>
        </div>
        <div class="product-thumbnails">${thumbs}${previewButton}</div>
      </div>
      
      <div class="product-content-column">
        <h2><i class="${p.titleIcon || 'fas fa-star'}"></i> ${escapeHtml(p.title)}</h2>
        <p class="lead">${escapeHtml(p.description)}</p>
        ${p.isbn ? `<p class="product-meta">ISBN: <strong>${p.isbn}</strong></p>` : ''}
        ${p.sku ? `<p class="product-meta">SKU: <strong>${p.sku}</strong></p>` : ''}
        <p class="product-price">${formatPrice(p.price)}</p>
        <p class="product-perks">✨ Free bookmark included | 🎁 Gift wrapping available at checkout | 📦 Ships within 2-3 business days</p>
        <div class="cta-row">
          <button class="btn primary" id="add-to-cart">✨ Add to Cart</button>
          <a class="btn ghost" href="shop.html">← Back to Shop</a>
        </div>
        
        <section class="product-reviews" aria-label="Customer reviews">
          <h4>Customer reviews</h4>
          ${(p.reviews && p.reviews.length) ? `<div class="reviews-list">${p.reviews.map(r=>`<div class="comment"><strong>${escapeHtml(r.name)} — ${Array(r.rating).fill('★').join('')}</strong><p>${escapeHtml(r.text)}</p><small>${r.date}</small></div>`).join('')}</div>` : '<p>No reviews yet — be the first to leave one!</p>'}
        </section>
      </div>
    </div>
  `;
  
  // thumbnail click to swap
  document.querySelectorAll('.thumb[data-src]').forEach(t=>t.addEventListener('click',e=>{
    const src = e.currentTarget.dataset.src;
    const mainImage = document.getElementById('main-image');
    const previewContainer = document.getElementById('pdf-preview-container');
    
    // Hide preview and show image
    if(previewContainer) previewContainer.style.display = 'none';
    if(mainImage) {
      mainImage.style.display = 'block';
      mainImage.src = src;
    }
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

  // PDF Preview functionality for book products
  if(isBookProduct) {
    const viewPreviewBtn = document.getElementById('view-preview-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const previewContainer = document.getElementById('pdf-preview-container');
    const mainImage = document.getElementById('main-image');
    const pdfScrollContainer = document.getElementById('pdf-scroll-container');

    let pdfDoc = null;
    let pdfLoaded = false;

    // Show preview when clicking the preview button
    if(viewPreviewBtn) {
      viewPreviewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mainImage.style.display = 'none';
        previewContainer.style.display = 'block';
        if(!pdfLoaded) {
          loadPDF();
        }
      });
    }

    // Close preview and show main image
    if(closePreviewBtn) {
      closePreviewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        previewContainer.style.display = 'none';
        mainImage.style.display = 'block';
      });
    }

    // Load PDF and render all pages
    function loadPDF() {
      const url = 'assets/suncatcher Preview.pdf';
      
      // Set workerSrc for PDF.js
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        pdfScrollContainer.innerHTML = '<p style="color:#8b7a86; text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading preview...</p>';
        
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
          pdfDoc = pdf;
          pdfLoaded = true;
          pdfScrollContainer.innerHTML = ''; // Clear loading message
          
          // Render all pages
          const numPages = pdf.numPages;
          for(let pageNum = 1; pageNum <= numPages; pageNum++) {
            renderPage(pageNum);
          }
        }).catch(function(error) {
          console.error('Error loading PDF:', error);
          pdfScrollContainer.innerHTML = '<p style="color:#8b7a86; text-align:center; padding:2rem;">✨ Preview temporarily unavailable. Please try again later!</p>';
        });
      } else {
        pdfScrollContainer.innerHTML = '<p style="color:#8b7a86; text-align:center; padding:2rem;">✨ Preview not supported in this browser.</p>';
      }
    }

    // Render individual page
    function renderPage(pageNum) {
      pdfDoc.getPage(pageNum).then(function(page) {
        const scale = 1.5;
        const viewport = page.getViewport({scale: scale});
        
        // Create canvas for this page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto 1rem auto';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        
        // Add page number label
        const pageLabel = document.createElement('div');
        pageLabel.textContent = `Page ${pageNum}`;
        pageLabel.style.cssText = 'text-align:center; color:#8b7a86; font-size:0.85rem; margin-bottom:0.5rem; font-weight:600;';
        
        pdfScrollContainer.appendChild(pageLabel);
        pdfScrollContainer.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        page.render(renderContext);
      });
    }
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
