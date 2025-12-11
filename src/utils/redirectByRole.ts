// Utility function to redirect users based on their role
export function redirectByRole(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student';
    case 'EMPLOYEE':
      return '/employee/dashboard';
    case 'PUBLIC_STUDENT':
      return '/student'; // Public students also go to student portal
    default:
      return '/';
  }
}

