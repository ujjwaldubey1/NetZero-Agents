# Vercel Configuration for React SPA ✅

## 📋 Overview

Created `vercel.json` in the `client` folder to configure Vercel for React Single Page Application deployment.

## ✅ Configuration

### **File Location:** `client/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🎯 What This Does

### **React Router Support**
- **All routes redirect to `/index.html`** - This ensures that React Router can handle client-side routing
- When users navigate to routes like `/operator/dashboard` or `/vendor/upload`, Vercel will serve `index.html` instead of returning a 404
- React Router then takes over and renders the correct component

### **How It Works**
1. User visits any URL (e.g., `https://your-app.vercel.app/operator/reports`)
2. Vercel receives the request
3. The rewrite rule catches all routes (`/(.*)`)
4. Vercel serves `/index.html` instead of looking for that path
5. React app loads and React Router handles the routing client-side
6. Correct component renders based on the URL

## 🚀 Deployment

### **Automatic Detection**
Vercel will automatically:
- Detect that this is a Vite project
- Run `npm run build` during build
- Serve files from the `dist` directory (Vite's default output)
- Use the rewrites configuration for SPA routing

### **Manual Deployment Steps**
1. Connect your repository to Vercel
2. Set the **Root Directory** to `client` (if deploying just the frontend)
3. Vercel will automatically use the `vercel.json` configuration
4. Build command: `npm run build`
5. Output directory: `dist`

## 📝 Notes

- This minimal configuration is all that's needed for a React SPA
- Vercel automatically detects Vite and React projects
- No need to specify build commands or framework - Vercel handles it
- The rewrite rule ensures all routes work with React Router

## ✅ Result

Your React Single Page Application will now work correctly on Vercel with client-side routing! 🎉

