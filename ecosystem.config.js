module.exports = {
  apps: [
    {
      name: "hk-vet-finder",
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      autorestart: true,
      min_uptime: "60s",
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
