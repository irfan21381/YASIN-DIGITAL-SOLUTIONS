import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/lib/store";

const Index = () => {
  const { user, initialized } = useAuthStore();

  const isAuthenticated = !!user;

  const getDashboardLink = () => {
    if (!user) return "/login";

    switch (user.activeRole) {
      case "SUPER_ADMIN":
        return "/admin/dashboard";
      case "MANAGER":
        return "/manager/dashboard";
      case "TEACHER":
        return "/teacher/dashboard";
      case "EMPLOYEE":
        return "/employee/dashboard";
      case "STUDENT":
      case "PUBLIC_STUDENT":
      default:
        return "/student";
    }
  };

  // Prevent flicker before Zustand restores auth
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center
        bg-gradient-to-br from-blue-50 to-indigo-100
        dark:from-gray-800 dark:to-gray-900
        text-center p-4 pt-16"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              YDS EDUAI
            </span>
          </h1>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Your all-in-one platform for educational content, AI-powered learning,
            and interactive coding.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={getDashboardLink()}>
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white
                  text-lg px-8 py-3 rounded-full shadow-lg
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Button>
            </Link>

            {!isAuthenticated && (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3 rounded-full shadow-lg
                    transition-all duration-300 ease-in-out
                    transform hover:scale-105
                    border-indigo-600 text-indigo-600
                    hover:bg-indigo-50
                    dark:border-indigo-400 dark:text-indigo-400
                    dark:hover:bg-gray-700"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-auto pt-12">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;
