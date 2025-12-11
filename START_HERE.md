# 🚀 START HERE - YDS EduAI Quick Start

## ⚡ 3-Step Quick Start

### Step 1: Create Test Users (30 seconds)

```bash
cd backend
node src/seed.js
```

✅ Creates 4 test users ready to login!

### Step 2: Start Servers (1 minute)

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### Step 3: Login & Test (1 minute)

1. Open: http://localhost:3000/auth/login
2. Enter: `student@yds.com`
3. Click "Send OTP"
4. **Check browser Network tab** → Response shows OTP
5. Enter OTP → Login!

---

## 🎯 Test Users

| Email | Role | Use For |
|-------|------|---------|
| `admin@yds.com` | Super Admin | System management |
| `manager@yds.com` | Manager | College management |
| `teacher@yds.com` | Teacher | Upload content, create quizzes |
| `student@yds.com` | Student | Test all student features |

**OTP:** In dev mode, OTP appears in API response. Check Network tab!

---

## ✅ Quick Verification

Test these URLs:

**Backend:**
- http://localhost:5000/health → Should show `{"status":"OK"}`
- http://localhost:5000/api/test/health-check → Should show services status

**Frontend:**
- http://localhost:3000 → Landing page
- http://localhost:3000/auth/login → Login page

---

## 🐛 If Something's Wrong

1. **Backend not starting?**
   - Check MongoDB is running: `Get-Service MongoDB`
   - Check port 5000 is free

2. **Frontend errors?**
   - Check `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
   - Restart frontend server

3. **OTP not working?**
   - OTP is in API response (dev mode)
   - Check browser Network tab → `/api/auth/send-otp` → Response

4. **Still stuck?**
   - See `TROUBLESHOOTING.md` for detailed fixes
   - See `QUICK_FIX.md` for common issues

---

## 📚 Full Documentation

- `TESTING_GUIDE.md` - Complete testing instructions
- `TROUBLESHOOTING.md` - Fix all issues
- `LAUNCH_READY.md` - Production deployment guide
- `SERVICES_COMPLETE.md` - All 15 services list

---

## 🎉 You're Ready!

Your platform is 100% complete with:
- ✅ All 15 services
- ✅ Test users ready
- ✅ All pages working
- ✅ Analytics with charts
- ✅ Dark neon UI theme

**Start testing now!** 🚀

