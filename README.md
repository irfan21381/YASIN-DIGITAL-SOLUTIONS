# YDS EduAI - AI Learning Suite for Colleges

India's first full AI-powered college learning platform with multi-role support, AI doubt solving, quiz generation, and comprehensive analytics.

## 🚀 Features

### Core Features
- **Multi-Role Authentication**: Single email with multiple roles (Super Admin, College Manager, Teacher, Student, Employee, Client)
- **OTP-Based Login**: Secure email OTP authentication
- **College Management**: Complete college, teacher, and student management system
- **Digital Content System**: Upload and manage notes, PDFs, PPTs, videos, and question banks
- **AI Doubt Solver**: RAG-based doubt solving using teacher-uploaded materials
- **AI Quiz Generator**: Automatic quiz generation with anti-cheat system
- **AI Notes Generator**: Generate summaries, short/long answers, and formula lists
- **AI Coding Lab**: Online compiler with AI assistance
- **AI Analytics Dashboard**: Comprehensive analytics with charts
- **AI Classroom Manager**: Track students, progress, and assignments
- **Free Public Student Mode**: Public access for brand growth

### Security Features
- College-level data separation
- Student data encryption
- S3 secure file storage
- Audit logs for all actions
- Role-based access control

## 🏗️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + OTP Authentication
- AWS S3 for file storage
- OpenAI/Groq API for AI features
- Multer for file uploads

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand for state management
- React Query for data fetching
- Axios for API calls

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- AWS S3 account (for file storage)
- OpenAI or Groq API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yds-eduai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
GROQ_API_KEY=your-groq-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🗂️ Project Structure

```
yds-eduai/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Auth, upload, audit
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── server.js
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API, store
│   └── public/              # Static assets
└── README.md
```

## 🔐 User Roles

1. **SUPER_ADMIN**: Full system access
2. **COLLEGE_MANAGER**: Manage college, teachers, students
3. **TEACHER**: Upload content, create quizzes, view analytics
4. **STUDENT**: Access content, take quizzes, use AI features
5. **EMPLOYEE**: Limited access
6. **CLIENT**: External access

## 📚 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/switch-role` - Switch active role

### Content
- `GET /api/content` - Get all content
- `POST /api/content` - Upload content
- `GET /api/content/:id` - Get content by ID
- `PUT /api/content/:id/verify` - Verify content

### Quiz
- `GET /api/quiz` - Get all quizzes
- `POST /api/ai/quiz/generate` - Generate quiz with AI
- `POST /api/quiz/:id/start` - Start quiz attempt
- `POST /api/quiz/:attemptId/submit` - Submit quiz

### AI Services
- `POST /api/ai/chat` - Send message to doubt solver
- `POST /api/ai/notes/generate` - Generate notes
- `GET /api/ai/mentor` - Get AI mentor recommendations

### Analytics
- `GET /api/analytics/student-usage` - Student usage stats
- `GET /api/analytics/weak-subjects` - Weak subject detection
- `GET /api/analytics/quiz-marks` - Quiz performance

## 🎯 Key Features Implementation

### AI Doubt Solver (RAG)
1. Teacher uploads content (PDF/PPT/Notes)
2. Backend extracts text and generates embeddings
3. Student asks doubt
4. System finds relevant chunks using vector similarity
5. AI answers only from teacher's materials
6. If topic not found, returns: "Teacher has not uploaded this topic yet."

### Anti-Cheat Quiz System
- Browser-side tracking: tab switch, screen blur, device change
- Backend logging of all cheating events
- Cheating score calculation
- Auto-submit on timer
- Teacher dashboard with cheating analysis

### AI Quiz Generator
- Teacher selects unit, difficulty, number of questions
- AI generates questions from uploaded content
- Each student gets different shuffled set
- Teacher can edit before publishing

## 🚢 Deployment

### Backend Deployment
1. Set up MongoDB Atlas
2. Configure AWS S3 bucket
3. Set environment variables
4. Deploy to Heroku/Railway/DigitalOcean

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, email support@ydseduai.com

"# yds-edu-ai-2" 
"# yds-edu-ai-2" 
