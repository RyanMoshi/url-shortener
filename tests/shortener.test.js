'use strict';
/**
 * url-shortener tests — uses Node's built-in assert module.
 * Run with: npm test  (or: node tests/shortener.test.js)
 */
const assert    = require('assert');
const Shortener = require('../src/shortener');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  ✅ PASS  ' + name);
    passed++;
  } catch (err) {
    console.log('  ❌ FAIL  ' + name);
    console.log('        ' + err.message);
    failed++;
  }
}

console.log('\n─────────────────────────────────────');
console.log('  url-shortener unit tests');
console.log('─────────────────────────────────────\n');

// ── Test 1 ────────────────────────────────────────────────────────────────────
test('shorten() returns a URL prefixed with baseUrl', function() {
  var s = new Shortener({ baseUrl: 'https://sho.rt' });
  var result = s.shorten('https://example.com/a/very/long/path?query=true');
  assert.ok(result.startsWith('https://sho.rt/'), 'should start with base URL');
  var code = result.slice('https://sho.rt/'.length);
  assert.ok(code.length >= 4, 'code should be at least 4 chars, got: ' + code);
});

// ── Test 2 ────────────────────────────────────────────────────────────────────
test('shorten() returns the same short URL for the same input', function() {
  var s = new Shortener({ baseUrl: 'https://sho.rt' });
  var a = s.shorten('https://example.com/idempotent');
  var b = s.shorten('https://example.com/idempotent');
  assert.strictEqual(a, b, 'same URL must always produce the same short code');
});

// ── Test 3 ────────────────────────────────────────────────────────────────────
test('resolve() returns the original URL', function() {
  var s = new Shortener({ baseUrl: 'https://sho.rt' });
  var short = s.shorten('https://example.com/resolve-me');
  var code  = short.replace('https://sho.rt/', '');
  var resolved = s.resolve(code);
  assert.strictEqual(resolved, 'https://example.com/resolve-me');
});

// ── Test 4 ────────────────────────────────────────────────────────────────────
test('stats() correctly tracks hit count', function() {
  var s = new Shortener({ baseUrl: 'https://sho.rt' });
  var short = s.shorten('https://example.com/count-me');
  var code  = short.replace('https://sho.rt/', '');

  s.resolve(code); // hit 1
  s.resolve(code); // hit 2
  s.resolve(code); // hit 3

  var stats = s.stats(code);
  assert.ok(stats !== null, 'stats should not be null');
  assert.strictEqual(stats.hits, 3, 'expected 3 hits, got ' + stats.hits);
  assert.strictEqual(stats.url, 'https://example.com/count-me');
});

// ── Test 5 ────────────────────────────────────────────────────────────────────
test('remove() deletes a mapping; resolve() returns null afterwards', function() {
  var s = new Shortener({ baseUrl: 'https://sho.rt' });
  var short = s.shorten('https://example.com/delete-me');
  var code  = short.replace('https://sho.rt/', '');

  var removed = s.remove(code);
  assert.strictEqual(removed, true, 'remove() should return true');
  assert.strictEqual(s.resolve(code), null, 'resolve() should return null after deletion');
  assert.strictEqual(s.stats(code), null, 'stats() should return null after deletion');
});

// ── Test 6 ────────────────────────────────────────────────────────────────────
test('shorten() throws TypeError for invalid URLs', function() {
  var s = new Shortener();
  assert.throws(function() { s.shorten('not-a-valid-url'); },
    /valid absolute URL/, 'should throw for relative/invalid URL');
  assert.throws(function() { s.shorten(''); },
    /non-empty string/, 'should throw for empty string');
  assert.throws(function() { s.shorten(null); },
    /non-empty string/, 'should throw for null');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────');
console.log('  ' + (passed + failed) + ' tests   ' + passed + ' passed   ' + failed + ' failed');
console.log('─────────────────────────────────────\n');
process.exit(failed > 0 ? 1 : 0);
