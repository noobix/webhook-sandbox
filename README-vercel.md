# 🔗 Webhook Sandbox (Vercel Branch)

A real-time webhook testing and monitoring application optimized for Vercel deployment. This branch removes all file-based logging to comply with Vercel's serverless limitations.

## 📋 Overview

This Vercel-optimized version provides:

- **Real-time webhook receiver** with in-memory storage
- **Lightweight API** for webhook monitoring
- **Serverless deployment** ready for Vercel
- **No file persistence** (memory-only storage)

## 🚀 Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/noobix/webhook-sandbox/tree/vercel-no-logs)

### Manual Deployment

1. **Clone this branch:**

```bash
git clone -b vercel-no-logs https://github.com/noobix/webhook-sandbox.git
cd webhook-sandbox
```

2. **Deploy to Vercel:**

```bash
vercel --prod
```

## 📡 API Endpoints

### Webhook Endpoints

- `POST /webhook` - Main webhook receiver
- `GET /webhooks` - Retrieve all webhook logs (in-memory)
- `GET /info` - Server information (uptime, last request)
- `GET /logs` - Console logs (empty for Vercel compatibility)
- `GET /` - Health check endpoint

### Example Webhook Request

```bash
curl -X POST https://your-vercel-app.vercel.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2025-10-01T12:00:00Z"}'
```

## 🏗️ Project Structure

```
webhook-sandbox/
├── server/           # Backend Node.js application
│   ├── index.js      # Main serverless function
│   └── package.json  # Minimal dependencies
├── frontend/         # Frontend web application
│   └── index.html    # Console interface
├── vercel.json       # Vercel configuration
└── README.md
```

## ⚙️ Configuration

### Environment Variables (Vercel)

- `NODE_ENV` - Set to "production" by default
- `BASE_URL` - Automatically configured for Vercel

### Differences from Main Branch

**Removed for Vercel compatibility:**

- ❌ Winston logging library
- ❌ Chalk color output
- ❌ lowdb file database
- ❌ PM2 process manager
- ❌ File-based log storage
- ❌ nodemon development watcher

**Simplified for serverless:**

- ✅ In-memory webhook storage
- ✅ Basic console.log output
- ✅ Minimal dependencies (express + cors)
- ✅ Serverless function architecture

## 📊 Features

### Webhook Reception

- **Real-time webhook capture** with origin tracking
- **In-memory storage** (last 100 webhooks)
- **Request details** including headers and body
- **Response confirmation** with timestamp

### Monitoring

- **Uptime tracking** since deployment
- **Last request timestamp**
- **Simple health check** endpoint

### Limitations

- **No persistence** - Data resets on each deployment
- **Memory limits** - Only keeps last 100 webhooks
- **No log files** - Uses console.log for simplicity

## 🔧 Local Development

```bash
cd server
npm install
npm run dev
```

Server will run on `http://localhost:3001`

## 📱 Frontend

The frontend works the same as the main branch but connects to the Vercel API endpoints. Update the `BACKEND_URL` in `frontend/index.html` to point to your Vercel deployment.

## 🤝 Contributing

This is a specialized branch for Vercel deployment. For full-featured development, use the `main` branch which includes:

- File-based logging
- Database persistence
- Advanced monitoring
- Development tools

---

**Optimized for Vercel serverless deployment** ⚡
