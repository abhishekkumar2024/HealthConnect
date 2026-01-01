# How to Start Both Servers

## The Error: ECONNREFUSED

This error means the **backend server is not running**. The frontend is trying to connect to `http://localhost:3000` but nothing is listening there.

## Solution: Start Both Servers

You need **TWO terminal windows** - one for backend, one for frontend.

### Step 1: Start Backend Server

**Open Terminal/PowerShell 1:**
```powershell
cd backend
npm install  # Only needed first time
npm run dev
```

**You should see:**
```
🚀 Server running on port 3000
📍 Environment: development
```

**If you see errors:**
- Database connection error? Check your MongoDB/database is running
- Port already in use? Another service is using port 3000
- Missing dependencies? Run `npm install` in backend folder

### Step 2: Start Frontend Server

**Open Terminal/PowerShell 2 (NEW WINDOW):**
```powershell
cd frontend
npm install  # Only needed first time
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Verify Connection

1. **Open browser:** `http://localhost:5173`
2. **Open DevTools (F12)** → Console tab
3. **Look for:** `🔧 API Configuration: { baseURL: '/api/v1', ... }`
4. **Try to login or make any API call**
5. **Check Network tab** - requests should show `/api/v1/...`

## Quick Test

**In browser console (F12):**
```javascript
fetch('/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Should return:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

## Common Issues

### Issue: "Port 3000 already in use"
**Solution:**
```powershell
# Find what's using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change backend port in backend/.env
PORT=3001
```

### Issue: "Cannot find module"
**Solution:**
```powershell
cd backend
npm install

cd ../frontend
npm install
```

### Issue: "Database connection failed"
**Solution:**
- Make sure MongoDB/database is running
- Check database connection string in `backend/.env`
- Verify database credentials

### Issue: Backend starts but frontend still shows ECONNREFUSED
**Solution:**
1. **Restart both servers** (stop with Ctrl+C, then start again)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Hard refresh** (Ctrl+Shift+R)
4. **Check backend is actually running:**
   ```powershell
   # Test backend directly
   curl http://localhost:3000/api/v1/health
   ```

## Windows PowerShell Commands

**Check if backend is running:**
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

**Check if frontend is running:**
```powershell
Test-NetConnection -ComputerName localhost -Port 5173
```

**Kill process on port 3000:**
```powershell
# Find PID
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill (replace PID)
Stop-Process -Id <PID> -Force
```

## Order Matters!

**Always start backend FIRST, then frontend.**

1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 5173
3. ✅ Open browser to http://localhost:5173

## Still Not Working?

1. **Check both terminals** - are both servers actually running?
2. **Check for errors** in both terminal windows
3. **Verify ports** - backend on 3000, frontend on 5173
4. **Test backend directly:** Open `http://localhost:3000/api/v1/health` in browser
5. **Check firewall** - Windows Firewall might be blocking connections

