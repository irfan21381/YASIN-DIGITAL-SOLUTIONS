-- ENUMS
CREATE TYPE "Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'TEACHER',
    'STUDENT',
    'PUBLIC_STUDENT',
    'EMPLOYEE'
);

CREATE TYPE "InternshipApplicationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
);

CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);

-- TABLES
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "College" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "studentNumber" TEXT,
    "year" INTEGER,
    "branch" TEXT,
    "collegeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "department" TEXT,
    "collegeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Manager" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "collegeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "collegeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "teacherId" INTEGER,
    "collegeId" INTEGER,
    "subjectId" INTEGER,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" INTEGER,
    "teacherId" INTEGER,
    "questions" JSONB NOT NULL,
    "totalMarks" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAttempt" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Internship" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT,
    "location" TEXT,
    "stipend" TEXT,
    "postedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InternshipApplication" (
    "id" SERIAL NOT NULL,
    "internshipId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "resumeUrl" TEXT,
    "coverLetter" TEXT,
    "status" "InternshipApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InternshipApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT,
    "providerId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIChatMessage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" INTEGER,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_StudentSubjects" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StudentSubjects_AB_pkey" PRIMARY KEY ("A", "B")
);

-- INDEXES
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");
CREATE UNIQUE INDEX "Manager_userId_key" ON "Manager"("userId");

CREATE UNIQUE INDEX "College_code_key" ON "College"("code");
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

CREATE INDEX "_StudentSubjects_B_index" ON "_StudentSubjects"("B");

-- FOREIGN KEYS
ALTER TABLE "Student"
    ADD CONSTRAINT "Student_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Student"
    ADD CONSTRAINT "Student_collegeId_fkey"
    FOREIGN KEY ("collegeId") REFERENCES "College"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Teacher"
    ADD CONSTRAINT "Teacher_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Teacher"
    ADD CONSTRAINT "Teacher_collegeId_fkey"
    FOREIGN KEY ("collegeId") REFERENCES "College"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Manager"
    ADD CONSTRAINT "Manager_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Manager"
    ADD CONSTRAINT "Manager_collegeId_fkey"
    FOREIGN KEY ("collegeId") REFERENCES "College"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Subject"
    ADD CONSTRAINT "Subject_collegeId_fkey"
    FOREIGN KEY ("collegeId") REFERENCES "College"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Material"
    ADD CONSTRAINT "Material_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Material"
    ADD CONSTRAINT "Material_collegeId_fkey"
    FOREIGN KEY ("collegeId") REFERENCES "College"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Material"
    ADD CONSTRAINT "Material_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Quiz"
    ADD CONSTRAINT "Quiz_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Quiz"
    ADD CONSTRAINT "Quiz_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Internship"
    ADD CONSTRAINT "Internship_postedById_fkey"
    FOREIGN KEY ("postedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InternshipApplication"
    ADD CONSTRAINT "InternshipApplication_internshipId_fkey"
    FOREIGN KEY ("internshipId") REFERENCES "Internship"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InternshipApplication"
    ADD CONSTRAINT "InternshipApplication_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AIChatMessage"
    ADD CONSTRAINT "AIChatMessage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "_StudentSubjects"
    ADD CONSTRAINT "_StudentSubjects_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Student"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_StudentSubjects"
    ADD CONSTRAINT "_StudentSubjects_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Subject"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- updatedAt AUTO-UPDATE TRIGGERS
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_User_updatedAt"
    BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_College_updatedAt"
    BEFORE UPDATE ON "College"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Student_updatedAt"
    BEFORE UPDATE ON "Student"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Teacher_updatedAt"
    BEFORE UPDATE ON "Teacher"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Manager_updatedAt"
    BEFORE UPDATE ON "Manager"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Subject_updatedAt"
    BEFORE UPDATE ON "Subject"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Material_updatedAt"
    BEFORE UPDATE ON "Material"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Quiz_updatedAt"
    BEFORE UPDATE ON "Quiz"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "trg_Internship_updatedAt"
    BEFORE UPDATE ON "Internship"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
