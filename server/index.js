import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for webhooks (no file persistence)
let webhookData = {
  webhooks: [],
  lastRequest: null,
  startTime: Date.now(),
};

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "development";
const BASE_URL =
  process.env.BASE_URL ||
  (NODE_ENV === "production"
    ? `https://webhook-sandbox-rouge.vercel.app`
    : `http://localhost:3001`);

// Webhook POST route with error handling
app.post("/api/webhook", async (req, res) => {
  try {
    const origin = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const details = {
      url: req.originalUrl,
      origin,
      body: req.body,
      time: Date.now(),
      headers: req.headers,
    };

    webhookData.webhooks.push(details);
    webhookData.lastRequest = details.time;

    // Keep only last 100 webhooks in memory
    if (webhookData.webhooks.length > 100) {
      webhookData.webhooks = webhookData.webhooks.slice(-100);
    }

    console.log(`Webhook received from ${origin} on ${req.originalUrl}`);

    res.json({
      message: "Webhook received",
      url: req.originalUrl,
      origin,
      body: req.body,
      timestamp: details.time,
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Info route
app.get("/api/info", (req, res) => {
  const uptime = Date.now() - webhookData.startTime;
  res.json({
    uptime,
    lastRequest: webhookData.lastRequest,
  });
});

// Route to get all webhook logs
app.get("/api/webhooks", (req, res) => {
  res.json(webhookData.webhooks);
});

// Route to get console logs (empty for Vercel compatibility)
app.get("/api/logs", (req, res) => {
  res.json([]);
});

// Health check for Vercel
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Webhook Sandbox API is running",
    uptime: Date.now() - webhookData.startTime,
    endpoints: ["/api/webhook", "/api/info", "/api/webhooks", "/api/logs"],
  });
});

// Catch all API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// For Vercel serverless function
export default app;
