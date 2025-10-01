# Webhook Sandbox Server

This server provides auto-restart capabilities and robust error handling for webhook processing.

## Running the Server

### Development Mode (with auto-restart on file changes)

```bash
npm run dev
```

### Production Mode with PM2 (auto-restart on crashes)

```bash
# Start the server
npm run pm2:start

# Stop the server
npm run pm2:stop

# Restart the server
npm run pm2:restart

# Delete the PM2 process
npm run pm2:delete
```

### Basic Mode

```bash
npm start
```

## Features

- **Auto-restart**: The server will automatically restart if it crashes when using PM2
- **Colored console logs**: Using Winston and Chalk for intuitive logging
- **File logging**: Logs are saved to the `logs/` directory
- **Error handling**: Comprehensive error handling for webhook processing
- **Database**: Uses lowdb for lightweight JSON-based storage

## Endpoints

- `POST /webhook` - Receive webhook requests
- `GET /info` - Get server uptime and last request info
- `GET /webhooks` - Get all webhook logs

The webhook endpoint will log:

- Origin address of the request
- Request body and headers
- Timestamp
- Request URL
