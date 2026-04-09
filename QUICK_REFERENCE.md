# 🚀 WorkSphere - Quick Reference Guide

## Development Commands

### Backend
```bash
cd Backend

# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production build test
NODE_ENV=production node server.js

# Tests
npm test
npm run test:watch

# Lint
npm run lint
```

### Frontend
```bash
cd Frontend

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Tests
npm test
npm run test:ui

# Lint
npm run lint
```

---

## Environment Variables

### Critical (Must Set)
```bash
# Backend
MONGO_URI=         # MongoDB Atlas connection
JWT_SECRET=        # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_REFRESH_SECRET=# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CLIENT_URL=        # Your frontend URL

# Frontend
VITE_API_URL=      # Your backend API URL (production only)
```

### Optional But Recommended
```bash
# Backend
NODE_ENV=production          # development/production
SMTP_HOST=smtp.gmail.com     # Email service
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENTRY_DSN=                  # Error tracking

# Frontend
VITE_DEBUG=false             # Debug mode
```

---

## Docker Operations

```bash
# Build and run locally
docker-compose --env-file .env.docker up

# Build specific service
docker-compose build backend
docker-compose build frontend

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose down && docker-compose up --build
```

---

## Database Index Management

Indexes are auto-created on app startup. To rebuild:

```bash
# MongoDB Shell
mongosh

# Connect to your database
use worksphere

# Check existing indexes
db.users.getIndexes()
db.expenses.getIndexes()

# Drop specific index
db.users.dropIndex("email_1")

# Rebuild all
db.users.reIndex()
```

---

## Deployment Checklist

### Before Deploy
- [ ] Run `node verify-production-readiness.js` - Get 90%+ score
- [ ] Environment variables configured (no placeholders)
- [ ] Database indexes created
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Email service tested

### After Deploy
- [ ] Test health endpoint: `GET /api/health`
- [ ] Test registration
- [ ] Test login/logout
- [ ] Test profile update
- [ ] Check Sentry for errors
- [ ] Monitor logs for warnings

---

## Common Issues & Solutions

### ❌ "VITE_API_URL is missing in production"
**Solution:** Add `VITE_API_URL` to Vercel environment variables

### ❌ "MongoDB connection failed"
**Solution:** 
- Check `MONGO_URI` in .env
- Verify IP address whitelisted on MongoDB Atlas
- Test connection: `mongosh "your-uri"`

### ❌ "Port 5000 already in use"
**Solution:** `PORT=5001 npm run dev` or kill process: `lsof -ti:5000 | xargs kill -9`

### ❌ "CORS error on frontend"
**Solution:** 
- Add `VITE_API_URL` environment variable
- Or update `CLIENT_URL` in backend .env
- Or add domain to allowed origins in `server.js`

### ❌ "Password reset email not sending"
**Solution:**
- Verify SMTP credentials
- Enable "Less secure apps" on Gmail
- Use 2FA app password instead
- Check Sentry/logs for error

### ❌ "Build fails: Cannot find module"
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Performance Tuning

### Database
```javascript
// Check slow queries (in MongoDB)
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().pretty()
```

### Backend
- Rate limits are configured
- Indexes auto-created
- Logging set to production level
- Sentry sampling at 10%

### Frontend
- Code splitting enabled
- Lazy loading on routes
- CSS minified
- Assets cached 1 year

---

## Security Audit

Run these checks:
```bash
# HTTPS redirect
curl -I http://your-backend.com
# Should redirect to https://

# CORS configured
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://your-backend.com/api/expenses

# Security headers
curl -I https://your-backend.com/api/health
# Should show X-Frame-Options, X-Content-Type-Options, etc.

# Rate limiting
for i in {1..100}; do curl https://your-backend.com/api/auth/login; done
# Should get 429 (Too Many Requests)

# CSRF protection
curl -X POST https://your-backend.com/api/expenses \
     -H "Content-Type: application/json" \
     -d '{}' -v
# Should fail if CSRF token not provided
```

---

## Monitoring

### Error Tracking (Sentry)
1. Create account on sentry.io
2. Add `SENTRY_DSN` to .env
3. Errors automatically reported

### Logs
- Backend: `Backend/logs/combined.log`
- Errors: `Backend/logs/error.log`
- Frontend: Browser console (F12)

### Metrics
- Database: MongoDB Atlas dashboard
- Backend: Deployment platform dashboard
- Frontend: Vercel analytics

---

## Git Operations

```bash
# Create feature branch
git checkout -b feature/name

# Push changes
git add .
git commit -m "feat: description"
git push origin feature/name

# Create pull request on GitHub
# After review, merge to main

# Deployment triggers automatically
```

---

## Useful Commands

```bash
# Backend
# Enter MongoDB shell
mongosh "$MONGO_URI"

# View all users
db.users.find()

# Clear logs
rm Backend/logs/*.log

# Restart gracefully
# Send SIGTERM (automatic in Docker)
kill -SIGTERM <pid>

# Frontend
# Clear build cache
rm -rf dist node_modules/.vite

# Analyze bundle size
npm run build -- --analyze

# Update dependencies
npm update
npm outdated
```

---

## Project Statistics

- **Backend Files:** 25+
- **Frontend Components:** 10+
- **Database Models:** 5
- **API Routes:** 25+
- **API Tests:** Multiple
- **Total Lines:** 5000+
- **Test Coverage:** 60%+

---

## Support Resources

- 📖 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment guide
- 📚 [README.md](./README.md) - Project overview
- ✅ [FIXES_APPLIED.md](./FIXES_APPLIED.md) - What was fixed
- 🧪 `verify-production-readiness.js` - Verification script

---

## Quick Deploy (Production)

```bash
# 1. Verify
node verify-production-readiness.js

# 2. Configure Backend (.env)
MONGO_URI=mongodb+srv://...
JWT_SECRET=<random-key>
JWT_REFRESH_SECRET=<random-key>
CLIENT_URL=https://yourfrontend.com
SENTRY_DSN=https://...

# 3. Deploy Backend
# Push to GitHub → Auto-deploys to Render/Railway

# 4. Configure Frontend (Vercel)
# Add VITE_API_URL=https://yourbackend.com/api

# 5. Deploy Frontend
# Push to GitHub → Auto-deploys to Vercel

# 6. Test
# Open https://yourfrontend.com
# Register → Email verification → Login ✅

# 7. Monitor
# Check Sentry dashboard
# Review deployment logs
```

---

## Success Indicators ✅

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Can register new account
- ✅ Can login with credentials
- ✅ Profile page works
- ✅ Can create expense/task/event
- ✅ No 404s or CORS errors
- ✅ Logs show no errors
- ✅ Sentry dashboard empty (no errors)

---

**Last Updated:** April 9, 2026
**Status:** Production Ready ✅
