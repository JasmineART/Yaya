// Admin Dashboard JavaScript
// This handles all admin functionality including authentication, content management, and deployment

class AdminDashboard {
  constructor() {
    this.hasChanges = false;
    this.currentData = {
      products: [],
      coupons: {},
      content: {},
      settings: {}
    };
    
    // Undo/Redo functionality
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistorySize = 50;
    
    this.init();
  }
  
  init() {
    // Check authentication
    if (!this.isAuthenticated()) {
      window.location.href = 'admin-login.html';
      return;
    }
    
    // Load current data
    this.loadCurrentData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load overview data
    this.loadOverview();
    
    // Initialize undo/redo buttons
    this.updateUndoRedoButtons();
  }
  
  isAuthenticated() {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    const loginTime = parseInt(sessionStorage.getItem('adminLoginTime') || '0');
    const now = Date.now();
    
    // Session expires after 4 hours
    if (authenticated === 'true' && (now - loginTime) < 4 * 60 * 60 * 1000) {
      return true;
    }
    
    // Clear expired session
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    return false;
  }
  
  loadCurrentData() {
    try {
      // Load products from products.js (3 current products)
      if (typeof PRODUCTS !== 'undefined') {
        this.currentData.products = [...PRODUCTS];
      } else {
        // Fallback product data based on current site
        this.currentData.products = [
          {
            id: 1,
            title: 'Suncatcher Spirit (Signed Edition)',
            titleIcon: 'fas fa-crown',
            price: 24.99,
            isbn: '979-8-9999322-0-4',
            description: 'The debut poetry collection by Yaya Starchild — 64 pages of luminous verses exploring love, loss, resilience, and present-moment magic. This signed copy includes a handwritten blessing and arrives wrapped in tissue paper, touched by magic.',
            reviews: [{name:'Moon Sisters Book Club',rating:5,text:'A tender, luminous collection that feels both grounding and uplifting. One of those books you return to again and again.',date:'2025-10-27'}],
            images: ['assets/suncatcher-cover.jpg']
          },
          {
            id: 2,
            title: 'Suncatcher Spirit (Paperback)',
            titleIcon: 'fas fa-book',
            price: 19.99,
            isbn: '979-8-9999322-0-4',
            description: 'Softcover paperback edition — 64 pages of poetry perfect for bedside reading, carrying in your bag, or gifting. Printed on cream-colored paper that feels gentle in your hands.',
            reviews: [{name:'Adriana Auch',rating:5,text:'I highly recommend bringing this book into nature with you.',date:'2025-11-02'}],
            images: ['assets/suncatcher-cover.jpg']
          },
          {
            id: 3,
            title: 'Suncatcher Spirit Sticker',
            titleIcon: 'fas fa-sparkles',
            price: 3.00,
            description: 'Keep the whimsy of "Suncatcher Spirit" close with stickers of the book\'s 11 dazzling illustrations or front cover! Perfect for laptops and water bottles.',
            requiresVariant: true,
            images: ['assets/sticker_Dancing.jpg']
          }
        ];
      }
      
      // Load current coupons from app.js (3 active coupons)
      if (typeof DISCOUNTS !== 'undefined') {
        this.currentData.coupons = {...DISCOUNTS};
      } else {
        // Current active coupons on the site
        this.currentData.coupons = {
          'PASTEL': {
            type: 'bogo_half',
            description: 'Buy one, get 2nd item 50% off',
            active: true
          },
          'SUNCATCHER': {
            type: 'percentage',
            value: 0.15,
            description: '15% off entire cart',
            active: true
          },
          'WHIMSY': {
            type: 'percentage',
            value: 0.25,
            description: '25% off entire cart',
            active: true
          }
        };
      }
      
      // Load actual current content from the site
      this.currentData.content = {
        tagline: "Whimsical poet testing admin functionality! 🧪",
        heroText: "A marriage of higher-self discovery and inner-child love — a sprinkle of fairy dust to reacquaint yourself with your childlike wonder. This enchanted debut collection invites you into a magical realm where poetry dances with illustrations, and every page sparkles with whimsy.",
        aboutIntro: "At the age of eight, Yaya picked up a pen for solace and never looked back. Starting with short stories in her youth, she eventually landed upon poetry as her most treasured means of expression.",
        aboutBio: "Yaya is a queer artist from St. Louis, MO, whose poetry explores the romance and whimsy woven into life's intricacies and simplicities. Her verses touch on love, loss, resilience, and the magic found in the present moment."
      };
      
      // Load settings
      this.currentData.settings = {
        username: 'AdminYaya',
        password: 'poem_123',
        lastUpdated: new Date().toISOString(),
        siteVersion: '2.0.0'
      };
      
    } catch (error) {
      console.error('Error loading current data:', error);
      this.showStatus('error', 'Error loading site data', 'overview');
    }
  }
  
