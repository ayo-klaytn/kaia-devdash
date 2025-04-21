module.exports = {
  name: "devrel-dashboard", // Name of your application
  script: "node_modules/next/dist/bin/next", // Entry point of your application
  args: "start --port 3006",
  interpreter: "bun", // Bun interpreter
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
  },
  // Load .env.local file
  env_file: ".env.local",
  // Error log file
  error_file: "logs/error.log",
  // Output log file
  out_file: "logs/out.log",
  // Log time format
  time: true
};