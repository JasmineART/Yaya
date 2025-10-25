const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', filePath, err.message);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌟 Yaya website server running at http://127.0.0.1:${PORT}/`);
});