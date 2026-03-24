<h1 align="center">🔗 url-shortener</h1>

<p align="center">
  A fast, lightweight URL shortening service built with Node.js
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/github/stars/RyanMoshi/url-shortener?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/RyanMoshi/url-shortener?style=social" alt="Forks">
</p>

---

## ✨ Features

- 🚀 **Fast** — Generates short URLs in milliseconds
- 🔒 **Collision-free** — Uses nanoid for unique short codes
- 📊 **Click tracking** — Track how many times a link is visited
- 🗄️ **Flexible storage** — In-memory, JSON file, or Redis
- 🌐 **REST API** — Clean endpoints for creating and resolving URLs
- ⚡ **Zero dependencies** — Core module has no external deps

## 🚀 Quick Start

### Install
```bash
git clone https://github.com/RyanMoshi/url-shortener.git
cd url-shortener
npm install
```

### Run
```bash
npm start
# Server running at http://localhost:3000
```

### Usage
```bash
# Shorten a URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url"}'

# Response: { "short": "http://localhost:3000/abc123" }

# Resolve a short URL
curl http://localhost:3000/abc123
# Redirects to original URL
```

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shorten` | Create a short URL |
| GET | `/:code` | Redirect to original URL |
| GET | `/stats/:code` | Get click stats for a URL |
| DELETE | `/:code` | Delete a short URL |

## 🛠️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `BASE_URL` | `http://localhost:3000` | Base URL for short links |
| `STORAGE` | `memory` | Storage backend (`memory`, `file`, `redis`) |
| `CODE_LENGTH` | 6 | Length of short codes |

## 📁 Project Structure
```
url-shortener/
├── src/
│   ├── index.js          # Entry point & server
│   ├── router.js         # Route handlers
│   ├── shortener.js      # Core shortening logic
│   └── storage/
│       ├── memory.js     # In-memory store
│       ├── file.js       # JSON file store
│       └── redis.js      # Redis store
├── tests/
│   └── shortener.test.js
├── package.json
├── .env.example
├── .gitignore
└── LICENSE
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

## 📄 License

MIT © [Ryan Moshi](https://github.com/RyanMoshi)
