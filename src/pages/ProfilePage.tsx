"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
          <CardDescription>View your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} readOnly className="bg-muted" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" type="text" value={user.role} readOnly className="bg-muted" />
          </div>
          {user.collegeId && (
            <div className="grid gap-2">
              <Label htmlFor="collegeId">College ID</Label>
              <Input id="collegeId" type="text" value={user.collegeId} readOnly className="bg-muted" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="isVerified">Account Status</Label>
            <Input
              id="isVerified"
              type="text"
              value={user.isVerified ? 'Verified' : 'Not Verified'}
              readOnly
              className={`bg-muted ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;