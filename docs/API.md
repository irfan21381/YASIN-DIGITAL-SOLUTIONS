# YDS EduAI Platform - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`

Register a new user (typically for public students).

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT",
  "isPublicStudent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered. OTP sent to email for verification.",
  "userId": "..."
}
```

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "email": "student@example.com",
    "role": "STUDENT",
    "collegeId": null,
    "isVerified": true
  }
}
```

### Send OTP
**POST** `/auth/send-otp`

Send OTP to user's email (for login or password reset).

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email."
}
```

### Verify OTP
**POST** `/auth/verify-otp`

Verify OTP and receive JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Reset Password (with OTP)
**POST** `/auth/reset-password`

Reset password using OTP (forgot password flow).

**Request Body:**
```json
{
  "email": "student@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

### Change Password (Protected)
**POST** `/auth/change-password`

Change password when logged in.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Student Endpoints

All student endpoints require authentication and STUDENT role.

### Get Student Profile
**GET** `/student/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "role": "STUDENT",
      "isVerified": true
    },
    "student": {
      "userId": "...",
      "collegeId": "...",
      "isPublic": false,
      "studentNumber": "STU001",
      "year": 2,
      "branch": "Computer Science",
      "enrolledSubjects": [...]
    }
  }
}
```

### Get Student Stats
**GET** `/student/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "completedCourses": 0,
    "pendingAssignments": 5,
    "internshipStatus": {
      "pending": 2,
      "accepted": 0,
      "total": 2
    },
    "aiCredits": 100,
    "enrolledSubjects": 3
  }
}
```

### Get Materials
**GET** `/student/materials`

Get all available materials for the student.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Introduction to Algorithms",
      "description": "...",
      "fileUrl": "/uploads/...",
      "fileType": "application/pdf",
      "subjectId": { "name": "Data Structures" },
      "status": "APPROVED"
    }
  ]
}
```

### Get Material Details
**GET** `/student/materials/:materialId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "fileUrl": "...",
    "fileType": "...",
    "subjectId": "...",
    "status": "APPROVED"
  }
}
```

### Get Available Quizzes
**GET** `/student/quizzes`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Quiz 1",
      "description": "...",
      "subjectId": { "name": "..." },
      "totalQuestions": 10
    }
  ]
}
```

### Get Quiz Details
**GET** `/student/quizzes/:quizId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Quiz 1",
    "description": "...",
    "questions": [
      {
        "questionText": "What is...?",
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ],
    "totalQuestions": 10
  }
}
```

### Submit Quiz Attempt
**POST** `/student/quizzes/:quizId/submit`

**Request Body:**
```json
{
  "answers": [
    {
      "questionText": "What is...?",
      "selectedAnswer": "Option A"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz attempt submitted successfully!",
  "data": {
    "_id": "...",
    "studentId": "...",
    "quizId": "...",
    "score": 8,
    "totalQuestions": 10,
    "answers": [...]
  }
}
```

### Get Enrolled Subjects
**GET** `/student/subjects`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Computer Science Fundamentals"
    }
  ]
}
```

---

## Internship Endpoints

### List Internships (Public)
**GET** `/internships`

**Query Parameters:**
- `collegeId` (optional): Filter by college

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Software Development Intern",
      "description": "...",
      "company": "YDS Tech Solutions",
      "location": "Remote",
      "duration": "3 months",
      "stipend": 15000,
      "applicationDeadline": "2024-12-31T00:00:00.000Z",
      "startDate": "2025-01-15T00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### Get Internship Details (Public)
**GET** `/internships/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "company": "...",
    "location": "...",
    "duration": "...",
    "stipend": 15000,
    "requirements": ["..."],
    "skills": ["..."],
    "applicationDeadline": "...",
    "startDate": "..."
  }
}
```

### Apply for Internship (Protected - STUDENT)
**POST** `/internships/:id/apply`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "coverLetter": "I am interested in...",
  "resumeUrl": "/uploads/resume.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "...",
    "studentId": "...",
    "internshipId": "...",
    "status": "PENDING",
    "appliedAt": "..."
  }
}
```

### Get My Applications (Protected - STUDENT)
**GET** `/internships/my-applications`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "studentId": "...",
      "internshipId": {
        "title": "...",
        "company": "...",
        "location": "..."
      },
      "status": "PENDING",
      "appliedAt": "..."
    }
  ]
}
```

---

## Admin Endpoints

All admin endpoints require SUPER_ADMIN role.

### Get Global Analytics
**GET** `/admin/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "colleges": 5,
    "students": 100,
    "teachers": 20,
    "quizzes": 50,
    "attempts": 200,
    "products": 0,
    "internships": 10,
    "internshipApplications": 30,
    "totalUsers": 130,
    "totalMaterials": 150,
    "aiUsage": {
      "totalQueries": 500,
      "totalEmbeddings": 1000
    }
  }
}
```

### Create College
**POST** `/admin/college`

**Request Body:**
```json
{
  "name": "New College Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "New College Name",
    "superAdminId": "...",
    "isActive": true
  }
}
```

### Get All Colleges
**GET** `/admin/colleges`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "...",
      "superAdminId": "...",
      "isActive": true
    }
  ]
}
```

### Assign Manager
**POST** `/admin/college/:collegeId/manager`

**Request Body:**
```json
{
  "managerEmail": "manager@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manager manager@example.com assigned to College Name. OTP sent for verification/login.",
  "data": { ... }
}
```

---

## AI Endpoints

### Query AI (Protected)
**POST** `/ai/query`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "question": "What is machine learning?",
  "materialId": "..." // optional, for RAG queries
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Machine learning is...",
    "citations": ["Material 1", "Material 2"]
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

