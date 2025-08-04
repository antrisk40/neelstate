# Deployment Guide

## Deploying to Render

### Prerequisites
- Render account
- Your API deployed and running
- Environment variables configured

### Steps

1. **Connect your repository to Render**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the deployment**
   - **Name**: `neelstate-client` (or your preferred name)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Static Site`

3. **Set Environment Variables**
   Add these environment variables in Render:
   - `VITE_API_URL`: Your API URL (e.g., `https://neelstate-backend.onrender.com`)
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key

4. **Configure SPA Routing (Important!)**
   - In your Render service settings, go to "Routes"
   - Add a rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - This ensures that all routes like `/sign-up`, `/listing/123`, etc. work on refresh

5. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your site

### Build Optimization

The build has been optimized with:
- **Code Splitting**: Large dependencies are split into separate chunks
- **Lazy Loading**: Mapbox and Stripe are loaded dynamically
- **Minification**: Code is minified and compressed
- **Tree Shaking**: Unused code is removed

### Bundle Sizes
- **Vendor (React)**: ~140KB
- **Router**: ~20KB  
- **Redux**: ~24KB
- **Main App**: ~353KB
- **Mapbox**: ~1.5MB (loaded on demand)

### SPA Routing Fix

If you're getting "Not Found" errors when refreshing pages:

1. **For Render**: Use the routes configuration in `render.yaml`
2. **For Netlify**: The `_redirects` file is already included
3. **For Vercel**: The `vercel.json` file is already included
4. **For other platforms**: Configure URL rewriting to serve `index.html` for all routes

### Troubleshooting

If you encounter build issues:

1. **Check Node.js version**: Ensure you're using Node.js 16+ in Render
2. **Clear cache**: Delete `node_modules` and reinstall
3. **Check environment variables**: Ensure all required env vars are set
4. **Check API URL**: Make sure your API is deployed and accessible
5. **SPA Routing**: Ensure URL rewriting is configured for your hosting platform

### Local Testing

To test the build locally:
```bash
npm run build
npm run preview
```

This will serve the built files locally for testing. 