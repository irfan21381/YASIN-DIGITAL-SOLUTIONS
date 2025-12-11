"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MenuIcon, UserCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md fixed w-full z-50 top-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          YDS EDUAI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="text-primary">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation (Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background text-foreground">
              <div className="flex flex-col space-y-4 mt-6">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Profile</Link>
                    {hasRole(['SUPER_ADMIN']) && (
                      <Link to="/admin-dashboard" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Super Admin Dashboard</Link>
                    )}
                    {hasRole(['MANAGER']) && (
                      <Link to="/manager-dashboard" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Manager Dashboard</Link>
                    )}
                    {hasRole(['TEACHER']) && (
                      <Link to="/teacher-dashboard" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Teacher Dashboard</Link>
                    )}
                    {hasRole(['STUDENT']) && (
                      <>
                        <Link to="/student-dashboard" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Student Dashboard</Link>
                        <Link to="/coding-lab" className="text-lg hover:text-primary" onClick={() => document.getElementById('sheet-close')?.click()}>Coding Lab</Link>
                      </>
                    )}
                    <Button onClick={logout} className="w-full">Logout</Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;