'use strict';
const crypto = require('crypto');

// Hash-based URL shortener with in-memory store

class UrlShortener {
  constructor(options) {
    options = options || {};
    this.baseUrl = options.baseUrl || 'https://short.local';
    this.length = options.length || 7;
    this._store = new Map();
    this._reverse = new Map();
  }

  _hash(url) {
    return crypto.createHash('sha256').update(url).digest('base64url').slice(0, this.length);
  }

  shorten(longUrl) {
    if (!longUrl || typeof longUrl !== 'string') throw new TypeError('URL must be a non-empty string');
    if (this._reverse.has(longUrl)) {
      const code = this._reverse.get(longUrl);
      return this.baseUrl + '/' + code;
    }
    let code = this._hash(longUrl);
    let attempt = 0;
    while (this._store.has(code) && this._store.get(code) !== longUrl) {
      code = this._hash(longUrl + attempt++);
    }
    this._store.set(code, { url: longUrl, hits: 0, createdAt: Date.now() });
    this._reverse.set(longUrl, code);
    return this.baseUrl + '/' + code;
  }

  resolve(code) {
    const entry = this._store.get(code);
    if (!entry) return null;
    entry.hits++;
    return entry.url;
  }

  stats(code) {
    return this._store.get(code) || null;
  }

  list() {
    return [...this._store.entries()].map(([code, e]) => ({
      short: this.baseUrl + '/' + code, url: e.url, hits: e.hits,
    }));
  }

  remove(code) {
    const entry = this._store.get(code);
    if (entry) this._reverse.delete(entry.url);
    return this._store.delete(code);
  }
}

module.exports = UrlShortener;
