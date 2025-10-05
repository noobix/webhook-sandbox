import express from "express";
import winston from "winston";
import chalk from "chalk";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage for serverless environments (no disk persistence)
const memoryStore = {
  webhooks: [],
  lastRequest: null,
  startTime: Date.now(),
  logs: [],
};

const app = express();
app.use(
  cors({
    origin: "*",
    authenticated: false,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// In-memory transport for real-time logs (no disk persistence)
class MemoryTransport extends winston.Transport {
  constructor(options = {}) {
    super(options);
    this.name = "memory";
  }

  log(info, callback) {
    const logEntry = {
      level: info.level,
      message: info.message,
      timestamp: info.timestamp,
      service: info.service,
      color: this.getColorForLevel(info.level),
    };

    // Store in memory only (no disk writes for serverless)
    memoryStore.logs.push(logEntry);

    // Keep only last 100 logs in memory for performance
    if (memoryStore.logs.length > 100) {
      memoryStore.logs = memoryStore.logs.slice(-100);
    }

    callback();
  }

  getColorForLevel(level) {
    switch (level) {
      case "info":
        return "green";
      case "warn":
        return "yellow";
      case "error":
        return "red";
      default:
        return "white";
    }
  }
}

// Winston logger with console only (no file logging for serverless)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "webhook-sandbox" },
  transports: [
    new MemoryTransport(),
    new winston.transports.Console({
      format: winston.format.printf(({ level, message, timestamp }) => {
        let colorFn = chalk.white;
        if (level === "info") colorFn = chalk.green;
        if (level === "warn") colorFn = chalk.yellow;
        if (level === "error") colorFn = chalk.red;
        return colorFn(
          `[${new Date(
            timestamp
          ).toLocaleTimeString()}] [${level.toUpperCase()}] ${message}`
        );
      }),
    }),
  ],
});

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

    memoryStore.webhooks.push(details);

    // Keep only last 50 webhooks in memory
    if (memoryStore.webhooks.length > 50) {
      memoryStore.webhooks = memoryStore.webhooks.slice(-50);
    }

    memoryStore.lastRequest = details.time;

    logger.info(
      `Webhook received from ${chalk.cyan(origin)} on ${chalk.blue(
        req.originalUrl
      )}`
    );

    res.json({
      message: "Webhook received",
      url: req.originalUrl,
      origin,
      body: req.body,
      timestamp: details.time,
    });
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Info route
app.get("/info", (req, res) => {
  const uptime = Date.now() - memoryStore.startTime;
  res.json({
    uptime,
    lastRequest: memoryStore.lastRequest,
  });
});

// Route to get all webhook logs
app.get("/webhooks", (req, res) => {
  res.json(memoryStore.webhooks);
});

// Route to get console logs
app.get("/logs", (req, res) => {
  res.json(memoryStore.logs || []);
});

// Global error handlers
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM signal. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT signal. Shutting down gracefully...");
  process.exit(0);
});

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const BASE_URL =
  process.env.BASE_URL ||
  (NODE_ENV === "production"
    ? `http://webhook-sandbox-rouge.vercel.app/`
    : `http://localhost:${PORT}`);

const server = app.listen(PORT, () => {
  logger.info(
    `${chalk.green("✓")} Server running on port ${chalk.cyan(
      PORT
    )} in ${chalk.magenta(NODE_ENV)} mode`
  );
  logger.info(
    `${chalk.yellow("➤")} Webhook endpoint: ${chalk.blue(
      `${BASE_URL}/webhook`
    )}`
  );
  logger.info(
    `${chalk.yellow("➤")} Info endpoint: ${chalk.blue(`${BASE_URL}/info`)}`
  );
});

server.on("error", (error) => {
  logger.error(`Server error: ${error.message}`);
});
