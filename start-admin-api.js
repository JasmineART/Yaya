#!/usr/bin/env node

// Admin API Server Startup Script
const AdminAPI = require('./admin-api.js');

console.log('🔧 Starting Yaya Starchild Admin API Server...');

// Create and start the admin API server
const adminAPI = new AdminAPI();

// Start on port 3001 (or from environment)
const port = process.env.ADMIN_PORT || 3001;

adminAPI.start(port);

console.log(`✨ Admin API Server is running on http://localhost:${port}`);
console.log('📝 Access admin dashboard at: http://localhost:3000/admin-login.html');
console.log('🛡️  Default credentials: AdminYaya / poem_123');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Admin API Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Admin API Server...');
  process.exit(0);
});