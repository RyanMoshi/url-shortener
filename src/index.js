'use strict';
/**
 * url-shortener — HTTP server
 * Handles: POST /shorten, GET /:code, GET /stats/:code, DELETE /:code
 */
const http = require('http');
const Shortener = require('./shortener');

const PORT     = parseInt(process.env.PORT, 10) || 3000;
const BASE_URL = process.env.BASE_URL || ('http://localhost:' + PORT);

const shortener = new Shortener({ baseUrl: BASE_URL });

// ── Parse a JSON request body ─────────────────────────────────────────────────
function parseBody(req) {
  return new Promise(function(resolve, reject) {
    var data = '';
    req.on('data', function(chunk) { data += chunk; });
    req.on('end', function() {
      try { resolve(JSON.parse(data)); } catch (_) { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── Send a JSON response ──────────────────────────────────────────────────────
function json(res, status, body) {
  var payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-Powered-By': 'url-shortener',
  });
  res.end(payload);
}

// ── Main request router ───────────────────────────────────────────────────────
async function router(req, res) {
  var pathname = req.url.split('?')[0];
  var parts    = pathname.split('/').filter(Boolean);
  var method   = req.method.toUpperCase();

  // Health check
  if (method === 'GET' && parts.length === 0) {
    return json(res, 200, { status: 'ok', uptime: process.uptime().toFixed(1) + 's' });
  }

  // POST /shorten
  if (method === 'POST' && parts[0] === 'shorten') {
    var body = await parseBody(req);
    if (!body.url) return json(res, 400, { error: 'url is required' });
    try {
      var short = shortener.shorten(body.url, body.code);
      return json(res, 201, { short: short, url: body.url });
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
  }

  // GET /stats/:code
  if (method === 'GET' && parts[0] === 'stats' && parts[1]) {
    var stats = shortener.stats(parts[1]);
    if (!stats) return json(res, 404, { error: 'Code not found' });
    return json(res, 200, stats);
  }

  // DELETE /:code
  if (method === 'DELETE' && parts[0]) {
    var removed = shortener.remove(parts[0]);
    if (!removed) return json(res, 404, { error: 'Code not found' });
    return json(res, 200, { message: 'Deleted successfully' });
  }

  // GET /:code  →  302 redirect
  if (method === 'GET' && parts[0]) {
    var longUrl = shortener.resolve(parts[0]);
    if (!longUrl) return json(res, 404, { error: 'Short URL not found' });
    res.writeHead(302, { Location: longUrl });
    return res.end();
  }

  return json(res, 404, { error: 'Not found' });
}

// ── Start server ──────────────────────────────────────────────────────────────
var server = http.createServer(async function(req, res) {
  try {
    await router(req, res);
  } catch (err) {
    json(res, 500, { error: 'Internal server error' });
  }
});

if (require.main === module) {
  server.listen(PORT, function() {
    console.log('url-shortener running at ' + BASE_URL);
    console.log('Press Ctrl+C to stop.');
  });
}

module.exports = server;
