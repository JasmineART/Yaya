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
      title:'Suncatcher Spirit Sticker',
      titleIcon:'fas fa-sparkles',
      price:3.00,
      sku:'STK-SS-001',
      description:"Keep the whimsy of \"Suncatcher Spirit\" close with stickers of the book's 10 dazzling illustrations or front cover! Perfect for laptops and water bottles. High-quality waterproof vinyl stickers featuring vibrant pastel artwork. Durable, weather-resistant, and fade-proof. Each sticker sold separately.",
      requiresVariant: true,
      variants: [
        {id: 'dancing', name: 'Dancing Couple', image: 'assets/sticker_Dancing.jpg'},
        {id: 'skydiving', name: 'Skydiving Joy', image: 'assets/sticker_skydiving.jpg'},
        {id: 'sunflower', name: 'Sunflower Garden', image: 'assets/sticker_sunflower.jpg'},
        {id: 'ballerina', name: 'Ballerina Dreams', image: 'assets/sticker_ballerina.jpg'},
        {id: 'birdsnbees', name: 'Birds & Bees', image: 'assets/sticker_birdsnbees.jpg'},
        {id: 'crows', name: 'Crows & Magic', image: 'assets/sticker_crows.jpg'},
        {id: 'applepicking', name: 'Apple Picking', image: 'assets/sticker_applepicking.jpg'},
        {id: 'pinklady', name: 'Pink Lady', image: 'assets/sticker_pinklady.jpg'},
        {id: 'fairytea', name: 'Fairy Tea Party', image: 'assets/sticker_fairyTea.jpg'},
        {id: 'cover', name: 'Book Cover', image: 'assets/suncatcher-cover.jpg'}
      ],
      reviews:[{name:'StickerFan',rating:5,text:'Stuck these on my laptop and they never peel — gorgeous colors.',date:'2025-11-05'}],
      images:['assets/sticker_Dancing.jpg', 'assets/sticker_skydiving.jpg', 'assets/sticker_sunflower.jpg', 'assets/sticker_ballerina.jpg', 'assets/sticker_birdsnbees.jpg', 'assets/sticker_crows.jpg', 'assets/sticker_applepicking.jpg', 'assets/sticker_pinklady.jpg', 'assets/sticker_fairyTea.jpg', 'assets/suncatcher-cover.jpg']
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

