# Deployment Guide

## Backend Deployment (Raindrop)

### Prerequisites
- Raindrop account with API access
- Environment variables configured
- Node.js 18+ on deployment server

### Steps

1. **Build the backend**:
```bash
cd backend
npm install
npm run build
```

2. **Set environment variables** on Raindrop:
   - `VULTR_API_KEY`
   - `VULTR_INFERENCE_ENDPOINT`
   - `RAINDROP_API_KEY`
   - `RAINDROP_MEMORY_ENDPOINT`
   - `RAINDROP_SQL_ENDPOINT`
   - `RAINDROP_BUCKETS_ENDPOINT`
   - `WORKOS_CLIENT_ID`
   - `WORKOS_CLIENT_SECRET`
   - `WORKOS_REDIRECT_URI`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `PORT`
   - `FRONTEND_URL`

3. **Deploy to Raindrop**:
   - Follow Raindrop's deployment documentation
   - Ensure the server starts with `npm start`
   - Configure health check endpoint if available

4. **Verify deployment**:
   - Check server logs
   - Test API endpoints
   - Verify database initialization

## Frontend Deployment (Netlify)

### Prerequisites
- Netlify account
- Git repository connected
- Backend URL available

### Steps

1. **Build configuration**:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/.next`
   - Node version: 18.x

2. **Environment variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://api.yourdomain.com`)

3. **Deploy**:
   - Connect repository to Netlify
   - Configure build settings
   - Add environment variables
   - Deploy

4. **Custom domain** (optional):
   - Add custom domain in Netlify settings
   - Update `WORKOS_REDIRECT_URI` in backend to match
   - Update `FRONTEND_URL` in backend to match

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Authentication flow works
- [ ] Agents can be accessed
- [ ] Workflows execute successfully
- [ ] Billing integration works
- [ ] Webhook endpoints configured
- [ ] Error logging set up
- [ ] Monitoring configured

## Environment-Specific Configuration

### Development
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Use test Stripe keys
- Use test WorkOS environment

### Staging
- Backend: `https://staging-api.yourdomain.com`
- Frontend: `https://staging.yourdomain.com`
- Use test Stripe keys
- Use test WorkOS environment

### Production
- Backend: `https://api.yourdomain.com`
- Frontend: `https://yourdomain.com`
- Use production Stripe keys
- Use production WorkOS environment

## Troubleshooting

### Backend Issues
- Check server logs
- Verify environment variables
- Test database connections
- Verify API keys are valid

### Frontend Issues
- Check build logs
- Verify environment variables
- Check API URL is correct
- Test in browser console

### Integration Issues
- Verify CORS settings
- Check redirect URIs match
- Verify webhook URLs
- Test API endpoints directly

