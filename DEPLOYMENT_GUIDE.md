# WorkSphere Production Deployment Guide

## Pre-Deployment Checklist

### Backend Configuration

#### Environment Variables (.env)
Required variables that MUST be set:
```bash
# Node environment
NODE_ENV=production
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/worksphere

# JWT Tokens
JWT_SECRET=<generate-secure-random-key>
JWT_REFRESH_SECRET=<generate-separate-secure-random-key>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Client URLs
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email Service (Gmail, SendGrid, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@worksphere.com

# Error Monitoring (Optional but recommended)
SENTRY_DSN=https://your-sentry-dsn
```

#### Generate Secure Keys
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

#### Vercel Environment Variables
In Vercel project settings, add:
```
VITE_API_URL=https://your-backend-api.com/api
```

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create a new project
   - Create a cluster (M0 for development, M10+ for production)

2. **Whitelist IP Addresses**
   - Go to Network Access
   - Add your server IP address
   - Add deployment IPs (Render, Heroku, etc.)

3. **Create Database User**
   - Go to Database Access
   - Create a user with strong password
   - Use this in MONGO_URI

4. **Get Connection String**
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy MongoDB connection string
   - Replace `<username>` and `<password>`

5. **Enable Backups**
   - Go to Backup
   - Enable automatic backups (recommended for production)

6. **Setup Monitoring**
   - Go to Monitoring
   - Enable alerts for high CPU, memory usage

### Backend Deployment (Render or Railway)

#### Generate Production Deployment URL
```bash
# After deployment, you'll get a URL like:
https://worksphere-backend.onrender.com
```

#### Health Check Verification
```bash
curl https://worksphere-backend.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "WorkSphere API is healthy",
  "environment": "production",
  "timestamp": "2026-04-09T10:30:00.000Z",
  "uptime": 3600,
  "mongodb": "connected"
}
```

### Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
   - Go to vercel.com
   - Click "New Project"
   - Select your WorkSphere repository

2. **Configure Build Settings**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **Add Environment Variables**
   - VITE_API_URL: `https://your-backend-url/api`

4. **Deploy**
   - Click Deploy
   - Wait for build to complete

5. **Verify Deployment**
   - Visit your frontend URL
   - Check console for errors
   - Test login functionality

### SSL/TLS Certificate Setup

For production domains:
```bash
# Vercel: Automatic SSL (included)
# Render/Railway: Automatic SSL (included)

# For custom domain:
# Use Cloudflare DNS for free SSL:
# 1. Add your domain to Cloudflare
# 2. Point nameservers to Cloudflare
# 3. SSL/TLS mode: Full (strict)
```

### CORS Production Configuration

Update CORS allowed origins in `.env`:
```
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Backend automatically configures:
- Added .vercel.app for Vercel deployments
- Added your CLIENT_URL
- Added your FRONTEND_URL

### Email Service Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to myaccount.google.com
   - Click "Security"
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows"
   - Copy the generated password
   - Use this as SMTP_PASS (not your regular password)

### Testing Checklist

#### Backend Tests
```bash
# Test health check
curl https://your-backend-url/api/health

# Test auth endpoint
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test@1234"}'

# Test database connection
# Check logs for "MongoDB connected"
```

#### Frontend Tests
1. **Visit production URL**
   - Check no console errors
   - Verify Network requests to API

2. **Test Login**
   - Register new account
   - Verify email (if enabled)
   - Login successfully
   - Check token in cookies

3. **Test Protected Routes**
   - Visit /expenses
   - Visit /tasks
   - Visit /profile
   - All should work

4. **Test Error Handling**
   - Add expense
   - Try invalid data
   - Check error messages
   - Verify no app crash

### Monitoring Setup

#### Sentry Error Tracking
1. **Create Sentry Account**
   - Go to sentry.io
   - Create new project
   - Select Node.js for backend

2. **Add SENTRY_DSN to .env**
   - Copy DSN from Sentry
   - Add to environment variables
   - Restart application

3. **Test Error Tracking**
   - Trigger an error
   - Check Sentry dashboard

#### Logs Monitoring
- Backend logs: Render/Railway dashboard
- Error logs: Check logs/error.log
- Combined logs: Check logs/combined.log

### Performance Optimization

#### Database Indexes
All indexes are automatically created on startup:
```
✅ User: email, resetPasswordToken, createdAt
✅ Expense: user+date, user+category
✅ Event: user+date, user+category
✅ Task: user (unique)
✅ Attendance: user (unique)
```

#### Caching Headers
Frontend:
- Static assets: 1 year cache (immutable)
- HTML: 1 hour cache

Backend:
- All responses: Cache-Control headers set

#### Rate Limiting
- Auth endpoints: 10 req/15min (production)
- General API: 200 req/min (production)
- Write operations: 60 req/min (production)
- Password reset: 3 req/min (production)

### Security Checklist

- ✅ HTTPS enforced (automatic redirects)
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ CSRF protection enabled
- ✅ Helmet security headers set
- ✅ Password validation strong
- ✅ JWT tokens secure
- ✅ Graceful shutdown implemented
- ✅ Error stacks not exposed
- ✅ Input validation on both sides

### Rollback Procedure

If deployment fails:

1. **Check Deployment Logs**
   - Render/Railway: View deployment logs
   - Verify build succeeded

2. **Verify Environment Variables**
   - All required vars set
   - No typos in variable names

3. **Test Locally First**
   ```bash
   NODE_ENV=production node server.js
   ```

4. **Redeploy**
   - Push to main branch
   - Deployment triggers automatically

### Maintenance Tasks

#### Weekly
- Check error logs
- Monitor database size
- Review API performance

#### Monthly
- Update dependencies
- Check security updates
- Review backup status

#### Quarterly
- Security audit
- Performance optimization
- Disaster recovery test

### Support

For deployment issues:
1. Check deployment logs
2. Verify environment variables
3. Test database connection
4. Review error messages
5. Contact deployment platform support

---

**Last Updated:** April 9, 2026
**Version:** 1.0.0 Production Ready
