# ⚡ Quick Fix Guide - YDS EduAI

## 🚨 If Something's Not Working

### Step 1: Verify Backend is Running

```bash
# Check backend
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"..."}
```

If not running:
```bash
cd backend
npm run dev
```

### Step 2: Verify Frontend is Running

```bash
# Check frontend
# Open: http://localhost:3000
```

If not running:
```bash
cd frontend
npm run dev
```

### Step 3: Check Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yds-eduai
JWT_SECRET=yds-secret-key-123
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 4: Test Login

1. Go to: http://localhost:3000/auth/login
2. Enter: `student@yds.com`
3. Click "Send OTP"
4. **Check browser Network tab** → Response will have OTP
5. Enter OTP and login

### Step 5: Common Fixes

**If API calls fail:**
- Restart both servers
- Clear browser cache
- Check CORS settings

**If OTP not working:**
- Check backend console
- OTP is in API response (dev mode)
- Check email config (optional in dev)

**If pages blank:**
- Check browser console for errors
- Verify all dependencies installed
- Restart frontend server

---

## ✅ Everything Working Checklist

- [ ] Backend: http://localhost:5000/health → OK
- [ ] Frontend: http://localhost:3000 → Loads
- [ ] Login: Can send OTP
- [ ] OTP: Visible in response
- [ ] Dashboard: Loads after login
- [ ] Services: All accessible

---

**If still not working, tell me the exact error and I'll fix it!** 🚀

