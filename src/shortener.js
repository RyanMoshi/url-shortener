'use strict';
/**
 * Core URL shortening logic.
 * Generates collision-resistant short codes and delegates storage.
 */
const crypto  = require('crypto');
const MemoryStore = require('./storage/memory');

// URL-safe alphabet (no confusable chars like 0/O, 1/l/I)
var ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a random short code of the given length.
 * Uses crypto.randomBytes for uniform distribution.
 */
function randomCode(length) {
  var bytes = crypto.randomBytes(length * 2); // extra bytes for modulo bias mitigation
  var code  = '';
  var i     = 0;
  while (code.length < length && i < bytes.length) {
    var idx = bytes[i] % ALPHABET.length;
    code += ALPHABET[idx];
    i++;
  }
  return code;
}

/**
 * Validate a URL string. Throws TypeError for invalid input.
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') throw new TypeError('url must be a non-empty string');
  try { new URL(url); } catch (_) { throw new TypeError('url must be a valid absolute URL'); }
}

class Shortener {
  constructor(options) {
    options = options || {};
    this.baseUrl    = (options.baseUrl || 'http://localhost:3000').replace(/\/$/, '');
    this.codeLength = parseInt(process.env.CODE_LENGTH, 10) || options.codeLength || 6;
    this.store      = options.store || new MemoryStore();
  }

  /**
   * Shorten a URL. Returns the full short URL.
   * Accepts an optional custom code; falls back to a random one.
   */
  shorten(longUrl, customCode) {
    validateUrl(longUrl);

    // Return existing mapping if this URL was already shortened
    var existing = this.store.findByUrl(longUrl);
    if (existing) return this.baseUrl + '/' + existing;

    var code    = customCode || randomCode(this.codeLength);
    var retries = 0;

    // Resolve collisions by regenerating (up to 10 attempts)
    while (this.store.exists(code) && retries < 10) {
      code = randomCode(this.codeLength);
      retries++;
    }
    if (this.store.exists(code)) throw new Error('Could not generate a unique code — try again');

    this.store.set(code, longUrl);
    return this.baseUrl + '/' + code;
  }

  /** Resolve a code to its original URL. Increments hit counter. */
  resolve(code) { return this.store.get(code); }

  /** Return usage statistics for a code. */
  stats(code) { return this.store.getStats(code); }

  /** Delete a short URL mapping. Returns true if deleted, false if not found. */
  remove(code) { return this.store.delete(code); }

  /** List all stored mappings. */
  list() { return this.store.list(); }
}

module.exports = Shortener;
