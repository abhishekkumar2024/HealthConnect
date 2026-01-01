# Troubleshooting Guide

## Current Status Check

If you're experiencing issues, follow these steps:

## 1. Verify Both Servers Are Running

**Backend:**
```bash
cd backend
npm run dev
# Should see: 🚀 Server running on port 3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should see: Local: http://localhost:5173
```

## 2. Check Browser Console

Open browser DevTools (F12) and check:

1. **Console Tab:**
   - Look for: `🔧 API Configuration: { baseURL: '/api/v1', ... }`
   - This confirms the frontend is using relative URLs

2. **Network Tab:**
   - Make a request (try to login)
   - Check if requests show as `/api/v1/...`
   - Check the status code (should be 200, 201, etc.)
   - If you see CORS errors, see section below

## 3. Common Issues and Solutions

### Issue: CORS Error
**Symptoms:** 
- Browser console shows: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- Network tab shows failed requests with CORS error

**Solutions:**
1. Restart the backend server (CORS config needs restart)
2. Check backend is running on port 3000
3. Verify `backend/src/app.js` has the updated CORS configuration
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: 404 Not Found
**Symptoms:**
- Network tab shows 404 errors
- Requests are going to wrong URL

**Solutions:**
1. Check if requests are using `/api/v1/...` (relative) not full URLs
2. Verify backend routes are at `/api/v1/*`
3. Test backend directly: `curl http://localhost:3000/api/v1/health`

### Issue: Connection Refused / Network Error
**Symptoms:**
- Network tab shows: `ERR_CONNECTION_REFUSED` or `Failed to fetch`
- No response from backend

**Solutions:**
1. **Backend not running:** Start backend server
2. **Wrong port:** Verify backend is on port 3000
3. **Port blocked:** Check firewall/antivirus isn't blocking port 3000
4. **Another service using port:** Check if port 3000 is already in use

### Issue: Requests Not Going Through Proxy
**Symptoms:**
- Requests show full URLs like `http://localhost:3000/api/v1/...`
- CORS errors appear

**Solutions:**
1. Check `frontend/src/config/api.js` uses relative URLs in development
2. Restart Vite dev server after config changes
3. Clear browser cache

### Issue: 401 Unauthorized
**Symptoms:**
- Login works but other requests fail with 401
- Token refresh not working

**Solutions:**
1. Check if token is stored in localStorage
2. Verify Authorization header is being sent
3. Check backend JWT configuration
4. Try logging out and logging in again

## 4. Test Connection Manually

**In Browser Console:**
```javascript
// Test health endpoint
fetch('/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Should return: { success: true, message: 'API is running', ... }
```

**Using curl (Terminal):**
```bash
# Test backend directly
curl http://localhost:3000/api/v1/health

# Should return JSON response
```

## 5. Check Configuration Files

**Frontend (`frontend/src/config/api.js`):**
```javascript
// Should be:
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')
  : '/api/v1';  // Relative URL in development
```

**Backend (`backend/src/app.js`):**
```javascript
// Should have CORS configured with:
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
```

**Vite (`frontend/vite.config.js`):**
```javascript
// Should have proxy:
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
    ws: true,
  }
}
```

## 6. Debug Steps

1. **Check Backend Logs:**
   - Look for incoming requests in backend console
   - If no requests appear, frontend isn't reaching backend

2. **Check Frontend Logs:**
   - Browser console should show API config on load
   - Network tab shows all requests

3. **Test Direct Backend:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

4. **Test Through Proxy:**
   - Open: `http://localhost:5173/api/v1/health`
   - Should return same JSON as direct backend

5. **Check Environment:**
   - No `.env` file needed in development (uses proxy)
   - For production, set `VITE_API_URL`

## 7. Still Having Issues?

If none of the above works, provide:
1. **Error message** from browser console
2. **Network tab screenshot** showing the failed request
3. **Backend logs** showing if requests are received
4. **Both servers** are confirmed running

## Quick Fix Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Browser console shows: `🔧 API Configuration: { baseURL: '/api/v1' }`
- [ ] Network requests show `/api/v1/...` (relative URLs)
- [ ] No CORS errors in console
- [ ] Backend CORS allows `http://localhost:5173`
- [ ] Vite proxy configured correctly
- [ ] Both servers restarted after config changes

