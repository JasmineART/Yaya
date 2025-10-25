#!/usr/bin/env node

/**
 * Optimized Yaya Server - High Performance Static + API Server
 * Combines frontend static serving with backend API in one optimized process
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Performance & Security Middleware (order matters!)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
  hsts: false // Disabled for local development
}));
app.use(compression()); // Gzip compression

// Optimized static file serving
app.use(express.static(path.join(__dirname), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Optimize caching for different file types
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
    } else if (filePath.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for CSS/JS
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week for images
    }
  }
}));

// API middleware
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Optimized CORS for development
app.use('/api', cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Optimized rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api', express.json({ limit: '10mb' }));

// Import optimized API routes
const { body, validationResult } = require('express-validator');

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'Yaya Optimized Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Optimized newsletter endpoint
app.post('/api/newsletter', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Mock success for now (replace with actual newsletter service)
  console.log('Newsletter signup:', req.body.email);
  res.json({ success: true, message: 'Successfully subscribed!' });
});

// Optimized contact endpoint
app.post('/api/contact', [
  body('name').isLength({ min: 1 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('message').isLength({ min: 1 }).trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Mock success for now
  console.log('Contact form submission:', req.body);
  res.json({ success: true, message: 'Message sent successfully!' });
});

// Fallback routes for HTML pages
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'cart.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'product.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'checkout.html')));
app.get('/policies', (req, res) => res.sendFile(path.join(__dirname, 'policies.html')));

// API 404 handler
app.use('/api', (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Yaya Optimized Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Performance optimizations enabled`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;