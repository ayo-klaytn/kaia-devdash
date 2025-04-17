module.exports = {
  apps: [{
    name: "devrel-dashboard",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    interpreter: "bun",
    env: {
      PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      NODE_ENV: "production",
      PORT: 3006
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3006
    },
    env_development: {
      NODE_ENV: "development",
      PORT: 3006
    },
    // Load .env.local file
    env_file: ".env.local",
    // Restart on file changes
    watch: false,
    // Auto restart on crash
    autorestart: true,
    // Max memory usage before restart
    max_memory_restart: "1G",
    // Error log file
    error_file: "logs/error.log",
    // Output log file
    out_file: "logs/out.log",
    // Log time format
    time: true
  }]
};