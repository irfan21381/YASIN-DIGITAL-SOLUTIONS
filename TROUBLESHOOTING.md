# 🔧 YDS EduAI - Troubleshooting Guide

## ✅ Quick Fixes for Common Issues

### Issue 1: Frontend Can't Connect to Backend

**Symptoms:**
- "Network Error" in browser
- API calls failing
- 404 errors

**Fix:**
1. Check backend is running:
   ```bash
   # Check if port 5000 is in use
   netstat -ano | findstr :5000
   ```

2. Verify `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

### Issue 2: OTP Not Working

**Symptoms:**
- OTP not received
- Login fails

**Fix:**
1. In development mode, OTP is in API response
2. Check browser Network tab → `/api/auth/send-otp` → Response
3. Or check backend console output
4. OTP is shown in response JSON: `{ "otp": "123456" }`

---

### Issue 3: MongoDB Connection Failed

**Symptoms:**
- Backend crashes on start
- "MongoDB connection error"

**Fix:**
1. Check MongoDB service:
   ```powershell
   Get-Service MongoDB
   ```

2. If not running:
   ```powershell
   Start-Service MongoDB
   ```

3. Verify connection string in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/yds-eduai
   ```

4. Test connection:
   ```bash
   node backend/test-connection.js
   ```

---

### Issue 4: Module Resolution Errors

**Symptoms:**
- "Cannot resolve '@/lib/api'"
- Import errors

**Fix:**
1. Verify `frontend/tsconfig.json` has:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. Restart dev server (Ctrl+C, then `npm run dev`)

---

### Issue 5: Port Already in Use

**Symptoms:**
- "EADDRINUSE: address already in use"
- Port 5000 or 3000 busy

**Fix:**
```powershell
# Kill Node processes
taskkill /F /IM node.exe

# Or kill specific port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

### Issue 6: CORS Errors

**Symptoms:**
- "CORS policy" errors in browser
- API calls blocked

**Fix:**
1. Check `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. Verify `backend/server.js` CORS config:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

3. Restart backend

---

### Issue 7: Charts Not Displaying

**Symptoms:**
- Analytics pages blank
- Chart.js errors

**Fix:**
1. Verify chart.js installed:
   ```bash
   cd frontend
   npm list chart.js react-chartjs-2
   ```

2. If missing:
   ```bash
   npm install chart.js react-chartjs-2
   ```

3. Check Chart.js registration in page files

---

### Issue 8: File Upload Not Working

**Symptoms:**
- Upload fails
- "File is required" error

**Fix:**
1. Check file size limit (100MB max)
2. Verify file type is allowed (PDF, PPT, DOC, etc.)
3. Check AWS S3 credentials in `backend/.env` (if using S3)
4. For local testing, files are stored in memory

---

### Issue 9: AI Services Not Responding

**Symptoms:**
- "AI service unavailable"
- Doubt solver fails

**Fix:**
1. Check API keys in `backend/.env`:
   ```env
   OPENAI_API_KEY=your-key
   # OR
   GROQ_API_KEY=your-key
   AI_PROVIDER=groq
   ```

2. If no API key, AI will return error messages
3. For testing, you can use mock responses

---

### Issue 10: Authentication Token Issues

**Symptoms:**
- "Invalid token"
- Auto-logout

**Fix:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

2. Check JWT_SECRET in `backend/.env`
3. Re-login

---

## 🧪 Testing Checklist

Run through this checklist to verify everything:

### Backend Tests
- [ ] `http://localhost:5000/health` returns OK
- [ ] `http://localhost:5000/api/test/health-check` works
- [ ] MongoDB connection successful
- [ ] All routes accessible

### Frontend Tests
- [ ] `http://localhost:3000` loads
- [ ] Login page accessible
- [ ] OTP can be sent
- [ ] OTP visible in response (dev mode)
- [ ] Login successful
- [ ] Dashboard loads after login

### Service Tests
- [ ] AI Doubt Solver works
- [ ] Quiz generation works
- [ ] Content upload works
- [ ] Analytics charts display
- [ ] Classroom manager loads

---

## 📞 Still Having Issues?

Provide:
1. **Error message** (exact text)
2. **Which page/service** is failing
3. **Backend console output**
4. **Browser console errors**
5. **Network tab** errors

I'll fix it immediately! 🚀

