#!/usr/bin/env node

/**
 * WorkSphere Production Readiness Verification Script
 * Run this before deployment to verify all critical systems
 */

const fs = require('fs');
const path = require('path');

const checks = {
  ✅: 0,
  ⚠️: 0,
  ❌: 0,
};

const results = [];

function log(status, message, details = '') {
  checks[status]++;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  results.push({ timestamp, status, message, details });
  console.log(`[${timestamp}] ${status} ${message}${details ? ` - ${details}` : ''}`);
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  WorkSphere Production Readiness Verification Script      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Backend environment variables
console.log('📋 Backend Configuration Check:\n');

const backendEnvFile = path.join(__dirname, 'Backend', '.env');
const backendEnvExampleFile = path.join(__dirname, 'Backend', '.env.example');

if (fs.existsSync(backendEnvFile)) {
  log('✅', 'Backend .env file exists');
  
  const envContent = fs.readFileSync(backendEnvFile, 'utf8');
  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
  
  requiredVars.forEach(v => {
    if (envContent.includes(`${v}=`) && !envContent.includes(`${v}=your-`)) {
      log('✅', `Environment variable configured: ${v}`);
    } else {
      log('❌', `Missing or invalid: ${v}`);
    }
  });
} else {
  log('❌', 'Backend .env file NOT found', 'Create from .env.example');
}

// Frontend environment
console.log('\n📋 Frontend Configuration Check:\n');

const frontendEnvExample = path.join(__dirname, 'Frontend', '.env.example');
if (fs.existsSync(frontendEnvExample)) {
  log('✅', 'Frontend .env.example exists');
} else {
  log('⚠️', 'Frontend .env.example missing (optional)');
}

// Backend dependencies
console.log('\n📦 Backend Dependencies Check:\n');

const backendPackageFile = path.join(__dirname, 'Backend', 'package.json');
if (fs.existsSync(backendPackageFile)) {
  const pkg = JSON.parse(fs.readFileSync(backendPackageFile, 'utf8'));
  
  const criticalDeps = [
    'express',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'cors',
    'helmet',
    'express-rate-limit',
    'express-validator',
    'nodemailer',
    'dotenv',
  ];
  
  criticalDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      log('✅', `Dependency present: ${dep}`);
    } else {
      log('❌', `Missing dependency: ${dep}`);
    }
  });
} else {
  log('❌', 'Backend package.json not found');
}

// Frontend dependencies
console.log('\n📦 Frontend Dependencies Check:\n');

const frontendPackageFile = path.join(__dirname, 'Frontend', 'package.json');
if (fs.existsSync(frontendPackageFile)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackageFile, 'utf8'));
  
  const criticalDeps = [
    'react',
    'react-router-dom',
    'axios',
  ];
  
  criticalDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      log('✅', `Dependency present: ${dep}`);
    } else {
      log('❌', `Missing dependency: ${dep}`);
    }
  });
} else {
  log('❌', 'Frontend package.json not found');
}

// Docker configuration
console.log('\n🐳 Docker Configuration Check:\n');

const dockerComposeFile = path.join(__dirname, 'docker-compose.yml');
if (fs.existsSync(dockerComposeFile)) {
  log('✅', 'docker-compose.yml exists');
  
  const dockerContent = fs.readFileSync(dockerComposeFile, 'utf8');
  
  if (dockerContent.includes('healthcheck')) {
    log('✅', 'Health checks configured');
  } else {
    log('⚠️', 'No health checks in docker-compose');
  }
  
  if (dockerContent.includes('SENTRY_DSN')) {
    log('✅', 'Environment variables in docker-compose');
  }
} else {
  log('⚠️', 'docker-compose.yml not found');
}

// Database models
console.log('\n💾 Database Models Check:\n');

const modelFiles = [
  'User.js',
  'Expense.js',
  'Event.js',
  'Task.js',
  'Attendance.js',
];

modelFiles.forEach(file => {
  const modelPath = path.join(__dirname, 'Backend', 'models', file);
  if (fs.existsSync(modelPath)) {
    const content = fs.readFileSync(modelPath, 'utf8');
    if (content.includes('createIndex') || content.includes('.index(')) {
      log('✅', `Model indexes defined: ${file}`);
    } else {
      log('⚠️', `No explicit indexes found in: ${file}`);
    }
  } else {
    log('❌', `Model file missing: ${file}`);
  }
});

// Security features
console.log('\n🔒 Security Features Check:\n');

const serverFile = path.join(__dirname, 'Backend', 'server.js');
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  
  if (content.includes('helmet(')) {
    log('✅', 'Helmet security headers enabled');
  } else {
    log('❌', 'Helmet not configured');
  }
  
  if (content.includes('gracefulShutdown') || content.includes('SIGTERM')) {
    log('✅', 'Graceful shutdown handling');
  } else {
    log('⚠️', 'No graceful shutdown handler');
  }
  
  if (content.includes('cors(')) {
    log('✅', 'CORS configured');
  } else {
    log('❌', 'CORS not configured');
  }
  
  if (content.includes('csrf')) {
    log('✅', 'CSRF protection enabled');
  } else {
    log('❌', 'CSRF not configured');
  }
  
  if (content.includes('requiredEnvVars')) {
    log('✅', 'Environment variable validation');
  } else {
    log('⚠️', 'No env var validation');
  }
}

// Frontend security
console.log('\n🔒 Frontend Security Check:\n');

const mainFile = path.join(__dirname, 'Frontend', 'src', 'main.jsx');
if (fs.existsSync(mainFile)) {
  const content = fs.readFileSync(mainFile, 'utf8');
  
  if (content.includes('ErrorBoundary')) {
    log('✅', 'Error boundary implemented');
  } else {
    log('❌', 'Error boundary missing');
  }
  
  if (content.includes('fetchCsrfToken')) {
    log('✅', 'CSRF token initialized');
  } else {
    log('⚠️', 'CSRF token may not be initialized');
  }
}

// Deployment configs
console.log('\n🚀 Deployment Configuration Check:\n');

const vercelFile = path.join(__dirname, 'Frontend', 'vercel.json');
if (fs.existsSync(vercelFile)) {
  log('✅', 'Vercel configuration exists');
  
  const vercelContent = fs.readFileSync(vercelFile, 'utf8');
  if (vercelContent.includes('VITE_API_URL')) {
    log('✅', 'API URL configured for Vercel');
  } else {
    log('⚠️', 'API URL not in Vercel config');
  }
} else {
  log('⚠️', 'vercel.json not found');
}

const deploymentGuide = path.join(__dirname, 'DEPLOYMENT_GUIDE.md');
if (fs.existsSync(deploymentGuide)) {
  log('✅', 'Deployment guide exists');
} else {
  log('⚠️', 'Deployment guide missing');
}

// Summary
console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║                    VERIFICATION SUMMARY                   ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

console.log(`✅ Passed:     ${checks['✅']}`);
console.log(`⚠️ Warnings:   ${checks['⚠️']}`);
console.log(`❌ Failed:     ${checks['❌']}`);

const total = checks['✅'] + checks['⚠️'] + checks['❌'];
const score = Math.round((checks['✅'] / total) * 100);

console.log(`\n📊 Production Readiness Score: ${score}%`);

if (score >= 90) {
  console.log('\n✅ READY FOR PRODUCTION DEPLOYMENT');
} else if (score >= 70) {
  console.log('\n⚠️  WARNING: Address issues before deployment');
} else {
  console.log('\n❌ NOT READY: Multiple issues must be fixed');
}

console.log(`\n${new Date().toISOString()}\n`);

process.exit(checks['❌'] > 0 ? 1 : 0);
