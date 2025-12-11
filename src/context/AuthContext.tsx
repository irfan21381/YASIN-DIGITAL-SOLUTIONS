import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import API from "@/lib/api";

interface User {
  id: string;
  email: string;
  role:
    | "SUPER_ADMIN"
    | "MANAGER"
    | "TEACHER"
    | "STUDENT"
    | "EMPLOYEE"
    | "PUBLIC_STUDENT";
  collegeId?: string;
  isVerified: boolean;
  name?: string; // Kept for components that set it (like login)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (
    roles: (
      | "SUPER_ADMIN"
      | "MANAGER"
      | "TEACHER"
      | "STUDENT"
      | "EMPLOYEE"
      | "PUBLIC_STUDENT"
    )[]
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------
  // LOAD USER FROM TOKEN (Initialization)
  // --------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    // 1. No token found: complete loading and exit
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded: any = jwtDecode(storedToken);
      const now = Date.now() / 1000;

      // 2. Token expired: log out
      if (decoded.exp < now) {
        logout();
      } else {
        // 3. Token valid: set basic user details from JWT
        setToken(storedToken);

        const baseUser: User = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          collegeId: decoded.collegeId,
          isVerified: true,
          // name is intentionally left undefined here. 
          // It will be fetched by Profile.tsx or set during login.
        };

        setUser(baseUser);
        
        // 🚨 REMOVED: Removed the API.get("/student/me") call here.
        // This prevents the global context from triggering a network request 
        // that could fail and cause a redirect on public pages.
      }
    } catch (e) {
      // Catch error during JWT decode (malformed token)
      console.error("JWT decoding failed:", e);
      logout();
    }

    // 4. Always set loading to false once initialization is complete
    setIsLoading(false);
  }, []);

  // --------------------------
  // LOGIN (Keep profile fetch here)
  // --------------------------
  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      const decoded: any = jwtDecode(newToken);

      let tempUser: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        collegeId: decoded.collegeId,
        isVerified: true,
      };

      // ⭐ Keep: Fetch profile to get name immediately after successful login
      if (decoded.role === "STUDENT" || decoded.role === "PUBLIC_STUDENT") {
        const res = await API.get("/student/me", {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        // Use the 'name' field from the student data returned by the backend
        tempUser.name = res.data.data.student?.name || "Student"; 
      }

      setUser(tempUser);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error("Login failed or token is invalid.");
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out.");
  };

  const isAuthenticated = !!user && !!token;

  const hasRole = (roles: User["role"][]) =>
    isAuthenticated && user ? roles.includes(user.role) : false;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isLoading, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};