module.exports = {
  apps: [
    {
      name: 'worksphere-backend',
      script: 'server.js',
      cwd: './Backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './Backend/logs/error.log',
      out_file: './Backend/logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/worksphere.git',
      path: '/var/www/worksphere',
      'pre-deploy-local': '',
      'post-deploy':
        'cd Backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};