"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Book,
  FileText,
  ClipboardCheck,
  GraduationCap,
  Code,
  Bot,
  BarChart,
  PlusCircle,
  Upload,
  FileUp,
  ListChecks,
  Building2,
  UserPlus,
  UserRoundPlus,
  FileSpreadsheet,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return null; // Don't render sidebar if not authenticated
  }

  const commonLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
  ];

  const superAdminLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin-dashboard#create-college', icon: Building2, label: 'Create College' },
    { to: '/admin-dashboard#assign-manager', icon: UserPlus, label: 'Assign Manager' },
    { to: '/admin-dashboard#manage-colleges', icon: ListChecks, label: 'Manage Colleges' },
    { to: '/admin-dashboard#analytics', icon: BarChart, label: 'Global Analytics' },
  ];

  const managerLinks = [
    { to: '/manager-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager-dashboard#add-teacher', icon: UserPlus, label: 'Add Teacher' },
    { to: '/manager-dashboard#add-student', icon: UserRoundPlus, label: 'Add Student' },
    { to: '/manager-dashboard#upload-csv', icon: FileSpreadsheet, label: 'Upload Students CSV' },
    { to: '/manager-dashboard#create-subject', icon: PlusCircle, label: 'Create Subject' },
    { to: '/manager-dashboard#pending-materials', icon: ClipboardCheck, label: 'Approve Materials' },
    { to: '/manager-dashboard#analytics', icon: BarChart, label: 'College Analytics' },
  ];

  const teacherLinks = [
    { to: '/teacher-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher-dashboard#upload-material', icon: Upload, label: 'Upload Material' },
    { to: '/teacher-dashboard#generate-quiz', icon: ListChecks, label: 'Generate Quiz' },
    { to: '/teacher-dashboard#my-materials', icon: FileText, label: 'My Materials' },
    { to: '/teacher-dashboard#my-quizzes', icon: ClipboardCheck, label: 'My Quizzes' },
    { to: '/subjects', icon: Book, label: 'My Subjects' },
    { to: '/teacher-dashboard#analytics', icon: BarChart, label: 'My Analytics' },
  ];

  const studentLinks = [
    { to: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: Book, label: 'My Subjects' },
    { to: '/student-dashboard#materials', icon: FileText, label: 'My Materials' },
    { to: '/student-dashboard#quizzes', icon: ClipboardCheck, label: 'My Quizzes' },
    { to: '/coding-lab', icon: Code, label: 'Coding Lab' },
    { to: '/student-dashboard#ai-chat', icon: Bot, label: 'AI Chatbot' },
  ];

  let currentRoleLinks: { to: string; icon: React.ElementType; label: string }[] = [];

  if (hasRole(['SUPER_ADMIN'])) {
    currentRoleLinks = superAdminLinks;
  } else if (hasRole(['MANAGER'])) {
    currentRoleLinks = managerLinks;
  } else if (hasRole(['TEACHER'])) {
    currentRoleLinks = teacherLinks;
  } else if (hasRole(['STUDENT'])) {
    currentRoleLinks = studentLinks;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground p-4 h-[calc(100vh-64px)] fixed top-16 left-0">
      <ScrollArea className="flex-1">
        <nav className="space-y-2">
          {currentRoleLinks.map((link) => (
            <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;