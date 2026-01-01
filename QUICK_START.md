# Quick Start Guide

## Fix ECONNREFUSED Error

The error means **backend is not running**. Follow these steps:

## Option 1: Manual Start (Recommended)

### Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```
Wait for: `🚀 Server running on port 4000`

### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Then:
1. Open browser: `http://localhost:5173`
2. Check console (F12) for: `🔧 API Configuration`
3. Try to login or register

## Option 2: Using PowerShell Scripts

### Terminal 1 - Backend:
```powershell
cd backend
.\start-backend.ps1
```

### Terminal 2 - Frontend:
```powershell
cd frontend
.\start-frontend.ps1
```

## Verify It's Working

**Test in browser console (F12):**
```javascript
fetch('/api/v1/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected!', data))
  .catch(err => console.error('❌ Connection failed:', err))
```

**Expected result:**
```
✅ Backend connected! { success: true, message: 'API is running', ... }
```

## Troubleshooting

### Backend won't start?
- Check if port 4000 is free: `netstat -ano | findstr :4000`
- Check database connection in `.env`
- Run `npm install` in backend folder

### Frontend shows ECONNREFUSED?
- **Backend must be running first!**
- Check backend terminal for errors
- Verify backend is on port 3000
- Restart both servers

### Still not working?
1. Stop both servers (Ctrl+C)
2. Start backend first
3. Wait for backend to fully start
4. Then start frontend
5. Clear browser cache (Ctrl+Shift+Delete)

## Important Notes

- ⚠️ **Backend must start BEFORE frontend**
- ⚠️ **Keep both terminals open** (don't close them)
- ⚠️ **Backend on port 4000, Frontend on port 5173**
- ⚠️ **Database must be running** (MongoDB, etc.)

