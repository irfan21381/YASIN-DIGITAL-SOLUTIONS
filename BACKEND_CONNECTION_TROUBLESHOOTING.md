# Backend Connection Troubleshooting

## ✅ Current Status

- **Backend Server**: Running on port 5000 ✅
- **Backend Health Check**: Responding ✅ (`http://localhost:5000/api/health`)
- **Frontend**: Running on port 8080 ✅
- **CORS Configuration**: Configured for `http://localhost:8080` ✅

## 🔍 Issue: "Cannot reach server" Error

The frontend is showing "Cannot reach server" error. Here's how to fix it:

### Step 1: Verify Backend is Running

Check if backend is running:
```bash
# In backend directory
cd backend
npm start
```

You should see:
```
Server running on http://0.0.0.0:5000
Mongo connected
```

### Step 2: Check Frontend API Configuration

The frontend is configured to use:
- Default: `http://localhost:5000/api`
- Or from env: `VITE_API_URL` or `VITE_BACKEND_URL`

**Create `.env` file in frontend root** (if not exists):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Verify CORS Configuration

Backend CORS is configured for:
- Origin: `http://localhost:8080` (or from `FRONTEND_ORIGIN` env var)
- Credentials: `true`

**Create `.env` file in backend root** (if not exists):
```env
FRONTEND_ORIGIN=http://localhost:8080
PORT=5000
MONGO_URI=mongodb://localhost:27017/yds
JWT_SECRET=your_jwt_secret_here
```

### Step 4: Test Backend Connection

Open browser console and test:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{ok: true}`

### Step 5: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab**: Look for CORS errors or network errors
2. **Network tab**: Check if requests to `/api/*` are failing
3. **Application tab**: Check if cookies/localStorage are being set

### Step 6: Common Issues & Fixes

#### Issue: CORS Error
**Fix**: Ensure `FRONTEND_ORIGIN` in backend `.env` matches frontend URL

#### Issue: Connection Refused
**Fix**: 
- Ensure backend is running: `cd backend && npm start`
- Check if port 5000 is not blocked by firewall

#### Issue: Timeout
**Fix**: 
- Check backend is responding: `curl http://localhost:5000/api/health`
- Increase timeout in `src/lib/api.ts` if needed

#### Issue: 401 Unauthorized
**Fix**: This is normal for login page - backend is reachable, just needs authentication

## 🚀 Quick Fix Commands

```bash
# 1. Start backend (in backend directory)
cd backend
npm start

# 2. In another terminal, start frontend (in root directory)
npm run dev

# 3. Test backend health
curl http://localhost:5000/api/health
```

## 📝 Environment Files Needed

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/yds
JWT_SECRET=your_secret_key_here
FRONTEND_ORIGIN=http://localhost:8080
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GROQ_API_KEY=your_groq_key
```

### `frontend/.env` (optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## ✅ Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Backend health endpoint responds: `http://localhost:5000/api/health`
- [ ] Frontend is running on port 8080
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API requests (even if 401, that's OK)
- [ ] `.env` files are created in both backend and frontend

---

**If backend is running but frontend still can't connect:**
1. Check browser console for specific error
2. Verify CORS origin matches exactly
3. Try hard refresh (Ctrl+Shift+R)
4. Clear browser cache

