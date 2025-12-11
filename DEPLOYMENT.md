# Deployment Guide

## Backend Deployment

### Option 1: Railway

1. Create account on [Railway](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `OPENAI_API_KEY` or `GROQ_API_KEY`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
5. Set start command: `cd backend && npm start`
6. Deploy

### Option 2: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create yds-eduai-backend`
4. Add MongoDB addon: `heroku addons:create mongolab`
5. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set OPENAI_API_KEY=your-key
   # ... add all other variables
   ```
6. Deploy: `git push heroku main`

### Option 3: DigitalOcean App Platform

1. Create account on DigitalOcean
2. Create new App
3. Connect repository
4. Configure:
   - Build command: `cd backend && npm install`
   - Run command: `cd backend && npm start`
5. Add environment variables
6. Deploy

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Navigate to frontend: `cd frontend`
4. Deploy: `vercel`
5. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL

### Option 2: Netlify

1. Create account on Netlify
2. Connect GitHub repository
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## MongoDB Setup

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Update `MONGODB_URI` in backend environment

## AWS S3 Setup

1. Create AWS account
2. Create S3 bucket
3. Configure bucket:
   - Block public access: Enabled (for security)
   - Versioning: Optional
4. Create IAM user with S3 access
5. Generate access keys
6. Update backend environment variables

## Environment Variables Checklist

### Backend
- [ ] `PORT` (default: 5000)
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRE` (default: 7d)
- [ ] `OPENAI_API_KEY` or `GROQ_API_KEY`
- [ ] `AI_PROVIDER` (openai or groq)
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_BUCKET`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `FRONTEND_URL`

### Frontend
- [ ] `NEXT_PUBLIC_API_URL`

## Post-Deployment

1. Test authentication flow
2. Test file uploads
3. Test AI features
4. Monitor logs for errors
5. Set up error tracking (Sentry, etc.)
6. Configure domain and SSL

## Scaling Considerations

- Use MongoDB Atlas for database scaling
- Use CDN for static assets
- Implement Redis for caching
- Use queue system (Bull/BullMQ) for background jobs
- Set up monitoring (PM2, New Relic, etc.)

