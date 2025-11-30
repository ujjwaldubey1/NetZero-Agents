# CORS Error Fix Documentation

## 🔴 Error Explanation

### What is CORS?
**Cross-Origin Resource Sharing (CORS)** is a browser security feature that blocks requests from one domain (origin) to another unless the server explicitly allows it.

### The Error
```
Access to XMLHttpRequest at 'https://app.urbanservicecompany.live/api/auth/login' 
from origin 'https://net-zero-agents.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### What This Means
- **Frontend Origin**: `https://net-zero-agents.vercel.app` (Vercel deployment)
- **Backend Origin**: `https://app.urbanservicecompany.live`
- **Problem**: The backend server is not sending the required CORS headers to allow the frontend to make requests

### Why Preflight Requests Fail
1. Browser sends an **OPTIONS request** (preflight) before the actual POST request
2. Server must respond with proper CORS headers
3. If headers are missing or incorrect, browser blocks the actual request

---

## ✅ Solution Applied

### Updated CORS Configuration (`server/index.js`)

```javascript
// Configure CORS to allow all origins with proper preflight handling
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});
```

### Key Changes:
1. ✅ **Allow All Origins**: `origin: true` allows requests from any domain
2. ✅ **Explicit OPTIONS Handler**: Handles preflight requests explicitly
3. ✅ **Proper Headers**: All required CORS headers are set
4. ✅ **Credentials Support**: Allows cookies/authentication headers
5. ✅ **Preflight Caching**: Caches preflight requests for 24 hours (reduces requests)

---

## 🚀 Deployment Steps

### 1. Deploy Backend Changes
The CORS configuration changes need to be deployed to your backend server at `https://app.urbanservicecompany.live`.

**Options:**
- If using Git deployment: Push changes and redeploy
- If using manual deployment: Upload the updated `server/index.js` file
- If using a hosting platform: Follow their deployment process

### 2. Verify CORS Headers
After deployment, verify that CORS headers are being sent:

```bash
# Test preflight request
curl -X OPTIONS https://app.urbanservicecompany.live/api/auth/login \
  -H "Origin: https://net-zero-agents.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://net-zero-agents.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, ...
Access-Control-Allow-Credentials: true
```

### 3. Test Frontend Connection
After backend deployment, test the frontend:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in from `https://net-zero-agents.vercel.app`
4. Check if requests succeed without CORS errors

---

## 🔒 Security Considerations

### Current Configuration (Development-Friendly)
- **Allows all origins** - Good for development, but less secure for production

### Production Recommendations
If you want to restrict origins in production, update the CORS config:

```javascript
app.use(cors({
  origin: [
    'https://net-zero-agents.vercel.app',
    'https://net-zero-agents-*.vercel.app', // Vercel preview deployments
    'http://localhost:5173', // Local development
  ],
  credentials: true,
  // ... rest of config
}));
```

Or use environment variable:
```javascript
origin: process.env.CORS_ORIGIN === '*' 
  ? true 
  : process.env.CORS_ORIGIN?.split(',') || true
```

---

## 📋 Testing Checklist

After deploying the fix:
- [ ] Backend server restarted with new CORS config
- [ ] OPTIONS preflight requests return 204 with proper headers
- [ ] POST/GET requests from frontend succeed
- [ ] No CORS errors in browser console
- [ ] Authentication/login works
- [ ] API calls from frontend work correctly

---

## 🐛 Troubleshooting

### Still Getting CORS Errors?

1. **Check Backend Logs**: Verify server is running with new config
2. **Check Response Headers**: Use browser DevTools to see if headers are present
3. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R) to clear cached preflight
4. **Check Server Deployment**: Ensure `server/index.js` changes are deployed
5. **Test with curl**: Use curl command above to verify headers server-side

### Common Issues:
- **Server not restarted**: Changes require server restart
- **Cached preflight**: Browser may have cached failed preflight (clear cache)
- **Proxy/CDN**: If using a proxy/CDN, ensure it's not stripping CORS headers
- **Multiple CORS middleware**: Ensure only one CORS middleware is applied

---

## ✅ Expected Result

After deploying these changes:
- ✅ No CORS errors in browser console
- ✅ Login and API requests work from Vercel frontend
- ✅ Preflight OPTIONS requests succeed
- ✅ All API endpoints accessible from frontend

**The backend will now properly allow requests from `https://net-zero-agents.vercel.app`!** 🎉

