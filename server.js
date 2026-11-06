/* ==========================================================================
   Meihang Co., Limited - local preview server
   --------------------------------------------------------------------------
   The site is a plain static build, but browsers refuse fetch() and
   cross-document <use> references under the file:// protocol, which means the
   SVG sprite (and therefore every icon and mascot) cannot load when a page is
   opened straight from disk. Running this tiny dependency-free server gives a
   faithful preview of what the deployed site looks like.

   Usage:   node server.js [port]
   Then open: http://localhost:8080
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = path.resolve(__dirname);
const PORT = Number(process.argv[2] || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath, status) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      const notFound = path.join(ROOT, '404.html');
      fs.readFile(notFound, (e2, nf) => {
        if (e2) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 Not Found'); }
        res.writeHead(404, { 'Content-Type': MIME['.html'] });
        res.end(nf);
      });
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(status || 200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('400 Bad Request');
  }

  if (pathname === '/' || pathname === '') pathname = '/index.html';

  // resolve inside ROOT only
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) return sendFile(res, path.join(filePath, 'index.html'));
    return sendFile(res, filePath);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = 'http://localhost:' + PORT + '/';
  console.log('');
  console.log('  Meihang Co., Limited - local preview');
  console.log('  ' + url);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
  if (process.env.NO_OPEN === '1') return;   // headless / CI use
  const opener = process.platform === 'win32'
    ? 'start "" "' + url + '"'
    : (process.platform === 'darwin' ? 'open "' + url + '"' : 'xdg-open "' + url + '"');
  exec(opener, () => {});
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Try: node server.js 8081');
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
