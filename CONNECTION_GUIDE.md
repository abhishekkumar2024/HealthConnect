# Frontend-Backend Connection Guide

## Issue: Frontend and Backend Not Connected

If requests are not reaching the backend, follow these steps:

## 1. Check Backend is Running

Make sure your backend server is running on port 3000:

```bash
cd backend
npm run dev
# or
npm start
```

You should see: `🚀 Server running on port 3000`

## 2. Check Frontend is Running

Start the frontend development server:

```bash
cd frontend
npm install  # if not already done
npm run dev
```

The frontend should start on `http://localhost:5173`

## 3. Verify CORS Configuration

The backend is now configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Backend)
- Any origin in development mode

## 4. How It Works

### Development Mode (Vite Proxy)
- Frontend uses relative URLs: `/api/v1`
- Vite proxy forwards `/api/*` requests to `http://localhost:3000`
- This avoids CORS issues in development

### Production Mode
- Frontend uses full URL from `VITE_API_URL` environment variable
- Make sure to set `ALLOWED_ORIGINS` in backend `.env`

## 5. Testing the Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login or make any API call
4. Check if requests are being made to `/api/v1/...`
5. Verify the requests reach the backend (check backend logs)

## 6. Common Issues

### Issue: CORS Error
**Solution**: The backend CORS is now configured to allow `http://localhost:5173`. If you still see CORS errors:
- Check backend is running
- Verify `ALLOWED_ORIGINS` in backend `.env` includes your frontend URL
- Clear browser cache

### Issue: 404 Not Found
**Solution**: 
- Verify backend routes are at `/api/v1/*`
- Check backend server is running on port 3000
- Verify Vite proxy is configured correctly

### Issue: Network Error / Connection Refused
**Solution**:
- Make sure backend server is running
- Check if port 3000 is not blocked by firewall
- Verify no other service is using port 3000

## 7. Backend Environment Variables

Create or update `backend/.env`:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
# ... other backend env variables
```

## 8. Frontend Environment Variables

For production, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

In development, this is not needed as Vite proxy handles it.

## 9. Verify Connection

Test with a simple API call:

```javascript
// In browser console on frontend
fetch('/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

You should see: `{ success: true, message: 'API is running', ... }`

## 10. Debug Steps

1. **Check Backend Logs**: Look for incoming requests
2. **Check Browser Console**: Look for errors
3. **Check Network Tab**: Verify request URLs and status codes
4. **Test Backend Directly**: `curl http://localhost:3000/api/v1/health`
5. **Test Frontend Proxy**: `curl http://localhost:5173/api/v1/health`

If all steps pass, the connection should work!

