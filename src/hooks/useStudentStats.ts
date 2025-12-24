import { useEffect, useState } from "react";
import { api as API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to check loading/auth state

// --- INTERFACES ---

interface InternshipStatus {
  pending: number;
  accepted: number;
  total: number;
}

interface StudentStats {
  completedCourses: number;
  pendingAssignments: number;
  internshipStatus: InternshipStatus;
  aiCredits: number;
}

// Assuming Activity/AuditLog items are objects with a timestamp
interface ActivityLog {
    _id: string;
    action: string;
    timestamp: string; // Or Date
    // Add other fields as necessary
}

// --- HOOK ---

export default function useStudentStats() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Use auth loading state
  const [stats, setStats] = useState<StudentStats>({
    completedCourses: 0,
    pendingAssignments: 0,
    internshipStatus: { pending: 0, accepted: 0, total: 0 },
    aiCredits: 0,
  });

  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 🛑 Guard against running before auth check is complete or if user is logged out
    if (isAuthLoading || !isAuthenticated) {
        setLoading(false);
        return; 
    }

    const fetchData = async () => {
      setLoading(true);
      
      try {
        const [sRes, aRes] = await Promise.allSettled([
          API.get("/student/stats"),
          API.get("/student/activity?limit=10"),
        ]);

        if (cancelled) return;
        
        // --- Process Stats Response ---
        const sRaw =
          sRes.status === "fulfilled" && sRes.value?.data?.data
            ? sRes.value.data.data
            : {};

        // Explicitly check if the stats call was rejected (e.g., 401)
        if (sRes.status === "rejected" && sRes.reason.response?.status !== 401) {
             console.error("Stats fetch failed:", sRes.reason);
        }

        setStats({
          completedCourses: sRaw.completedCourses ?? 0,
          pendingAssignments: sRaw.pendingAssignments ?? 0,
          internshipStatus: sRaw.internshipStatus ?? { pending: 0, accepted: 0, total: 0 },
          aiCredits: sRaw.aiCredits ?? 0,
        });

        // --- Process Activity Response ---
        const aRaw =
          aRes.status === "fulfilled" && aRes.value?.data?.data
            ? aRes.value.data.data
            : [];
            
        // Explicitly check if the activity call was rejected
        if (aRes.status === "rejected" && aRes.reason.response?.status !== 401) {
             console.error("Activity fetch failed:", aRes.reason);
        }

        const safe = Array.isArray(aRaw) ? aRaw : [];
        setActivity(safe);
        
      } catch (err) {
        // This catch block mainly handles non-401 network/promise errors
        console.error("useStudentStats hook failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading]); // Dependency on auth state

  return { stats, activity, loading };
}