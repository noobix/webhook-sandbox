// Dynamic API router for Vercel serverless functions
// This handles all /api/[...slug] routes

// In-memory storage (note: this resets on each cold start)
let globalState = {
  webhooks: [],
  lastRequest: null,
  startTime: Date.now(),
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug || '';

  console.log(`API Request: ${req.method} /api/${path}`);

  try {
    // Route handling
    switch (path) {
      case '':
      case 'health':
        return handleHealth(req, res);
        
      case 'webhook':
        return handleWebhook(req, res);
        
      case 'webhooks':
        return handleWebhooks(req, res);
        
      case 'logs':
        return handleLogs(req, res);
        
      case 'info':
        return handleInfo(req, res);
        
      default:
        // Handle dynamic webhook endpoints
        if (req.method === 'POST') {
          return handleWebhook(req, res);
        }
        res.status(404).json({ error: `API endpoint not found: /api/${path}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

function handleHealth(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.status(200).json({
    status: "ok",
    message: "Webhook Sandbox API is running",
    uptime: Date.now() - globalState.startTime,
    endpoints: ["/api/webhook", "/api/info", "/api/webhooks", "/api/logs"],
    timestamp: Date.now(),
    totalWebhooks: globalState.webhooks.length
  });
}

function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers["x-forwarded-for"] || req.connection.remoteAddress || 'unknown';
  const details = {
    url: req.url,
    origin,
    body: req.body,
    time: Date.now(),
    headers: req.headers,
    method: req.method,
    userAgent: req.headers['user-agent'] || 'unknown'
  };

  globalState.webhooks.push(details);
  globalState.lastRequest = details.time;

  // Keep only last 100 webhooks in memory
  if (globalState.webhooks.length > 100) {
    globalState.webhooks = globalState.webhooks.slice(-100);
  }

  console.log(`Webhook received from ${origin} on ${req.url}`);

  res.status(200).json({
    message: "Webhook received successfully",
    url: req.url,
    origin,
    timestamp: details.time,
    totalWebhooks: globalState.webhooks.length
  });
}

function handleWebhooks(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.status(200).json(globalState.webhooks);
}

function handleLogs(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Return formatted logs for the terminal console
  const logs = globalState.webhooks.map(webhook => ({
    level: 'info',
    message: `Webhook received from ${webhook.origin} on ${webhook.url}`,
    timestamp: webhook.time,
    type: 'webhook'
  }));
  
  res.status(200).json(logs);
}

function handleInfo(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const uptime = Date.now() - globalState.startTime;
  
  res.status(200).json({
    uptime,
    serverTime: Date.now(),
    environment: "vercel-serverless",
    lastRequest: globalState.lastRequest,
    totalWebhooks: globalState.webhooks.length,
    startTime: globalState.startTime
  });
}