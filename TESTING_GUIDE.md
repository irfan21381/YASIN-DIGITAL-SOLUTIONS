# 🧪 YDS EduAI - Complete Testing Guide

## 🚀 Quick Start Testing

### Step 1: Create Test Users

```bash
cd backend
node src/seed.js
```

This creates:
- ✅ Super Admin (admin@yds.com)
- ✅ Manager (manager@yds.com)
- ✅ Teacher (teacher@yds.com)
- ✅ Student (student@yds.com)
- ✅ Test College
- ✅ Test Subject

### Step 2: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Test Login

1. Go to: http://localhost:3000/auth/login
2. Enter: `admin@yds.com` (or any test email)
3. Click "Send OTP"
4. **Check backend console or API response** - OTP will be shown in dev mode
5. Enter OTP and login

---

## ✅ Test Endpoints

### Backend Health Checks

Test these URLs in browser or Postman:

- ✅ `http://localhost:5000/health` - Server health
- ✅ `http://localhost:5000/api/test/auth/test` - Auth route test
- ✅ `http://localhost:5000/api/test/teacher/test` - Teacher route test
- ✅ `http://localhost:5000/api/test/student/test` - Student route test
- ✅ `http://localhost:5000/api/test/health-check` - Complete health check

### Frontend Pages

Test these URLs:

- ✅ `http://localhost:3000` - Landing page
- ✅ `http://localhost:3000/auth/login` - Login page
- ✅ `http://localhost:3000/public` - Public mode
- ✅ `http://localhost:3000/student` - Student dashboard (after login)
- ✅ `http://localhost:3000/teacher` - Teacher dashboard (after login)
- ✅ `http://localhost:3000/manager` - Manager dashboard (after login)
- ✅ `http://localhost:3000/admin` - Admin dashboard (after login)

---

## 🔍 Service Testing Checklist

### ✅ 1. Authentication
- [ ] Send OTP works
- [ ] OTP appears in response (dev mode)
- [ ] Login successful
- [ ] Token stored in localStorage
- [ ] Role-based redirect works

### ✅ 2. AI Doubt Solver
- [ ] Teacher can upload material
- [ ] Material processing works
- [ ] Student can ask doubts
- [ ] AI responds from teacher content
- [ ] Shows "Teacher has not uploaded" when appropriate

### ✅ 3. Quiz System
- [ ] Teacher can generate quiz
- [ ] Quiz can be published
- [ ] Student can start quiz
- [ ] Anti-cheat events logged
- [ ] Quiz submission works
- [ ] Results displayed

### ✅ 4. Content Management
- [ ] Teacher can upload files
- [ ] Files appear in content list
- [ ] Students can view content
- [ ] Access control works

### ✅ 5. Analytics
- [ ] Charts load correctly
- [ ] Data displays properly
- [ ] All analytics pages accessible

### ✅ 6. Classroom Manager
- [ ] Active students list shows
- [ ] AI recommendations appear
- [ ] Activity timeline works

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot connect to API"

**Fix:**
1. Check backend is running: `http://localhost:5000/health`
2. Check `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
3. Restart frontend server

### Issue 2: "OTP not received"

**Fix:**
- In dev mode, OTP is in API response
- Check backend console
- Check browser network tab for response

### Issue 3: "Module not found"

**Fix:**
1. Run: `cd frontend && npm install`
2. Check `tsconfig.json` has path aliases
3. Restart dev server

### Issue 4: "CORS error"

**Fix:**
1. Check `backend/.env` has: `FRONTEND_URL=http://localhost:3000`
2. Restart backend server

### Issue 5: "MongoDB connection error"

**Fix:**
1. Check MongoDB is running: `Get-Service MongoDB`
2. Check `backend/.env` has correct `MONGODB_URI`
3. Test connection: `node backend/test-connection.js`

---

## 📝 Test User Credentials

| Role | Email | OTP Method |
|------|-------|------------|
| Super Admin | admin@yds.com | Send OTP, check response |
| Manager | manager@yds.com | Send OTP, check response |
| Teacher | teacher@yds.com | Send OTP, check response |
| Student | student@yds.com | Send OTP, check response |

**Note:** In development mode, OTP is returned in the API response for easy testing.

---

## 🔧 Environment Variables Check

### Backend `.env` Required:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yds-eduai
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local` Required:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## ✅ Success Indicators

When everything works, you should see:

1. ✅ Backend: `🚀 Server running on port 5000`
2. ✅ Backend: `✅ MongoDB Connected`
3. ✅ Frontend: `✓ Ready in X.Xs`
4. ✅ Login: OTP in response (dev mode)
5. ✅ Dashboard: All services visible
6. ✅ No console errors

---

## 🆘 Still Not Working?

Tell me:
1. Which specific page/service?
2. Error message from console
3. Backend terminal output
4. Browser network tab errors

I'll fix it immediately! 🚀