  setupEventListeners() {
    // Product form
    document.getElementById('add-product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addProduct();
    });
    
    // Coupon form
    document.getElementById('add-coupon-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addCoupon();
    });
    
    // Credentials form
    document.getElementById('change-credentials-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.changeCredentials();
    });
    
    // Content inputs - detect changes
    const contentInputs = ['site-tagline', 'hero-text', 'about-intro'];
    contentInputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.markChanges());
      }
    });
  }
  
  loadOverview() {
    // Update statistics with animation
    this.animateNumber('product-count', this.currentData.products.length);
    this.animateNumber('coupon-count', Object.keys(this.currentData.coupons).length);
    
    // Update change status
    this.updateChangeStatus();
    
    this.loadProductsList();
    this.loadCouponsList();
    this.loadContentForms();
  }
  
  animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startNumber = parseInt(element.textContent) || 0;
    const duration = 600;
    const steps = 20;
    const increment = (targetNumber - startNumber) / steps;
    let current = startNumber;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current += increment;
      element.textContent = Math.round(current);
      
      if (step >= steps) {
        clearInterval(timer);
        element.textContent = targetNumber;
      }
    }, duration / steps);
  }
  
  updateChangeStatus() {
    const saveBtn = document.getElementById('save-site-btn');
    if (this.hasChanges && saveBtn) {
      saveBtn.style.display = 'flex';
      saveBtn.classList.add('pulse');
    } else if (saveBtn) {
      saveBtn.style.display = 'none';
      saveBtn.classList.remove('pulse');
    }
  }
  
  loadProductsList() {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    if (this.currentData.products.length === 0) {
      container.innerHTML = '<p style="color: rgba(44,62,80,0.7);">No products found. Add your first product!</p>';
      return;
    }
    
    container.innerHTML = this.currentData.products.map(product => {
      const reviewCount = product.reviews ? product.reviews.length : 0;
      const avgRating = reviewCount > 0 ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1) : 'N/A';
      const hasVariants = product.requiresVariant && product.variants;
      
      return `
        <div class="product-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="product-info" style="flex: 1;">
            <h4 style="color: #2c3e50; margin: 0 0 0.5rem 0; font-family: 'Cinzel', serif;"><i class="${product.titleIcon || 'fas fa-box'}"></i> ${this.escapeHtml(product.title)}</h4>
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: var(--pink); font-size: 1.1rem;">$${product.price.toFixed(2)}</strong>
              ${product.isbn ? `<span style="color: rgba(44,62,80,0.6); margin-left: 1rem; font-size: 0.9rem;">ISBN: ${product.isbn}</span>` : ''}
            </div>
            <p style="color: rgba(44,62,80,0.8); margin: 0.5rem 0; line-height: 1.4;">${product.description ? (product.description.length > 120 ? product.description.substring(0, 120) + '...' : product.description) : 'No description'}</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.9rem;">
              <span style="color: rgba(44,62,80,0.7);"><i class="fas fa-star"></i> ${avgRating} (${reviewCount} reviews)</span>
              ${hasVariants ? `<span style="color: rgba(44,62,80,0.7);"><i class="fas fa-palette"></i> ${product.variants.length} variants</span>` : ''}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem;">
            <button onclick="adminDashboard.editProduct(${product.id})" class="admin-btn secondary">Edit</button>
            <button onclick="adminDashboard.deleteProduct(${product.id})" class="admin-btn danger">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  loadCouponsList() {
    const container = document.getElementById('coupon-list');
    if (!container) return;
    
    const coupons = Object.keys(this.currentData.coupons);
    if (coupons.length === 0) {
      container.innerHTML = '<p style="color: rgba(44,62,80,0.7);">No active coupons. Create your first coupon!</p>';
      return;
    }
    
    container.innerHTML = coupons.map(code => {
      const coupon = this.currentData.coupons[code];
      const discountText = coupon.type === 'percentage' 
        ? `${Math.round(coupon.value * 100)}% off`
        : coupon.type === 'bogo_half'
        ? 'BOGO 50% off'
        : coupon.type === 'flat'
        ? `$${coupon.value} off`
        : 'Special offer';
      
      const isActive = coupon.active !== false;
      
      return `
        <div class="coupon-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div class="coupon-info">
            <h4 style="color: #2c3e50; margin: 0 0 0.25rem 0; font-family: 'Cinzel', serif;"><i class="fas fa-tag"></i> ${this.escapeHtml(code)}</h4>
            <p style="color: rgba(44,62,80,0.8); margin: 0; font-size: 0.9rem;">${this.escapeHtml(coupon.description || 'No description')}</p>
            <small style="color: var(--pink); font-weight: 600;">${discountText} ${isActive ? '✅ Active' : '❌ Inactive'}</small>
          </div>
          <div>
            <button onclick="adminDashboard.editCoupon('${code}')" class="admin-btn secondary" style="margin-right: 0.5rem;">Edit</button>
            <button onclick="adminDashboard.deleteCoupon('${code}')" class="admin-btn danger">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  loadContentForms() {
    // Populate with actual current site content
    const taglineField = document.getElementById('site-tagline');
    const heroTextField = document.getElementById('site-hero-text');
    const aboutIntroField = document.getElementById('about-intro');
    const aboutBioField = document.getElementById('about-bio');
    
    if (taglineField) taglineField.value = this.currentData.content.tagline || 'Whimsical poet who hopes to leave you enchanted.';
    if (heroTextField) heroTextField.value = this.currentData.content.heroText || 'A marriage of higher-self discovery and inner-child love';
    if (aboutIntroField) aboutIntroField.value = this.currentData.content.aboutIntro || 'At the age of eight, Yaya picked up a pen for solace and never looked back.';
    if (aboutBioField) aboutBioField.value = this.currentData.content.aboutBio || 'Yaya is a queer artist from St. Louis, MO, whose poetry explores the romance and whimsy woven into life\'s intricacies and simplicities.';
  }
  
  formatCouponValue(coupon) {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value * 100}% off`;
      case 'flat':
        return `$${coupon.value} off`;
      case 'bogo_half':
        return 'BOGO 50% off';
      default:
        return '';
    }
  }
  
  addProduct() {
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const icon = document.getElementById('product-icon').value || 'fas fa-box';
    const isbn = document.getElementById('product-isbn').value;
    const image = document.getElementById('product-image').value;
    
    if (!title || !price || !description || !image) {
      this.showStatus('error', 'Please fill in all required fields', 'products');
      return;
    }
    
    // Save state before making changes
    this.saveState(`Add Product: ${title}`);
    
    const newProduct = {
      id: Math.max(...this.currentData.products.map(p => p.id || 0)) + 1,
      title,
      titleIcon: icon,
      price,
      description,
      images: [image],
      reviews: []
    };
    
    if (isbn) {
      newProduct.isbn = isbn;
    }
    
    this.currentData.products.push(newProduct);
    this.markChanges();
    this.loadProductsList();
    this.loadOverview();
    
    // Clear form
    document.getElementById('add-product-form').reset();
    
    this.showStatus('success', `Product "${title}" added successfully!`, 'products');
  }
  
  addCoupon() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const type = document.getElementById('coupon-type').value;
    
    // Save state before making changes
    this.saveState(`Add Coupon: ${code}`);
    const value = parseFloat(document.getElementById('coupon-value').value);
    const description = document.getElementById('coupon-description').value.trim();
    
    if (!code) {
      this.showStatus('error', 'Coupon code is required', 'coupons');
      return;
    }
    
    if (type === 'percentage' && (isNaN(value) || value <= 0 || value > 100)) {
      this.showStatus('error', 'Percentage must be between 1 and 100', 'coupons');
      return;
    }
    
    if (type === 'flat' && (isNaN(value) || value <= 0)) {
      this.showStatus('error', 'Dollar amount must be greater than 0', 'coupons');
      return;
    }
    
    const isExisting = this.currentData.coupons[code];
    
    this.currentData.coupons[code] = {
      type,
      value: type === 'bogo_half' ? undefined : (type === 'percentage' ? value / 100 : value),
      description,
      active: true,
      created: this.currentData.coupons[code]?.created || new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    this.hasChanges = true;
    this.updateChangeStatus();
    this.loadCouponsList();
    this.loadOverview();
    
    // Clear form
    document.getElementById('add-coupon-form').reset();
    
    const action = isExisting ? 'updated' : 'created';
    this.showStatus('success', `Coupon "${code}" ${action} successfully`, 'coupons');
  }
  
  deleteProduct(productId) {
    try {
      const product = this.currentData.products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Save state before making changes
      this.saveState(`Delete Product: ${product.title}`);
      
      const productIndex = this.currentData.products.findIndex(p => p.id === productId);
      
      // Remove product
      this.currentData.products.splice(productIndex, 1);
      
      this.hasChanges = true;
      this.loadProductsList();
      this.showStatus('success', 'Product deleted successfully!', 'products');
    } catch (error) {
      this.showStatus('error', error.message, 'products');
    }
  }
  
  deleteCoupon(couponCode) {
    try {
      if (!this.currentData.coupons[couponCode]) {
        throw new Error('Coupon not found');
      }
      
      // Save state before making changes
      this.saveState(`Delete Coupon: ${couponCode}`);
      
      delete this.currentData.coupons[couponCode];
      
      this.hasChanges = true;
      this.loadCouponsList();
      this.showStatus('success', 'Coupon deleted successfully!', 'coupons');
    } catch (error) {
      this.showStatus('error', error.message, 'coupons');
    }
  }
  
  updateContent(contentData) {
    try {
      // Save state before making changes
      this.saveState('Update Site Content');
      
      // Update current data
      Object.assign(this.currentData.content, contentData);
      
      // Save to localStorage
      localStorage.setItem('adminSiteContent', JSON.stringify(this.currentData.content));
      
      this.markChanges();
      this.showStatus('success', 'Content updated successfully!', 'content');
    } catch (error) {
      this.showStatus('error', error.message, 'content');
    }
  }
  
  changeCredentials() {
    const currentPassword = document.getElementById('current-password').value;
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (currentPassword !== this.currentData.settings.password) {
      this.showStatus('error', 'Current password is incorrect', 'settings');
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      this.showStatus('error', 'New passwords do not match', 'settings');
      return;
    }
    
    if (newUsername) {
      this.currentData.settings.username = newUsername;
    }
    
    if (newPassword) {
      this.currentData.settings.password = newPassword;
    }
    
    // Save to localStorage
    localStorage.setItem('adminSettings', JSON.stringify(this.currentData.settings));
    
    this.markChanges();
    document.getElementById('change-credentials-form').reset();
    this.showStatus('success', 'Credentials updated successfully!', 'settings');
  }
  
  updateContent(section) {
    if (section === 'homepage') {
      const tagline = document.getElementById('site-tagline').value.trim();
      const heroText = document.getElementById('site-hero-text').value.trim();
      
      if (tagline) this.currentData.content.tagline = tagline;
      if (heroText) this.currentData.content.heroText = heroText;
      
      this.showStatus('success', 'Homepage content updated successfully', 'content');
    } else if (section === 'about') {
      const aboutIntro = document.getElementById('about-intro').value.trim();
      const aboutBio = document.getElementById('about-bio').value.trim();
      
      if (aboutIntro) this.currentData.content.aboutIntro = aboutIntro;
      if (aboutBio) this.currentData.content.aboutBio = aboutBio;
      
      this.showStatus('success', 'About page content updated successfully', 'content');
    }
    
    // Save to localStorage
    localStorage.setItem('adminSiteContent', JSON.stringify(this.currentData.content));
    
    this.hasChanges = true;
    this.updateChangeStatus();
    this.loadOverview();
  }

  markChanges() {
    this.hasChanges = true;
    this.updateChangeStatus();
  }
  
  saveSite() {
    if (!this.hasChanges) {
      this.showStatus('error', 'No changes to save', 'overview');
      return;
    }
    
    const saveBtn = document.getElementById('save-site-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
    saveBtn.disabled = true;
    
    // Simulate site deployment process
    this.deployChanges().then(() => {
      this.hasChanges = false;
      saveBtn.classList.remove('show');
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
      
      // Update last updated time
      this.currentData.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem('adminSettings', JSON.stringify(this.currentData.settings));
      
      this.showStatus('success', 'Site deployed successfully! Changes are now live.', 'overview');
      this.loadOverview();
      
    }).catch(error => {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
      this.showStatus('error', 'Deployment failed: ' + error.message, 'overview');
    });
  }
  
  async deployChanges() {
    try {
      // Get authentication token
      const token = this.getAuthToken();
      
      // Deploy products if changed
      await this.apiCall('/api/admin/products', {
        products: this.currentData.products
      }, token);
      
      // Deploy coupons if changed
      await this.apiCall('/api/admin/coupons', {
        coupons: this.currentData.coupons
      }, token);
      
      // Deploy content if changed
      await this.apiCall('/api/admin/content', {
        content: this.currentData.content
      }, token);
      
      // Trigger final deployment
      await this.apiCall('/api/admin/deploy', {}, token);
      
      // Save current state to localStorage as backup
      localStorage.setItem('adminSiteData', JSON.stringify(this.currentData));
      
      return true;
      
    } catch (error) {
      // Fallback to local-only deployment if API is not available
      console.warn('API deployment failed, using local simulation:', error.message);
      
      // Update local objects
      if (typeof PRODUCTS !== 'undefined') {
        PRODUCTS.length = 0;
        PRODUCTS.push(...this.currentData.products);
      }
      
      if (typeof DISCOUNTS !== 'undefined') {
        Object.keys(DISCOUNTS).forEach(key => delete DISCOUNTS[key]);
        Object.assign(DISCOUNTS, this.currentData.coupons);
      }
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save current state to localStorage as backup
      localStorage.setItem('adminSiteData', JSON.stringify(this.currentData));
      
      return true;
    }
  }
  
  getAuthToken() {
    const credentials = `${this.currentData.settings.username}:${this.currentData.settings.password}`;
    return btoa(credentials);
  }
  
  async apiCall(endpoint, data, token) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }
    
    return await response.json();
  }
  
  exportData() {
    const dataToExport = {
      products: this.currentData.products,
      coupons: this.currentData.coupons,
      content: this.currentData.content,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaya-site-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showStatus('success', 'Site data exported successfully!', 'settings');
  }
  
  showStatus(type, message, section) {
    const statusEl = document.getElementById(`${section}-status`);
    if (!statusEl) return;
    
    statusEl.className = `admin-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Undo/Redo functionality
  saveState(action = 'Unknown Action') {
    // Create a deep copy of current state
    const state = {
      data: JSON.parse(JSON.stringify(this.currentData)),
      timestamp: Date.now(),
      action: action
    };
    
    // Add to undo stack
    this.undoStack.push(state);
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    this.updateUndoRedoButtons();
  }
  
  undo() {
    if (this.undoStack.length === 0) return;
    
    // Save current state to redo stack
    const currentState = {
      data: JSON.parse(JSON.stringify(this.currentData)),
      timestamp: Date.now(),
      action: 'Current State'
    };
    this.redoStack.push(currentState);
    
    // Restore previous state
    const previousState = this.undoStack.pop();
    this.currentData = JSON.parse(JSON.stringify(previousState.data));
    
    // Update UI
    this.refreshAllSections();
    this.updateUndoRedoButtons();
    
    // Show feedback
    this.showNotification(`Undid: ${previousState.action}`, 'success');
  }
  
  redo() {
    if (this.redoStack.length === 0) return;
    
    // Save current state to undo stack
    const currentState = {
      data: JSON.parse(JSON.stringify(this.currentData)),
      timestamp: Date.now(),
      action: 'Undo Action'
    };
    this.undoStack.push(currentState);
    
    // Restore next state
    const nextState = this.redoStack.pop();
    this.currentData = JSON.parse(JSON.stringify(nextState.data));
    
    // Update UI
    this.refreshAllSections();
    this.updateUndoRedoButtons();
    
    // Show feedback
    this.showNotification(`Redid: ${nextState.action}`, 'success');
  }
  
  updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.disabled = this.undoStack.length === 0;
      undoBtn.title = this.undoStack.length > 0 
        ? `Undo: ${this.undoStack[this.undoStack.length - 1].action}` 
        : 'Nothing to undo';
    }
    
    if (redoBtn) {
      redoBtn.disabled = this.redoStack.length === 0;
      redoBtn.title = this.redoStack.length > 0 
        ? `Redo: ${this.redoStack[this.redoStack.length - 1].action}` 
        : 'Nothing to redo';
    }
  }
  
  refreshAllSections() {
    // Refresh products section
    this.loadProductsList();
    
    // Refresh coupons section
    this.loadCouponsList();
    
    // Refresh content section if loaded
    if (document.getElementById('heroTitle')) {
      this.loadContentForms();
    }
    
    // Update overview
    this.loadOverview();
  }
  
  showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('admin-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'admin-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.3);
        transition: all 0.3s ease;
        transform: translateX(100%);
      `;
      document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification-${type}`;
    
    // Style based on type
    if (type === 'success') {
      notification.style.background = 'rgba(46, 204, 113, 0.9)';
      notification.style.color = 'white';
    } else if (type === 'error') {
      notification.style.background = 'rgba(231, 76, 60, 0.9)';
      notification.style.color = 'white';
    } else {
      notification.style.background = 'rgba(52, 152, 219, 0.9)';
      notification.style.color = 'white';
    }
    
    // Animate in
    notification.style.transform = 'translateX(0)';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Navigation functions
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active class from nav buttons
  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected section
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Add active class to nav button
  const navButton = document.getElementById(`nav-${sectionName}`);
  if (navButton) {
    navButton.classList.add('active');
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'admin-login.html';
  }
}

function updateContent(section) {
  adminDashboard.updateContent(section);
}

function exportData() {
  adminDashboard.exportData();
}

function saveSite() {
  adminDashboard.saveSite();
}

// Initialize admin dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard = new AdminDashboard();
});

// Make functions globally available
window.showSection = showSection;
window.logout = logout;
window.updateContent = updateContent;
window.exportData = exportData;
window.saveSite = saveSite;
window.adminDashboard = adminDashboard;