function renderProductDetail(){
  const el = document.getElementById('product-detail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id')||'1';
  const p = getProductById(id);
  if(!p){el.innerHTML='<p>✨ Product not found — perhaps it vanished into the ether?</p>';return}
  
  // Slideshow navigation for multiple images
  const hasMultipleImages = p.images && p.images.length > 1;
  const slideshowControls = hasMultipleImages ? `
    <button id="prev-slide" class="slideshow-arrow prev-arrow" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 1.5rem; color: #8b7a86; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,1)'; this.style.transform='translateY(-50%) scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateY(-50%) scale(1)';">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button id="next-slide" class="slideshow-arrow next-arrow" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 1.5rem; color: #8b7a86; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,1)'; this.style.transform='translateY(-50%) scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateY(-50%) scale(1)';">
      <i class="fas fa-chevron-right"></i>
    </button>
    <div class="slideshow-indicators" style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10;">
      ${p.images.map((_, i) => `
        <button class="slide-indicator" data-index="${i}" style="width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9); background: ${i === 0 ? 'rgba(255,255,255,0.9)' : 'transparent'}; cursor: pointer; transition: all 0.3s ease;"></button>
      `).join('')}
    </div>
  ` : '';
  
  // Check if this is a book product (ID 1 or 2) to show preview
  const isBookProduct = (p.id === 1 || p.id === 2);
  
  // Variant selector for products that require it
  const variantSelector = p.requiresVariant && p.variants ? `
    <div class="variant-selector" style="margin: 1.5rem 0; padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 15px; border: 1px solid rgba(255,255,255,0.2);">
      <h4 style="margin-bottom: 1rem; font-size: 1.2rem; font-weight: 600;"><i class="fas fa-palette"></i> Choose Your Design:</h4>
      <div class="variant-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
        ${p.variants.map(v => `
          <label class="variant-option" style="cursor: pointer; position: relative; display: block;">
            <input type="radio" name="variant" value="${v.id}" data-name="${escapeHtml(v.name)}" style="position: absolute; opacity: 0;" required />
            <div class="variant-card" style="border: 3px solid rgba(255,255,255,0.3); border-radius: 12px; padding: 0.75rem; transition: all 0.3s ease; background: rgba(255,255,255,0.05); height: 100%; transform: translateY(0);">
              <img src="${v.image}" alt="${escapeHtml(v.name)}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
              <p style="font-size: 0.9rem; text-align: center; margin: 0; font-weight: 600; line-height: 1.3;">${escapeHtml(v.name)}</p>
            </div>
          </label>
        `).join('')}
      </div>
      <p id="variant-error" style="color: #ff6b6b; font-size: 0.95rem; margin-top: 1rem; display: none; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Please select a design before adding to cart</p>
    </div>
  ` : '';
  
  // Preview button for book products
  const previewButton = isBookProduct ? `
    <button id="view-preview-btn" class="thumb preview-thumb" style="padding: 1rem; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.4); border-radius:12px; cursor:pointer; transition:all 0.3s ease; margin-top: 1rem; width: 100%;" onmouseover="this.style.transform='scale(1.02)'; this.style.borderColor='rgba(255,255,255,0.7)'; this.style.background='rgba(255,255,255,0.25)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.4)'; this.style.background='rgba(255,255,255,0.15)';">
      <i class="fas fa-book-open" style="font-size:2rem; margin-bottom:0.5rem;"></i>
      <span style="font-size:1rem; font-weight:600;">View Book Preview</span>
    </button>
  ` : '';
  
  el.innerHTML = `
    <div class="product-magazine-layout">
      <div class="product-image-column">
        <div id="image-view-container" style="position: relative;">
          <img id="main-image" src="${p.images[0]}" alt="${escapeHtml(p.title)} main view" loading="eager" data-current-index="0"/>
          ${slideshowControls}
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
        ${previewButton}
      </div>
      
      <div class="product-content-column">
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2;"><i class="${p.titleIcon || 'fas fa-star'}"></i> ${escapeHtml(p.title)}</h2>
        <p class="lead" style="font-size: 1.15rem; line-height: 1.8; margin-bottom: 1.5rem;">${escapeHtml(p.description)}</p>
        ${p.isbn ? `<p class="product-meta" style="font-size: 1rem; margin: 0.5rem 0;">ISBN: <strong>${p.isbn}</strong></p>` : ''}
        ${p.sku ? `<p class="product-meta" style="font-size: 1rem; margin: 0.5rem 0;">SKU: <strong>${p.sku}</strong></p>` : ''}
        ${variantSelector}
        <p class="product-price" style="font-size: 2.5rem; font-weight: 700; margin: 1.5rem 0; color: #fff;">${formatPrice(p.price)}</p>
        <p class="product-perks" style="font-size: 1rem; line-height: 1.6; opacity: 0.95; margin-bottom: 1.5rem;">✨ Free bookmark included | 🎁 Gift wrapping available at checkout | 📦 Ships within 2-3 business days</p>
        <div class="cta-row" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
          <button class="btn primary" id="add-to-cart" style="flex: 1; font-size: 1.1rem; padding: 1rem 2rem;">✨ Add to Cart</button>
          <a class="btn ghost" href="shop.html" style="font-size: 1.1rem; padding: 1rem 2rem;">← Back to Shop</a>
        </div>
        
        <section class="product-reviews" aria-label="Customer reviews" style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid rgba(255,255,255,0.2);">
          <h4 style="font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-star"></i> Customer Reviews</h4>
          ${(p.reviews && p.reviews.length) ? `<div class="reviews-list">${p.reviews.map(r=>`<div class="comment" style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 12px;"><strong style="font-size: 1.1rem;">${escapeHtml(r.name)} — <span style="color: #FFD166;">${Array(r.rating).fill('★').join('')}</span></strong><p style="margin: 0.75rem 0; font-size: 1.05rem; line-height: 1.6;">${escapeHtml(r.text)}</p><small style="opacity: 0.8;">${r.date}</small></div>`).join('')}</div>` : '<p>No reviews yet — be the first to leave one!</p>'}
        </section>
      </div>
    </div>
  `;
  
  // Slideshow functionality
  if(p.images && p.images.length > 1) {
    let currentIndex = 0;
    const mainImage = document.getElementById('main-image');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const indicators = document.querySelectorAll('.slide-indicator');
    
    function updateSlide(index) {
      currentIndex = index;
      if(mainImage) {
        mainImage.src = p.images[currentIndex];
        mainImage.setAttribute('data-current-index', currentIndex);
      }
      // Update indicators
      indicators.forEach((ind, i) => {
        ind.style.background = i === currentIndex ? 'rgba(255,255,255,0.9)' : 'transparent';
      });
    }
    
    if(prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + p.images.length) % p.images.length;
        updateSlide(currentIndex);
      });
    }
    
    if(nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % p.images.length;
        updateSlide(currentIndex);
      });
    }
    
    // Click indicators to jump to slide
    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => {
        updateSlide(i);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowLeft' && prevBtn) {
        prevBtn.click();
      } else if(e.key === 'ArrowRight' && nextBtn) {
        nextBtn.click();
      }
    });
  }
  
  // Variant selection styling
  if(p.requiresVariant) {
    document.querySelectorAll('.variant-option input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', function() {
        // Remove selected styling from all
        document.querySelectorAll('.variant-card').forEach(card => {
          card.style.borderColor = 'rgba(255,255,255,0.3)';
          card.style.background = 'rgba(255,255,255,0.05)';
          card.style.boxShadow = 'none';
        });
        // Add selected styling
        const card = this.parentElement.querySelector('.variant-card');
        card.style.borderColor = '#FFD166';
        card.style.background = 'rgba(255,209,102,0.15)';
        card.style.boxShadow = '0 0 25px rgba(255,209,102,0.4)';
        // Hide error
        const error = document.getElementById('variant-error');
        if(error) error.style.display = 'none';
      });
    });
    
    // Add hover effects to variant cards
    document.querySelectorAll('.variant-option').forEach(option => {
      const card = option.querySelector('.variant-card');
      option.addEventListener('mouseenter', () => {
        if(!option.querySelector('input').checked) {
          card.style.borderColor = 'rgba(255,255,255,0.6)';
          card.style.background = 'rgba(255,255,255,0.15)';
          card.style.transform = 'translateY(-4px)';
        }
      });
      option.addEventListener('mouseleave', () => {
        if(!option.querySelector('input').checked) {
          card.style.borderColor = 'rgba(255,255,255,0.3)';
          card.style.background = 'rgba(255,255,255,0.05)';
          card.style.transform = 'translateY(0)';
        }
      });
    });
  }
  
  document.getElementById('add-to-cart').addEventListener('click',()=>{
    // Check if variant is required
    if(p.requiresVariant) {
      const selectedVariant = document.querySelector('.variant-option input[type="radio"]:checked');
      if(!selectedVariant) {
        const error = document.getElementById('variant-error');
        if(error) error.style.display = 'block';
        return;
      }
      // Add variant info to cart item
      const variantId = selectedVariant.value;
      const variantName = selectedVariant.dataset.name;
      addToCart(p.id, 1, {variantId, variantName});
      
      // Create notification with variant name
      const notification = document.createElement('div');
      notification.textContent = `✨ Added ${variantName} to your enchanted cart!`;
      notification.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.95); color:#8b7a86; padding:1rem 1.5rem; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.2); z-index:9999; animation:slideIn 0.3s ease; font-weight:600;';
      document.body.appendChild(notification);
      setTimeout(()=>notification.remove(), 3000);
    } else {
      addToCart(p.id);
      // Create a magical notification instead of alert
      const notification = document.createElement('div');
      notification.textContent = '✨ Added to your enchanted cart!';
      notification.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.95); color:#8b7a86; padding:1rem 1.5rem; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.2); z-index:9999; animation:slideIn 0.3s ease; font-weight:600;';
      document.body.appendChild(notification);
      setTimeout(()=>notification.remove(), 3000);
    }
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
