# 🔗 Webhook Sandbox

A real-time webhook testing and monitoring application with a terminal-style web console. Built with Node.js/Express backend and vanilla JavaScript frontend.

## 📋 Overview

Webhook Sandbox provides a simple way to receive, log, and monitor webhook requests in real-time. It features:

- **Real-time webhook receiver** with detailed logging
- **Terminal-style web console** displaying colored logs
- **Lightweight database** for storing webhook data
- **Server monitoring** with uptime and request statistics
- **Auto-restart capabilities** for production deployment

## 🏗️ Project Structure

```
webhook-sandbox/
├── server/           # Backend Node.js application
│   ├── index.js      # Main server file
│   ├── package.json  # Dependencies and scripts
│   ├── nodemon.json  # Development configuration
│   └── ecosystem.config.js  # PM2 configuration
├── frontend/         # Frontend web application
│   └── index.html    # Console interface
└── README.md
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

4. **Or start production server:**

```bash
npm start
```

### Frontend Access

1. **Open the console interface:**

   - Direct access: `http://localhost:3001` (when served by backend)
   - Or open `frontend/index.html` in your browser

2. **Configure backend URL** (if needed):
   - Edit `BACKEND_URL` in `frontend/index.html` line ~279

## 📡 API Endpoints

### Webhook Endpoints

- `POST /webhook` - Main webhook receiver
- `GET /webhooks` - Retrieve all webhook logs
- `GET /info` - Server information (uptime, last request)
- `GET /logs` - Console logs for frontend display

### Example Webhook Request

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2025-10-01T12:00:00Z"}'
```

## 🖥️ Frontend Features

### Terminal Console

- **Real-time log display** with color coding
- **Auto-refresh** every 5 seconds
- **Manual controls** (pause/resume, clear console)
- **Connection status** indicator

### Server Information Panel

- Live server uptime
- Last webhook request timestamp
- Total webhook count
- Available API endpoints

### Color Coding

- 🟢 **Green**: Info messages
- 🟡 **Yellow**: Warning messages
- 🔴 **Red**: Error messages
- ⚪ **White**: General messages

## ⚙️ Backend Configuration

### Environment Variables

```bash
NODE_ENV=development          # development | production
PORT=3001                     # Server port
BASE_URL=http://localhost:3001 # Base URL for logging
```

### Development Mode

```bash
npm run dev                   # Auto-restart on file changes
```

### Production Deployment

```bash
# Using PM2 (recommended)
npm run pm2:start            # Start with PM2
npm run pm2:stop             # Stop PM2 process
npm run pm2:restart          # Restart PM2 process

# Direct execution
npm start                    # Standard production start
```

## 📊 Features

### Logging & Monitoring

- **Winston logging** with file and console output
- **Colored console output** using Chalk
- **Request origin tracking** (IP addresses)
- **Automatic log rotation** (keeps last 500 entries)

### Database

- **Lightweight JSON database** using lowdb
- **Automatic data persistence**
- **Configurable retention** (webhooks, logs, metadata)

### Auto-Restart

- **Nodemon** for development file watching
- **PM2 integration** for production auto-restart
- **Graceful shutdown** handling
- **Error recovery** with exponential backoff

## 🔧 Configuration Files

### `server/package.json`

Contains dependencies and npm scripts for development and production.

### `server/nodemon.json`

Development configuration that ignores database and log files to prevent restart loops.

### `server/ecosystem.config.js`

PM2 configuration for production deployment with auto-restart policies.

## 🛠️ Development

### Project Requirements

- **Node.js** 16+
- **NPM** 7+

### Adding Features

1. **Backend**: Modify `server/index.js` and restart server
2. **Frontend**: Edit `frontend/index.html` and refresh browser
3. **Styling**: Update CSS in the `<style>` section of `index.html`

### Debugging

- **Server logs**: Check console output or `logs/` directory
- **Frontend logs**: Open browser developer tools
- **Database**: Inspect `server/db.json` file

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for webhook testing and monitoring**
