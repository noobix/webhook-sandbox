export default {
  apps: [
    {
      name: "webhook-sandbox",
      script: "./index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
        BASE_URL: "http://localhost:3001",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        BASE_URL: "https://your-domain.com",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
