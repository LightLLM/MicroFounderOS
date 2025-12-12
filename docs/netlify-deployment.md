# Netlify Deployment Guide

## Prerequisites

1. Netlify account (sign up at https://app.netlify.com)
2. Git repository connected to GitHub
3. Frontend built successfully

## Deployment Methods

### Method 1: Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Sign in with your GitHub account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Select "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select the repository: `LightLLM/MicroFounderOS`

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18` (or use `.nvmrc` file)

4. **Environment Variables**
   Add the following environment variables in Site settings → Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd frontend
   netlify init
   ```
   - Follow the prompts to link to an existing site or create a new one
   - Select build command: `npm run build`
   - Select publish directory: `.next`

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 3: Git-based Continuous Deployment

1. **Connect Repository** (same as Method 1, steps 1-2)

2. **Configure Build Settings**
   - Netlify will automatically detect `netlify.toml` in the `frontend` directory
   - Or manually set:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Automatic Deployments**
   - Every push to `main` branch will trigger a new deployment
   - Pull requests will create preview deployments

## Configuration Files

### netlify.toml
Located in `frontend/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

- `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://api.yourdomain.com`)

## Post-Deployment

1. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Backend CORS**
   - Update `FRONTEND_URL` in backend environment variables
   - Update `WORKOS_REDIRECT_URI` to match your Netlify URL

3. **Verify Deployment**
   - Visit your Netlify URL
   - Test all pages and functionality
   - Check browser console for errors

## Troubleshooting

### Build Fails

1. Check build logs in Netlify Dashboard
2. Ensure Node version is 18+
3. Verify all dependencies are in `package.json`
4. Check for TypeScript errors

### Runtime Errors

1. Check environment variables are set correctly
2. Verify `NEXT_PUBLIC_API_URL` points to correct backend
3. Check browser console for errors
4. Verify CORS settings on backend

### Performance

1. Enable Next.js Image Optimization
2. Use Netlify's Edge Functions if needed
3. Enable caching headers
4. Monitor build times and bundle sizes

## Next Steps

After successful deployment:

1. Set up custom domain
2. Configure SSL (automatic with Netlify)
3. Set up form handling (if needed)
4. Configure redirects and rewrites
5. Set up analytics (optional)

