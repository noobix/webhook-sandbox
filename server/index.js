import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

// In-memory storage for webhooks (no file persistence)
let webhookData = {
  webhooks: [],
  lastRequest: null,
  startTime: Date.now(),
};

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const BASE_URL =
  process.env.BASE_URL ||
  (NODE_ENV === "production"
    ? `https://webhook-sandbox-rouge.vercel.app`
    : `http://localhost:${PORT}`);

// Webhook POST route with error handling
app.post("/webhook", async (req, res) => {
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
app.get("/info", (req, res) => {
  const uptime = Date.now() - webhookData.startTime;
  res.json({
    uptime,
    lastRequest: webhookData.lastRequest,
  });
});

// Route to get all webhook logs
app.get("/webhooks", (req, res) => {
  res.json(webhookData.webhooks);
});

// Route to get console logs (empty for Vercel compatibility)
app.get("/logs", (req, res) => {
  res.json([]);
});

// Health check for Vercel
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Webhook Sandbox is running",
    uptime: Date.now() - webhookData.startTime,
    endpoints: ["/webhook", "/info", "/webhooks", "/logs"],
  });
});

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`➤ Webhook endpoint: ${BASE_URL}/webhook`);
  console.log(`➤ Info endpoint: ${BASE_URL}/info`);
});

server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
});

export default app;
