# Troubleshooting Guide

## "Cannot reach server" Error

This error occurs when the frontend cannot connect to the backend. Follow these steps:

### 1. Check Backend is Running

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

You should see:
```
Mongo connected
Server running on http://0.0.0.0:5000
```

### 2. Check Environment Variables

**Frontend `.env` file (in root directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend `.env` file (in `backend/` directory):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/yds
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:8080
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Verify MongoDB is Running

**Check MongoDB:**
```bash
# Windows (if installed as service, it should be running)
# Or start manually:
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 4. Test Backend Connection

Open browser and go to:
```
http://localhost:5000/api/health
```

Should return: `{"ok":true}`

### 5. Check CORS Configuration

Ensure `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL:
- Development: `http://localhost:8080`
- Production: Your production URL

### 6. Restart Both Servers

1. Stop both frontend and backend (Ctrl+C)
2. Start backend first: `cd backend && npm start`
3. Start frontend: `npm run dev`

## Forgot Password Not Working

### Fixed Issues:
✅ Created `/forgot-password` page
✅ Added forgot password API functions
✅ Linked "Forgot password?" in login page
✅ Backend endpoint `/api/auth/reset-password` exists

### How to Use:
1. Click "Forgot password?" on login page
2. Enter your email
3. Click "Send OTP"
4. Check your email for OTP
5. Enter OTP and new password
6. Click "Reset Password"

### If OTP Not Received:
1. Check spam folder
2. Verify email configuration in backend `.env`:
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Gmail App Password (not regular password)
3. For Gmail App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app password
   - Use it in `EMAIL_PASS`

## Common Issues

### Port Already in Use
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Check MongoDB is running
- Verify `MONGO_URI` is correct
- For Atlas: Check IP whitelist includes your IP

### CORS Errors
- Verify `FRONTEND_ORIGIN` in backend `.env`
- Check browser console for specific CORS error
- Ensure frontend URL matches exactly (including port)

### Network Timeout
- Backend might be slow to start
- Check backend logs for errors
- Verify MongoDB connection

## Quick Health Check

Run these commands to verify setup:

```bash
# 1. Check backend health
curl http://localhost:5000/api/health

# 2. Check MongoDB connection
# Open MongoDB Compass or mongosh
mongosh mongodb://localhost:27017/yds

# 3. Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@yds.com","password":"student123"}'
```

## Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend terminal for error logs
3. Verify all environment variables are set
4. Ensure both servers are running
5. Try clearing browser cache and localStorage

---

**Last Updated:** After implementing forgot password and fixing API connection

