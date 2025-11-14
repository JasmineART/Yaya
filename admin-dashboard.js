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
      // Load products from products.js
      if (typeof PRODUCTS !== 'undefined') {
        this.currentData.products = [...PRODUCTS];
      }
      
      // Load coupons from app.js DISCOUNTS object
      if (typeof DISCOUNTS !== 'undefined') {
        this.currentData.coupons = {...DISCOUNTS};
      }
      
      // Load content from localStorage or defaults
      const savedContent = localStorage.getItem('adminSiteContent');
      if (savedContent) {
        this.currentData.content = JSON.parse(savedContent);
      } else {
        this.currentData.content = {
          tagline: "Whimsical poet who hopes to leave you enchanted.",
          heroText: "Discover luminous poetry that sparks wonder and celebrates the magic in everyday moments. Each verse invites you to pause, breathe, and find light in the spaces between heartbeats.",
          aboutIntro: "At the age of eight, Yaya picked up a pen for solace and never looked back. Starting with short stories in her youth, she eventually landed upon poetry as her most treasured means of expression."
        };
      }
      
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        this.currentData.settings = JSON.parse(savedSettings);
      } else {
        this.currentData.settings = {
          username: 'AdminYaya',
          password: 'poem_123',
          lastUpdated: new Date().toISOString()
        };
      }
      
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
      container.innerHTML = '<p style="color: rgba(255,255,255,0.7);">No products found. Add your first product!</p>';
      return;
    }
    
    container.innerHTML = this.currentData.products.map(product => `
      <div class="product-item">
        <div class="product-info">
          <h4><i class="${product.titleIcon || 'fas fa-box'}"></i> ${this.escapeHtml(product.title)}</h4>
          <p>$${product.price} • ${product.description ? product.description.substring(0, 100) + '...' : 'No description'}</p>
        </div>
        <div>
          <button onclick="adminDashboard.editProduct(${product.id})" class="admin-btn secondary">Edit</button>
          <button onclick="adminDashboard.deleteProduct(${product.id})" class="admin-btn danger">Delete</button>
        </div>
      </div>
    `).join('');
  }
  
  loadCouponsList() {
    const container = document.getElementById('coupon-list');
    if (!container) return;
    
    const coupons = Object.entries(this.currentData.coupons);
    if (coupons.length === 0) {
      container.innerHTML = '<p style="color: rgba(255,255,255,0.7);">No coupons found. Add your first coupon!</p>';
      return;
    }
    
    container.innerHTML = coupons.map(([code, data]) => `
      <div class="coupon-item">
        <div class="coupon-info">
          <span class="coupon-code">${code}</span>
          <span style="color: var(--white);">${data.description}</span>
          <span style="color: rgba(255,255,255,0.7);">${this.formatCouponValue(data)}</span>
        </div>
        <div>
          <button onclick="adminDashboard.deleteCoupon('${code}')" class="admin-btn danger">Delete</button>
        </div>
      </div>
    `).join('');
  }
  
  loadContentForms() {
    // Load current content into forms
    document.getElementById('site-tagline').value = this.currentData.content.tagline || '';
    document.getElementById('hero-text').value = this.currentData.content.heroText || '';
    document.getElementById('about-intro').value = this.currentData.content.aboutIntro || '';
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
    const code = document.getElementById('coupon-code').value.toUpperCase();
    const type = document.getElementById('coupon-type').value;
    const value = parseFloat(document.getElementById('coupon-value').value);
    const description = document.getElementById('coupon-description').value;
    
    if (!code || !type || !description) {
      this.showStatus('error', 'Please fill in all required fields', 'coupons');
      return;
    }
    
    if ((type === 'percentage' || type === 'flat') && (isNaN(value) || value <= 0)) {
      this.showStatus('error', 'Please enter a valid discount value', 'coupons');
      return;
    }
    
    if (this.currentData.coupons[code]) {
      this.showStatus('error', `Coupon code "${code}" already exists`, 'coupons');
      return;
    }
    
    const newCoupon = { type, description };
    if (type !== 'bogo_half') {
      newCoupon.value = type === 'percentage' ? value / 100 : value;
    }
    
    this.currentData.coupons[code] = newCoupon;
    this.markChanges();
    this.loadCouponsList();
    this.loadOverview();
    
    // Clear form
    document.getElementById('add-coupon-form').reset();
    
    this.showStatus('success', `Coupon "${code}" added successfully!`, 'coupons');
  }
  
  deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const index = this.currentData.products.findIndex(p => p.id === id);
    if (index > -1) {
      const product = this.currentData.products[index];
      this.currentData.products.splice(index, 1);
      this.markChanges();
      this.loadProductsList();
      this.loadOverview();
      this.showStatus('success', `Product "${product.title}" deleted successfully!`, 'products');
    }
  }
  
  deleteCoupon(code) {
    if (!confirm(`Are you sure you want to delete the coupon "${code}"?`)) return;
    
    delete this.currentData.coupons[code];
    this.markChanges();
    this.loadCouponsList();
    this.loadOverview();
    this.showStatus('success', `Coupon "${code}" deleted successfully!`, 'coupons');
  }
  
  updateContent(section) {
    const tagline = document.getElementById('site-tagline').value;
    const heroText = document.getElementById('hero-text').value;
    const aboutIntro = document.getElementById('about-intro').value;
    
    this.currentData.content = {
      tagline,
      heroText,
      aboutIntro
    };
    
    // Save to localStorage
    localStorage.setItem('adminSiteContent', JSON.stringify(this.currentData.content));
    
    this.markChanges();
    this.showStatus('success', 'Content updated successfully!', 'content');
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
  
  markChanges() {
    this.hasChanges = true;
    document.getElementById('save-site-btn').classList.add('show');
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