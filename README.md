<<<<<<< HEAD
# YDS (Yasin Digital Solutions) - EduAI Platform

A complete, production-ready full-stack web application for educational management with AI-powered learning assistance. Built with TypeScript, React, Node.js, Express, and MongoDB.

## 🚀 Features

### Roles & Permissions
- **SUPER_ADMIN**: Global control - create colleges, add managers, view global analytics
- **MANAGER**: College-scoped - add teachers, add students, approve uploads, view college analytics
- **TEACHER**: Subject-scoped - upload materials, create quizzes, view student progress
- **STUDENT**: Two types
  - College-registered (full access to college-specific content)
  - Public/Free (limited access to public content)

### Authentication
- JWT-based authentication with access tokens
- Email OTP flow for login and password reset
- Password-based login
- Protected routes with role-based authorization

### Core Features
- Material upload and management (with manager approval)
- Quiz creation and attempts
- Internship listings and applications
- AI-powered RAG (Retrieval Augmented Generation) assistant
- Student dashboard with stats and activity tracking
- File uploads (local storage with S3-ready hooks)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Gmail account with App Password (for email OTP)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd YDS-main
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

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

**Note**: For Gmail, you need to:
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated App Password in `EMAIL_PASS`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the root directory (or `frontend/` if separate):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 5. Seed the Database

```bash
cd backend
npm run seed
```

This will create:
- Super Admin (admin@yds.com / admin123)
- Sample College
- Manager (manager@yds.com / manager123)
- Teacher (teacher@yds.com / teacher123)
- College Students (student1@yds.com, student2@yds.com / student123)
- Public Students (public1@yds.com, public2@yds.com / public123)
- Sample Subjects
- Sample Internships

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on http://localhost:8080

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm run serve
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Create .env file in root with required variables
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 5000
- Frontend on port 80

### Individual Docker Builds

**Backend:**
```bash
docker build -f Dockerfile.backend -t yds-backend .
docker run -p 5000:5000 --env-file backend/.env yds-backend
```

**Frontend:**
```bash
docker build -f Dockerfile.frontend -t yds-frontend .
docker run -p 80:80 yds-frontend
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (public students)
- `POST /api/auth/login` - Login with password
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/auth/change-password` - Change password (protected)

### Student Routes (Protected - STUDENT role)
- `GET /api/student/me` - Get student profile
- `GET /api/student/stats` - Get student statistics
- `GET /api/student/materials` - Get available materials
- `GET /api/student/materials/:materialId` - Get material details
- `GET /api/student/quizzes` - Get available quizzes
- `GET /api/student/quizzes/:quizId` - Get quiz details
- `POST /api/student/quizzes/:quizId/submit` - Submit quiz attempt
- `GET /api/student/subjects` - Get enrolled subjects

### Internships (Public + Protected)
- `GET /api/internships` - List internships
- `GET /api/internships/:id` - Get internship details
- `POST /api/internships/:id/apply` - Apply for internship (STUDENT)
- `GET /api/internships/my-applications` - Get my applications (STUDENT)

### Admin Routes (Protected - SUPER_ADMIN role)
- `GET /api/admin/stats` - Get global analytics
- `POST /api/admin/college` - Create college
- `GET /api/admin/colleges` - Get all colleges
- `POST /api/admin/college/:collegeId/manager` - Assign manager
- `PATCH /api/admin/college/:collegeId/activate` - Activate/deactivate college

### Teacher Routes (Protected - TEACHER role)
- `POST /api/teacher/materials` - Upload material
- `GET /api/teacher/materials` - Get my materials
- `POST /api/teacher/quizzes` - Create quiz
- `GET /api/teacher/quizzes` - Get my quizzes

### Manager Routes (Protected - MANAGER role)
- `GET /api/manager/teachers` - Get college teachers
- `POST /api/manager/teacher` - Add teacher
- `GET /api/manager/materials/pending` - Get pending materials
- `PATCH /api/manager/materials/:id/approve` - Approve material
- `GET /api/manager/analytics` - Get college analytics

### AI Routes (Protected)
- `POST /api/ai/query` - AI/RAG query (returns assistant message + citations)

## 🗄️ Database Schema

### Models
- **User**: Base user model with email, password, role, collegeId
- **College**: College information
- **Student**: Student profile (studentNumber, year, branch, enrolledSubjects)
- **Teacher**: Teacher profile linked to User
- **Subject**: Course/subject information
- **Material**: Uploaded materials (PDF, DOCX) with approval status
- **Quiz**: Quiz with questions and answers
- **QuizAttempt**: Student quiz attempts with scores
- **Internship**: Internship listings
- **InternshipApplication**: Student applications for internships
- **AuditLog**: Activity logging for analytics

## 🔒 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- CORS configured with specific origin (not wildcard)
- Input sanitization (express-mongo-sanitize)
- Rate limiting
- Helmet.js for security headers
- Role-based access control middleware

## 📧 Email Configuration

The application uses NodeMailer with SMTP. For Gmail:

1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASS`

For other email providers, update `EMAIL_HOST` and `EMAIL_PORT` accordingly.

## 🔄 Migration Notes

### Switching File Uploads to S3

The codebase includes hooks for S3 integration. To enable:

1. Install AWS SDK (already in dependencies)
2. Update `backend/utils/fileProcessor.ts` to upload to S3
3. Set environment variables:
   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=yds-uploads
   ```

### Adding Embeddings Store

The AI service layer includes stubbed functions for RAG:
- `indexMaterial(materialId)` - Index material for vector search
- `queryRag(userId, prompt, context)` - Query RAG system

To implement:
1. Set up vector database (Pinecone, Weaviate, or MongoDB Atlas Vector Search)
2. Update `backend/services/embeddingService.ts`
3. Update `backend/services/vectorService.ts`

## 🧪 Testing

### Smoke Tests

Basic acceptance tests can be run manually:

1. **Auth Flow:**
   ```bash
   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","role":"STUDENT","isPublicStudent":true}'
   
   # Login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

2. **Student Stats:**
   ```bash
   curl -X GET http://localhost:5000/api/student/stats \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 📝 API Documentation

For detailed API documentation, see:
- Postman Collection: `docs/postman-collection.json` (to be created)
- OpenAPI Spec: `docs/openapi.yaml` (to be created)

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL
- Check that frontend is making requests with `credentials: true`

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` or check MongoDB Compass
- Check `MONGO_URI` in `.env`
- For Atlas, ensure IP whitelist includes your IP

### Email Not Sending
- Verify Gmail App Password is correct
- Check `EMAIL_HOST` and `EMAIL_PORT`
- Test SMTP connection separately

### File Upload Issues
- Ensure `backend/uploads/` directory exists and is writable
- Check file size limits in `server.ts` (currently 10mb)

## 📄 License

ISC

## 👥 Contributors

YDS Development Team

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ by Yasin Digital Solutions**
=======
# YASIN-DIGITTAL-SOLUTIONS
>>>>>>> 9539ddc66a83af515944dcfe3216718e593a84fc
