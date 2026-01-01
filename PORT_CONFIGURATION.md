# Port Configuration

## Current Setup

- **Backend Server:** Port `4000`
- **Frontend Server:** Port `5173`
- **API Endpoint:** `http://localhost:4000/api/v1`

## Configuration Files Updated

### ✅ Frontend (`frontend/vite.config.js`)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:4000',  // ✅ Updated to 4000
    ...
  }
}
```

### ✅ Frontend (`frontend/src/config/api.js`)
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1')  // ✅ Updated to 4000
  : '/api/v1';
```

### ✅ Backend (`backend/server.js`)
```javascript
const PORT = process.env.PORT || 4000;  // ✅ Updated to 4000
```

### ✅ Backend CORS (`backend/src/app.js`)
```javascript
allowedOrigins = [
  'http://localhost:5173',   // Frontend
  'http://localhost:4000',    // Backend
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4000'
]
```

## Environment Variables

### Backend `.env`
```env
PORT=4000
# Or leave it unset to use default 4000
```

### Frontend `.env` (for production only)
```env
VITE_API_URL=http://localhost:4000/api/v1
```

## Testing

**Test backend directly:**
```bash
curl http://localhost:4000/api/v1/health
```

**Test through frontend proxy:**
```bash
curl http://localhost:5173/api/v1/health
```

Both should return the same response.

## Important Notes

- ✅ All configurations now point to port **4000**
- ✅ Vite proxy forwards `/api/*` to `http://localhost:4000`
- ✅ CORS allows requests from frontend (port 5173)
- ⚠️ **Restart both servers** after these changes!

