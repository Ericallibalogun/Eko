# Frontend Deployment Guide

## Frontend Configuration Update

The frontend has been updated to work with your deployed backend:

- **Development**: Uses `http://localhost:5000/api` for local backend
- **Production**: Uses `https://eko-7.onrender.com/api` for deployed backend

## Frontend Deployment Options

You can deploy your frontend using several free services:

### Option 1: Netlify (Recommended)

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Build your frontend**:

   ```bash
   npm run build
   ```

3. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Vercel

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

### Option 3: GitHub Pages

1. **Install gh-pages**:

   ```bash
   npm install gh-pages --save-dev
   ```

2. **Add deployment scripts to package.json**:

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## Environment Variables

Make sure to set the following environment variables in your frontend deployment service:

```
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

## Testing the Integration

After deploying your frontend:

1. **Visit your frontend URL**
2. **Test user registration and login**
3. **Verify chat functionality works**
4. **Check that saved places are working**
5. **Test settings updates**

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Make sure your backend is configured to allow requests from your frontend origin
   - Check that the backend is running and accessible

2. **API Connection Issues**:

   - Verify the API_BASE_URL in services/apiService.ts is correct
   - Check that the backend is properly deployed and running

3. **Environment Variables**:
   - Ensure GEMINI_API_KEY is set in your frontend deployment environment

### Debugging Steps

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API requests
3. **Verify backend health** by visiting https://eko-7.onrender.com/health
4. **Check Render logs** for any backend errors

## Next Steps

1. **Deploy your frontend** using one of the options above
2. **Set environment variables** in your deployment service
3. **Test all functionality** to ensure proper integration
4. **Share your application** with users

Your full-stack application is now ready for deployment!
