# YDS EduAI Platform - Setup Checklist

Use this checklist to verify your setup is complete and working.

## ✅ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB running locally OR MongoDB Atlas connection string ready
- [ ] Gmail account with App Password generated (for email OTP)

## ✅ Backend Setup

- [ ] Navigate to `backend/` directory
- [ ] Run `npm install`
- [ ] Create `backend/.env` file with required variables:
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
- [ ] Verify MongoDB is accessible
- [ ] Run `npm run seed` to populate database
- [ ] Run `npm start` - backend should start on http://localhost:5000
- [ ] Test health endpoint: `curl http://localhost:5000/api/health`

## ✅ Frontend Setup

- [ ] Navigate to project root
- [ ] Run `npm install`
- [ ] Create `.env` file in root with:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```
- [ ] Run `npm run dev` - frontend should start on http://localhost:8080
- [ ] Verify frontend loads without errors

## ✅ Database Verification

- [ ] Connect to MongoDB (mongosh or MongoDB Compass)
- [ ] Verify collections exist:
  - [ ] users
  - [ ] colleges
  - [ ] students
  - [ ] teachers
  - [ ] subjects
  - [ ] materials
  - [ ] quizzes
  - [ ] internships
- [ ] Verify seed data:
  - [ ] Super Admin: admin@yds.com
  - [ ] Manager: manager@yds.com
  - [ ] Teacher: teacher@yds.com
  - [ ] Students: student1@yds.com, student2@yds.com
  - [ ] Public Students: public1@yds.com, public2@yds.com

## ✅ API Testing

### Authentication Tests
- [ ] Register new user: `POST /api/auth/register`
- [ ] Login with password: `POST /api/auth/login`
- [ ] Send OTP: `POST /api/auth/send-otp`
- [ ] Verify OTP: `POST /api/auth/verify-otp`
- [ ] Get JWT token from login/verify-otp response

### Student Endpoints (use student token)
- [ ] Get profile: `GET /api/student/me`
- [ ] Get stats: `GET /api/student/stats`
- [ ] Get materials: `GET /api/student/materials`
- [ ] Get quizzes: `GET /api/student/quizzes`
- [ ] Get subjects: `GET /api/student/subjects`

### Internship Endpoints
- [ ] List internships: `GET /api/internships`
- [ ] Get internship details: `GET /api/internships/:id`
- [ ] Apply for internship: `POST /api/internships/:id/apply` (with student token)
- [ ] Get my applications: `GET /api/internships/my-applications` (with student token)

### Admin Endpoints (use admin token)
- [ ] Get stats: `GET /api/admin/stats`
- [ ] Create college: `POST /api/admin/college`
- [ ] Get colleges: `GET /api/admin/colleges`

## ✅ Frontend Testing

### Public Pages
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] Register page accessible
- [ ] Internships listing page accessible

### Authentication Flow
- [ ] Can register new student
- [ ] Can login with password
- [ ] Can login with OTP (send OTP → verify OTP)
- [ ] JWT token stored after login
- [ ] Redirects to /student after login

### Student Portal
- [ ] Dashboard loads with stats
- [ ] Sidebar is fixed
- [ ] Topbar shows Logout button
- [ ] Profile page accessible
- [ ] Materials page shows available materials
- [ ] Quizzes page shows available quizzes
- [ ] Internships page shows internships
- [ ] Can apply for internship
- [ ] AI Assistant page accessible

### Role-Based Access
- [ ] Student cannot access admin routes
- [ ] Admin can access admin dashboard
- [ ] Manager can access manager dashboard
- [ ] Teacher can access teacher dashboard

## ✅ File Upload Testing

- [ ] Teacher can upload material (PDF/DOCX)
- [ ] File saved to `backend/uploads/` directory
- [ ] Material metadata saved to database
- [ ] Material status is PENDING initially
- [ ] Manager can approve material
- [ ] Approved material visible to students

## ✅ CORS Verification

- [ ] Frontend can make API calls with credentials
- [ ] No CORS errors in browser console
- [ ] Check Network tab - requests include credentials
- [ ] Verify `FRONTEND_ORIGIN` matches frontend URL

## ✅ Email Testing

- [ ] OTP email sent on registration
- [ ] OTP email sent on send-otp request
- [ ] Check email inbox for OTP
- [ ] OTP is 6 digits
- [ ] OTP expires after 5 minutes

## ✅ Docker (Optional)

- [ ] `docker-compose up -d` starts all services
- [ ] MongoDB accessible on port 27017
- [ ] Backend accessible on port 5000
- [ ] Frontend accessible on port 80
- [ ] All services healthy

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 5000 is not in use
- Review error logs

### Frontend won't start
- Check Node.js version (18+)
- Verify `.env` file exists
- Check port 8080 is not in use
- Clear `node_modules` and reinstall

### CORS errors
- Verify `FRONTEND_ORIGIN` in backend `.env` matches frontend URL
- Check browser console for specific CORS error
- Verify credentials are included in requests

### Email not sending
- Verify Gmail App Password is correct
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Test SMTP connection separately
- Check email spam folder

### Database connection issues
- Verify MongoDB is running
- Check `MONGO_URI` in `.env`
- For Atlas, verify IP whitelist
- Check network connectivity

## 📞 Support

If you encounter issues:
1. Check error logs in console
2. Review README.md for common issues
3. Verify all environment variables are set
4. Check database connection
5. Review API documentation in `docs/API.md`

---

**Last Updated:** Project initialization
**Status:** ✅ Ready for development

