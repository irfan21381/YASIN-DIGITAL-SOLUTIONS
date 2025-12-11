# 🔐 Seed Users for Testing

## Quick Setup

Run the seed script to create test users:

```bash
cd backend
node src/seed.js
```

## Test Users Created

### 1. Super Admin
- **Email**: `admin@yds.com`
- **Role**: SUPER_ADMIN
- **Login**: Use OTP (send OTP to this email)

### 2. College Manager
- **Email**: `manager@yds.com`
- **Role**: COLLEGE_MANAGER
- **College**: YDS Test College (YDS001)
- **Login**: Use OTP

### 3. Teacher
- **Email**: `teacher@yds.com`
- **Role**: TEACHER
- **Department**: Computer Science
- **Subject**: Data Structures (CS301)
- **Login**: Use OTP

### 4. Student
- **Email**: `student@yds.com`
- **Role**: STUDENT
- **Branch**: CSE
- **Year**: 2
- **Semester**: 3
- **Login**: Use OTP

## How to Login

1. Go to http://localhost:3000/auth/login
2. Enter any test email above
3. Click "Send OTP"
4. In development mode, check the backend console or API response for OTP
5. Enter OTP and login

## Test Data Created

- ✅ 1 College (YDS Test College)
- ✅ 1 Subject (Data Structures - CS301)
- ✅ 4 Users (Admin, Manager, Teacher, Student)
- ✅ All relationships linked

## Manual MongoDB Insert (Alternative)

If you prefer to insert manually via MongoDB Compass:

```json
{
  "name": "Super Admin",
  "email": "admin@yds.com",
  "roles": ["SUPER_ADMIN"],
  "activeRole": "SUPER_ADMIN",
  "isActive": true,
  "usageStats": {
    "totalLogins": 0,
    "studyStreak": 0
  }
}
```

Repeat for other users with their respective data.

