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

## 🌐 Live Webhook Testing with Tunneling

To test webhooks from external services (GitHub, Stripe, PayPal, etc.) on your local development server, you need to expose your localhost to the internet. Choose one of these popular tunneling solutions:

### Option 1: ngrok (Recommended for Beginners)

**What ngrok brings to the table:**

- ✅ Secure HTTPS tunnel to your localhost
- ✅ Web interface to inspect all HTTP requests
- ✅ Replay functionality for debugging
- ✅ Works behind firewalls and NAT
- ✅ Custom subdomains (paid plans)
- ✅ Password protection for your tunnel
- ✅ Works on all platforms (Windows, Mac, Linux)

**Setup Steps:**

1. **Download and install ngrok:**

   - Visit [ngrok.com](https://ngrok.com/download)
   - Download for your platform
   - Extract and add to PATH (optional)

2. **Sign up for free account:**

   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

3. **Start your webhook sandbox:**

   ```bash
   cd server
   npm run dev
   ```

4. **In a new terminal, create the tunnel:**

   ```bash
   ngrok http 3001
   ```

5. **Copy the public URL:**

   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3001
   ```

6. **Use the ngrok URL for webhooks:**
   ```
   Webhook URL: https://abc123.ngrok.io/webhook
   ```

**ngrok Web Interface:**

- Open `http://localhost:4040` in your browser
- View all incoming requests in real-time
- Inspect headers, body, and responses
- Replay requests for debugging

**Example with GitHub Webhooks:**

```
Repository Settings → Webhooks → Add webhook
Payload URL: https://abc123.ngrok.io/webhook
Content type: application/json
```

### Option 2: Serveo (No Installation Required)

**What Serveo brings to the table:**

- ✅ Zero installation - works via SSH
- ✅ No account registration required
- ✅ Custom subdomain support
- ✅ Completely free and open source
- ✅ Works anywhere SSH is available
- ✅ Lightweight and fast
- ✅ No bandwidth limits

**Setup Steps:**

1. **Start your webhook sandbox:**

   ```bash
   cd server
   npm run dev
   ```

2. **In a new terminal, create SSH tunnel:**

   ```bash
   ssh -R 80:localhost:3001 serveo.net
   ```

3. **Copy the public URL from the output:**

   ```
   Forwarding HTTP traffic from https://yourname.serveo.net
   ```

4. **Use a custom subdomain (optional):**

   ```bash
   ssh -R mywebhook:80:localhost:3001 serveo.net
   ```

   This gives you: `https://mywebhook.serveo.net`

5. **Use the Serveo URL for webhooks:**
   ```
   Webhook URL: https://yourname.serveo.net/webhook
   ```

**Example with Stripe Webhooks:**

```
Stripe Dashboard → Developers → Webhooks → Add endpoint
Endpoint URL: https://yourname.serveo.net/webhook
Events to send: Select events you want to receive
```

### Comparison: ngrok vs Serveo

| Feature            | ngrok                       | Serveo                |
| ------------------ | --------------------------- | --------------------- |
| Installation       | Required                    | None (uses SSH)       |
| Account Required   | Yes (free tier)             | No                    |
| Web Interface      | Yes (`localhost:4040`)      | No                    |
| Request Inspection | Full details + replay       | No                    |
| Custom Subdomains  | Paid plans only             | Free                  |
| HTTPS Support      | Yes                         | Yes                   |
| Stability          | Very stable                 | Can disconnect        |
| Bandwidth Limits   | 40 connections/min (free)   | None                  |
| Best For           | Professional dev, debugging | Quick tests, no setup |

### Which Should You Choose?

**Choose ngrok if:**

- 🔍 You need to inspect and debug webhook payloads
- 🔄 You want to replay requests
- 💼 You're doing professional development
- 📊 You need reliable, long-running tunnels
- 🎯 You want advanced features (auth, custom domains)

**Choose Serveo if:**

- ⚡ You need a quick tunnel right now
- 🚫 You don't want to install anything
- 🆓 You want a completely free solution
- 🔧 You're doing simple webhook testing
- 🌐 You have SSH available everywhere

### Testing Your Tunnel

Once your tunnel is running, test it:

```bash
# Test with curl
curl https://YOUR-TUNNEL-URL/webhook \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"source": "external", "test": true}'
```

You should see:

- ✅ The webhook appear in your terminal console
- ✅ The log entry in your frontend at `http://localhost:3001`
- ✅ The webhook details in the Webhooks panel

### Common Webhook Services to Test

With your tunnel set up, you can receive webhooks from:

- **GitHub**: Push events, Pull requests, Issues
- **Stripe**: Payment events, Customer events
- **PayPal**: Payment notifications
- **Twilio**: SMS, Call events
- **Shopify**: Order events, Customer events
- **Discord**: Bot events, Interactions
- **Slack**: Slash commands, Events API
- **Mailgun**: Email events
- **SendGrid**: Email events, Bounces

### Security Considerations

⚠️ **Important Security Notes:**

1. **Don't use tunnels in production** - They're for development only
2. **Never commit tunnel URLs** to your repository
3. **Tunnels expire** - Free ngrok URLs change on restart
4. **Anyone with the URL** can send requests to your localhost
5. **Consider IP whitelisting** for sensitive webhooks
6. **Use HTTPS tunnels only** for webhook data
7. **Monitor your tunnel** for unexpected traffic

### Troubleshooting Tunnels

**ngrok Issues:**

```bash
# Check if ngrok is running
curl http://localhost:4040/api/tunnels

# Restart ngrok if tunnel dies
# Press Ctrl+C and run again
ngrok http 3001
```

**Serveo Issues:**

```bash
# If connection drops, reconnect
ssh -R 80:localhost:3001 serveo.net

# Try alternate server if serveo.net is down
ssh -R 80:localhost:3001 localhost.run
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
