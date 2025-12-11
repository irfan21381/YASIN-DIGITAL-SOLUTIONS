# Architecture Documentation

## System Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend)
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│  Express API    │  (Backend)
│   (Port 5000)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐ ┌────▼────┐ ┌───▼────┐
│MongoDB│ │AWS S3│ │OpenAI/  │ │Email   │
│       │ │      │ │Groq API │ │SMTP    │
└───────┘ └──────┘ └─────────┘ └────────┘
```

## Database Schema

### User Model
- Multi-role support (array of roles)
- College association
- Student/Teacher specific data
- Usage statistics

### College Model
- College information
- Manager assignment
- Settings (years, branches, semesters)

### Subject Model
- Subject details
- Year/Branch/Semester mapping
- Teacher assignment
- Units

### Content Model
- File storage (S3)
- Text extraction
- Embeddings for RAG
- Access control

### Quiz Model
- Questions with metadata
- Settings (duration, anti-cheat)
- Access control

### QuizAttempt Model
- Student answers
- Cheating events tracking
- Performance metrics

### Chat Model
- Conversation history
- RAG context tracking
- Sources used

## AI Services Architecture

### RAG (Retrieval Augmented Generation)

```
Teacher Upload → Text Extraction → Chunking → Embedding Generation
                                                      ↓
Student Question → Embedding → Vector Search → Relevant Chunks
                                                      ↓
                                              AI Response Generation
```

### Embedding Pipeline
1. Content uploaded (PDF/Notes)
2. Text extraction (PDF parsing)
3. Text chunking (1000 chars with 200 overlap)
4. Embedding generation (OpenAI ada-002)
5. Storage in MongoDB

### Query Pipeline
1. Student question
2. Generate question embedding
3. Cosine similarity search
4. Retrieve top 5 relevant chunks
5. Build context
6. Generate AI response
7. Return answer with sources

## Security Architecture

### Authentication Flow
1. User enters email
2. OTP generated and sent
3. OTP verified
4. JWT token issued
5. Token stored in localStorage

### Authorization
- Role-based access control (RBAC)
- College-level data isolation
- Resource-level permissions

### Data Security
- Student data encryption
- S3 private bucket
- Audit logging
- Rate limiting

## API Architecture

### RESTful Design
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/colleges/*` - College management
- `/api/subjects/*` - Subject management
- `/api/content/*` - Content management
- `/api/quiz/*` - Quiz management
- `/api/ai/*` - AI services
- `/api/analytics/*` - Analytics
- `/api/coding/*` - Coding lab
- `/api/classroom/*` - Classroom features
- `/api/public/*` - Public endpoints

### Middleware Stack
1. Helmet (security headers)
2. CORS
3. Rate limiting
4. Body parser
5. Authentication
6. Authorization
7. Audit logging

## Frontend Architecture

### Next.js App Router
- `/app` - Pages and layouts
- `/components` - Reusable components
- `/lib` - Utilities, API client, store

### State Management
- Zustand for global state
- React Query for server state
- Local storage for persistence

### Routing
- Role-based route protection
- Dynamic routing
- API route handlers

## Scalability Considerations

### Database
- Indexed queries
- Aggregation pipelines
- Connection pooling

### File Storage
- S3 for scalability
- CDN for delivery
- Signed URLs for security

### AI Services
- Async processing
- Caching embeddings
- Batch operations

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Browser caching

## Monitoring & Logging

### Logging
- Morgan for HTTP logs
- Console logging for errors
- Audit logs in database

### Monitoring
- Health check endpoint
- Error tracking
- Performance metrics

## Future Enhancements

1. Real-time features (WebSockets)
2. Video processing
3. Advanced analytics
4. Mobile app
5. Offline support
6. Multi-language support

