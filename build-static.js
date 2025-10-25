#!/usr/bin/env node

/**
 * Build Script for GitHub Pages Deployment
 * Copies all static files to dist directory for deployment
 */

const fs = require('fs');
const path = require('path');

// Files to copy to dist directory
const staticFiles = [
  'index.html',
  'about.html', 
  'cart.html',
  'checkout.html',
  'policies.html',
  'product.html',
  'shop.html',
  'styles.css',
  'app.js',
  'products.js',
  'cookie-consent.js',
  'data-handler.js',
  'error-monitor.js',
  'firebase-config.js',
  'google-email-client.js',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'logo.svg'
];

// Directories to copy recursively
const staticDirs = [
  'assets'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

function buildStatic() {
  console.log('🏗️  Building static site for GitHub Pages...');
  
  // Clean dist directory
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  ensureDir(distDir);
  
  // Copy static files
  staticFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      console.warn(`⚠️  File not found: ${src}`);
    }
  });
  
  // Copy static directories
  staticDirs.forEach(dir => {
    const src = path.join(__dirname, dir);
    const dest = path.join(distDir, dir);
    
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log(`📁 Copied directory: ${dir}`);
    } else {
      console.warn(`⚠️  Directory not found: ${src}`);
    }
  });
  
  // Create .nojekyll file to prevent Jekyll processing
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  console.log('📄 Created .nojekyll file');
  
  // Create CNAME file if custom domain is needed (optional)
  // fs.writeFileSync(path.join(distDir, 'CNAME'), 'your-domain.com');
  
  console.log('✅ Static site build complete!');
  console.log(`📦 Built files are in: ${distDir}`);
}

if (require.main === module) {
  buildStatic();
}

module.exports = buildStatic;