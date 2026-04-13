/**
 * EventFlow Dev Server
 * Serves the entire project root as the web root.
 * Handles SPA fallback (all unknown routes → index.html).
 * Usage: node server.js
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = 3000;
const ROOT      = __dirname;
const INDEX     = path.join(ROOT, 'public', 'index.html');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    const logTag = `[${new Date().toLocaleTimeString()}] ${req.method} ${urlPath}`;

    let filePath;
    let isSPA = false;

    if (urlPath === '/' || !path.extname(urlPath)) {
        filePath = INDEX;
        isSPA = true;
    } else if (urlPath.startsWith('/src/')) {
        filePath = path.join(ROOT, urlPath);
    } else {
        filePath = path.join(ROOT, 'public', urlPath);
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`${logTag} → 404 (Not Found)`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`404 — Not found: ${urlPath}`);
            return;
        }

        const ext = path.extname(filePath);
        let contentType = MIME[ext] || 'application/octet-stream';
        let body = data;

        console.log(`${logTag} → 200 (${contentType})`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(body);
    });

});

server.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   EventFlow Dev Server — Running                 ║
  ╠══════════════════════════════════════════════════╣
  ║   Attendee: http://localhost:${PORT}/             ║
  ║   Staff:    http://localhost:${PORT}/staff        ║
  ║   Control:  http://localhost:${PORT}/control      ║
  ║   Feedback: http://localhost:${PORT}/feedback     ║
  ╚══════════════════════════════════════════════════╝
`);
});
