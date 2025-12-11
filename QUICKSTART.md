# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB (local or Atlas)
- AWS S3 account (for file storage)
- OpenAI or Groq API key

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required:
# - MONGODB_URI
# - JWT_SECRET
# - OPENAI_API_KEY or GROQ_API_KEY
# - AWS credentials
# - Email credentials
```

### 3. Frontend Setup

```bash
cd frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 4. Start Development Servers

From root directory:

```bash
# Start both backend and frontend
npm run dev
```

Or separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## First Time Setup

### 1. Create Super Admin

You'll need to create a super admin user manually in MongoDB or via API:

```bash
# Using MongoDB shell
use yds-eduai
db.users.insertOne({
  email: "admin@example.com",
  name: "Super Admin",
  roles: ["SUPER_ADMIN"],
  activeRole: "SUPER_ADMIN",
  isActive: true
})
```

### 2. Create College

1. Login as super admin
2. Navigate to admin dashboard
3. Create a college
4. Assign a manager

### 3. Add Users

1. Login as college manager
2. Upload students/teachers via CSV or add manually
3. Create subjects
4. Assign teachers to subjects

## Testing the Features

### AI Doubt Solver
1. Teacher uploads PDF/notes
2. Wait for embedding processing
3. Student asks doubt
4. AI answers from teacher's materials

### Quiz Generator
1. Teacher selects unit and difficulty
2. AI generates questions
3. Teacher reviews and publishes
4. Students take quiz

### Analytics
1. Navigate to analytics dashboard
2. View student usage, weak subjects, quiz performance
3. Check study streaks and time spent

## Common Issues

### MongoDB Connection Error
- Check MongoDB is running
- Verify connection string in .env
- Check network/firewall settings

### AWS S3 Upload Error
- Verify AWS credentials
- Check bucket name and region
- Ensure IAM user has S3 permissions

### AI API Error
- Verify API key is correct
- Check API quota/limits
- Ensure internet connection

### OTP Email Not Sending
- Check email credentials
- Verify SMTP settings
- Check spam folder
- In development, OTP is shown in response

## Next Steps

1. Read [README.md](./README.md) for detailed documentation
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
3. Customize UI and branding
4. Add more features as needed

## Support

For issues or questions, please open an issue on GitHub.

