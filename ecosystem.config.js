module.exports = {
  apps: [
    {
      name: 'techblog-api',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/techblog-error.log',
      out_file: '/var/log/pm2/techblog-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
