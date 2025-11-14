// Admin API Backend - Handles admin operations and site updates
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AdminAPI {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('.'));
    
    // CORS for admin access
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }
  
  setupRoutes() {
    // Authentication middleware
    const authenticate = (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !this.validateToken(auth)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    };
    
    // Authentication endpoint
    this.app.post('/api/admin/auth', async (req, res) => {
      try {
        const { username, password } = req.body;
        const isValid = await this.validateCredentials(username, password);
        
        if (isValid) {
          const token = this.generateToken();
          res.json({ 
            success: true, 
            token,
            message: 'Authentication successful' 
          });
        } else {
          res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
          });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get current site data
    this.app.get('/api/admin/data', authenticate, async (req, res) => {
      try {
        const data = await this.getCurrentSiteData();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Update products
    this.app.post('/api/admin/products', authenticate, async (req, res) => {
      try {
        await this.updateProducts(req.body.products);
        await this.deploySite();
        res.json({ success: true, message: 'Products updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Update coupons
    this.app.post('/api/admin/coupons', authenticate, async (req, res) => {
      try {
        await this.updateCoupons(req.body.coupons);
        await this.deploySite();
        res.json({ success: true, message: 'Coupons updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Update content
    this.app.post('/api/admin/content', authenticate, async (req, res) => {
      try {
        await this.updateContent(req.body.content);
        await this.deploySite();
        res.json({ success: true, message: 'Content updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Deploy site
    this.app.post('/api/admin/deploy', authenticate, async (req, res) => {
      try {
        const result = await this.deploySite();
        res.json({ success: true, message: 'Site deployed successfully', result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Update admin credentials
    this.app.post('/api/admin/credentials', authenticate, async (req, res) => {
      try {
        await this.updateCredentials(req.body.credentials);
        res.json({ success: true, message: 'Credentials updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  validateToken(authHeader) {
    // Simple token validation - in production, use JWT or proper session management
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [username, password] = decoded.split(':');
      
      // Load current credentials
      const credentials = this.loadCredentials();
      return username === credentials.username && password === credentials.password;
    } catch {
      return false;
    }
  }
  
  loadCredentials() {
    try {
      const credentialsPath = path.join(__dirname, 'admin-credentials.json');
      const data = require(credentialsPath);
      return data;
    } catch {
      // Default credentials
      return { username: 'AdminYaya', password: 'poem_123' };
    }
  }
  
  async validateCredentials(username, password) {
    const credentials = this.loadCredentials();
    return username === credentials.username && password === credentials.password;
  }
  
  generateToken() {
    const credentials = this.loadCredentials();
    const tokenData = `${credentials.username}:${credentials.password}`;
    return Buffer.from(tokenData).toString('base64');
  }
  
  async getCurrentSiteData() {
    // Read products.js
    const productsContent = await fs.readFile('products.js', 'utf8');
    const products = this.extractProductsFromJS(productsContent);
    
    // Read app.js for coupons
    const appContent = await fs.readFile('app.js', 'utf8');
    const coupons = this.extractCouponsFromJS(appContent);
    
    // Read content from HTML files
    const content = await this.extractContentFromHTML();
    
    return { products, coupons, content };
  }
  
  extractProductsFromJS(content) {
    try {
      console.log('Extracting products from content...');
      console.log('Content preview:', content.substring(0, 300));
      
      // Extract PRODUCTS array from the loadProducts function
      const match = content.match(/PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
      console.log('Regex match found:', !!match);
      
      if (match) {
        console.log('Matched content:', match[1].substring(0, 200));
        // Create a safe execution context
        const vm = require('vm');
        const context = {};
        const script = new vm.Script(`products = ${match[1]}`);
        script.runInNewContext(context);
        console.log('Extracted products count:', context.products ? context.products.length : 0);
        return context.products;
      }
    } catch (error) {
      console.error('Error extracting products:', error);
      console.log('Raw content preview:', content.substring(0, 500));
    }
    return [];
  }
  
  extractCouponsFromJS(content) {
    try {
      // Extract DISCOUNTS object from JavaScript
      const match = content.match(/const\s+DISCOUNTS\s*=\s*(\{[\s\S]*?\});/);
      if (match) {
        // Create a safe execution context
        const vm = require('vm');
        const context = {};
        const script = new vm.Script(`discounts = ${match[1]}`);
        script.runInNewContext(context);
        return context.discounts;
      }
    } catch (error) {
      console.error('Error extracting coupons:', error);
    }
    return {};
  }
  
  async extractContentFromHTML() {
    const content = {};
    
    try {
      // Extract tagline from index.html
      const indexContent = await fs.readFile('index.html', 'utf8');
      const taglineMatch = indexContent.match(/<p class="tag">(.*?)<\/p>/);
      if (taglineMatch) {
        content.tagline = taglineMatch[1];
      }
      
      // Extract hero text from index.html 
      const heroMatch = indexContent.match(/<h1[^>]*>(.*?)<\/h1>/);
      if (heroMatch) {
        content.heroText = heroMatch[1].replace(/<[^>]*>/g, '').trim(); // Remove any HTML tags
      }
      
      // Extract about content from about.html
      const aboutContent = await fs.readFile('about.html', 'utf8');
      const aboutIntroMatch = aboutContent.match(/<div class="about-intro"[^>]*>\s*<p>(.*?)<\/p>/s);
      if (aboutIntroMatch) {
        content.aboutIntro = aboutIntroMatch[1].trim();
      }
      
      const aboutBioMatch = aboutContent.match(/<div class="bio-section"[^>]*>[\s\S]*?<p>(.*?)<\/p>/);
      if (aboutBioMatch) {
        content.aboutBio = aboutBioMatch[1].trim();
      }
      
    } catch (error) {
      console.error('Error extracting content:', error);
    }
    
    return content;
  }
  
  async updateProducts(products) {
    // Generate new products.js content
    const newContent = this.generateProductsJS(products);
    await fs.writeFile('products.js', newContent, 'utf8');
  }
  
  generateProductsJS(products) {
    const productsJS = JSON.stringify(products, null, 2);
    
    return `// Magical product dataset and render helpers
let PRODUCTS = [];

// Load products from JSON immediately
(function loadProducts() {
  // Inline data for immediate rendering (no fetch delay)
  PRODUCTS = ${productsJS};
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
  grid.innerHTML = PRODUCTS.map(p=>\`
    <article class="product-card active" onclick="window.location.href='product.html?id=\${p.id}'" style="cursor:pointer;">
      <img src="\${p.images[0]}" alt="\${escapeHtml(p.title)} magical treasure" loading="lazy" style="width:100%; height:280px; object-fit:cover; object-position:center;" />
      <h3><i class="\${p.titleIcon || 'fas fa-star'}"></i> \${escapeHtml(p.title)}</h3>
      <p style="font-size:0.95rem; margin:0.5rem 0; opacity:0.9; line-height:1.5;">\${escapeHtml(p.description.substring(0, 120))}\${p.description.length>120 ? '...' : ''}</p>
      <div style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
        \${renderStarsInline(''+(p.reviews && p.reviews.length ? Math.round(p.reviews.reduce((s,r)=>s+r.rating,0)/p.reviews.length) : 4))}
        <small style="opacity:0.9; font-size:0.9rem;">\${p.reviews ? p.reviews.length : 0} \${p.reviews && p.reviews.length === 1 ? 'review' : 'reviews'}</small>
      </div>
      <div class="meta">
        <strong class="price">\${formatPrice(p.price)}</strong>
        <span class="btn ghost" style="font-size:0.95rem; padding:0.5rem 1rem; pointer-events:none;">View ✨</span>
      </div>
    </article>
  \`).join('');
}

function renderStarsInline(n){
  const count = Math.max(0, Math.min(5, parseInt(n,10)||0));
  let out = '';
  for(let i=0;i<5;i++) out += i<count ? '<i class="fas fa-star" style="color:#FFD166"></i>' : '<i class="far fa-star" style="color:rgba(255,255,255,0.5)"></i>';
  return \`<span aria-hidden="true">\${out}</span>\`;
}

function getProductById(id){
  return PRODUCTS.find(p=>p.id===Number(id));
}

// Additional functions would continue here...
`;
  }
  
  async updateCoupons(coupons) {
    // Read current app.js
    let appContent = await fs.readFile('app.js', 'utf8');
    
    // Generate new DISCOUNTS object
    const newDiscounts = JSON.stringify(coupons, null, 2);
    
    // Replace DISCOUNTS object in app.js
    appContent = appContent.replace(
      /const\s+DISCOUNTS\s*=\s*\{[\s\S]*?\};/,
      `const DISCOUNTS = ${newDiscounts};`
    );
    
    await fs.writeFile('app.js', appContent, 'utf8');
  }
  
  async updateContent(content) {
    // Update various HTML files with new content
    for (const [key, value] of Object.entries(content)) {
      await this.updateHTMLContent(key, value);
    }
  }
  
  async updateHTMLContent(contentType, value) {
    switch (contentType) {
      case 'tagline':
        await this.updateTagline(value);
        break;
      case 'heroText':
        await this.updateHeroText(value);
        break;
      case 'aboutIntro':
        await this.updateAboutIntro(value);
        break;
    }
  }
  
  async updateTagline(newTagline) {
    const files = ['index.html', 'about.html', 'shop.html', 'product.html'];
    
    for (const file of files) {
      try {
        let content = await fs.readFile(file, 'utf8');
        content = content.replace(
          /<p class="tag">.*?<\/p>/g,
          `<p class="tag">${newTagline}</p>`
        );
        await fs.writeFile(file, content, 'utf8');
      } catch (error) {
        console.error(`Error updating tagline in ${file}:`, error);
      }
    }
  }
  
  async updateHeroText(newHeroText) {
    // Update hero text in index.html - this would need to be customized based on your HTML structure
    try {
      let content = await fs.readFile('index.html', 'utf8');
      // Add specific replacement logic for hero text
      await fs.writeFile('index.html', content, 'utf8');
    } catch (error) {
      console.error('Error updating hero text:', error);
    }
  }
  
  async updateAboutIntro(newAboutIntro) {
    // Update about intro in about.html
    try {
      let content = await fs.readFile('about.html', 'utf8');
      // Add specific replacement logic for about intro
      await fs.writeFile('about.html', content, 'utf8');
    } catch (error) {
      console.error('Error updating about intro:', error);
    }
  }
  
  async updateCredentials(credentials) {
    const credentialsPath = path.join(__dirname, 'admin-credentials.json');
    await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
  }
  
  async deploySite() {
    try {
      // Stage all changes
      execSync('git add -A', { cwd: __dirname });
      
      // Commit changes
      const timestamp = new Date().toISOString();
      execSync(`git commit -m "Admin update: ${timestamp}"`, { cwd: __dirname });
      
      // Push to main branch
      execSync('git push origin main', { cwd: __dirname });
      
      return { success: true, message: 'Site deployed successfully', timestamp };
      
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }
  
  start(port = 3001) {
    try {
      this.server = this.app.listen(port, () => {
        console.log(`Admin API server running on port ${port}`);
        console.log(`Available endpoints:`);
        console.log(`  POST /api/admin/auth - Authentication`);
        console.log(`  GET /api/admin/data - Get site data`);
        console.log(`  POST /api/admin/products - Update products`);
        console.log(`  POST /api/admin/coupons - Update coupons`);
        console.log(`  POST /api/admin/content - Update content`);
        console.log(`  POST /api/admin/deploy - Deploy site`);
      });
      
      this.server.on('error', (error) => {
        console.error('Server error:', error);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  }
}

// Export for use
module.exports = AdminAPI;

// Start server if run directly
if (require.main === module) {
  const api = new AdminAPI();
  api.start();
}