/**
 * MSOT LEARN — Node.js Application & API Server
 * Runs on port 3000 with universal CORS, static file serving, and /api/beta integration.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import betaHandler from './api/beta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// 1. Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const idx = trimmed.indexOf('=');
                const key = trimmed.slice(0, idx).trim();
                const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        });
        console.log('✓ Loaded environment variables from .env');
    } catch (e) {
        console.warn('Could not read .env file:', e.message);
    }
}

// 2. MIME types map for static files
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// 3. Helper to set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

// 4. Create HTTP Server
const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    // Handle Preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = reqUrl.pathname;

    // Route: POST /api/beta
    if (pathname === '/api/beta') {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
            return;
        }

        let bodyData = '';
        req.on('data', chunk => {
            bodyData += chunk;
            if (bodyData.length > 2e6) { // 2MB limit
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload too large' }));
                req.destroy();
            }
        });

        req.on('end', async () => {
            try {
                let parsedBody = {};
                if (bodyData.trim()) {
                    parsedBody = JSON.parse(bodyData);
                }
                
                // Wrap response object to match serverless function signature (res.status().json())
                const mockReq = {
                    method: req.method,
                    body: parsedBody,
                    headers: req.headers
                };

                const mockRes = {
                    statusCode: 200,
                    setHeader(name, val) {
                        res.setHeader(name, val);
                    },
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },
                    json(data) {
                        setCorsHeaders(res);
                        res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(data));
                    },
                    end(data) {
                        setCorsHeaders(res);
                        res.writeHead(this.statusCode);
                        res.end(data);
                    }
                };

                await betaHandler(mockReq, mockRes);
            } catch (err) {
                console.error('Error handling /api/beta:', err);
                setCorsHeaders(res);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error processing AI request', details: err.message }));
            }
        });
        return;
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Safety check against directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Check index.html fallback for SPA or 404
            if (pathname.startsWith('/api/')) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API route not found' }));
                return;
            }
            filePath = path.join(__dirname, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🕉️ MSOT Learn Server running on http://localhost:${PORT}`);
    console.log(`🤖 Aham Brahmasmi API endpoint active at /api/beta`);
    console.log(`=======================================================`);
});

export default server;
