'use strict';
/**
 * In-memory storage backend for url-shortener.
 * Stores mappings in a Map. Not persistent across restarts.
 */

class MemoryStore {
  constructor() {
    // code -> { url, hits, createdAt }
    this._store = new Map();
  }

  /** Persist a code → url mapping. */
  set(code, url) {
    this._store.set(code, {
      url:       url,
      hits:      0,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Look up the original URL for a code.
   * Increments the hit counter on each successful lookup.
   * Returns null if not found.
   */
  get(code) {
    var entry = this._store.get(code);
    if (!entry) return null;
    entry.hits++;
    return entry.url;
  }

  /** Check if a code exists without incrementing hits. */
  exists(code) { return this._store.has(code); }

  /** Delete a code mapping. Returns true if deleted, false if not found. */
  delete(code) { return this._store.delete(code); }

  /** Return statistics for a code without incrementing hits. */
  getStats(code) {
    var entry = this._store.get(code);
    if (!entry) return null;
    return { code: code, url: entry.url, hits: entry.hits, createdAt: entry.createdAt };
  }

  /** Find the code that maps to a given URL. Returns code string or null. */
  findByUrl(url) {
    for (var pair of this._store) {
      if (pair[1].url === url) return pair[0];
    }
    return null;
  }

  /** Return all stored mappings as an array. */
  list() {
    return Array.from(this._store.entries()).map(function(pair) {
      return { code: pair[0], url: pair[1].url, hits: pair[1].hits };
    });
  }

  /** Current number of stored mappings. */
  get size() { return this._store.size; }
}

module.exports = MemoryStore;
