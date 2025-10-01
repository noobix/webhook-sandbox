import express from "express";
import winston from "winston";
import chalk from "chalk";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const dbFile = path.join(__dirname, "db.json");
const adapter = new JSONFile(dbFile);
const defaultData = {
  webhooks: [],
  lastRequest: null,
  startTime: Date.now(),
  logs: [],
};
const db = new Low(adapter, defaultData);
await db.read();

const app = express();
app.use(
  cors({
    origin: "*",
    authenticated: false,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Custom transport to store logs in database
class DatabaseTransport extends winston.Transport {
  constructor(options = {}) {
    super(options);
    this.name = "database";
    this.logBuffer = [];
    this.writeTimeout = null;
  }

  log(info, callback) {
    const logEntry = {
      level: info.level,
      message: info.message,
      timestamp: info.timestamp,
      service: info.service,
      color: this.getColorForLevel(info.level),
    };

    // Add to buffer instead of immediate database write
    this.logBuffer.push(logEntry);

    // Debounced write - only write every 3 seconds
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }

    this.writeTimeout = setTimeout(() => {
      // Add buffered logs to database
      db.data.logs.push(...this.logBuffer);

      // Keep only last 500 logs for performance
      if (db.data.logs.length > 500) {
        db.data.logs = db.data.logs.slice(-500);
      }

      // Write to file
      db.write();

      // Clear buffer
      this.logBuffer = [];
      this.writeTimeout = null;
    }, 3000); // Write every 3 seconds

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

// Winston logger with chalk and file logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "webhook-sandbox" },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    new DatabaseTransport(),
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

    db.data.webhooks.push(details);
    db.data.lastRequest = details.time;
    await db.write();

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
  const uptime = Date.now() - db.data.startTime;
  res.json({
    uptime,
    lastRequest: db.data.lastRequest,
  });
});

// Route to get all webhook logs
app.get("/webhooks", (req, res) => {
  res.json(db.data.webhooks);
});

// Route to get console logs
app.get("/logs", (req, res) => {
  res.json(db.data.logs || []);
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
    ? `https://your-domain.com`
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
